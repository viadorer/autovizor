-- ============================================================
-- AUTOVIZOR.CZ — Migrace 012
-- Fix: get_similar_vehicles vrací JOIN-enriched JSONB
--   (původní verze 009 vracela SETOF vehicles bez manufacturer_name,
--    fuel_name atd. → frontend VehicleCard nezobrazoval popisky)
-- ============================================================

DROP FUNCTION IF EXISTS get_similar_vehicles(BIGINT, INTEGER);

CREATE OR REPLACE FUNCTION get_similar_vehicles(
  p_vehicle_id BIGINT,
  p_limit INTEGER DEFAULT 6
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_ref RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_ref FROM vehicles WHERE id = p_vehicle_id;
  IF v_ref IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(sub)), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      v.*,
      m.name AS manufacturer_name,
      mo.name AS model_name,
      f.name AS fuel_name,
      g.name AS gearbox_name,
      c.name AS color_name,
      cd.name AS condition_name,
      r.name AS region_name,
      dr.name AS drive_name,
      bt.name AS body_type_name
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
    LIMIT p_limit
  ) sub;

  RETURN v_result;
END;
$$;
