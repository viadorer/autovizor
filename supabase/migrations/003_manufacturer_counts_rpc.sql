-- ============================================================
-- 003: RPC funkce get_manufacturer_counts
-- Vrací počty aktivních vozidel dle výrobce
-- ============================================================

CREATE OR REPLACE FUNCTION get_manufacturer_counts()
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  vehicle_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      m.id,
      m.name,
      COUNT(v.id) AS vehicle_count
    FROM manufacturers m
    LEFT JOIN vehicles v ON v.manufacturer_id = m.id AND v.is_active = TRUE
    GROUP BY m.id, m.name
    HAVING COUNT(v.id) > 0
    ORDER BY vehicle_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;
