-- ============================================================
-- AUTOVIZOR.CZ — Migrace 013
-- Dealers backfill + User-facing infra + Lead-gen propojení
--
-- 3 cíle:
--   A) Dedupe a backfill dealerů z denormalizovaných seller_* sloupců
--   B) Rozšíření users tabulky o role, telefon, ověření → soukromý
--      i dealerský prodejce může inzerovat
--   C) vehicle_inquiries + vehicle_messages pro buyer↔seller komunikaci
--
-- IDEMPOTENTNÍ — bezpečné spustit opakovaně.
-- ============================================================

-- ============================================================
-- A.1 Normalizační helpery (telefon, email, slug)
-- ============================================================

CREATE OR REPLACE FUNCTION normalize_phone(p TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  IF p IS NULL OR length(trim(p)) = 0 THEN RETURN NULL; END IF;
  digits := regexp_replace(p, '[^0-9]', '', 'g');
  IF length(digits) < 8 THEN RETURN NULL; END IF;
  -- ČR: pokud nezačíná +420 a má 9 cifer → přidat +420
  IF length(digits) = 9 THEN RETURN '+420' || digits; END IF;
  RETURN '+' || digits;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_email(e TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF e IS NULL OR length(trim(e)) = 0 THEN RETURN NULL; END IF;
  RETURN lower(trim(e));
END;
$$;

-- ============================================================
-- A.2 Dealers: unique constraint + auto-normalize trigger
-- ============================================================

-- Dva dealery se stejným emailem nedávají smysl
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS email_normalized TEXT
  GENERATED ALWAYS AS (normalize_email(email)) STORED;
ALTER TABLE dealers ADD COLUMN IF NOT EXISTS phone_normalized TEXT
  GENERATED ALWAYS AS (normalize_phone(phone)) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dealers_email_uniq
  ON dealers(email_normalized) WHERE email_normalized IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_dealers_phone_uniq
  ON dealers(phone_normalized) WHERE phone_normalized IS NOT NULL AND email_normalized IS NULL;

-- ============================================================
-- A.3 Backfill: extrahuj unikátní dealery z vehicles
--
-- POZN k DISTINCT ON: dedupe_key musí být první v ORDER BY.
-- POZN k ON CONFLICT: partial unique index nelze rovnou cílit
--   ON CONFLICT bez WHERE klauzule → použijeme NOT EXISTS pre-check.
-- ============================================================

WITH dedupe_keys AS (
  SELECT
    seller_name,
    seller_phone,
    seller_email,
    seller_logo_url,
    seller_type_id,
    seller_rating,
    seller_review_count,
    address, city, zip_code, region_id, latitude, longitude,
    created_at,
    COALESCE(
      normalize_email(seller_email),
      'phone:' || normalize_phone(seller_phone),
      'name:' || lower(trim(seller_name))
    ) AS dedupe_key
  FROM vehicles
  WHERE seller_name IS NOT NULL
    AND length(trim(seller_name)) > 0
),
unique_sellers AS (
  SELECT DISTINCT ON (dedupe_key)
    dedupe_key,
    seller_name AS name,
    seller_phone AS phone,
    seller_email AS email,
    seller_logo_url AS logo_url,
    COALESCE(seller_type_id, 2) AS type_id,
    address, city, zip_code, region_id, latitude, longitude,
    seller_rating AS rating,
    seller_review_count AS review_count
  FROM dedupe_keys
  ORDER BY dedupe_key, created_at DESC NULLS LAST
)
INSERT INTO dealers (
  name, phone, email, logo_url, type_id,
  address, city, zip_code, region_id, latitude, longitude,
  rating, review_count, is_verified
)
SELECT
  us.name, us.phone, us.email, us.logo_url, us.type_id,
  us.address, us.city, us.zip_code, us.region_id, us.latitude, us.longitude,
  us.rating, us.review_count, FALSE
FROM unique_sellers us
WHERE NOT EXISTS (
  SELECT 1 FROM dealers d
  WHERE
    -- match podle emailu (priorita 1)
    (us.email IS NOT NULL AND d.email_normalized = normalize_email(us.email))
    -- match podle telefonu (priorita 2, jen když email chybí)
    OR (us.email IS NULL AND us.phone IS NOT NULL
        AND d.phone_normalized = normalize_phone(us.phone)
        AND d.email_normalized IS NULL)
    -- match podle name (priorita 3)
    OR (us.email IS NULL AND us.phone IS NULL
        AND lower(trim(d.name)) = lower(trim(us.name))
        AND d.email_normalized IS NULL AND d.phone_normalized IS NULL)
);

-- ============================================================
-- A.4 Set vehicles.dealer_id (match by email > phone > name)
-- ============================================================

-- Match podle email
UPDATE vehicles v
SET dealer_id = d.id
FROM dealers d
WHERE v.dealer_id IS NULL
  AND v.seller_email IS NOT NULL
  AND d.email_normalized = normalize_email(v.seller_email);

-- Match podle phone (pro ty bez emailu)
UPDATE vehicles v
SET dealer_id = d.id
FROM dealers d
WHERE v.dealer_id IS NULL
  AND v.seller_phone IS NOT NULL
  AND d.phone_normalized = normalize_phone(v.seller_phone)
  AND d.email_normalized IS NULL;

-- Fallback: match podle name (nepřesné, ale lepší než nic)
UPDATE vehicles v
SET dealer_id = d.id
FROM dealers d
WHERE v.dealer_id IS NULL
  AND v.seller_name IS NOT NULL
  AND lower(trim(v.seller_name)) = lower(trim(d.name))
  AND d.email_normalized IS NULL
  AND d.phone_normalized IS NULL;

-- ============================================================
-- A.5 Auto-link trigger: nové vehicles automaticky najdou dealer_id
-- ============================================================

CREATE OR REPLACE FUNCTION vehicles_auto_link_dealer()
RETURNS TRIGGER AS $$
DECLARE
  v_dealer_id BIGINT;
BEGIN
  IF NEW.dealer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Match v pořadí: email > phone > name
  IF NEW.seller_email IS NOT NULL THEN
    SELECT id INTO v_dealer_id FROM dealers
    WHERE email_normalized = normalize_email(NEW.seller_email)
    LIMIT 1;
  END IF;

  IF v_dealer_id IS NULL AND NEW.seller_phone IS NOT NULL THEN
    SELECT id INTO v_dealer_id FROM dealers
    WHERE phone_normalized = normalize_phone(NEW.seller_phone)
      AND email_normalized IS NULL
    LIMIT 1;
  END IF;

  IF v_dealer_id IS NULL AND NEW.seller_name IS NOT NULL THEN
    SELECT id INTO v_dealer_id FROM dealers
    WHERE lower(trim(name)) = lower(trim(NEW.seller_name))
      AND email_normalized IS NULL
      AND phone_normalized IS NULL
    LIMIT 1;
  END IF;

  -- Pokud nikdo neodpovídá, vytvoř nového dealera (auto-onboard)
  IF v_dealer_id IS NULL AND NEW.seller_name IS NOT NULL THEN
    INSERT INTO dealers (
      name, phone, email, logo_url, type_id,
      address, city, zip_code, region_id, latitude, longitude,
      rating, review_count, is_verified
    )
    VALUES (
      NEW.seller_name, NEW.seller_phone, NEW.seller_email, NEW.seller_logo_url,
      COALESCE(NEW.seller_type_id, 2),
      NEW.address, NEW.city, NEW.zip_code, NEW.region_id, NEW.latitude, NEW.longitude,
      NEW.seller_rating, COALESCE(NEW.seller_review_count, 0), FALSE
    )
    RETURNING id INTO v_dealer_id;
    -- POZN: race-condition (dva insertu se stejným email_normalized) je
    -- ošetřena tím, že trigger nejprve hledá existujícího dealera (3
    -- strategie výše). Pokud by selhal partial unique index, transakce
    -- celého INSERT na vehicles se rollbackne — což je očekávané chování.
  END IF;

  NEW.dealer_id = v_dealer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_auto_link_dealer_trigger ON vehicles;
CREATE TRIGGER vehicles_auto_link_dealer_trigger
  BEFORE INSERT ON vehicles
  FOR EACH ROW EXECUTE FUNCTION vehicles_auto_link_dealer();

-- ============================================================
-- B.1 Users: rozšíření o role, telefon, ověření
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'buyer'
  CHECK (role IN ('buyer', 'private_seller', 'dealer_admin', 'admin'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_normalized TEXT
  GENERATED ALWAYS AS (normalize_phone(phone)) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_uniq
  ON users(phone_normalized) WHERE phone_normalized IS NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dealer_id BIGINT REFERENCES dealers(id) ON DELETE SET NULL;
  -- pokud je role='dealer_admin', zde je odkaz na jeho dealera

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_dealer ON users(dealer_id) WHERE dealer_id IS NOT NULL;

-- ============================================================
-- B.2 Vehicles: vlastník inzerátu (private seller flow)
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS posted_by TEXT NOT NULL DEFAULT 'import'
  CHECK (posted_by IN ('import', 'private_seller', 'dealer'));
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS published_status TEXT NOT NULL DEFAULT 'published'
  CHECK (published_status IN ('draft', 'pending_review', 'published', 'rejected', 'expired', 'sold'));
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
  -- automaticky 60 dní pro private, 90 pro dealer (cron job to flips na 'expired')

CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_posted_by ON vehicles(posted_by);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(published_status) WHERE published_status != 'published';

-- ============================================================
-- B.3 Self-service post: trigger sets dealer_id z user.dealer_id
-- ============================================================

CREATE OR REPLACE FUNCTION vehicles_link_user_dealer()
RETURNS TRIGGER AS $$
DECLARE
  u_record RECORD;
  v_dealer_id BIGINT;
BEGIN
  -- Spustit jen pokud user_id je nastaven a dealer_id chybí
  IF NEW.user_id IS NULL OR NEW.dealer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT role, dealer_id, name, email, phone INTO u_record
  FROM users WHERE id = NEW.user_id;

  IF u_record IS NULL THEN RETURN NEW; END IF;

  -- Dealer-admin: použij jeho dealer_id
  IF u_record.role = 'dealer_admin' AND u_record.dealer_id IS NOT NULL THEN
    NEW.dealer_id = u_record.dealer_id;
    NEW.posted_by = 'dealer';
  ELSIF u_record.role = 'private_seller' THEN
    -- Najdi existujícího dealera podle emailu/telefonu (private sellers
    -- mohou mít více inzerátů → reuse stejného dealer_id)
    IF u_record.email IS NOT NULL THEN
      SELECT id INTO v_dealer_id FROM dealers
      WHERE email_normalized = normalize_email(u_record.email)
      LIMIT 1;
    END IF;
    IF v_dealer_id IS NULL AND u_record.phone IS NOT NULL THEN
      SELECT id INTO v_dealer_id FROM dealers
      WHERE phone_normalized = normalize_phone(u_record.phone)
        AND email_normalized IS NULL
      LIMIT 1;
    END IF;

    -- Pokud neexistuje, auto-vytvoř soukromého "dealera"
    IF v_dealer_id IS NULL THEN
      INSERT INTO dealers (name, email, phone, type_id, is_verified)
      VALUES (
        u_record.name,
        u_record.email,
        u_record.phone,
        1, -- Soukromý prodejce
        u_record.email IS NOT NULL
      )
      RETURNING id INTO v_dealer_id;
    END IF;

    NEW.dealer_id = v_dealer_id;
    NEW.posted_by = 'private_seller';

    -- Nastavit zpět do users.dealer_id
    UPDATE users SET dealer_id = v_dealer_id
    WHERE id = NEW.user_id AND dealer_id IS NULL;
  END IF;

  -- Default expirace
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + (CASE
      WHEN NEW.posted_by = 'private_seller' THEN '60 days'::INTERVAL
      ELSE '90 days'::INTERVAL
    END);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_link_user_dealer_trigger ON vehicles;
CREATE TRIGGER vehicles_link_user_dealer_trigger
  BEFORE INSERT ON vehicles
  FOR EACH ROW EXECUTE FUNCTION vehicles_link_user_dealer();

-- ============================================================
-- C.1 Vehicle inquiries (lead generation)
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_inquiries (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  dealer_id BIGINT REFERENCES dealers(id) ON DELETE SET NULL,
  -- Buyer info (auth nebo guest)
  buyer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_message TEXT NOT NULL,
  -- Lead conversion tracking
  inquiry_type TEXT DEFAULT 'message' CHECK (inquiry_type IN ('message', 'phone_call', 'test_drive', 'offer')),
  offer_amount INTEGER, -- pro inquiry_type='offer'
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'spam')),
  contacted_at TIMESTAMPTZ,
  -- Anti-spam / abuse
  ip_address INET,
  user_agent TEXT,
  is_spam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_vehicle ON vehicle_inquiries(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_dealer ON vehicle_inquiries(dealer_id) WHERE dealer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON vehicle_inquiries(buyer_user_id) WHERE buyer_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON vehicle_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_new ON vehicle_inquiries(dealer_id, created_at DESC)
  WHERE status = 'new' AND is_spam = FALSE;

-- Auto-set dealer_id z vehicle při inquiry insert
CREATE OR REPLACE FUNCTION inquiries_set_dealer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dealer_id IS NULL THEN
    SELECT dealer_id INTO NEW.dealer_id FROM vehicles WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inquiries_set_dealer_trigger ON vehicle_inquiries;
CREATE TRIGGER inquiries_set_dealer_trigger
  BEFORE INSERT ON vehicle_inquiries
  FOR EACH ROW EXECUTE FUNCTION inquiries_set_dealer();

-- ============================================================
-- C.2 Vehicle messages (chat thread navazující na inquiry)
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_messages (
  id BIGSERIAL PRIMARY KEY,
  inquiry_id BIGINT NOT NULL REFERENCES vehicle_inquiries(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('buyer', 'seller')),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_inquiry ON vehicle_messages(inquiry_id, created_at);

-- ============================================================
-- C.3 RLS pro user-scoped data
-- ============================================================

ALTER TABLE vehicle_inquiries ENABLE ROW LEVEL SECURITY;

-- Buyer vidí svoje inquiries
DROP POLICY IF EXISTS inquiries_buyer_read ON vehicle_inquiries;
CREATE POLICY inquiries_buyer_read ON vehicle_inquiries FOR SELECT
  USING (auth.uid() = buyer_user_id);

-- Seller (dealer_admin nebo private_seller) vidí inquiries na své inzeráty
DROP POLICY IF EXISTS inquiries_seller_read ON vehicle_inquiries;
CREATE POLICY inquiries_seller_read ON vehicle_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (
          (u.role = 'dealer_admin' AND u.dealer_id = vehicle_inquiries.dealer_id)
          OR (u.role = 'private_seller' AND EXISTS (
            SELECT 1 FROM vehicles v WHERE v.id = vehicle_inquiries.vehicle_id AND v.user_id = u.id
          ))
        )
    )
  );

-- Anyone (auth nebo guest) může vytvořit inquiry
DROP POLICY IF EXISTS inquiries_public_insert ON vehicle_inquiries;
CREATE POLICY inquiries_public_insert ON vehicle_inquiries FOR INSERT WITH CHECK (TRUE);

-- Seller může update status (contacted, closed, spam)
DROP POLICY IF EXISTS inquiries_seller_update ON vehicle_inquiries;
CREATE POLICY inquiries_seller_update ON vehicle_inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND (
          (u.role = 'dealer_admin' AND u.dealer_id = vehicle_inquiries.dealer_id)
          OR (u.role = 'private_seller' AND EXISTS (
            SELECT 1 FROM vehicles v WHERE v.id = vehicle_inquiries.vehicle_id AND v.user_id = u.id
          ))
        )
    )
  );

ALTER TABLE vehicle_messages ENABLE ROW LEVEL SECURITY;

-- Účastník threadu vidí všechny zprávy
DROP POLICY IF EXISTS messages_thread_read ON vehicle_messages;
CREATE POLICY messages_thread_read ON vehicle_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vehicle_inquiries i
      WHERE i.id = vehicle_messages.inquiry_id
        AND (
          i.buyer_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
              AND (
                (u.role = 'dealer_admin' AND u.dealer_id = i.dealer_id)
                OR (u.role = 'private_seller' AND EXISTS (
                  SELECT 1 FROM vehicles v WHERE v.id = i.vehicle_id AND v.user_id = u.id
                ))
              )
          )
        )
    )
  );

