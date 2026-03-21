#!/usr/bin/env node
// ============================================================
// TipCars.com → Supabase + R2 import pipeline
// Scrapes listings, parses JSON-LD + HTML specs + equipment,
// downloads images to R2, inserts into Supabase.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env ───────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  env[t.slice(0, eq)] = t.slice(eq + 1);
}

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YWp5d2hpanFlbmRubmt6a3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNzY1OSwiZXhwIjoyMDg5NjEzNjU5fQ.-fz6VdW4NjBSPMN9PdQOyB3dQq18vGGmH6QqsxBX6wY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET = env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

const BASE_URL = 'https://www.tipcars.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'cs-CZ,cs;q=0.9',
};

// ── Codebook maps ───────────────────────────────────────────
const FUEL_MAP = {
  'benzin': 1, 'benzín': 1,
  'nafta': 2, 'diesel': 2,
  'lpg': 3, 'lpg + benzin': 3, 'lpg + benzín': 3,
  'elektro': 4, 'elektrický': 4, 'elektřina': 4, 'electric': 4,
  'hybrid': 5, 'hybridní': 5, 'plug-in hybrid': 5,
  'cng': 6, 'cng + benzin': 6, 'cng + benzín': 6,
  'ethanol': 7, 'e85': 7,
  'jiné': 8, 'jiný': 8,
  'vodík': 9, 'hydrogen': 9,
};

const GEARBOX_MAP = {
  'manuální': 1, 'manuální převodovka': 1, 'manual': 1, 'man. převodovka': 1,
  'poloautomatická': 2, 'poloautomatická převodovka': 2, 'poloaut. převodovka': 2,
  'automatická': 3, 'automatická převodovka': 3, 'automat': 3, 'aut. převodovka': 3,
};

const BODY_TYPE_MAP = {
  'hatchback': 1, 'sedan': 2, 'kombi': 3, 'liftback': 4,
  'mpv': 5, 'suv': 6, 'kupé': 7, 'coupé': 7, 'coupe': 7,
  'kabriolet': 8, 'cabrio': 8, 'roadster': 9, 'pickup': 10,
  'van': 11, 'minivan': 12, 'limuzína': 13, 'terénní': 14,
  'mikro': 15, 'fastback': 16, 'targa': 17,
  'shooting brake': 18, 'jiné': 19, 'jiný': 19,
};

const COLOR_MAP = {
  'bílá': 1, 'žlutá': 2, 'oranžová': 3, 'červená': 4,
  'vínová': 5, 'růžová': 6, 'fialová': 7, 'modrá': 8,
  'zelená': 9, 'hnědá': 10, 'šedá': 11, 'černá': 12,
  'béžová': 13, 'stříbrná': 14, 'zlatá': 15, 'jiná': 16,
  'bronzová': 17,
};

const DRIVE_MAP = {
  '4x2': 1, 'pohon 4x2': 1,
  '4x4': 2, 'pohon 4x4': 2, 'pohon všech kol': 2,
  'pohon předních kol': 9, 'přední': 9,
  'pohon zadních kol': 10, 'zadní': 10,
};

const CONDITION_MAP = {
  'nové': 1, 'new': 1, 'NewCondition': 1,
  'ojeté': 2, 'used': 2, 'UsedCondition': 2,
  'havarované': 3, 'DamagedCondition': 3,
  'předváděcí': 4, 'RefurbishedCondition': 4,
  'veterán': 5,
};

// ── Manufacturer seo → our DB IDs ───────────────────────────
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

// ── Models cache (loaded from DB) ───────────────────────────
let modelsCache = null;

async function loadModelsFromDB() {
  if (modelsCache) return;
  const { data, error } = await supabase.from('models').select('id, name, manufacturer_id');
  if (error) { console.error('Failed to load models:', error); modelsCache = {}; return; }

  modelsCache = {};
  for (const m of data) {
    if (!modelsCache[m.manufacturer_id]) modelsCache[m.manufacturer_id] = {};
    modelsCache[m.manufacturer_id][m.name.toLowerCase()] = m.id;
    modelsCache[m.manufacturer_id][m.name.toLowerCase().replace(/[\s\-\/]+/g, '')] = m.id;
  }
  console.log(`Loaded ${data.length} models from DB`);
}

