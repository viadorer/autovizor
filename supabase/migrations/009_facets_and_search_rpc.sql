-- ============================================================
-- AUTOVIZOR.CZ — Migrace 009
-- Pokročilé RPC funkce pro vyhledávání:
--   1. search_vehicles_v2 — kompletní WHERE pokrývající všechny filtry z Vehicle typu
--   2. get_filter_facets — počty per dimenze pro live faceted search
--   3. get_similar_vehicles — podobné vozy dle params (engagement)
--   4. log_vehicle_view — increment views_count + denní agregace
--   5. get_recently_viewed — pro home page
-- ============================================================

-- ============================================================
-- 1. SEARCH_VEHICLES_V2 — kompletní query builder server-side
-- ============================================================
-- Bere filtry jako JSONB pro flexibilitu, vrací stránku + total
-- Použití z klienta: supabase.rpc('search_vehicles_v2', { p_filters: {...}, p_page: 1, p_per_page: 20 })
-- ============================================================

CREATE OR REPLACE FUNCTION search_vehicles_v2(
  p_filters JSONB DEFAULT '{}'::jsonb,
  p_page INTEGER DEFAULT 1,
  p_per_page INTEGER DEFAULT 20,
  p_sort_by TEXT DEFAULT 'created_at'
)
RETURNS TABLE (
  vehicles JSONB,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_where TEXT := 'WHERE v.is_active = TRUE';
  v_order TEXT;
  v_offset INTEGER := GREATEST(0, (p_page - 1) * p_per_page);
  v_total BIGINT;
  v_result JSONB;
  v_eq_ids INTEGER[];
  v_kind_id INTEGER;
  v_user_lat NUMERIC;
  v_user_lng NUMERIC;
  v_radius_km NUMERIC;
BEGIN
  -- Pomocná funkce pro INT filtr
  -- (inlinujeme pro výkon)

  -- ID rovnostní filtry
  IF p_filters ? 'kind_id' THEN
    v_kind_id := (p_filters->>'kind_id')::INTEGER;
    v_where := v_where || ' AND v.kind_id = ' || v_kind_id;
  END IF;
  IF p_filters ? 'manufacturer_id' THEN v_where := v_where || ' AND v.manufacturer_id = ' || (p_filters->>'manufacturer_id')::INTEGER; END IF;
  IF p_filters ? 'model_id' THEN v_where := v_where || ' AND v.model_id = ' || (p_filters->>'model_id')::INTEGER; END IF;
  IF p_filters ? 'fuel_type_id' THEN v_where := v_where || ' AND v.fuel_type_id = ' || (p_filters->>'fuel_type_id')::INTEGER; END IF;
  IF p_filters ? 'gearbox_id' THEN v_where := v_where || ' AND v.gearbox_id = ' || (p_filters->>'gearbox_id')::INTEGER; END IF;
  IF p_filters ? 'gearbox_level_id' THEN v_where := v_where || ' AND v.gearbox_level_id = ' || (p_filters->>'gearbox_level_id')::INTEGER; END IF;
  IF p_filters ? 'color_id' THEN v_where := v_where || ' AND v.color_id = ' || (p_filters->>'color_id')::INTEGER; END IF;
  IF p_filters ? 'color_tone_id' THEN v_where := v_where || ' AND v.color_tone_id = ' || (p_filters->>'color_tone_id')::INTEGER; END IF;
  IF p_filters ? 'color_type_id' THEN v_where := v_where || ' AND v.color_type_id = ' || (p_filters->>'color_type_id')::INTEGER; END IF;
  IF p_filters ? 'condition_id' THEN v_where := v_where || ' AND v.condition_id = ' || (p_filters->>'condition_id')::INTEGER; END IF;
  IF p_filters ? 'region_id' THEN v_where := v_where || ' AND v.region_id = ' || (p_filters->>'region_id')::INTEGER; END IF;
  IF p_filters ? 'body_type_id' THEN v_where := v_where || ' AND v.body_type_id = ' || (p_filters->>'body_type_id')::INTEGER; END IF;
  IF p_filters ? 'drive_id' THEN v_where := v_where || ' AND v.drive_id = ' || (p_filters->>'drive_id')::INTEGER; END IF;
  IF p_filters ? 'aircondition_id' THEN v_where := v_where || ' AND v.aircondition_id = ' || (p_filters->>'aircondition_id')::INTEGER; END IF;
  IF p_filters ? 'euro_id' THEN v_where := v_where || ' AND v.euro_id = ' || (p_filters->>'euro_id')::INTEGER; END IF;
  IF p_filters ? 'door_count_id' THEN v_where := v_where || ' AND v.door_count_id = ' || (p_filters->>'door_count_id')::INTEGER; END IF;
  IF p_filters ? 'capacity_id' THEN v_where := v_where || ' AND v.capacity_id = ' || (p_filters->>'capacity_id')::INTEGER; END IF;
  IF p_filters ? 'country_id' THEN v_where := v_where || ' AND v.country_id = ' || (p_filters->>'country_id')::INTEGER; END IF;
  IF p_filters ? 'servicebook_id' THEN v_where := v_where || ' AND v.servicebook_id = ' || (p_filters->>'servicebook_id')::INTEGER; END IF;
  IF p_filters ? 'upholstery_id' THEN v_where := v_where || ' AND v.upholstery_id = ' || (p_filters->>'upholstery_id')::INTEGER; END IF;
  IF p_filters ? 'owner_count_id' THEN v_where := v_where || ' AND v.owner_count_id = ' || (p_filters->>'owner_count_id')::INTEGER; END IF;
  IF p_filters ? 'deal_type_id' THEN v_where := v_where || ' AND v.deal_type_id = ' || (p_filters->>'deal_type_id')::INTEGER; END IF;
  IF p_filters ? 'seller_type_id' THEN v_where := v_where || ' AND v.seller_type_id = ' || (p_filters->>'seller_type_id')::INTEGER; END IF;
  IF p_filters ? 'certified_id' THEN v_where := v_where || ' AND v.certified_id = ' || (p_filters->>'certified_id')::INTEGER; END IF;
  IF p_filters ? 'availability_id' THEN v_where := v_where || ' AND v.availability_id = ' || (p_filters->>'availability_id')::INTEGER; END IF;
  IF p_filters ? 'airbag_count_id' THEN v_where := v_where || ' AND v.airbag_count_id = ' || (p_filters->>'airbag_count_id')::INTEGER; END IF;
  IF p_filters ? 'bed_count_id' THEN v_where := v_where || ' AND v.bed_count_id = ' || (p_filters->>'bed_count_id')::INTEGER; END IF;
  IF p_filters ? 'motorcycle_type_id' THEN v_where := v_where || ' AND v.motorcycle_type_id = ' || (p_filters->>'motorcycle_type_id')::INTEGER; END IF;
  IF p_filters ? 'truck_type_id' THEN v_where := v_where || ' AND v.truck_type_id = ' || (p_filters->>'truck_type_id')::INTEGER; END IF;
  IF p_filters ? 'bus_type_id' THEN v_where := v_where || ' AND v.bus_type_id = ' || (p_filters->>'bus_type_id')::INTEGER; END IF;
  IF p_filters ? 'trailer_type_id' THEN v_where := v_where || ' AND v.trailer_type_id = ' || (p_filters->>'trailer_type_id')::INTEGER; END IF;
  IF p_filters ? 'seatplace_id' THEN v_where := v_where || ' AND v.seatplace_id = ' || (p_filters->>'seatplace_id')::INTEGER; END IF;
  IF p_filters ? 'quad_type_id' THEN v_where := v_where || ' AND v.quad_type_id = ' || (p_filters->>'quad_type_id')::INTEGER; END IF;
  IF p_filters ? 'machine_type_id' THEN v_where := v_where || ' AND v.machine_type_id = ' || (p_filters->>'machine_type_id')::INTEGER; END IF;

  -- Range filtry
  IF p_filters ? 'price_from' THEN v_where := v_where || ' AND v.price >= ' || (p_filters->>'price_from')::INTEGER; END IF;
  IF p_filters ? 'price_to' THEN v_where := v_where || ' AND v.price <= ' || (p_filters->>'price_to')::INTEGER; END IF;
  IF p_filters ? 'year_from' THEN v_where := v_where || ' AND v.made_year >= ' || (p_filters->>'year_from')::INTEGER; END IF;
  IF p_filters ? 'year_to' THEN v_where := v_where || ' AND v.made_year <= ' || (p_filters->>'year_to')::INTEGER; END IF;
  IF p_filters ? 'km_from' THEN v_where := v_where || ' AND v.tachometer >= ' || (p_filters->>'km_from')::INTEGER; END IF;
  IF p_filters ? 'km_to' THEN v_where := v_where || ' AND v.tachometer <= ' || (p_filters->>'km_to')::INTEGER; END IF;
  IF p_filters ? 'power_from' THEN v_where := v_where || ' AND v.engine_power >= ' || (p_filters->>'power_from')::INTEGER; END IF;
  IF p_filters ? 'power_to' THEN v_where := v_where || ' AND v.engine_power <= ' || (p_filters->>'power_to')::INTEGER; END IF;
  IF p_filters ? 'volume_from' THEN v_where := v_where || ' AND v.engine_volume >= ' || (p_filters->>'volume_from')::INTEGER; END IF;
  IF p_filters ? 'volume_to' THEN v_where := v_where || ' AND v.engine_volume <= ' || (p_filters->>'volume_to')::INTEGER; END IF;

  -- Bool filtry
  IF (p_filters->>'vat_deductible')::BOOLEAN IS TRUE THEN v_where := v_where || ' AND v.vat_deductible = TRUE'; END IF;
  IF (p_filters->>'first_owner')::BOOLEAN IS TRUE THEN v_where := v_where || ' AND v.first_owner = 1'; END IF;
  IF p_filters ? 'crashed' THEN
    v_where := v_where || ' AND v.crashed = ' || ((p_filters->>'crashed')::BOOLEAN)::TEXT;
  END IF;
  IF (p_filters->>'tunning')::BOOLEAN IS TRUE THEN v_where := v_where || ' AND v.tunning = TRUE'; END IF;
  IF (p_filters->>'handicapped')::BOOLEAN IS TRUE THEN v_where := v_where || ' AND v.handicapped = TRUE'; END IF;

  -- Equipment array (vyžaduje VŠECHNY zaškrtnuté)
  IF p_filters ? 'equipment_ids' THEN
    v_eq_ids := ARRAY(SELECT jsonb_array_elements_text(p_filters->'equipment_ids')::INTEGER);
    IF array_length(v_eq_ids, 1) > 0 THEN
      v_where := v_where || ' AND v.equipment_ids @> ARRAY[' ||
        array_to_string(v_eq_ids, ',') || ']::INTEGER[]';
    END IF;
  END IF;

  -- Geo: vozidla v okolí (km od user_lat/user_lng)
  IF p_filters ? 'user_lat' AND p_filters ? 'user_lng' AND p_filters ? 'radius_km' THEN
    v_user_lat := (p_filters->>'user_lat')::NUMERIC;
    v_user_lng := (p_filters->>'user_lng')::NUMERIC;
    v_radius_km := (p_filters->>'radius_km')::NUMERIC;
    v_where := v_where || format(
      ' AND v.geo IS NOT NULL AND ST_DWithin(v.geo, ST_SetSRID(ST_MakePoint(%s,%s),4326)::geography, %s)',
      v_user_lng, v_user_lat, v_radius_km * 1000
    );
  END IF;

  -- Fulltext: trigram nad title (rychlejší než ILIKE pro velký objem)
  IF p_filters ? 'query' THEN
    v_where := v_where || format(' AND v.title %% %L', p_filters->>'query');
  END IF;

  -- Řazení
  v_order := CASE p_sort_by
    WHEN 'price_asc' THEN 'v.price ASC NULLS LAST'
    WHEN 'price_desc' THEN 'v.price DESC NULLS LAST'
    WHEN 'year_desc' THEN 'v.made_year DESC NULLS LAST'
    WHEN 'year_asc' THEN 'v.made_year ASC NULLS LAST'
    WHEN 'km_asc' THEN 'v.tachometer ASC NULLS LAST'
    WHEN 'km_desc' THEN 'v.tachometer DESC NULLS LAST'
    WHEN 'power_desc' THEN 'v.engine_power DESC NULLS LAST'
    WHEN 'views_desc' THEN 'v.views_count DESC NULLS LAST'
    ELSE 'v.priority_ordering DESC NULLS LAST, v.created_at DESC'
  END;

  -- Total count
  EXECUTE 'SELECT COUNT(*) FROM vehicles v ' || v_where INTO v_total;

  -- Data + joiny
  EXECUTE format($f$
    SELECT COALESCE(jsonb_agg(row_to_json(sub)), '[]'::jsonb) FROM (
      SELECT v.*,
             m.name AS manufacturer_name,
             mo.name AS model_name,
             f.name AS fuel_name,
             g.name AS gearbox_name,
             c.name AS color_name,
             cd.name AS condition_name,
             r.name AS region_name,
             dr.name AS drive_name,
             bt.name AS body_type_name,
             ac.name AS aircondition_name,
             eu.name AS euro_name,
             co.name AS country_name
      FROM vehicles v
      LEFT JOIN manufacturers m ON m.id = v.manufacturer_id
      LEFT JOIN models mo ON mo.id = v.model_id
      LEFT JOIN fuel_types f ON f.id = v.fuel_type_id
      LEFT JOIN gearbox_types g ON g.id = v.gearbox_id
      LEFT JOIN colors c ON c.id = v.color_id
      LEFT JOIN conditions cd ON cd.id = v.condition_id
      LEFT JOIN regions r ON r.id = v.region_id
      LEFT JOIN drive_types dr ON dr.id = v.drive_id
      LEFT JOIN body_types bt ON bt.id = v.body_type_id
      LEFT JOIN aircondition_types ac ON ac.id = v.aircondition_id
      LEFT JOIN euro_types eu ON eu.id = v.euro_id
      LEFT JOIN countries co ON co.id = v.country_id
      %s
      ORDER BY %s
      LIMIT %s OFFSET %s
    ) sub
  $f$, v_where, v_order, p_per_page, v_offset)
  INTO v_result;

  RETURN QUERY SELECT v_result, v_total;
END;
$$;

-- ============================================================
-- 2. GET_FILTER_FACETS — počty per dimenze pro UI live counts
-- ============================================================

CREATE OR REPLACE FUNCTION get_filter_facets(
  p_filters JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_base_where TEXT := 'WHERE v.is_active = TRUE';
  v_kind_id INTEGER;
  v_result JSONB := '{}'::jsonb;
  v_temp JSONB;
BEGIN
  -- Aplikujeme jen kind_id (pro per-kategorii facets — body_types, fuel atd.)
  -- Ostatní facety se počítají BEZ aplikování stejné dimenze (klasický UX)
  IF p_filters ? 'kind_id' THEN
    v_kind_id := (p_filters->>'kind_id')::INTEGER;
    v_base_where := v_base_where || ' AND v.kind_id = ' || v_kind_id;
  END IF;

  -- Manufacturers
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(manufacturer_id, c), '{}'::jsonb)
    FROM (
      SELECT v.manufacturer_id, COUNT(*) AS c
      FROM vehicles v
      %s AND v.manufacturer_id IS NOT NULL
      GROUP BY v.manufacturer_id
    ) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('manufacturer_id', v_temp);

  -- Fuel types
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(fuel_type_id, c), '{}'::jsonb)
    FROM (
      SELECT v.fuel_type_id, COUNT(*) AS c
      FROM vehicles v %s AND v.fuel_type_id IS NOT NULL
      GROUP BY v.fuel_type_id
    ) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('fuel_type_id', v_temp);

  -- Gearbox
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(gearbox_id, c), '{}'::jsonb)
    FROM (SELECT v.gearbox_id, COUNT(*) AS c FROM vehicles v %s AND v.gearbox_id IS NOT NULL GROUP BY v.gearbox_id) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('gearbox_id', v_temp);

  -- Body type
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(body_type_id, c), '{}'::jsonb)
    FROM (SELECT v.body_type_id, COUNT(*) AS c FROM vehicles v %s AND v.body_type_id IS NOT NULL GROUP BY v.body_type_id) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('body_type_id', v_temp);

  -- Drive
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(drive_id, c), '{}'::jsonb)
    FROM (SELECT v.drive_id, COUNT(*) AS c FROM vehicles v %s AND v.drive_id IS NOT NULL GROUP BY v.drive_id) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('drive_id', v_temp);

  -- Color
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(color_id, c), '{}'::jsonb)
    FROM (SELECT v.color_id, COUNT(*) AS c FROM vehicles v %s AND v.color_id IS NOT NULL GROUP BY v.color_id) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('color_id', v_temp);

  -- Condition
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(condition_id, c), '{}'::jsonb)
    FROM (SELECT v.condition_id, COUNT(*) AS c FROM vehicles v %s AND v.condition_id IS NOT NULL GROUP BY v.condition_id) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('condition_id', v_temp);

  -- Region (pro lokační filtr)
  EXECUTE format($f$
    SELECT COALESCE(jsonb_object_agg(region_id, c), '{}'::jsonb)
    FROM (SELECT v.region_id, COUNT(*) AS c FROM vehicles v %s AND v.region_id IS NOT NULL GROUP BY v.region_id) sub
  $f$, v_base_where) INTO v_temp;
  v_result := v_result || jsonb_build_object('region_id', v_temp);

  -- Total
  EXECUTE 'SELECT COUNT(*) FROM vehicles v ' || v_base_where INTO v_temp;
  v_result := v_result || jsonb_build_object('total', v_temp);

  RETURN v_result;
