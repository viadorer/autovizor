#!/usr/bin/env node
/**
 * Sync manufacturers and models from Sauto.cz API for all vehicle categories.
 * Outputs a complete manufacturers.ts file aligned with Sauto IDs.
 *
 * Sauto category_id mapping:
 *   838 = Osobní (kind_id=1)
 *   839 = Užitková (kind_id=4)
 *   840 = Nákladní (kind_id=5)
 *   841 = Motorky (kind_id=3)
 *   842 = Čtyřkolky (kind_id=11)
 *   843 = Přívěsy a návěsy (kind_id=7)
 *   844 = Obytné (kind_id=9)
 *   845 = Pracovní stroje (kind_id=10)
 *   846 = Autobusy (kind_id=6)
 */

const SAUTO_API = 'https://www.sauto.cz/api/v1/items/search?';

const CATEGORIES = [
  { sauto_id: 838, kind_id: 1, name: 'Osobní' },
  { sauto_id: 839, kind_id: 4, name: 'Užitková' },
  { sauto_id: 840, kind_id: 5, name: 'Nákladní' },
  { sauto_id: 841, kind_id: 3, name: 'Motorky' },
  { sauto_id: 842, kind_id: 11, name: 'Čtyřkolky' },
  { sauto_id: 843, kind_id: 7, name: 'Přívěsy a návěsy' },
  { sauto_id: 844, kind_id: 9, name: 'Obytné' },
  { sauto_id: 845, kind_id: 10, name: 'Pracovní stroje' },
  { sauto_id: 846, kind_id: 6, name: 'Autobusy' },
];

// Map: sauto_category_id → kind_id
const SAUTO_TO_KIND = Object.fromEntries(CATEGORIES.map(c => [c.sauto_id, c.kind_id]));

async function fetchPage(categoryId, offset = 0, limit = 200) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    category_id: String(categoryId),
    condition_seo: 'nove,ojete,predvadeci',
    operating_lease: 'false',
  });
  const url = SAUTO_API + params.toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function collectManufacturers(categoryId, kindId, label) {
  // Manufacturers map: sauto_mfr_id → { name, seo, models: { sauto_model_id → { name, seo } } }
  const mfrs = {};
  let offset = 0;
  const limit = 200;
  let total = 0;

  console.error(`  Fetching ${label} (category_id=${categoryId})...`);

  // Fetch up to 1000 results (5 pages) to get a representative sample of all manufacturers
  for (let page = 0; page < 5; page++) {
    try {
      const data = await fetchPage(categoryId, offset, limit);
      total = data.pagination?.total || 0;
      const results = data.results || [];

      if (results.length === 0) break;

      for (const r of results) {
        const m = r.manufacturer_cb;
        const mod = r.model_cb;
        if (!m || !m.value) continue;

        const mfrId = m.value;
        if (!mfrs[mfrId]) {
          mfrs[mfrId] = { name: m.name, seo: m.seo_name, models: {} };
        }

        if (mod && mod.value) {
          mfrs[mfrId].models[mod.value] = { name: mod.name, seo: mod.seo_name };
        }
      }

      offset += limit;
      if (offset >= Math.min(total, 1000)) break;

      // Rate limit
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`    Error at offset ${offset}: ${err.message}`);
      break;
    }
  }

  const mfrCount = Object.keys(mfrs).length;
  const modelCount = Object.values(mfrs).reduce((s, m) => s + Object.keys(m.models).length, 0);
  console.error(`    ${label}: ${total} listings → ${mfrCount} manufacturers, ${modelCount} models`);

  return { mfrs, total, kindId };
}

async function main() {
  // Global maps
  const allMfrs = {}; // sauto_id → { name, seo, kind_ids: Set, models: {} }

  for (const cat of CATEGORIES) {
    const { mfrs, kindId } = await collectManufacturers(cat.sauto_id, cat.kind_id, cat.name);

    for (const [mfrId, info] of Object.entries(mfrs)) {
      if (!allMfrs[mfrId]) {
        allMfrs[mfrId] = {
          name: info.name,
          seo: info.seo,
          kind_ids: new Set(),
          models: {},
        };
      }
      allMfrs[mfrId].kind_ids.add(kindId);
      Object.assign(allMfrs[mfrId].models, info.models);
    }

    // Rate limit between categories
    await new Promise(r => setTimeout(r, 500));
  }

  // Generate manufacturers.ts content
  const sorted = Object.entries(allMfrs)
    .sort((a, b) => a[1].name.localeCompare(b[1].name, 'cs'));

  let ts = `// ============================================================
// AUTOVIZOR.CZ - Kompletní seznam výrobců a modelů
// Synchronizováno ze Sauto.cz API (${new Date().toISOString().split('T')[0]})
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

    const modelStr = models
      .map(([modId, mod]) => `{ id: ${modId}, name: '${mod.name.replace(/'/g, "\\'")}', seo_name: '${mod.seo}' }`)
      .join(', ');

    ts += `  { id: ${mfrId}, name: '${info.name.replace(/'/g, "\\'")}', seo_name: '${info.seo}',${kindIdsStr} models: [\n`;
    // Wrap models at ~120 chars
    if (modelStr.length > 100) {
      const modelLines = [];
      let line = '    ';
      for (const [modId, mod] of models) {
        const entry = `{ id: ${modId}, name: '${mod.name.replace(/'/g, "\\'")}', seo_name: '${mod.seo}' }, `;
        if (line.length + entry.length > 120) {
          modelLines.push(line);
          line = '    ';
        }
        line += entry;
      }
      if (line.trim()) modelLines.push(line);
      ts += modelLines.join('\n') + '\n';
    } else {
      ts += `    ${modelStr}\n`;
    }
    ts += `  ]},\n`;
  }

  ts += `];\n`;

  // Output to stdout
  console.log(ts);

  // Summary to stderr
  console.error(`\n=== Summary ===`);
  console.error(`Total manufacturers: ${sorted.length}`);
  const totalModels = sorted.reduce((s, [, m]) => s + Object.keys(m.models).length, 0);
  console.error(`Total models: ${totalModels}`);
  for (const cat of CATEGORIES) {
    const count = sorted.filter(([, m]) => m.kind_ids.has(cat.kind_id)).length;
    console.error(`  ${cat.name} (kind_id=${cat.kind_id}): ${count} manufacturers`);
  }
}

main().catch(console.error);