function findModelId(manufacturerId, modelName) {
  if (!modelsCache?.[manufacturerId] || !modelName) return null;
  const models = modelsCache[manufacturerId];
  const name = modelName.toLowerCase();
  const norm = name.replace(/[\s\-\/]+/g, '');
  if (models[name]) return models[name];
  if (models[norm]) return models[norm];
  for (const [key, id] of Object.entries(models)) {
    if (key.includes(norm) || norm.includes(key)) return id;
  }
  return null;
}

// ── Regions cache ───────────────────────────────────────────
let regionsCache = null;

async function loadRegionsFromDB() {
  if (regionsCache) return;
  const { data, error } = await supabase.from('regions').select('id, name');
  if (error) { console.error('Failed to load regions:', error); regionsCache = {}; return; }
  regionsCache = {};
  for (const r of data) {
    regionsCache[r.name.toLowerCase().replace(/[\s\-]+/g, '')] = r.id;
  }
  console.log(`Loaded ${data.length} regions from DB`);
}

function findRegionId(city) {
  if (!regionsCache || !city) return null;
  const norm = city.toLowerCase().replace(/[\s\-]+/g, '');
  if (regionsCache[norm]) return regionsCache[norm];
  for (const [key, id] of Object.entries(regionsCache)) {
    if (key.includes(norm) || norm.includes(key)) return id;
  }
  return null;
}

// ── Helpers ─────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// ── Parse listing page → detail URLs ────────────────────────
function parseListingPage(html) {
  const urls = [];
  const re = /href="(\/[a-z]+-[^"]*-(\d+)\.html)"/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    const url = match[1];
    const id = match[2];
    // Avoid duplicates and non-listing links
    if (!urls.some(u => u.id === id)) {
      urls.push({ url: BASE_URL + url, id });
    }
  }
  return urls;
}

