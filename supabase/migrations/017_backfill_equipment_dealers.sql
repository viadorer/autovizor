-- ============================================================
-- AUTOVIZOR.CZ — Migrace 017
-- Backfill helpery pro existující TipCars/Sauto data
--
-- Cíl: po nasazení migrace 013 (dealers) + 014 (equipment helpery)
-- existuje 1640 vozů, kde dealer_id i equipment_ids mohou být prázdné.
-- Tato migrace přidá idempotentní RPC, které backfillují obojí.
-- ============================================================

-- ============================================================
-- 1. RPC: backfill_dealers_for_existing_vehicles
--    Pro vehicles s dealer_id IS NULL & seller_name IS NOT NULL
--    spustí stejnou logiku jako trigger vehicles_auto_link_dealer:
--    najde nebo vytvoří dealera a nastaví FK.
-- ============================================================

CREATE OR REPLACE FUNCTION backfill_dealers_for_existing_vehicles(p_limit INTEGER DEFAULT 1000)
RETURNS TABLE (linked INTEGER, created INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_record RECORD;
  v_dealer_id BIGINT;
  v_linked INTEGER := 0;
  v_created INTEGER := 0;
BEGIN
  FOR v_record IN
    SELECT id, seller_name, seller_phone, seller_email, seller_logo_url,
           seller_type_id, seller_rating, seller_review_count,
           address, city, zip_code, region_id, latitude, longitude
    FROM vehicles
    WHERE dealer_id IS NULL
      AND seller_name IS NOT NULL
      AND length(trim(seller_name)) > 0
    LIMIT p_limit
  LOOP
    v_dealer_id := NULL;

    -- Match podle email
    IF v_record.seller_email IS NOT NULL THEN
      SELECT id INTO v_dealer_id FROM dealers
      WHERE email_normalized = normalize_email(v_record.seller_email)
      LIMIT 1;
    END IF;

    -- Match podle phone (jen pokud nemá email)
    IF v_dealer_id IS NULL AND v_record.seller_phone IS NOT NULL THEN
      SELECT id INTO v_dealer_id FROM dealers
      WHERE phone_normalized = normalize_phone(v_record.seller_phone)
        AND email_normalized IS NULL
      LIMIT 1;
    END IF;

    -- Match podle name (fallback)
    IF v_dealer_id IS NULL THEN
      SELECT id INTO v_dealer_id FROM dealers
      WHERE lower(trim(name)) = lower(trim(v_record.seller_name))
        AND email_normalized IS NULL
        AND phone_normalized IS NULL
      LIMIT 1;
    END IF;

    -- Vytvořit nového dealera pokud neexistuje
    IF v_dealer_id IS NULL THEN
      INSERT INTO dealers (
        name, phone, email, logo_url, type_id,
        address, city, zip_code, region_id, latitude, longitude,
        rating, review_count, is_verified
      )
      VALUES (
        v_record.seller_name,
        v_record.seller_phone,
        v_record.seller_email,
        v_record.seller_logo_url,
        COALESCE(v_record.seller_type_id, 2),
        v_record.address,
        v_record.city,
        v_record.zip_code,
        v_record.region_id,
        v_record.latitude,
        v_record.longitude,
        v_record.seller_rating,
        COALESCE(v_record.seller_review_count, 0),
        FALSE
      )
      RETURNING id INTO v_dealer_id;
      v_created := v_created + 1;
    END IF;

    -- Set FK na vehicles
    UPDATE vehicles SET dealer_id = v_dealer_id WHERE id = v_record.id;
    v_linked := v_linked + 1;
  END LOOP;

  RETURN QUERY SELECT v_linked, v_created;
END;
$$;

-- ============================================================
-- 2. RPC: enrich_dealer_from_vehicles
--    Pro daného dealera dohledá kompletní info ze všech jeho vozů
--    (latitude/longitude, region_id, opening_hours kdyby v note byly).
--    Tahle se používá až pro re-pass po backfillu.
-- ============================================================

CREATE OR REPLACE FUNCTION enrich_dealer_from_vehicles(p_dealer_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_lat NUMERIC;
  v_lng NUMERIC;
  v_addr TEXT;
  v_city TEXT;
  v_zip TEXT;
  v_region INTEGER;
  v_logo TEXT;
BEGIN
  -- Použij medián geo (pokud má dealer více poboček, vezmeme nejčastější)
  SELECT
    AVG(latitude)::NUMERIC(10,7),
    AVG(longitude)::NUMERIC(10,7),
    MAX(address) FILTER (WHERE address IS NOT NULL),
    MAX(city) FILTER (WHERE city IS NOT NULL),
    MAX(zip_code) FILTER (WHERE zip_code IS NOT NULL),
    MAX(region_id) FILTER (WHERE region_id IS NOT NULL),
    MAX(seller_logo_url) FILTER (WHERE seller_logo_url IS NOT NULL)
  INTO v_lat, v_lng, v_addr, v_city, v_zip, v_region, v_logo
  FROM vehicles
  WHERE dealer_id = p_dealer_id;

  UPDATE dealers d
  SET latitude = COALESCE(d.latitude, v_lat),
      longitude = COALESCE(d.longitude, v_lng),
      address = COALESCE(d.address, v_addr),
      city = COALESCE(d.city, v_city),
      zip_code = COALESCE(d.zip_code, v_zip),
      region_id = COALESCE(d.region_id, v_region),
      logo_url = COALESCE(d.logo_url, v_logo),
      updated_at = NOW()
  WHERE d.id = p_dealer_id;
END;
$$;

-- ============================================================
-- 3. RPC: enrich_all_dealers — bulk
-- ============================================================
CREATE OR REPLACE FUNCTION enrich_all_dealers()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER := 0;
  v_dealer_id BIGINT;
BEGIN
  FOR v_dealer_id IN SELECT id FROM dealers
  LOOP
    PERFORM enrich_dealer_from_vehicles(v_dealer_id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

-- ============================================================
-- 4. RPC: backfill_equipment_for_vehicle
--    Pro jeden konkrétní vůz spustí extract_equipment_from_text
--    (z migrace 014) a vloží do vehicle_equipment. Použito jak
--    z importního skriptu, tak z backfill_equipment_for_existing.
-- ============================================================

CREATE OR REPLACE FUNCTION backfill_equipment_for_vehicle(p_vehicle_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_text TEXT;
  v_ids INTEGER[];
  v_inserted INTEGER := 0;
BEGIN
  SELECT COALESCE(description, '') || ' ' || COALESCE(note, '') ||
         ' ' || COALESCE(title, '') INTO v_text
  FROM vehicles WHERE id = p_vehicle_id;

  IF v_text IS NULL THEN RETURN 0; END IF;

  v_ids := extract_equipment_from_text(v_text);
  IF array_length(v_ids, 1) IS NULL THEN RETURN 0; END IF;

  INSERT INTO vehicle_equipment (vehicle_id, equipment_id)
  SELECT p_vehicle_id, unnest(v_ids)
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$$;

-- ============================================================
-- 5. Diagnostické zobrazení statistik
-- ============================================================

CREATE OR REPLACE FUNCTION get_data_health()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'vehicles', jsonb_build_object(
      'total_active', (SELECT COUNT(*) FROM vehicles WHERE is_active=TRUE),
      'with_dealer', (SELECT COUNT(*) FROM vehicles WHERE is_active=TRUE AND dealer_id IS NOT NULL),
      'without_dealer', (SELECT COUNT(*) FROM vehicles WHERE is_active=TRUE AND dealer_id IS NULL AND seller_name IS NOT NULL),
      'with_equipment', (SELECT COUNT(*) FROM vehicles WHERE is_active=TRUE AND array_length(equipment_ids, 1) > 0),
      'with_geo', (SELECT COUNT(*) FROM vehicles WHERE is_active=TRUE AND geo IS NOT NULL),
      'with_slug', (SELECT COUNT(*) FROM vehicles WHERE is_active=TRUE AND slug IS NOT NULL)
    ),
    'dealers', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM dealers),
      'private', (SELECT COUNT(*) FROM dealers WHERE type_id = 1),
      'business', (SELECT COUNT(*) FROM dealers WHERE type_id != 1 OR type_id IS NULL),
      'verified', (SELECT COUNT(*) FROM dealers WHERE is_verified = TRUE),
      'with_logo', (SELECT COUNT(*) FROM dealers WHERE logo_url IS NOT NULL),
      'with_geo', (SELECT COUNT(*) FROM dealers WHERE geo IS NOT NULL)
    ),
    'inquiries', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM vehicle_inquiries),
      'new', (SELECT COUNT(*) FROM vehicle_inquiries WHERE status = 'new'),
      'contacted', (SELECT COUNT(*) FROM vehicle_inquiries WHERE status = 'contacted')
    ),
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM users),
      'private_sellers', (SELECT COUNT(*) FROM users WHERE role = 'private_seller'),
      'dealer_admins', (SELECT COUNT(*) FROM users WHERE role = 'dealer_admin')
    )
  ) INTO result;
  RETURN result;
END;
$$;