-- Účastník threadu může psát
DROP POLICY IF EXISTS messages_thread_insert ON vehicle_messages;
CREATE POLICY messages_thread_insert ON vehicle_messages FOR INSERT
  WITH CHECK (
    sender_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM vehicle_inquiries i
      WHERE i.id = vehicle_messages.inquiry_id
        AND (
          i.buyer_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
              AND (
                (u.role = 'dealer_admin' AND u.dealer_id = i.dealer_id)
                OR (u.role = 'private_seller' AND EXISTS (
                  SELECT 1 FROM vehicles v WHERE v.id = i.vehicle_id AND v.user_id = u.id
                ))
              )
          )
        )
    )
  );

-- Vehicles RLS update: vlastník může editovat svůj inzerát
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vehicles_owner_update ON vehicles;
CREATE POLICY vehicles_owner_update ON vehicles FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'dealer_admin' AND u.dealer_id = vehicles.dealer_id
    )
  );

DROP POLICY IF EXISTS vehicles_owner_insert ON vehicles;
CREATE POLICY vehicles_owner_insert ON vehicles FOR INSERT
  WITH CHECK (
    user_id IS NULL -- backend imports
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS vehicles_owner_delete ON vehicles;
CREATE POLICY vehicles_owner_delete ON vehicles FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ============================================================
-- C.4 Pohledy / RPC pro UI
-- ============================================================

-- Dashboard pro prodejce: jeho aktivní inzeráty + nové dotazy
CREATE OR REPLACE FUNCTION get_seller_dashboard(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  u_role TEXT;
  u_dealer_id BIGINT;
BEGIN
  SELECT role, dealer_id INTO u_role, u_dealer_id FROM users WHERE id = p_user_id;
  IF u_role IS NULL THEN RETURN '{}'::jsonb; END IF;

  result := jsonb_build_object(
    'role', u_role,
    'dealer_id', u_dealer_id,
    'active_listings', (
      SELECT COUNT(*) FROM vehicles
      WHERE is_active = TRUE AND published_status = 'published'
        AND (user_id = p_user_id OR (u_dealer_id IS NOT NULL AND dealer_id = u_dealer_id))
    ),
    'new_inquiries', (
      SELECT COUNT(*) FROM vehicle_inquiries
      WHERE status = 'new' AND is_spam = FALSE
        AND (
          (u_dealer_id IS NOT NULL AND dealer_id = u_dealer_id)
          OR EXISTS (
            SELECT 1 FROM vehicles v
            WHERE v.id = vehicle_inquiries.vehicle_id AND v.user_id = p_user_id
          )
        )
    ),
    'total_views_30d', (
      SELECT COALESCE(SUM(view_count), 0) FROM vehicle_views_daily vvd
      WHERE day >= CURRENT_DATE - INTERVAL '30 days'
        AND EXISTS (
          SELECT 1 FROM vehicles v
          WHERE v.id = vvd.vehicle_id
            AND (v.user_id = p_user_id OR (u_dealer_id IS NOT NULL AND v.dealer_id = u_dealer_id))
        )
    )
  );

  RETURN result;
END;
$$;

-- ============================================================
-- D.1 Cleanup pole na vehicles (postupný odchod od denormalizace)
-- POZN: Zatím NESMAŽEME seller_* sloupce — frontend je stále čte
--       jako fallback. Po přechodu na dealer_id ve view + UI je
--       smažeme v migraci 015.
-- ============================================================

-- ============================================================
-- D.2 pg_cron job: expirace listingů
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('expire-listings') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-listings');
    PERFORM cron.schedule(
      'expire-listings',
      '15 4 * * *',
      $cron$UPDATE vehicles
        SET published_status = 'expired', is_active = FALSE
        WHERE published_status = 'published'
          AND expires_at IS NOT NULL
          AND expires_at < NOW();$cron$
    );
  END IF;
END $$;
