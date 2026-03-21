#!/usr/bin/env node
/**
 * Sync ALL manufacturers and models from Sauto.cz official carList XML.
 * Source: https://www.sauto.cz/import/carList
 *
 * This uses the official codebook (882 manufacturers, 5066+ models)
 * instead of sampling from search results.
 *
 * Usage:
 *   node scripts/sync-sauto-codebooks.mjs              # Sync to Supabase + update manufacturers.ts
 *   node scripts/sync-sauto-codebooks.mjs --dry-run     # Only print stats, no DB writes
 *   node scripts/sync-sauto-codebooks.mjs --ts-only     # Only update manufacturers.ts, skip DB
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseString } from 'xml2js';

const __dirname = dirname(fileURLToPath(import.meta.url));

import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, '../.env') });

const CARLIST_URL = 'https://www.sauto.cz/import/carList';
const DRY_RUN = process.argv.includes('--dry-run');
const TS_ONLY = process.argv.includes('--ts-only');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// ============================================================
// Fetch and parse XML
// ============================================================
async function fetchCarList() {
  console.error('Fetching carList from Sauto.cz...');
  const res = await fetch(CARLIST_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  console.error(`  Received ${(xml.length / 1024).toFixed(0)} KB of XML`);

  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// ============================================================
// Extract manufacturers and models from parsed XML
// ============================================================
function extractData(parsed) {
  const kinds = Array.isArray(parsed.car_list.kind) ? parsed.car_list.kind : [parsed.car_list.kind];

  // Global: mfrId → { name, seo_name, kind_ids: Set, models: { modelId → { name, seo_name } } }
  const allMfrs = {};

  for (const kind of kinds) {
    const kindId = parseInt(kind.kind_id, 10);
    const kindName = kind.kind_name;
    const manufacturers = kind.manufacturer ? (Array.isArray(kind.manufacturer) ? kind.manufacturer : [kind.manufacturer]) : [];

    for (const mfr of manufacturers) {
      const mfrId = parseInt(mfr.manufacturer_id, 10);
      const mfrName = mfr.manufacturer_name;
      const mfrSeo = mfrName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

      if (!allMfrs[mfrId]) {
        allMfrs[mfrId] = { name: mfrName, seo_name: mfrSeo, kind_ids: new Set(), models: {} };
      }
      allMfrs[mfrId].kind_ids.add(kindId);

      // Models
      const models = mfr.model ? (Array.isArray(mfr.model) ? mfr.model : [mfr.model]) : [];
      for (const mod of models) {
        const modId = parseInt(mod.model_id, 10);
        const modName = mod.model_name;
        const modSeo = modName.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-');

        allMfrs[mfrId].models[modId] = { name: modName, seo_name: modSeo, manufacturer_id: mfrId };
      }
    }

    console.error(`  ${kindName} (kind_id=${kindId}): ${manufacturers.length} manufacturers`);
  }

  const totalMfrs = Object.keys(allMfrs).length;
  const totalModels = Object.values(allMfrs).reduce((s, m) => s + Object.keys(m.models).length, 0);
  console.error(`\n  TOTAL: ${totalMfrs} unique manufacturers, ${totalModels} unique models`);

  return allMfrs;
}

// ============================================================
// Sync to Supabase
// ============================================================
async function syncToSupabase(allMfrs) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — skipping DB sync');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Upsert manufacturers in batches
  const mfrRows = Object.entries(allMfrs).map(([id, m]) => ({
    id: parseInt(id, 10),
    name: m.name,
    seo_name: m.seo_name,
  }));

  console.error(`\nUpserting ${mfrRows.length} manufacturers...`);
  const BATCH = 200;
  for (let i = 0; i < mfrRows.length; i += BATCH) {
    const batch = mfrRows.slice(i, i + BATCH);
    const { error } = await supabase.from('manufacturers').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  Error at batch ${i}: ${error.message}`);
    } else {
      console.error(`  Upserted ${Math.min(i + BATCH, mfrRows.length)}/${mfrRows.length}`);
    }
  }

  // Upsert models in batches
  const modelRows = [];
  for (const [, mfr] of Object.entries(allMfrs)) {
    for (const [modId, mod] of Object.entries(mfr.models)) {
      modelRows.push({
        id: parseInt(modId, 10),
        manufacturer_id: mod.manufacturer_id,
        name: mod.name,
        seo_name: mod.seo_name,
      });
    }
  }

  console.error(`Upserting ${modelRows.length} models...`);
  for (let i = 0; i < modelRows.length; i += BATCH) {
    const batch = modelRows.slice(i, i + BATCH);
    const { error } = await supabase.from('models').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  Error at batch ${i}: ${error.message}`);
    } else {
      console.error(`  Upserted ${Math.min(i + BATCH, modelRows.length)}/${modelRows.length}`);
    }
  }

  console.error('\nSupabase sync complete!');
}

// ============================================================
// Generate manufacturers.ts
// ============================================================
function generateTypescript(allMfrs) {
  const sorted = Object.entries(allMfrs)
    .sort((a, b) => a[1].name.localeCompare(b[1].name, 'cs'));

  let ts = `// ============================================================
// AUTOVIZOR.CZ - Kompletní seznam výrobců a modelů
// Synchronizováno ze Sauto.cz carList XML (${new Date().toISOString().split('T')[0]})
// ${Object.keys(allMfrs).length} výrobců, ${Object.values(allMfrs).reduce((s, m) => s + Object.keys(m.models).length, 0)} modelů
// ============================================================

export interface ManufacturerWithModels {
  id: number;
  name: string;
  seo_name: string;
  kind_ids?: number[]; // 1=Osobní, 3=Motocykl, 4=Užitkové, 5=Nákladní, 6=Autobus, 7=Přívěs, 9=Obytné, 10=Pracovní stroj, 11=Čtyřkolka
  models: { id: number; name: string; seo_name: string }[];
}

const R2_LOGOS = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev';

export function getManufacturerLogoUrl(name: string): string {
  const safeName = name.toLowerCase()
    .replace(/\\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  return \`\${R2_LOGOS}/logos/\${safeName}.png\`;
}

// Sauto category_id → kind_id mapping for reference:
// 838=Osobní(1), 839=Užitková(4), 840=Nákladní(5), 841=Motorky(3),
// 842=Čtyřkolky(11), 843=Přívěsy(7), 844=Obytné(9), 845=Prac.stroje(10), 846=Autobusy(6)

export const MANUFACTURERS: ManufacturerWithModels[] = [\n`;

  for (const [mfrId, info] of sorted) {
    const kindIds = [...info.kind_ids].sort((a, b) => a - b);
    const kindIdsStr = kindIds.length > 0 && !(kindIds.length === 1 && kindIds[0] === 1)
      ? ` kind_ids: [${kindIds.join(', ')}],`
      : '';

    const models = Object.entries(info.models)
      .sort((a, b) => a[1].name.localeCompare(b[1].name, 'cs'));

    ts += `  { id: ${mfrId}, name: '${info.name.replace(/'/g, "\\'")}', seo_name: '${info.seo_name}',${kindIdsStr} models: [\n`;

    const modelEntries = models.map(([modId, mod]) =>
      `{ id: ${modId}, name: '${mod.name.replace(/'/g, "\\'")}', seo_name: '${mod.seo_name}' }`
    );

    // Wrap at ~120 chars per line
    let line = '    ';
    const lines = [];
    for (const entry of modelEntries) {
      const candidate = line + entry + ', ';
      if (candidate.length > 120 && line.trim()) {
        lines.push(line);
        line = '    ' + entry + ', ';
      } else {
        line = candidate;
      }
    }
    if (line.trim()) lines.push(line);
    ts += lines.join('\n') + '\n';
    ts += `  ]},\n`;
  }

  ts += `];\n`;
  return ts;
}

// ============================================================
// Main
// ============================================================
async function main() {
  const parsed = await fetchCarList();
  const allMfrs = extractData(parsed);

  if (DRY_RUN) {
    console.error('\n--dry-run: No changes made.');
    return;
  }

  // Sync to Supabase
  if (!TS_ONLY) {
    await syncToSupabase(allMfrs);
  }

  // Generate TS file
  const tsContent = generateTypescript(allMfrs);
  const tsPath = resolve(__dirname, '../src/lib/manufacturers.ts');
  writeFileSync(tsPath, tsContent, 'utf-8');
  console.error(`\nWrote ${tsPath}`);

  console.error('\nDone!');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
