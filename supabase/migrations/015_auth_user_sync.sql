-- ============================================================
-- AUTOVIZOR.CZ — Migrace 015
-- Auto-sync auth.users → public.users při registraci/přihlášení
--
-- Supabase má auth.users tabulku, my máme public.users s rozšířenými poli
-- (role, dealer_id, phone_verified_at, atd.). Trigger zajistí, že nový
-- záznam v auth.users vytvoří odpovídající řádek v public.users.
-- ============================================================

-- Funkce: sync new auth user → public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
BEGIN
  -- Extrahuj role + name z user_metadata (poslané z signUp options.data)
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
  v_name := NEW.raw_user_meta_data->>'name';

  -- Validace role
  IF v_role NOT IN ('buyer', 'private_seller', 'dealer_admin', 'admin') THEN
    v_role := 'buyer';
  END IF;

  -- Insert (ON CONFLICT DO NOTHING — pokud už existuje, neměníme)
  INSERT INTO public.users (id, email, name, role, email_verified_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        email_verified_at = COALESCE(public.users.email_verified_at, EXCLUDED.email_verified_at);

  RETURN NEW;
END;
$$;

-- Trigger na auth.users (vyžaduje SUPERUSER, Supabase Dashboard má povolení)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Trigger pro update (email confirmed, atd.)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- BACKFILL: synchronizuj existující auth.users → public.users
-- (pro účty, které vznikly před touto migrací)
-- ============================================================
INSERT INTO public.users (id, email, name, role, email_verified_at)
SELECT
  id,
  email,
  raw_user_meta_data->>'name',
  COALESCE(raw_user_meta_data->>'role', 'buyer') AS role,
  email_confirmed_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
