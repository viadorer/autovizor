#!/usr/bin/env node
// ============================================================
// Sauto.cz → Supabase import pipeline
// Fetches real listings from Sauto API, maps codebook IDs,
// uploads images to R2, inserts into Supabase.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────
// Load .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
// Service role key — bypasses RLS for inserts
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YWp5d2hpanFlbmRubmt6a3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNzY1OSwiZXhwIjoyMDg5NjEzNjU5fQ.-fz6VdW4NjBSPMN9PdQOyB3dQq18vGGmH6QqsxBX6wY';

const R2_ENDPOINT = env.R2_ENDPOINT;
const R2_ACCESS_KEY = env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// ── Sauto API ───────────────────────────────────────────────
const SAUTO_API = 'https://www.sauto.cz/api/v1/items/search?';

// Default search params — osobní vozy, all conditions
const DEFAULT_PARAMS = {
  limit: '200',
  offset: '0',
  condition_seo: 'nove,ojete,predvadeci',
  category_id: '838',
  operating_lease: 'false',
};

// ── Codebook mapping: Sauto seo_name → our DB IDs ───────────
// Built from our migration codebook tables + Sauto API responses

const FUEL_MAP = {
  'benzin': 1,
  'nafta': 2,
  'lpg': 3, 'lpg-benzin': 3,
  'elektro': 4, 'elektricky': 4,
  'hybrid': 5, 'hybridni': 5,
  'cng': 6, 'cng-benzin': 6,
  'ethanol': 7,
  'jine': 8,
  'vodik': 9,
};

const GEARBOX_MAP = {
  'manualni': 1,
  'poloautomaticka': 2,
  'automaticka': 3,
};

const CONDITION_MAP = {
  'nove': 1,
  'ojete': 2,
  'havarie': 3, 'havariovane': 3,
  'predvadeci': 4,
  'veteran': 5,
};

const COLOR_MAP = {
  'bila': 1,
  'zluta': 2,
  'oranzova': 3,
  'cervena': 4,
  'vinova': 5,
  'ruzova': 6,
  'fialova': 7,
  'modra': 8,
  'zelena': 9,
  'hneda': 10,
  'seda': 11,
  'cerna': 12,
  'bezova': 13,
  'stribrna': 14,
  'zlata': 15,
  'jina': 16,
  'bronzova': 17,
};

const BODY_TYPE_MAP = {
  'hatchback': 1,
  'sedan': 2,
  'kombi': 3,
  'liftback': 4,
  'mpv': 5,
  'suv': 6,
  'kupe': 7, 'coupe': 7,
  'kabriolet': 8, 'cabrio': 8,
  'roadster': 9,
  'pickup': 10,
  'van': 11,
  'minivan': 12,
  'limuzina': 13,
  'terenni': 14,
  'mikro': 15,
  'fastback': 16,
  'targa': 17,
  'shooting-brake': 18,
  'jine': 19,
};

const DRIVE_MAP = {
  '4x2': 1,
  '4x4': 2,
  'predni': 9, 'pohon-prednich-kol': 9,
  'zadni': 10, 'pohon-zadnich-kol': 10,
};

// ── Manufacturer seo_name → our DB IDs ──────────────────────
// Key mapping: Sauto seo_name → our manufacturer_id
const MANUFACTURER_SEO_MAP = {
  'alfa-romeo': 1, 'audi': 2, 'austin': 3, 'bentley': 4, 'bmw': 5,
  'bugatti': 6, 'buick': 7, 'cadillac': 8, 'caterham': 9, 'chevrolet': 10,
  'chrysler': 11, 'citroen': 12, 'cupra': 13, 'dacia': 14, 'daewoo': 15,
  'daihatsu': 16, 'dodge': 17, 'ds': 18, 'ferrari': 19, 'fiat': 20,
  'ford': 21, 'genesis': 22, 'honda': 23, 'hummer': 24, 'hyundai': 25,
  'infiniti': 26, 'isuzu': 27, 'iveco': 28, 'jaguar': 29, 'jeep': 30,
  'kia': 31, 'lada': 32, 'lamborghini': 33, 'lancia': 34, 'land-rover': 35,
  'lexus': 36, 'lincoln': 37, 'lotus': 38, 'maserati': 39, 'mazda': 40,
  'mclaren': 41, 'mercedes-benz': 42, 'mg': 43, 'mini': 44, 'mitsubishi': 45,
  'morgan': 46, 'nissan': 47, 'opel': 48, 'peugeot': 49, 'polestar': 50,
  'porsche': 51, 'renault': 52, 'rolls-royce': 53, 'rover': 54, 'saab': 55,
  'seat': 56, 'skoda': 57, 'smart': 58, 'ssangyong': 59, 'subaru': 60,
  'suzuki': 61, 'tesla': 62, 'toyota': 63, 'volkswagen': 64, 'volvo': 65,
  'byd': 66, 'lynk-co': 67, 'ora': 68, 'nio': 69, 'aiways': 70,
  'xpeng': 71, 'gwm': 72, 'abarth': 73, 'alpine': 74, 'aston-martin': 75,
  'dfsk': 76, 'maxus': 77, 'ram': 78, 'tatra': 79, 'wiesmann': 80,
};