// ── Parse detail page → vehicle data ────────────────────────
function parseDetailPage(html, sourceUrl) {
  const vehicle = { source: 'tipcars', source_url: sourceUrl };

  // 1. Extract JSON-LD
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>\s*(\{[\s\S]*?"@type"\s*:\s*"Product"[\s\S]*?\})\s*<\/script>/);
  if (!jsonLdMatch) return null;

  let jsonLd;
  try { jsonLd = JSON.parse(jsonLdMatch[1]); } catch { return null; }

  // Basic info from JSON-LD
  vehicle.title = jsonLd.name || '';
  vehicle.vin = jsonLd.productID || null;

  // Extract TipCars ID from SKU
  const skuMatch = jsonLd.sku?.match(/(\d+)$/);
  vehicle.custom_id = skuMatch ? skuMatch[1] : null;

  // Brand & model
  const brandName = jsonLd.brand?.name || '';
  const modelName = jsonLd.model || '';

  // Map manufacturer
  const brandSeo = brandName.toLowerCase()
    .replace(/š/g, 's').replace(/ž/g, 'z').replace(/č/g, 'c')
    .replace(/ř/g, 'r').replace(/ď/g, 'd').replace(/ť/g, 't')
    .replace(/ň/g, 'n').replace(/ú/g, 'u').replace(/ů/g, 'u')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ý/g, 'y').replace(/ě/g, 'e')
    .replace(/\s+/g, '-');
  vehicle.manufacturer_id = MANUFACTURER_SEO_MAP[brandSeo] || null;
  vehicle.model_id = vehicle.manufacturer_id ? findModelId(vehicle.manufacturer_id, modelName) : null;

  // Price
  vehicle.price = jsonLd.offers?.price || null;

  // Condition
  const condition = jsonLd.offers?.itemCondition || '';
  const condKey = condition.replace('https://schema.org/', '').replace('http://schema.org/', '');
  vehicle.condition_id = CONDITION_MAP[condKey] || 2; // default ojeté

  // Seller
  const seller = jsonLd.offers?.seller;
  if (seller) {
    vehicle.seller_name = seller.name || null;
    vehicle.seller_phone = seller.telephone || null;
    vehicle.seller_email = seller.email || null;
    vehicle.seller_type_id = seller['@type'] === 'Organization' ? 2 : 1;
    if (seller.address) {
      vehicle.address = seller.address.streetAddress || null;
      vehicle.city = seller.address.addressLocality || null;
      vehicle.zip_code = seller.address.postalCode || null;
      vehicle.region_id = findRegionId(seller.address.addressLocality);
    }
  }

  // Images from JSON-LD
  const images = [];
  if (Array.isArray(jsonLd.image)) {
    for (const img of jsonLd.image) {
      const url = typeof img === 'string' ? img : img.url;
      if (url) images.push(url);
    }
  }
  vehicle._imageUrls = images;

  // Additional properties from JSON-LD
  if (Array.isArray(jsonLd.additionalProperty)) {
    for (const prop of jsonLd.additionalProperty) {
      const name = prop.name?.toLowerCase() || '';
      const value = prop.value || '';

      if (name.includes('palivo') || name.includes('fuel')) {
        vehicle.fuel_type_id = FUEL_MAP[value.toLowerCase()] || null;
      }
      if (name.includes('najeto') || name.includes('mileage')) {
        const km = parseInt(value.replace(/\s/g, ''));
        if (!isNaN(km)) vehicle.tachometer = km;
      }
      if (name.includes('uvedení') || name.includes('provoz') || name.includes('registration')) {
        // Format: "05/2018"
        const dateMatch = value.match(/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
          vehicle.made_month = parseInt(dateMatch[1]);
          vehicle.made_year = parseInt(dateMatch[2]);
          vehicle.manufacture_date = `${dateMatch[2]}-${dateMatch[1].padStart(2, '0')}-01`;
        }
      }
      if (name.includes('výkon') || name.includes('power')) {
        const kw = parseInt(value);
        if (!isNaN(kw)) {
          vehicle.engine_power = kw;
          vehicle.engine_power_ps = Math.round(kw * 1.36);
        }
      }
      if (name.includes('objem') || name.includes('volume')) {
        const ccm = parseInt(value.replace(/\s/g, ''));
        if (!isNaN(ccm)) vehicle.engine_volume = ccm;
      }
      if (name.includes('převodovka') || name.includes('gearbox')) {
        vehicle.gearbox_id = GEARBOX_MAP[value.toLowerCase()] || null;
      }
      if (name.includes('pohon') || name.includes('drive')) {
        vehicle.drive_id = DRIVE_MAP[value.toLowerCase()] || null;
      }
    }
  }

  // 2. Parse HTML for additional specs
  // Body type from URL or HTML
  const bodyMatch = html.match(/karoserie:<\/div>\s*([^<]+)/i);
  if (bodyMatch) {
    vehicle.body_type_id = BODY_TYPE_MAP[bodyMatch[1].trim().toLowerCase()] || null;
  }

  // Color
  const colorMatch = html.match(/barva:<\/div>\s*([^<]+)/i);
  if (colorMatch) {
    vehicle.color_id = COLOR_MAP[colorMatch[1].trim().toLowerCase()] || null;
  }

  // Door count
  const doorMatch = html.match(/počet dveří:<\/div>\s*(\d+)/i);
  if (doorMatch) {
    const doors = parseInt(doorMatch[1]);
    if (doors >= 1 && doors <= 6) vehicle.door_count_id = doors;
  }

  // Seat count
  const seatMatch = html.match(/počet míst:<\/div>\s*(\d+)/i);
  if (seatMatch) {
    const seats = parseInt(seatMatch[1]);
    if (seats >= 1 && seats <= 9) vehicle.capacity_id = seats;
  }

  // STK date
  const stkMatch = html.match(/STK:<\/div>\s*(\d{1,2})\/(\d{4})/i);
  if (stkMatch) {
    vehicle.stk_date = `${stkMatch[2]}-${stkMatch[1].padStart(2, '0')}-01`;
  }

  // Description / note
  const noteMatch = html.match(/<div class="detail-box__long-text">\s*([\s\S]*?)\s*<\/div>/);
  if (noteMatch) {
    vehicle.description = noteMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 5000);
  }

  // Second note (after <hr>)
  const noteMatch2 = html.match(/<div class="detail-box__long-text text--first-upper">\s*([\s\S]*?)\s*<\/div>/);
  if (noteMatch2) {
    const note2 = noteMatch2[1].replace(/<[^>]+>/g, '').trim();
    if (note2) {
      vehicle.note = note2.slice(0, 2000);
      // Check for first owner
      if (note2.includes('první majitel') || note2.includes('1. majitel')) {
        vehicle.first_owner = 1;
      }
      // Country of origin
      if (note2.includes('Německo') || note2.includes('německo')) vehicle.country_id = 5;
      else if (note2.includes('Česko') || note2.includes('ČR') || note2.includes('česko')) vehicle.country_id = 1;
      else if (note2.includes('Slovensko')) vehicle.country_id = 2;
      else if (note2.includes('Rakousko')) vehicle.country_id = 6;
      // Service book
      if (note2.includes('servisní knížka')) vehicle.servicebook_id = 1;
    }
  }

  // GPS coordinates from Google Maps iframe
  const gpsMatch = html.match(/maps\/embed\/v1\/place\?q=([\d.]+)%2C([\d.]+)/);
  if (gpsMatch) {
    vehicle.latitude = parseFloat(gpsMatch[1]);
    vehicle.longitude = parseFloat(gpsMatch[2]);
  }

  // 2b. Fallback: parse dataLayer JSON for missing fields
  const dlMatch = html.match(/"fuel":"([^"]+)".*?"color":"([^"]+)"/);
  if (dlMatch) {
    if (!vehicle.fuel_type_id) {
      const dlFuel = dlMatch[1].toLowerCase();
      vehicle.fuel_type_id = FUEL_MAP[dlFuel] || null;
    }
    if (!vehicle.color_id) {
      // dataLayer uses ASCII names like "bila", "cerna", "modra"
      const DL_COLOR_MAP = {
        'bila': 1, 'zluta': 2, 'oranzova': 3, 'cervena': 4,
        'vinova': 5, 'ruzova': 6, 'fialova': 7, 'modra': 8,
        'zelena': 9, 'hneda': 10, 'seda': 11, 'cerna': 12,
        'bezova': 13, 'stribrna': 14, 'zlata': 15, 'jina': 16,
        'bronzova': 17,
      };
      vehicle.color_id = DL_COLOR_MAP[dlMatch[2].toLowerCase()] || null;
    }
  }

  // 3. Parse equipment (výbava)
  const equipment = [];
  const equipRe = /<div class="detail-box__subtitle">([^<]+)<\/div>\s*<ul>([\s\S]*?)<\/ul>/g;
  let eqMatch;
  while ((eqMatch = equipRe.exec(html)) !== null) {
    const category = eqMatch[1].trim();
    const itemsHtml = eqMatch[2];
    const itemRe = /<li>([^<]+)<\/li>/g;
    let itemMatch;
    while ((itemMatch = itemRe.exec(itemsHtml)) !== null) {
      equipment.push({ category, item: itemMatch[1].trim() });
    }
  }
  vehicle._equipment = equipment;

  // Extract specific equipment flags
  const equipItems = equipment.map(e => e.item.toLowerCase());
  if (equipItems.some(e => e.includes('klimatizace'))) {
    if (equipItems.some(e => e.includes('automatická klimatizace'))) vehicle.aircondition_id = 3;
    else if (equipItems.some(e => e.includes('dvouzónová'))) vehicle.aircondition_id = 4;
    else vehicle.aircondition_id = 2;
  }

  // Airbag count
  const airbagItem = equipItems.find(e => e.includes('airbag') && e.match(/\d/));
  if (airbagItem) {
    const count = parseInt(airbagItem);
    if (!isNaN(count)) {
      // Map to our airbag_count_id: 1=1, 2=2, 3=4, 4=6, 5=7, 6=8, 7=9, 8=10, 9=12, 10=14
      const airbagMap = { 1: 1, 2: 2, 4: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 12: 9, 14: 10 };
      vehicle.airbag_count_id = airbagMap[count] || null;
    }
  }

  // Euro emission standard
  const euroItem = equipItems.find(e => e.includes('euro'));
  if (euroItem) {
    const euroNum = euroItem.match(/euro\s*(\d|vi|v|iv|iii|ii|i)/i);
    if (euroNum) {
      const romanMap = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6 };
      vehicle.euro_id = romanMap[euroNum[1].toLowerCase()] || parseInt(euroNum[1]) || null;
    }
  }

  vehicle.kind_id = 1; // osobní
  vehicle.is_active = true;
  vehicle.deal_type_id = 1; // prodej

  return vehicle;
}

