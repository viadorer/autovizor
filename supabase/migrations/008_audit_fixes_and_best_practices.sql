-- ============================================================
-- AUTOVIZOR.CZ — Migrace 008
-- Komplexní fixy z auditu + zavedení best practices
--
-- Obsah:
--  1. Doplnění chybějících číselníků (quad_types, machine_types) do vehicles
--  2. manufacturers.kind_id → kind_ids INTEGER[] (multi-kategorie)
--  3. Sjednocení duplicitních sloupců (seller_type, deal_type)
--  4. Tabulka dealers (denormalizace prodejce)
--  5. PostGIS + geo column + GiST index
--  6. vehicle_price_history, vehicle_views_daily, dealer_reviews
--  7. RLS na users (security fix)
--  8. equipment_ids jako pole + GIN index (rychlejší výbavový filtr)
--  9. UNIQUE indexy na materialized views (CONCURRENTLY refresh)
-- 10. updated_at triggers
-- ============================================================

-- 0. SAFETY: rozšíření
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================
-- 1. CHYBĚJÍCÍ ČÍSELNÍKY → vehicles
-- ============================================================

-- 1a. Quad types (čtyřkolky, kind_id=11)
CREATE TABLE IF NOT EXISTS quad_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO quad_types (id, name) VALUES
  (1, 'Sportovní'), (2, 'Užitková'), (3, 'Dětská'),
  (4, 'Side-by-side (UTV)'), (5, 'Jiná')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS quad_type_id INTEGER REFERENCES quad_types(id);
CREATE INDEX IF NOT EXISTS idx_vehicles_quad_type ON vehicles(quad_type_id) WHERE is_active = TRUE AND quad_type_id IS NOT NULL;

-- 1b. Machine types (pracovní stroje, kind_id=10)
CREATE TABLE IF NOT EXISTS machine_types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO machine_types (id, name) VALUES
  (1, 'Bagr'), (2, 'Nakladač'), (3, 'Buldozer'), (4, 'Jeřáb'),
  (5, 'Vysokozdvižný vozík'), (6, 'Válec'), (7, 'Fréza'),
  (8, 'Kompresor'), (9, 'Plošina'), (10, 'Manipulátor'),
  (11, 'Traktor'), (12, 'Jiný')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS machine_type_id INTEGER REFERENCES machine_types(id);
CREATE INDEX IF NOT EXISTS idx_vehicles_machine_type ON vehicles(machine_type_id) WHERE is_active = TRUE AND machine_type_id IS NOT NULL;

-- ============================================================
-- 2. MANUFACTURERS — multi-kind support
-- Suzuki (auta + motorky), Honda (auta + motorky), Yamaha atd.
-- ============================================================

-- Pridáme pole kind_ids jako INTEGER[] (zachová staré kind_id pro rollback)
ALTER TABLE manufacturers ADD COLUMN IF NOT EXISTS kind_ids INTEGER[] DEFAULT '{}';

-- Naplň z existujícího skaláru (zatím všichni mají 1 kind)
UPDATE manufacturers
SET kind_ids = ARRAY[kind_id]
WHERE kind_id IS NOT NULL AND (kind_ids IS NULL OR kind_ids = '{}');

-- GIN index pro rychlé `kind_ids @> ARRAY[1]` dotazy
CREATE INDEX IF NOT EXISTS idx_manufacturers_kind_ids ON manufacturers USING gin(kind_ids);

-- Známé multi-kind značky (Sauto carList): označit korektně
-- Suzuki, Honda, Yamaha, Kawasaki vyrábí auta i motorky
-- Implementace: skript sync-sauto-manufacturers.mjs naplní kind_ids[] dle XML

-- ============================================================
-- 3. SJEDNOCENÍ DUPLICITNÍCH SLOUPCŮ
-- ============================================================

-- 3a. dph BOOLEAN je nejasný (s DPH? bez DPH?). Rename → price_includes_vat
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='vehicles' AND column_name='dph') THEN
    ALTER TABLE vehicles RENAME COLUMN dph TO price_includes_vat;
  END IF;
END $$;

-- 3b. first_owner už je INTEGER (1=Ano, 2=Ne) z migrace 002 — OK

-- ============================================================
-- 4. DEALERS — denormalizace prodejce
-- ============================================================

