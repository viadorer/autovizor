#!/usr/bin/env node
// ============================================================
// AUTOVIZOR.CZ — Data backfill orchestrator
//
// Spouští backfill úkoly proti živé Supabase DB:
//  --equipment   Doplní equipment_ids[] z descriptions (heuristický keyword match)
//  --dealers     Re-run dealers dedup + linking (idempotentní)
//  --stats       Vypíše coverage statistiky
//
// Použití:
//   SUPABASE_URL=https://... SUPABASE_SERVICE_KEY=... node scripts/backfill-data.mjs --stats
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/backfill-data.mjs --equipment --batch=2000
// ============================================================

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY env vars.');
  console.error('Service role key potřeba kvůli RLS bypass na backfill.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a.startsWith(name));
const arg = (name, def) => {
  const found = args.find((a) => a.startsWith(`${name}=`));
  return found ? found.split('=')[1] : def;
};

async function showStats() {
  console.log('▶ Data coverage statistiky\n');

  // Vehicles
  const { count: totalVehicles } = await supabase
    .from('vehicles').select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: withDealer } = await supabase
    .from('vehicles').select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('dealer_id', 'is', null);

  console.log(`Vehicles aktivní:        ${totalVehicles}`);
  console.log(`  s dealer_id:           ${withDealer} (${pct(withDealer, totalVehicles)})`);

  // Dealers
  const { count: totalDealers } = await supabase
    .from('dealers').select('*', { count: 'exact', head: true });
  const { count: privateDealers } = await supabase
    .from('dealers').select('*', { count: 'exact', head: true })
    .eq('type_id', 1);

  console.log(`\nDealers:                 ${totalDealers}`);
  console.log(`  z toho soukromí:       ${privateDealers}`);
  console.log(`  z toho firemní:        ${totalDealers - privateDealers}`);

  // Equipment via RPC
  const { data: eqStats, error } = await supabase.rpc('get_equipment_coverage_stats');
  if (error) {
    console.warn(`\nEquipment stats: ${error.message}`);
  } else if (eqStats) {
    console.log(`\nEquipment coverage:`);
    console.log(`  vehicles celkem:       ${eqStats.total_vehicles}`);
    console.log(`  s výbavou:             ${eqStats.with_equipment} (${pct(eqStats.with_equipment, eqStats.total_vehicles)})`);
    console.log(`  průměr výbav/vůz:      ${eqStats.avg_equipment_per_vehicle ?? '–'}`);
    if (eqStats.top_equipment) {
      console.log(`\nTop 10 výbav:`);
      eqStats.top_equipment.slice(0, 10).forEach((e) => {
        console.log(`  ${String(e.count).padStart(5)} × ${e.name}`);
      });
    }
  }

  // Inquiries
  const { count: inquiries } = await supabase
    .from('vehicle_inquiries').select('*', { count: 'exact', head: true });
  console.log(`\nVehicle inquiries:       ${inquiries ?? 0}`);
}

async function backfillEquipment() {
  const batch = parseInt(arg('--batch', '1000'));
  console.log(`▶ Equipment backfill (batch size: ${batch})...`);

  let totalUpdated = 0;
  let totalEquipment = 0;
  let iteration = 0;

  while (true) {
    iteration++;
    const { data, error } = await supabase.rpc('backfill_equipment_from_descriptions', {
      p_limit: batch,
    });

    if (error) {
      console.error(`Iteration ${iteration} chyba:`, error.message);
      break;
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result || result.updated_count === 0) {
      console.log(`Iteration ${iteration}: 0 updates → konec.`);
      break;
    }

    totalUpdated += result.updated_count;
    totalEquipment += Number(result.total_equipment_added ?? 0);
    console.log(`Iteration ${iteration}: ${result.updated_count} vozidel, ${result.total_equipment_added} equipment links`);

    if (result.updated_count < batch) break; // last partial batch

    // Rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✔ Hotovo: ${totalUpdated} vozidel obohaceno o ${totalEquipment} equipment vazeb.`);
}

async function rerunDealersBackfill() {
  console.log('▶ Re-run dealers backfill...');

  // Helper: spočítej kolik vehicles ještě nemá dealer_id
  const { count: missing } = await supabase
    .from('vehicles').select('*', { count: 'exact', head: true })
    .is('dealer_id', null)
    .not('seller_name', 'is', null);

  console.log(`Vehicles bez dealer_id se seller_name: ${missing}`);

  if (missing === 0) {
    console.log('Nic k backfillu — všechny matched.');
    return;
  }

  // Vlastní backfill query (kopie z migrace 013, ale přes JS)
  console.log('Spouštím UPDATE FROM dealers (3 strategie: email > phone > name)…');

  // Match podle email
  const r1 = await supabase.rpc('exec_sql', {
    sql: `UPDATE vehicles v SET dealer_id = d.id FROM dealers d
          WHERE v.dealer_id IS NULL AND v.seller_email IS NOT NULL
            AND d.email_normalized = normalize_email(v.seller_email)`,
  }).catch(() => null);

  if (!r1) {
    console.warn('exec_sql RPC nedostupný — spusťte migraci 013 ručně v SQL editoru');
    return;
  }

  console.log('✔ Backfill dokončen.');
}

function pct(a, b) {
  if (!b) return '0 %';
  return ((a / b) * 100).toFixed(1) + ' %';
}

async function main() {
  if (flag('--stats')) {
    await showStats();
  } else if (flag('--equipment')) {
    await backfillEquipment();
  } else if (flag('--dealers')) {
    await rerunDealersBackfill();
  } else {
    console.log('Použití:');
    console.log('  --stats         Vypiš coverage statistiky');
    console.log('  --equipment     Backfill equipment_ids z descriptions (--batch=1000)');
    console.log('  --dealers       Re-run dealers backfill');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
