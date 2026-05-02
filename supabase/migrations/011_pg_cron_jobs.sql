-- ============================================================
-- AUTOVIZOR.CZ — Migrace 011
-- Periodické joby pro materializované views a údržbu
--
-- POZNÁMKA: pg_cron extension v Supabase je třeba povolit v Dashboard:
--   Database → Extensions → enable "pg_cron"
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- Refresh materialized views každých 15 minut
-- (CONCURRENTLY = bez zámku, vyžaduje UNIQUE index, je v 008)
-- ============================================================

SELECT cron.unschedule('refresh-vehicle-stats') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-vehicle-stats');
SELECT cron.schedule(
  'refresh-vehicle-stats',
  '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY vehicle_stats;$$
);

SELECT cron.unschedule('refresh-manufacturer-counts') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-manufacturer-counts');
SELECT cron.schedule(
  'refresh-manufacturer-counts',
  '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY manufacturer_counts;$$
);

-- ============================================================
-- Cleanup view_history starší 90 dní (každý den ve 3:00 AM)
-- ============================================================
SELECT cron.unschedule('cleanup-view-history') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-view-history');
SELECT cron.schedule(
  'cleanup-view-history',
  '0 3 * * *',
  $$DELETE FROM view_history WHERE viewed_at < NOW() - INTERVAL '90 days';$$
);

-- ============================================================
-- Cleanup vehicle_views_daily starší 365 dní (jednou týdně, neděle 4:00)
-- ============================================================
SELECT cron.unschedule('cleanup-views-daily') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-views-daily');
SELECT cron.schedule(
  'cleanup-views-daily',
  '0 4 * * 0',
  $$DELETE FROM vehicle_views_daily WHERE day < CURRENT_DATE - INTERVAL '365 days';$$
);

-- ============================================================
-- Soft-deactivate inzeráty bez aktualizace > 60 dní (pravděpodobně stažené)
-- (každý den 4:30)
-- ============================================================
SELECT cron.unschedule('deactivate-stale-vehicles') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'deactivate-stale-vehicles');
SELECT cron.schedule(
  'deactivate-stale-vehicles',
  '30 4 * * *',
  $$UPDATE vehicles SET is_active = FALSE
    WHERE is_active = TRUE
      AND synced_at < NOW() - INTERVAL '60 days'
      AND source IN ('sauto', 'tipcars');$$
);

-- ============================================================
-- VACUUM ANALYZE na vehicles (každou neděli 2:00)
-- (Supabase už dělá autovacuum, toto je explicit pro velké tabulky)
-- ============================================================
SELECT cron.unschedule('vacuum-vehicles') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vacuum-vehicles');
SELECT cron.schedule(
  'vacuum-vehicles',
  '0 2 * * 0',
  $$VACUUM ANALYZE vehicles;$$
);
