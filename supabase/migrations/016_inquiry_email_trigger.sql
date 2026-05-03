-- ============================================================
-- AUTOVIZOR.CZ — Migrace 016
-- pgnet trigger volá Edge Function notify-inquiry při novém inquiry
--
-- VYŽADUJE:
--  1. Edge Function 'notify-inquiry' nasazený (supabase functions deploy)
--  2. Tajné klíče nastavené:
--     supabase secrets set RESEND_API_KEY=re_xxx
--     supabase secrets set FROM_EMAIL=info@autovizor.cz
--  3. pg_net extension povolený (Supabase ho má pre-installed)
--
-- Pokud Edge Function ještě není nasazený, migrace stále funguje —
-- HTTP volání jen selže silently (status != 200) a inquiries se uloží.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Funkce volá Edge Function přes pg_net
-- Project URL je fixní per environment, ukládáme do GUC (settings)
CREATE OR REPLACE FUNCTION notify_inquiry_via_edge_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project_url TEXT;
  v_anon_key TEXT;
BEGIN
  -- Skip pokud je to spam
  IF NEW.is_spam IS TRUE THEN
    RETURN NEW;
  END IF;

  -- Konfigurace přes ALTER DATABASE … SET app.<key> nebo zde defaultně
  -- Supabase Dashboard má vault.decrypted_secrets pro centrální secrets
  -- Zde jednoduchá varianta: SQL editor uživatele si nastaví GUC po prvním deploy
  BEGIN
    v_project_url := current_setting('app.supabase_url', true);
  EXCEPTION WHEN OTHERS THEN
    v_project_url := NULL;
  END;

  BEGIN
    v_anon_key := current_setting('app.supabase_anon_key', true);
  EXCEPTION WHEN OTHERS THEN
    v_anon_key := NULL;
  END;

  IF v_project_url IS NULL OR v_anon_key IS NULL THEN
    RAISE NOTICE 'app.supabase_url nebo app.supabase_anon_key není nastavený — emaily nebudou odeslány';
    RETURN NEW;
  END IF;

  -- Async HTTP call (pg_net.http_post je non-blocking, vrátí request_id)
  PERFORM net.http_post(
    url := v_project_url || '/functions/v1/notify-inquiry',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object('inquiry_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_inquiry_email_trigger ON vehicle_inquiries;
CREATE TRIGGER notify_inquiry_email_trigger
  AFTER INSERT ON vehicle_inquiries
  FOR EACH ROW EXECUTE FUNCTION notify_inquiry_via_edge_function();

-- ============================================================
-- INSTRUKCE PRO ADMINA (po prvním deploy Edge Function):
-- ============================================================
--
-- 1. V Supabase SQL editoru spusť:
--    ALTER DATABASE postgres SET app.supabase_url = 'https://<project>.supabase.co';
--    ALTER DATABASE postgres SET app.supabase_anon_key = '<anon-public-key>';
--
-- 2. Reconnect pro aplikaci nových settings:
--    SELECT pg_reload_conf();
--
-- 3. Test:
--    INSERT INTO vehicle_inquiries (vehicle_id, buyer_email, buyer_message)
--    VALUES (1, 'test@example.com', 'Test inquiry');
--
-- ============================================================