// ── Upload image to R2 ──────────────────────────────────────
async function uploadImageToR2(imageUrl, vehicleId, index) {
  try {
    const res = await fetch(imageUrl, { headers: HEADERS });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) return null; // skip tiny/broken

    const ct = res.headers.get('content-type') || 'image/jpeg';
    const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
    const key = `vehicles/tc-${vehicleId}/${index}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: ct,
    }));

    return `${R2_PUBLIC_URL}/${key}`;
  } catch {
    return null;
  }
}

// ── Process and insert vehicle ──────────────────────────────
async function processAndInsertVehicle(detailUrl, options) {
  const { uploadImages = true, dryRun = false } = options;

  const html = await fetchPage(detailUrl);
  const vehicle = parseDetailPage(html, detailUrl);
  if (!vehicle) return null;

  // Skip if no manufacturer mapped
  if (!vehicle.manufacturer_id) return null;

  // Upload images to R2
  const imageUrls = vehicle._imageUrls || [];
  const equipment = vehicle._equipment || [];
  delete vehicle._imageUrls;
  delete vehicle._equipment;

  if (uploadImages && imageUrls.length > 0) {
    const r2Urls = [];
    const toUpload = imageUrls.slice(0, 10); // max 10 images

    for (let i = 0; i < toUpload.length; i++) {
      const r2Url = await uploadImageToR2(toUpload[i], vehicle.custom_id || 'unknown', i);
      if (r2Url) r2Urls.push(r2Url);
      await sleep(50);
    }

    if (r2Urls.length > 0) {
      vehicle.images = JSON.stringify(r2Urls);
      vehicle.main_image_url = r2Urls[0];
      vehicle.main_thumbnail_url = r2Urls[0];
      vehicle.image_count = r2Urls.length;
    }
  } else if (imageUrls.length > 0) {
    // Store original TipCars URLs (they're publicly accessible)
    vehicle.images = JSON.stringify(imageUrls);
    vehicle.main_image_url = imageUrls[0];
    vehicle.image_count = imageUrls.length;
  }

  if (dryRun) {
    return { vehicle, equipment, imageCount: imageUrls.length };
  }

  // Check if already exists (by custom_id + source)
  if (vehicle.custom_id) {
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('custom_id', vehicle.custom_id)
      .eq('source', 'tipcars')
      .limit(1);
    if (existing?.length > 0) {
      // Update existing
      const { error: updateErr } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', existing[0].id);
      if (updateErr) console.error(`\n  Update error: ${updateErr.message}`);
      return { vehicle, id: existing[0].id, imageCount: imageUrls.length };
    }
  }

  // Insert new
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select('id');

  if (error) {
    console.error(`\n  Insert error: ${error.message}`);
    return null;
  }

  return { vehicle, id: data?.[0]?.id, imageCount: imageUrls.length };
}

// ── Fetch listing pages → detail URLs ───────────────────────
async function getListingUrls(brand, startPage, endPage) {
  const urls = [];

  for (let page = startPage; page <= endPage; page++) {
    const url = page === 1
      ? `${BASE_URL}/${brand}`
      : `${BASE_URL}/${brand}?page=${page}`;

    try {
      const html = await fetchPage(url);
      const listings = parseListingPage(html);
      urls.push(...listings);

      if (page % 10 === 0 || page === endPage) {
        process.stdout.write(`\r  Page ${page}/${endPage}: ${urls.length} listings found`);
      }

      // Rate limit
      await sleep(300);
    } catch (err) {
      console.error(`\n  Error on page ${page}: ${err.message}`);
    }
  }

  console.log(`\n  Total listing URLs: ${urls.length}`);
  return urls;
}

// ── Get total pages for a brand ─────────────────────────────
async function getTotalPages(brand) {
  const html = await fetchPage(`${BASE_URL}/${brand}`);
  const match = html.match(/data-paginator-page-param="(\d+)"/g);
  if (!match) return 1;

  let max = 1;
  for (const m of match) {
    const num = parseInt(m.match(/(\d+)/)[1]);
    if (num > max) max = num;
  }
  return max;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  let brand = 'skoda';
  let uploadImages = true;
  let startPage = 1;
  let endPage = 0; // 0 = auto-detect
  let maxListings = 0; // 0 = all
  let dryRun = false;
  let noImages = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--brand': case '-b': brand = args[++i]; break;
      case '--start-page': startPage = parseInt(args[++i]); break;
      case '--end-page': endPage = parseInt(args[++i]); break;
      case '--max': maxListings = parseInt(args[++i]); break;
      case '--dry-run': dryRun = true; break;
      case '--no-images': noImages = true; uploadImages = false; break;
      case '--help': case '-h':
        console.log(`
TipCars.com → Supabase + R2 import

Usage: node import-tipcars.mjs [options]

Options:
  -b, --brand <name>     Brand slug (default: skoda). Examples: volkswagen, bmw, hyundai
  --start-page <n>       Start from page N (default: 1)
  --end-page <n>         End at page N (default: auto-detect)
  --max <n>              Max listings to process (default: all)
  --no-images            Skip image upload to R2 (use TipCars URLs directly)
  --dry-run              Parse but don't insert into DB

Examples:
  node import-tipcars.mjs -b skoda --max 10              # First 10 Škoda listings
  node import-tipcars.mjs -b volkswagen --no-images       # VW without R2 upload
  node import-tipcars.mjs -b bmw --start-page 5 --end-page 10
  node import-tipcars.mjs --dry-run -b skoda --max 3      # Test parsing
        `);
        process.exit(0);
    }
  }

  console.log('=== TipCars.com → Supabase + R2 Import ===');
  console.log(`Brand: ${brand}`);
  console.log(`Upload images to R2: ${uploadImages}`);
  console.log(`Dry run: ${dryRun}`);

  // Load DB data
  await loadModelsFromDB();
  await loadRegionsFromDB();

  // Get total pages
  if (endPage === 0) {
    endPage = await getTotalPages(brand);
    console.log(`Total pages for "${brand}": ${endPage}`);
  }

  // Limit pages if max is set
  if (maxListings > 0) {
    const neededPages = Math.ceil(maxListings / 22);
    endPage = Math.min(endPage, startPage + neededPages - 1);
  }

  // Fetch all listing URLs
  console.log(`Fetching pages ${startPage}-${endPage}...`);
  const listings = await getListingUrls(brand, startPage, endPage);

  if (listings.length === 0) {
    console.log('No listings found.');
    return;
  }

  // Limit if needed
  const toProcess = maxListings > 0 ? listings.slice(0, maxListings) : listings;
  console.log(`\nProcessing ${toProcess.length} listings...`);

  let processed = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  let totalImages = 0;

  for (const listing of toProcess) {
    try {
      const result = await processAndInsertVehicle(listing.url, { uploadImages, dryRun });

      if (result) {
        if (dryRun && processed < 3) {
          console.log(`\n--- ${result.vehicle.title} ---`);
          console.log(`  Brand: ${result.vehicle.manufacturer_id}, Model: ${result.vehicle.model_id}`);
          console.log(`  Price: ${result.vehicle.price} CZK`);
          console.log(`  Year: ${result.vehicle.made_month}/${result.vehicle.made_year}`);
          console.log(`  Fuel: ${result.vehicle.fuel_type_id}, Gearbox: ${result.vehicle.gearbox_id}`);
          console.log(`  Power: ${result.vehicle.engine_power} kW, Volume: ${result.vehicle.engine_volume} ccm`);
          console.log(`  Tachometer: ${result.vehicle.tachometer} km`);
          console.log(`  Color: ${result.vehicle.color_id}, Body: ${result.vehicle.body_type_id}`);
          console.log(`  VIN: ${result.vehicle.vin}`);
          console.log(`  Seller: ${result.vehicle.seller_name} (${result.vehicle.city})`);
          console.log(`  Images: ${result.imageCount || 0}`);
          console.log(`  Equipment (${result.equipment?.length || 0}):`, (result.equipment || []).slice(0, 5).map(e => e.item).join(', '));
        }

        if (result.skipped) {
          skipped++;
        } else {
          inserted++;
          totalImages += result.imageCount || 0;
        }
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      if (errors <= 5) console.error(`\n  Error processing ${listing.url}: ${err.message}`);
    }

    processed++;
    if (!dryRun) {
      process.stdout.write(`\r  Processed: ${processed}/${toProcess.length} | Inserted: ${inserted} | Skipped: ${skipped} | Errors: ${errors} | Images: ${totalImages}`);
    }

    // Rate limit — be respectful
    await sleep(uploadImages ? 500 : 300);
  }

  console.log(`\n\nDone!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total images: ${totalImages}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
