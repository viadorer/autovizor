-- ============================================================
-- AUTOVIZOR.CZ — Migrace 010
-- Slug sloupce pro SEO friendly URLy:
--   /vozidlo/skoda-octavia-2-0-tdi-110kw-2019-123456
--   /znacka/skoda
--   /znacka/skoda/octavia
--   /prodejce/auto-jarov
-- ============================================================

-- Helper: česky-bezpečný slug generator (NFD + odstranění diakritiky + lower + dash)
CREATE OR REPLACE FUNCTION make_slug(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  s TEXT;
BEGIN
  IF input IS NULL OR length(trim(input)) = 0 THEN
    RETURN NULL;
  END IF;
  -- unaccent → lowercase → non-alphanumeric to dash → collapse dashes → trim dashes
  s := lower(unaccent(input));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '^-+|-+$', '', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  IF length(s) = 0 THEN
    RETURN 'item';
  END IF;
  RETURN s;
END;
$$;

-- ============================================================
-- 1. VEHICLES.slug
-- /vozidlo/{slug}-{id} — slug+id zaručuje uniqueness
-- ============================================================
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE vehicles
SET slug = make_slug(
  COALESCE(title, '') ||
  CASE WHEN made_year IS NOT NULL THEN ' ' || made_year::TEXT ELSE '' END
)
WHERE slug IS NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_slug ON vehicles(slug) WHERE is_active = TRUE;

CREATE OR REPLACE FUNCTION vehicles_set_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' OR NEW.title IS DISTINCT FROM OLD.title THEN
    NEW.slug := make_slug(
      COALESCE(NEW.title, '') ||
      CASE WHEN NEW.made_year IS NOT NULL THEN ' ' || NEW.made_year::TEXT ELSE '' END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicles_slug_trigger ON vehicles;
CREATE TRIGGER vehicles_slug_trigger
  BEFORE INSERT OR UPDATE OF title, made_year ON vehicles
  FOR EACH ROW EXECUTE FUNCTION vehicles_set_slug();

-- ============================================================
-- 2. MANUFACTURERS.slug — fallback na seo_name (Sauto)
-- ============================================================
-- seo_name už existuje, jen ho použijeme jako primary slug.
-- Doplníme tam, kde chybí.
UPDATE manufacturers
SET seo_name = make_slug(name)
WHERE seo_name IS NULL OR seo_name = '';

-- ============================================================
-- 3. MODELS.slug — dtto
-- ============================================================
UPDATE models
SET seo_name = make_slug(name)
WHERE seo_name IS NULL OR seo_name = '';

CREATE INDEX IF NOT EXISTS idx_models_seo ON models(seo_name);

-- ============================================================
-- 4. DEALERS.slug — auto-generate z name
-- ============================================================
UPDATE dealers
SET slug = make_slug(name) || '-' || id::TEXT
WHERE slug IS NULL OR slug = '';

CREATE OR REPLACE FUNCTION dealers_set_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := make_slug(NEW.name) || '-' || NEW.id::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealers_slug_trigger ON dealers;
CREATE TRIGGER dealers_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON dealers
  FOR EACH ROW EXECUTE FUNCTION dealers_set_slug();

-- ============================================================
-- 5. RPC pro lookup vehicle podle slug (s id pro fallback)
-- ============================================================
CREATE OR REPLACE FUNCTION get_vehicle_by_slug_id(p_id BIGINT)
RETURNS SETOF vehicles
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY SELECT * FROM vehicles WHERE id = p_id LIMIT 1;
END;
$$;

-- ============================================================
-- 6. SITEMAP DATA RPC — vrací vše pro generátor sitemap.xml
-- ============================================================
CREATE OR REPLACE FUNCTION get_sitemap_urls(
  p_offset INTEGER DEFAULT 0,
  p_limit INTEGER DEFAULT 50000
)
RETURNS TABLE (
  url_path TEXT,
  last_modified TIMESTAMPTZ,
  priority NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  -- Vehicles (highest priority - search traffic)
  SELECT
    '/vozidlo/' || v.slug || '-' || v.id AS url_path,
    GREATEST(v.updated_at, v.created_at) AS last_modified,
    0.8::NUMERIC AS priority
  FROM vehicles v
  WHERE v.is_active = TRUE AND v.slug IS NOT NULL
  ORDER BY v.updated_at DESC
  OFFSET p_offset LIMIT p_limit;
END;
$$;
