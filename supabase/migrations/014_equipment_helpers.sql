-- ============================================================
-- AUTOVIZOR.CZ — Migrace 014
-- Equipment backfill helpery + utility funkce
--
-- Stávající stav:
--  - vehicle_equipment (M:N) je z importů ze Sauto / TipCars
--    pravděpodobně prázdná (TipCars XML nemá strukturovanou výbavu)
--  - vehicles.equipment_ids[] je tedy []
--
-- Strategie:
--  1) Pokud běží Sauto sync, equipment přijde s daty
--  2) Pro TipCars: parse z description přes keyword match (helper RPC)
--  3) VIN decoder vrací equipment array → backfill skript
-- ============================================================

-- ============================================================
-- 1. RPC: extract_equipment_from_text
--    Heuristický keyword match přes EQUIPMENT názvy
--    Vstup: free text (description, note)
--    Výstup: pole equipment_id
-- ============================================================

CREATE OR REPLACE FUNCTION extract_equipment_from_text(p_text TEXT)
RETURNS INTEGER[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_text TEXT;
  v_result INTEGER[];
BEGIN
  IF p_text IS NULL OR length(p_text) < 5 THEN RETURN '{}'; END IF;

  v_text := lower(unaccent(p_text));

  -- Match equipment, kde název (lowercase, unaccent) je substring textu
  -- a je >= 4 znaky (filtr na false positives jako "led")
  SELECT array_agg(DISTINCT id)
  INTO v_result
  FROM equipment
  WHERE length(name) >= 4
    AND v_text LIKE '%' || lower(unaccent(name)) || '%';

  RETURN COALESCE(v_result, '{}');
END;
$$;

-- ============================================================
-- 2. Bulk backfill RPC: vehicles bez equipment dostanou
--    equipment_ids z description heuristikou
--    Volat manuálně, ne v triggeru (drahé)
-- ============================================================

CREATE OR REPLACE FUNCTION backfill_equipment_from_descriptions(p_limit INTEGER DEFAULT 1000)
RETURNS TABLE (
  updated_count INTEGER,
  total_equipment_added BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER := 0;
  v_total BIGINT := 0;
  v_record RECORD;
  v_extracted INTEGER[];
BEGIN
  FOR v_record IN
    SELECT id, description, note
    FROM vehicles
    WHERE is_active = TRUE
      AND (equipment_ids IS NULL OR equipment_ids = '{}')
      AND (description IS NOT NULL OR note IS NOT NULL)
    LIMIT p_limit
  LOOP
    v_extracted := extract_equipment_from_text(
      COALESCE(v_record.description, '') || ' ' || COALESCE(v_record.note, '')
    );

    IF array_length(v_extracted, 1) > 0 THEN
      -- Insert do M:N tabulky (trigger pak naplní equipment_ids[])
      INSERT INTO vehicle_equipment (vehicle_id, equipment_id)
      SELECT v_record.id, unnest(v_extracted)
      ON CONFLICT DO NOTHING;

      v_count := v_count + 1;
      v_total := v_total + array_length(v_extracted, 1);
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_count, v_total;
END;
$$;

-- ============================================================
-- 3. Statistiky equipment coverage
-- ============================================================

CREATE OR REPLACE FUNCTION get_equipment_coverage_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_vehicles', (SELECT COUNT(*) FROM vehicles WHERE is_active = TRUE),
    'with_equipment', (
      SELECT COUNT(*) FROM vehicles
      WHERE is_active = TRUE
        AND equipment_ids IS NOT NULL
        AND array_length(equipment_ids, 1) > 0
    ),
    'avg_equipment_per_vehicle', (
      SELECT ROUND(AVG(array_length(equipment_ids, 1))::NUMERIC, 1)
      FROM vehicles
      WHERE is_active = TRUE AND array_length(equipment_ids, 1) > 0
    ),
    'top_equipment', (
      SELECT jsonb_agg(jsonb_build_object('id', id, 'name', name, 'count', cnt))
      FROM (
        SELECT e.id, e.name, COUNT(*) AS cnt
        FROM equipment e
        JOIN vehicle_equipment ve ON ve.equipment_id = e.id
        JOIN vehicles v ON v.id = ve.vehicle_id AND v.is_active = TRUE
        GROUP BY e.id, e.name
        ORDER BY cnt DESC
        LIMIT 20
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 4. RPC pro autocomplete equipment (typeahead v Sell wizard)
-- ============================================================

CREATE OR REPLACE FUNCTION search_equipment(p_query TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (id INTEGER, name TEXT, category TEXT)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_query IS NULL OR length(p_query) < 2 THEN
    RETURN QUERY SELECT e.id, e.name, e.category FROM equipment e ORDER BY e.name LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT e.id, e.name, e.category
    FROM equipment e
    WHERE lower(unaccent(e.name)) ILIKE '%' || lower(unaccent(p_query)) || '%'
    ORDER BY
      CASE WHEN lower(unaccent(e.name)) = lower(unaccent(p_query)) THEN 1
           WHEN lower(unaccent(e.name)) LIKE lower(unaccent(p_query)) || '%' THEN 2
           ELSE 3
      END,
      e.name
    LIMIT p_limit;
  END IF;
END;
$$;