// ── Model name → our model ID ───────────────────────────────
// We'll load models from Supabase DB at runtime for dynamic matching
let modelsCache = null; // { [manufacturer_id]: { [normalizedName]: model_id } }

async function loadModelsFromDB() {
  if (modelsCache) return modelsCache;

  const { data, error } = await supabase
    .from('models')
    .select('id, name, manufacturer_id');

  if (error) {
    console.error('Failed to load models from DB:', error);
    modelsCache = {};
    return modelsCache;
  }

  modelsCache = {};
  for (const m of data) {
    if (!modelsCache[m.manufacturer_id]) {
      modelsCache[m.manufacturer_id] = {};
    }
    // Normalize: lowercase, remove spaces/dashes for fuzzy matching
    const norm = m.name.toLowerCase().replace(/[\s\-\/]+/g, '');
    modelsCache[m.manufacturer_id][norm] = m.id;
    // Also keep original lowercase for exact match
    modelsCache[m.manufacturer_id][m.name.toLowerCase()] = m.id;
  }

  console.log(`Loaded ${data.length} models from DB`);
  return modelsCache;
}

function findModelId(manufacturerId, sautoModelName) {
  if (!modelsCache || !modelsCache[manufacturerId]) return null;

  const models = modelsCache[manufacturerId];
  const name = sautoModelName.toLowerCase();
  const normName = name.replace(/[\s\-\/]+/g, '');

  // Exact match
  if (models[name]) return models[name];
  if (models[normName]) return models[normName];

  // Partial match — find best match
  for (const [key, id] of Object.entries(models)) {
    if (key.includes(normName) || normName.includes(key)) return id;
  }

  return null;
}

// ── Region/district mapping ─────────────────────────────────
// Sauto district_id → our region_id (approximate mapping by district name)
// We'll try to match by district name from our regions table
let regionsCache = null;

async function loadRegionsFromDB() {
  if (regionsCache) return regionsCache;

  const { data, error } = await supabase
    .from('regions')
    .select('id, name');

  if (error) {
    console.error('Failed to load regions:', error);
    regionsCache = {};
    return regionsCache;
  }

  regionsCache = {};
  for (const r of data) {
    const norm = r.name.toLowerCase().replace(/[\s\-]+/g, '');
    regionsCache[norm] = r.id;
  }

  console.log(`Loaded ${data.length} regions from DB`);
  return regionsCache;
}

function findRegionId(districtName) {
  if (!regionsCache || !districtName) return null;
  const norm = districtName.toLowerCase().replace(/[\s\-]+/g, '');

  if (regionsCache[norm]) return regionsCache[norm];

  // Partial match
  for (const [key, id] of Object.entries(regionsCache)) {
    if (key.includes(norm) || norm.includes(key)) return id;
  }

  return null;
}