CREATE TABLE IF NOT EXISTS dealers (
  id BIGSERIAL PRIMARY KEY,
  sauto_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  type_id INTEGER REFERENCES seller_types(id),
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  region_id INTEGER REFERENCES regions(id),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  geo geography(Point, 4326),
  rating NUMERIC(3,2),
  review_count INTEGER DEFAULT 0,
  certified_program_id INTEGER REFERENCES certified_programs(id),
  opening_hours JSONB,
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dealers_slug ON dealers(slug);
CREATE INDEX IF NOT EXISTS idx_dealers_region ON dealers(region_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_dealers_geo ON dealers USING gist(geo);
CREATE INDEX IF NOT EXISTS idx_dealers_name_trgm ON dealers USING gin(name gin_trgm_ops);

-- Auto-update geo z lat/lng (BEFORE INSERT/UPDATE)
CREATE OR REPLACE FUNCTION dealers_update_geo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geo = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealers_geo_trigger ON dealers;
CREATE TRIGGER dealers_geo_trigger
  BEFORE INSERT OR UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION dealers_update_geo();

-- vehicle.dealer_id reference (nahradí denormalizovaná seller_* pole časem)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS dealer_id BIGINT REFERENCES dealers(id);
CREATE INDEX IF NOT EXISTS idx_vehicles_dealer ON vehicles(dealer_id) WHERE is_active = TRUE AND dealer_id IS NOT NULL;

-- ============================================================
-- 5. POSTGIS + GEO PRO VEHICLES
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS geo geography(Point, 4326);

-- Naplnit existující řádky
UPDATE vehicles
SET geo = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE longitude IS NOT NULL AND latitude IS NOT NULL AND geo IS NULL;

-- Trigger pro automatickou synchronizaci
CREATE OR REPLACE FUNCTION vehicles_update_geo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geo = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geo = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_geo_trigger ON vehicles;
CREATE TRIGGER vehicles_geo_trigger
  BEFORE INSERT OR UPDATE OF latitude, longitude ON vehicles
  FOR EACH ROW EXECUTE FUNCTION vehicles_update_geo();

CREATE INDEX IF NOT EXISTS idx_vehicles_geo ON vehicles USING gist(geo);

-- ============================================================
-- 6. ANALYTICKÉ + HISTORIE TABULKY
-- ============================================================

-- 6a. Cenová historie (price drop badge)
CREATE TABLE IF NOT EXISTS vehicle_price_history (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  change_pct NUMERIC(5,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_price_history_vehicle ON vehicle_price_history(vehicle_id, recorded_at DESC);

-- Trigger: log změny ceny
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.price > 0)
     OR (TG_OP = 'UPDATE' AND OLD.price IS DISTINCT FROM NEW.price AND NEW.price > 0) THEN
    INSERT INTO vehicle_price_history (vehicle_id, price, change_pct)
    VALUES (
      NEW.id,
      NEW.price,
      CASE WHEN TG_OP = 'UPDATE' AND OLD.price > 0
           THEN ROUND(((NEW.price - OLD.price)::NUMERIC / OLD.price) * 100, 2)
           ELSE NULL
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_price_history_trigger ON vehicles;
CREATE TRIGGER vehicles_price_history_trigger
  AFTER INSERT OR UPDATE OF price ON vehicles
  FOR EACH ROW EXECUTE FUNCTION log_price_change();

-- 6b. Pohled vozidla denně agregovaný (pro popularity ranking)
CREATE TABLE IF NOT EXISTS vehicle_views_daily (
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (vehicle_id, day)
);
CREATE INDEX IF NOT EXISTS idx_vehicle_views_daily_day ON vehicle_views_daily(day DESC);

-- 6c. Dealer reviews (důvěra)
CREATE TABLE IF NOT EXISTS dealer_reviews (
  id BIGSERIAL PRIMARY KEY,
  dealer_id BIGINT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  pros TEXT,
  cons TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_dealer ON dealer_reviews(dealer_id) WHERE is_published = TRUE;

-- Recompute dealer aggregate rating po každém review
CREATE OR REPLACE FUNCTION recompute_dealer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dealers d
  SET rating = sub.avg_rating,
      review_count = sub.cnt
  FROM (
    SELECT AVG(rating)::NUMERIC(3,2) AS avg_rating, COUNT(*) AS cnt
    FROM dealer_reviews
    WHERE dealer_id = COALESCE(NEW.dealer_id, OLD.dealer_id) AND is_published = TRUE
  ) sub
  WHERE d.id = COALESCE(NEW.dealer_id, OLD.dealer_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealer_reviews_recompute_trigger ON dealer_reviews;
CREATE TRIGGER dealer_reviews_recompute_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dealer_reviews
  FOR EACH ROW EXECUTE FUNCTION recompute_dealer_rating();

-- ============================================================
-- 7. SECURITY: RLS POLICIES PRO USERS, DEALERS, REVIEWS
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_self_read ON users;
CREATE POLICY users_self_read ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_self_update ON users;
CREATE POLICY users_self_update ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS users_self_insert ON users;
CREATE POLICY users_self_insert ON users FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dealers_public_read ON dealers;
CREATE POLICY dealers_public_read ON dealers FOR SELECT USING (is_active = TRUE);

ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dealer_reviews_public_read ON dealer_reviews;
CREATE POLICY dealer_reviews_public_read ON dealer_reviews FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS dealer_reviews_user_insert ON dealer_reviews;
CREATE POLICY dealer_reviews_user_insert ON dealer_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS dealer_reviews_user_update ON dealer_reviews;
CREATE POLICY dealer_reviews_user_update ON dealer_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS dealer_reviews_user_delete ON dealer_reviews;
CREATE POLICY dealer_reviews_user_delete ON dealer_reviews FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE vehicle_price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS price_history_public_read ON vehicle_price_history;
CREATE POLICY price_history_public_read ON vehicle_price_history FOR SELECT USING (TRUE);

-- ============================================================
-- 8. EQUIPMENT_IDS POLE NA VEHICLES (rychlejší filtr výbavy)
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS equipment_ids INTEGER[] DEFAULT '{}';

-- Naplnit z existujícího M:N
UPDATE vehicles v
SET equipment_ids = COALESCE(sub.ids, '{}')
FROM (
  SELECT vehicle_id, array_agg(equipment_id ORDER BY equipment_id) AS ids
  FROM vehicle_equipment
  GROUP BY vehicle_id
) sub
WHERE v.id = sub.vehicle_id;

CREATE INDEX IF NOT EXISTS idx_vehicles_equipment_gin ON vehicles USING gin(equipment_ids);

-- Trigger pro synchronizaci pole s M:N tabulkou
CREATE OR REPLACE FUNCTION sync_vehicle_equipment_array()
RETURNS TRIGGER AS $$
DECLARE
  v_id BIGINT;
BEGIN
  v_id = COALESCE(NEW.vehicle_id, OLD.vehicle_id);
  UPDATE vehicles
  SET equipment_ids = COALESCE(
    (SELECT array_agg(equipment_id ORDER BY equipment_id)
     FROM vehicle_equipment WHERE vehicle_id = v_id),
    '{}'
  )
  WHERE id = v_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_equipment_sync_trigger ON vehicle_equipment;
CREATE TRIGGER vehicle_equipment_sync_trigger
  AFTER INSERT OR DELETE OR UPDATE ON vehicle_equipment
  FOR EACH ROW EXECUTE FUNCTION sync_vehicle_equipment_array();

-- ============================================================
-- 9. UNIQUE INDEXY NA MATERIALIZED VIEWS (CONCURRENTLY refresh)
-- ============================================================

-- vehicle_stats má jen 1 řádek → unique není smysl, ale nutné pro CONCURRENTLY
-- → vytvoříme dummy unique index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'vehicle_stats_uniq') THEN
    EXECUTE 'CREATE UNIQUE INDEX vehicle_stats_uniq ON vehicle_stats ((1))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- manufacturer_counts má id jako přirozený PK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'manufacturer_counts_id_uniq') THEN
    EXECUTE 'CREATE UNIQUE INDEX manufacturer_counts_id_uniq ON manufacturer_counts (id)';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================
-- 10. UPDATED_AT TRIGGER NA DEALERS
-- ============================================================
DROP TRIGGER IF EXISTS dealers_updated_at ON dealers;
CREATE TRIGGER dealers_updated_at
  BEFORE UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 11. DALŠÍ INDEXY PRO PRODUKCI
-- ============================================================

-- Fulltext na description (čeština unaccent)
CREATE INDEX IF NOT EXISTS idx_vehicles_description_trgm
  ON vehicles USING gin(description gin_trgm_ops)
  WHERE is_active = TRUE AND description IS NOT NULL;

-- Indexy pro řazení dle popularity
CREATE INDEX IF NOT EXISTS idx_vehicles_views ON vehicles(views_count DESC NULLS LAST)
  WHERE is_active = TRUE;

-- Composite pro homepage "newest with images"
CREATE INDEX IF NOT EXISTS idx_vehicles_active_with_image_recent
  ON vehicles(created_at DESC)
  WHERE is_active = TRUE AND main_image_url IS NOT NULL;

-- Pro "first_owner" filtr (1 = Ano)
CREATE INDEX IF NOT EXISTS idx_vehicles_first_owner ON vehicles(first_owner)
  WHERE is_active = TRUE AND first_owner = 1;

-- VAT deduktibilita pro B2B filtr
CREATE INDEX IF NOT EXISTS idx_vehicles_vat ON vehicles(vat_deductible)
  WHERE is_active = TRUE AND vat_deductible = TRUE;