END;
$$;

-- ============================================================
-- 3. GET_SIMILAR_VEHICLES — podobné vozy
-- ============================================================
CREATE OR REPLACE FUNCTION get_similar_vehicles(
  p_vehicle_id BIGINT,
  p_limit INTEGER DEFAULT 6
)
RETURNS SETOF vehicles
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_ref RECORD;
BEGIN
  SELECT * INTO v_ref FROM vehicles WHERE id = p_vehicle_id;
  IF v_ref IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT v.*
  FROM vehicles v
  WHERE v.is_active = TRUE
    AND v.id <> p_vehicle_id
    AND (v.kind_id = v_ref.kind_id OR v_ref.kind_id IS NULL)
    AND (v.manufacturer_id = v_ref.manufacturer_id OR v.body_type_id = v_ref.body_type_id)
    AND (v_ref.price IS NULL OR v.price BETWEEN v_ref.price * 0.7 AND v_ref.price * 1.3)
  ORDER BY
    -- Skóre podobnosti: stejný model > stejný výrobce > stejná karoserie
    CASE
      WHEN v.model_id = v_ref.model_id THEN 1
      WHEN v.manufacturer_id = v_ref.manufacturer_id THEN 2
      WHEN v.body_type_id = v_ref.body_type_id THEN 3
      ELSE 4
    END,
    ABS(v.price - COALESCE(v_ref.price, v.price)) ASC,
    v.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================