// ── Image upload to R2 ──────────────────────────────────────
async function uploadImageToR2(imageUrl, vehicleId, index) {
  try {
    // Sauto images sometimes start with "//" (protocol-relative)
    let url = imageUrl;
    if (url.startsWith('//')) url = 'https:' + url;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  Image fetch failed (${response.status}): ${url}`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const key = `vehicles/${vehicleId}/${index}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${R2_PUBLIC_URL}/${key}`;
  } catch (err) {
    console.warn(`  Image upload error: ${err.message}`);
    return null;
  }
}

// ── Map Sauto listing → our DB vehicle row ──────────────────
function mapSautoToVehicle(item) {
  const mfrSeo = item.manufacturer_cb?.seo_name;
  const manufacturerId = mfrSeo ? MANUFACTURER_SEO_MAP[mfrSeo] : null;

  const modelName = item.model_cb?.name;
  const modelId = manufacturerId && modelName ? findModelId(manufacturerId, modelName) : null;

  const fuelSeo = item.fuel_cb?.seo_name;
  const fuelId = fuelSeo ? (FUEL_MAP[fuelSeo] || null) : null;

  const gearboxSeo = item.gearbox_cb?.seo_name;
  const gearboxId = gearboxSeo ? (GEARBOX_MAP[gearboxSeo] || null) : null;

  const conditionSeo = item.condition_cb?.seo_name;
  const conditionId = conditionSeo ? (CONDITION_MAP[conditionSeo] || null) : null;

  const colorSeo = item.color_cb?.seo_name;
  const colorId = colorSeo ? (COLOR_MAP[colorSeo] || null) : null;

  const bodyTypeSeo = item.body_type_cb?.seo_name;
  const bodyTypeId = bodyTypeSeo ? (BODY_TYPE_MAP[bodyTypeSeo] || null) : null;

  const driveSeo = item.drive_cb?.seo_name;
  const driveId = driveSeo ? (DRIVE_MAP[driveSeo] || null) : null;

  const districtName = item.locality?.district;
  const regionId = findRegionId(districtName);

  // Parse dates
  const mfgDate = item.manufacturing_date || item.in_operation_date;
  let madeYear = null;
  let madeMonth = null;
  if (mfgDate) {
    const d = new Date(mfgDate);
    madeYear = d.getFullYear();
    madeMonth = d.getMonth() + 1;
  }

  // Seller info
  const premise = item.premise;
  const sellerName = premise?.name || null;
  const sellerPhone = premise?.phone || null;
  const sellerLogo = premise?.logo ? (premise.logo.startsWith('//') ? 'https:' + premise.logo : premise.logo) : null;
  const sellerTypeId = premise ? 2 : 1; // 2=autobazar, 1=soukromý

  // Images — keep Sauto URLs initially, will be replaced after R2 upload
  const images = (item.images || []).map(img => {
    let url = img.url || img;
    if (typeof url === 'string' && url.startsWith('//')) url = 'https:' + url;
    return url;
  });

  const mainImage = images.length > 0 ? images[0] : null;

  // Deal type
  let dealTypeId = 1; // prodej
  if (item.deal_type === 'lease' || item.deal_type === 'operativni-leasing') dealTypeId = 2;
  if (item.deal_type === 'sale_or_lease') dealTypeId = 3;

  return {
    sauto_id: item.id,
    custom_id: item.custom_id || null,
    kind_id: 1, // osobní (category 838)
    manufacturer_id: manufacturerId,
    model_id: modelId,
    body_type_id: bodyTypeId,
    condition_id: conditionId,
    title: item.name || `${item.manufacturer_cb?.name || ''} ${item.model_cb?.name || ''}`.trim(),
    model_variant: item.additional_model_name || null,
    price: item.price || null,
    vat_deductible: item.vat_deduction === true,
    fuel_type_id: fuelId,
    gearbox_id: gearboxId,
    drive_id: driveId,
    engine_volume: item.engine_volume || null,
    engine_power: item.engine_power || null,
    tachometer: item.tachometer || null,
    manufacture_date: mfgDate || null,
    made_year: madeYear,
    made_month: madeMonth,
    color_id: colorId,
    region_id: regionId,
    address: item.locality?.municipality || null,
    city: item.locality?.district || null,
    seller_name: sellerName,
    seller_phone: sellerPhone,
    seller_logo_url: sellerLogo,
    description: item.description || null,
    images: JSON.stringify(images),
    image_count: item.images_total_count || images.length,
    main_image_url: mainImage,
    source: 'sauto',
    source_url: item.id ? `https://www.sauto.cz/osobni-auta/detail/${item.id}` : null,
    is_top: item.topped === true,
    is_promoted: item.promoted === true,
    is_active: true,
    deal_type_id: dealTypeId,
    seller_type_id: sellerTypeId,
    created_at: item.create_date || new Date().toISOString(),
  };
}

