-- ============================================================
-- AUTOVIZOR.CZ — Migrace 018
-- Supabase Storage bucket pro fotky vozidel z Sell wizardu
--
-- Bucket: vehicle-photos
-- Struktura: {user_id}/{vehicle_id-or-draft-uuid}/{index}.{ext}
-- Public read, authenticated write (vlastník vozidla nebo dealer)
-- ============================================================

-- 1. Bucket — public (čteno přímo z UI bez auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-photos',
  'vehicle-photos',
  TRUE,
  10 * 1024 * 1024, -- 10 MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS policies pro storage.objects v rámci tohoto bucketu

-- Public read — kdokoliv může číst (potřeba pro <img src=> z UI)
DROP POLICY IF EXISTS "vehicle_photos_public_read" ON storage.objects;
CREATE POLICY "vehicle_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos');

-- Insert — jen authenticated uživatel může nahrávat, do svého folderu
-- Path = {user_id}/... → musí začínat auth.uid()
DROP POLICY IF EXISTS "vehicle_photos_user_insert" ON storage.objects;
CREATE POLICY "vehicle_photos_user_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update — jen vlastník složky
DROP POLICY IF EXISTS "vehicle_photos_user_update" ON storage.objects;
CREATE POLICY "vehicle_photos_user_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vehicle-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete — jen vlastník složky
DROP POLICY IF EXISTS "vehicle_photos_user_delete" ON storage.objects;
CREATE POLICY "vehicle_photos_user_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 3. Drafts: rozšíření vehicles o JSONB pro rozpracovaný state
--    (pokud uživatel zavře wizard, můžeme se vrátit přes
--     ProtectedRoute → načíst posledí draft per user)
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS draft_data JSONB;

CREATE INDEX IF NOT EXISTS idx_vehicles_user_draft
  ON vehicles(user_id, updated_at DESC)
  WHERE published_status = 'draft';

-- ============================================================
-- 4. RPC: get_my_draft — pro user vrací poslední draft
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_draft()
RETURNS SETOF vehicles
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM vehicles
  WHERE user_id = auth.uid()
    AND published_status = 'draft'
  ORDER BY updated_at DESC
  LIMIT 1;
END;
$$;