-- 4. LOG_VEHICLE_VIEW — bezpečně inkrementuje views
-- ============================================================
CREATE OR REPLACE FUNCTION log_vehicle_view(
  p_vehicle_id BIGINT,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Increment counter (cheap)
  UPDATE vehicles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_vehicle_id;

  -- Denní agregát
  INSERT INTO vehicle_views_daily (vehicle_id, day, view_count)
  VALUES (p_vehicle_id, CURRENT_DATE, 1)
  ON CONFLICT (vehicle_id, day)
  DO UPDATE SET view_count = vehicle_views_daily.view_count + 1;

  -- Plný history záznam (pro recently viewed)
  INSERT INTO view_history (user_id, vehicle_id, session_id, viewed_at)
  VALUES (p_user_id, p_vehicle_id, p_session_id, NOW());
END;
$$;

-- Open RLS for view_history insert (anyone can log a view)
DROP POLICY IF EXISTS view_history_anyone_insert ON view_history;
CREATE POLICY view_history_anyone_insert ON view_history FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- 5. GET_RECENTLY_VIEWED — vozy podle session_id nebo user_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_recently_viewed(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 8
)
RETURNS SETOF vehicles
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_user_id IS NULL AND p_session_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH last_views AS (
    SELECT DISTINCT ON (vehicle_id) vehicle_id, viewed_at
    FROM view_history
    WHERE (p_user_id IS NOT NULL AND user_id = p_user_id)
       OR (p_session_id IS NOT NULL AND session_id = p_session_id)
    ORDER BY vehicle_id, viewed_at DESC
  )
  SELECT v.*
  FROM vehicles v
  JOIN last_views lv ON lv.vehicle_id = v.id
  WHERE v.is_active = TRUE
  ORDER BY lv.viewed_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================================
-- 6. GET_PRICE_DROPS — vozy s nedávným poklesem ceny
-- ============================================================
CREATE OR REPLACE FUNCTION get_price_drops(
  p_limit INTEGER DEFAULT 12,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  vehicle_id BIGINT,
  current_price INTEGER,
  previous_price INTEGER,
  drop_pct NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      ph.vehicle_id,
      ph.price,
      ph.recorded_at,
      ROW_NUMBER() OVER (PARTITION BY ph.vehicle_id ORDER BY ph.recorded_at DESC) AS rn
    FROM vehicle_price_history ph
    WHERE ph.recorded_at > NOW() - (p_days || ' days')::INTERVAL
  ),
  current_vs_prev AS (
    SELECT
      r1.vehicle_id,
      r1.price AS current_price,
      r2.price AS previous_price
    FROM ranked r1
    JOIN ranked r2 ON r1.vehicle_id = r2.vehicle_id AND r2.rn = 2
    WHERE r1.rn = 1 AND r1.price < r2.price
  )
  SELECT
    cvp.vehicle_id,
    cvp.current_price,
    cvp.previous_price,
    ROUND(((cvp.previous_price - cvp.current_price)::NUMERIC / cvp.previous_price) * 100, 2) AS drop_pct
  FROM current_vs_prev cvp
  JOIN vehicles v ON v.id = cvp.vehicle_id
  WHERE v.is_active = TRUE
  ORDER BY drop_pct DESC
  LIMIT p_limit;
END;
$$;