// ── Fetch from Sauto API ────────────────────────────────────
async function fetchSautoPage(params) {
  const qs = new URLSearchParams(params).toString();
  const url = `${SAUTO_API}${qs}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.sauto.cz/',
    },
  });

  if (!response.ok) {
    throw new Error(`Sauto API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllListings(manufacturerSeo, options = {}) {
  const {
    priceStep = 200000,
    priceMax = 50000000,
    maxListings = 10000,
    conditionSeo = 'nove,ojete,predvadeci',
  } = options;

  const allResults = [];
  let currentPrice = 0;

  console.log(`\nFetching listings for: ${manufacturerSeo || 'ALL'}`);
  console.log(`Price step: ${priceStep.toLocaleString()} CZK, max: ${priceMax.toLocaleString()} CZK`);

  while (currentPrice < priceMax && allResults.length < maxListings) {
    const params = {
      ...DEFAULT_PARAMS,
      price_from: String(currentPrice),
      price_to: String(currentPrice + priceStep),
    };

    if (manufacturerSeo) {
      params.manufacturer_model_seo = manufacturerSeo;
    }

    if (conditionSeo) {
      params.condition_seo = conditionSeo;
    }

    try {
      // First page
      const data = await fetchSautoPage(params);
      const total = data.pagination?.total || 0;
      const results = data.results || [];

      if (results.length > 0) {
        allResults.push(...results);
        console.log(`  ${currentPrice.toLocaleString()}-${(currentPrice + priceStep).toLocaleString()} CZK: ${results.length}/${total} listings`);
      }

      // If there are more than 200 results in this price range, paginate
      if (total > 200) {
        let offset = 200;
        while (offset < total && offset < 1000) {
          params.offset = String(offset);
          const pageData = await fetchSautoPage(params);
          const pageResults = pageData.results || [];
          if (pageResults.length === 0) break;
          allResults.push(...pageResults);
          offset += 200;

          // Rate limiting
          await sleep(100);
        }

        if (total > 1000) {
          console.warn(`  ⚠ Price range ${currentPrice}-${currentPrice + priceStep} has ${total} items, only fetched first 1000. Consider smaller price_step.`);
        }
      }
    } catch (err) {
      console.error(`  Error at price ${currentPrice}: ${err.message}`);
    }

    currentPrice += priceStep;

    // Rate limiting — be nice to the API
    await sleep(200);
  }

  // Deduplicate by sauto_id
  const seen = new Set();
  const unique = allResults.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  console.log(`Total unique listings: ${unique.length}`);
  return unique;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Insert vehicles into Supabase ───────────────────────────
async function insertVehicles(vehicles, options = {}) {
  const { uploadImages = false, batchSize = 50 } = options;

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);
    const mapped = batch.map(mapSautoToVehicle);

    // Filter out vehicles without manufacturer_id (unmapped)
    const valid = mapped.filter(v => v.manufacturer_id !== null);
    const invalid = mapped.length - valid.length;
    if (invalid > 0) {
      skipped += invalid;
    }

    if (valid.length === 0) continue;

    // Upload images to R2 if enabled
    if (uploadImages) {
      for (const v of valid) {
        const images = JSON.parse(v.images || '[]');
        if (images.length === 0) continue;

        // Upload max 10 images per vehicle
        const r2Urls = [];
        const toUpload = images.slice(0, 10);

        for (let idx = 0; idx < toUpload.length; idx++) {
          const r2Url = await uploadImageToR2(toUpload[idx], v.sauto_id, idx);
          if (r2Url) r2Urls.push(r2Url);
          await sleep(50); // Rate limit uploads
        }

        if (r2Urls.length > 0) {
          v.images = JSON.stringify(r2Urls);
          v.main_image_url = r2Urls[0];
          v.main_thumbnail_url = r2Urls[0];
        }

        process.stdout.write(`\r  Uploading images... ${inserted + 1}/${vehicles.length}`);
      }
    }

    // Upsert — use sauto_id as conflict key
    const { data, error } = await supabase
      .from('vehicles')
      .upsert(valid, { onConflict: 'sauto_id', ignoreDuplicates: false })
      .select('id');

    if (error) {
      console.error(`\n  Batch error (${i}-${i + batch.length}):`, error.message);
      errors += batch.length;
    } else {
      inserted += (data?.length || valid.length);
    }

    process.stdout.write(`\r  Inserted: ${inserted}, skipped: ${skipped}, errors: ${errors}`);
  }

  console.log(`\nDone! Inserted: ${inserted}, skipped (unmapped): ${skipped}, errors: ${errors}`);
  return { inserted, skipped, errors };
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  // Parse CLI args
  let manufacturer = null;
  let uploadImages = false;
  let priceStep = 200000;
  let priceMax = 50000000;
  let maxListings = 10000;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--manufacturer':
      case '-m':
        manufacturer = args[++i];
        break;
      case '--upload-images':
      case '-u':
        uploadImages = true;
        break;
      case '--price-step':
        priceStep = parseInt(args[++i]);
        break;
      case '--price-max':
        priceMax = parseInt(args[++i]);
        break;
      case '--max':
        maxListings = parseInt(args[++i]);
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Sauto.cz → Supabase import script

Usage: node import-sauto.mjs [options]

Options:
  -m, --manufacturer <seo>  Filter by manufacturer seo_name (e.g., "skoda", "volkswagen")
  -u, --upload-images       Download images and upload to R2 (slower)
  --price-step <num>        Price range step in CZK (default: 200000)
  --price-max <num>         Max price in CZK (default: 50000000)
  --max <num>               Max listings to fetch (default: 10000)
  --dry-run                 Fetch and map but don't insert into DB

Examples:
  node import-sauto.mjs -m skoda                    # Import all Škoda listings
  node import-sauto.mjs -m volkswagen -u             # Import VW with R2 images
  node import-sauto.mjs --price-step 50000 --max 500 # All brands, small price step
  node import-sauto.mjs --dry-run -m bmw             # Test mapping without insert
        `);
        process.exit(0);
    }
  }

  console.log('=== Sauto.cz → Supabase Import ===');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`R2 bucket: ${R2_BUCKET}`);
  console.log(`Upload images: ${uploadImages}`);
  console.log(`Manufacturer: ${manufacturer || 'ALL'}`);

  // Load codebook data from DB
  await loadModelsFromDB();
  await loadRegionsFromDB();

  // Fetch listings from Sauto
  const listings = await fetchAllListings(manufacturer, {
    priceStep,
    priceMax,
    maxListings,
  });

  if (listings.length === 0) {
    console.log('No listings found.');
    return;
  }

  if (dryRun) {
    console.log('\n--- Dry run: first 3 mapped vehicles ---');
    const sample = listings.slice(0, 3).map(mapSautoToVehicle);
    for (const v of sample) {
      console.log(JSON.stringify(v, null, 2));
    }

    // Stats
    const allMapped = listings.map(mapSautoToVehicle);
    const withMfr = allMapped.filter(v => v.manufacturer_id);
    const withModel = allMapped.filter(v => v.model_id);
    console.log(`\nMapping stats:`);
    console.log(`  Total: ${allMapped.length}`);
    console.log(`  With manufacturer_id: ${withMfr.length} (${(withMfr.length / allMapped.length * 100).toFixed(1)}%)`);
    console.log(`  With model_id: ${withModel.length} (${(withModel.length / allMapped.length * 100).toFixed(1)}%)`);

    // Unmapped manufacturers
    const unmappedMfr = new Set();
    for (const item of listings) {
      const seo = item.manufacturer_cb?.seo_name;
      if (seo && !MANUFACTURER_SEO_MAP[seo]) {
        unmappedMfr.add(`${seo} (${item.manufacturer_cb.name})`);
      }
    }
    if (unmappedMfr.size > 0) {
      console.log(`  Unmapped manufacturers: ${[...unmappedMfr].join(', ')}`);
    }

    // Unmapped models
    const unmappedModels = new Set();
    for (const item of listings) {
      const mfrSeo = item.manufacturer_cb?.seo_name;
      const mfrId = mfrSeo ? MANUFACTURER_SEO_MAP[mfrSeo] : null;
      const modelName = item.model_cb?.name;
      if (mfrId && modelName && !findModelId(mfrId, modelName)) {
        unmappedModels.add(`${item.manufacturer_cb.name} ${modelName}`);
      }
    }
    if (unmappedModels.size > 0) {
      console.log(`  Unmapped models (${unmappedModels.size}): ${[...unmappedModels].slice(0, 20).join(', ')}${unmappedModels.size > 20 ? '...' : ''}`);
    }

    return;
  }

  // Insert into Supabase
  await insertVehicles(listings, { uploadImages });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
