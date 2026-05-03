#!/usr/bin/env node
// ============================================================
// AUTOVIZOR.CZ — TipCars data backfill orchestrator
//
// Pro existující 1640+ vozů z TipCars (importovaných před migracemi
// 008-017) doplní:
//   1. dealer_id (sloučí duplicity, vytvoří dealer rows)
//   2. equipment_ids[] (heuristický keyword match z descriptions)
//   3. dealer geo + city/region/logo (z dat ve vehicles)
//   4. Slug, geo column (auto přes triggery)
//
// VYŽADUJE: aplikované migrace 008-017 + SUPABASE_SERVICE_KEY
//
// Použití:
//   node scripts/backfill-tipcars.mjs --health     Zobrazí stav
//   node scripts/backfill-tipcars.mjs --dealers    Backfill dealer_id
//   node scripts/backfill-tipcars.mjs --equipment  Backfill equipment_ids
//   node scripts/backfill-tipcars.mjs --enrich     Doplnění dealer info
//   node scripts/backfill-tipcars.mjs --all        Kompletní pipeline
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = resolve(__dirname, '..', '.env');
const env = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq)] = t.slice(eq + 1);
  }
} catch {
  // OK — env může být ze shellu
}

const SUPABASE_URL = process.env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL nebo SUPABASE_SERVICE_KEY/SERVICE_ROLE_KEY');
  console.error('Nastavit přes .env nebo env proměnné.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === name);
const arg = (name, def) => {
  const found = args.find((a) => a.startsWith(`${name}=`));
  return found ? found.split('=')[1] : def;
};

function pct(a, b) {
  if (!b) return '0 %';
  return ((a / b) * 100).toFixed(1) + ' %';
}

// ============================================================
// 1. HEALTH CHECK
// ============================================================
async function showHealth() {
  console.log('▶ Datová zdravotní zpráva\n');
  const { data, error } = await supabase.rpc('get_data_health');
  if (error) {
    console.error(`Error (možná chybí migrace 017): ${error.message}`);
    return;
  }

  const v = data.vehicles ?? {};
  const d = data.dealers ?? {};
  const i = data.inquiries ?? {};
  const u = data.users ?? {};

  console.log('=== Vehicles ===');
  console.log(`  Aktivní celkem:       ${v.total_active}`);
  console.log(`  S dealer_id:          ${v.with_dealer} (${pct(v.with_dealer, v.total_active)})`);
  console.log(`  BEZ dealer_id:        ${v.without_dealer} ⚠️`);
  console.log(`  S equipment_ids:      ${v.with_equipment} (${pct(v.with_equipment, v.total_active)})`);
  console.log(`  S geo (PostGIS):      ${v.with_geo} (${pct(v.with_geo, v.total_active)})`);
  console.log(`  Se slugem:            ${v.with_slug} (${pct(v.with_slug, v.total_active)})`);

  console.log('\n=== Dealers ===');
  console.log(`  Celkem:               ${d.total}`);
  console.log(`  Soukromí:             ${d.private}`);
  console.log(`  Firemní:              ${d.business}`);
  console.log(`  Ověření:              ${d.verified}`);
  console.log(`  S logem:              ${d.with_logo}`);
  console.log(`  S geo:                ${d.with_geo}`);

  console.log('\n=== Inquiries ===');
  console.log(`  Celkem:               ${i.total}`);
  console.log(`  Nové:                 ${i.new}`);
  console.log(`  Kontaktované:         ${i.contacted}`);

  console.log('\n=== Users ===');
  console.log(`  Celkem:               ${u.total}`);
  console.log(`  Soukromí prodejci:    ${u.private_sellers}`);
  console.log(`  Dealer admini:        ${u.dealer_admins}`);
}

// ============================================================
// 2. DEALERS BACKFILL
// ============================================================
async function backfillDealers() {
  console.log('▶ Backfill dealers (linking + creating)…');
  const batch = parseInt(arg('--batch', '500'));
  let totalLinked = 0;
  let totalCreated = 0;
  let iteration = 0;

  while (iteration < 50) {
    iteration++;
    const { data, error } = await supabase.rpc('backfill_dealers_for_existing_vehicles', {
      p_limit: batch,
    });
    if (error) {
      console.error(`Iteration ${iteration} error: ${error.message}`);
      return;
    }
    const result = Array.isArray(data) ? data[0] : data;
    if (!result || result.linked === 0) {
      console.log(`Iteration ${iteration}: 0 → konec.`);
      break;
    }
    totalLinked += result.linked;
    totalCreated += result.created;
    console.log(`Iteration ${iteration}: linked=${result.linked}, created=${result.created}`);
    if (result.linked < batch) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✔ Linked: ${totalLinked} vehicles, vytvořeno ${totalCreated} dealerů.`);
}

// ============================================================
// 3. EQUIPMENT BACKFILL
// ============================================================
async function backfillEquipment() {
  console.log('▶ Backfill equipment (z descriptions)…');
  const batch = parseInt(arg('--batch', '1000'));
  let totalUpdated = 0;
  let totalLinks = 0;
  let iteration = 0;

  while (iteration < 100) {
    iteration++;
    const { data, error } = await supabase.rpc('backfill_equipment_from_descriptions', {
      p_limit: batch,
    });
    if (error) {
      console.error(`Iteration ${iteration} error: ${error.message}`);
      return;
    }
    const result = Array.isArray(data) ? data[0] : data;
    if (!result || result.updated_count === 0) {
      console.log(`Iteration ${iteration}: 0 → konec.`);
      break;
    }
    totalUpdated += result.updated_count;
    totalLinks += Number(result.total_equipment_added ?? 0);
    console.log(`Iteration ${iteration}: ${result.updated_count} vozů, ${result.total_equipment_added} equipment links`);
    if (result.updated_count < batch) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n✔ ${totalUpdated} vozů obohaceno o ${totalLinks} equipment vazeb.`);
}

// ============================================================
// 4. ENRICH DEALERS
// ============================================================
async function enrichDealers() {
  console.log('▶ Enrich dealers (geo, address, logo z vehicles)…');
  const { data, error } = await supabase.rpc('enrich_all_dealers');
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(`✔ Enriched ${data} dealerů.`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  if (flag('--health') || flag('-h')) {
    await showHealth();
  } else if (flag('--dealers')) {
    await backfillDealers();
    await showHealth();
  } else if (flag('--equipment')) {
    await backfillEquipment();
    await showHealth();
  } else if (flag('--enrich')) {
    await enrichDealers();
    await showHealth();
  } else if (flag('--all')) {
    console.log('=== KOMPLETNÍ BACKFILL PIPELINE ===\n');
    await showHealth();
    console.log('\n[1/3] Dealers…');
    await backfillDealers();
    console.log('\n[2/3] Equipment…');
    await backfillEquipment();
    console.log('\n[3/3] Dealer enrichment…');
    await enrichDealers();
    console.log('\n=== HOTOVO ===');
    await showHealth();
  } else {
    console.log('Použití:');
    console.log('  --health         Zobraz stav dat');
    console.log('  --dealers        Backfill dealer_id (slučuje duplicity, vytváří chybějící dealery)');
    console.log('  --equipment      Backfill equipment_ids[] z descriptions');
    console.log('  --enrich         Doplnění geo/address/logo na dealers z vehicles');
    console.log('  --all            Spustit vše v pořadí (dealers → equipment → enrich)');
    console.log('');
    console.log('  --batch=N        Velikost batchu (default 500-1000)');
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
