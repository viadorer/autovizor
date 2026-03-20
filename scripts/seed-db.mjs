#!/usr/bin/env node
// ============================================================
// AUTOVIZOR.CZ - Seed script pro naplnění Supabase DB
// Vkládá výrobce, modely a 200+ realistických vozidel
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://dwajywhijqendnnkzkvo.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3YWp5d2hpanFlbmRubmt6a3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAzNzY1OSwiZXhwIjoyMDg5NjEzNjU5fQ.-fz6VdW4NjBSPMN9PdQOyB3dQq18vGGmH6QqsxBX6wY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================
// Parsování VŠECH výrobců a modelů z manufacturers.ts
// ============================================================
function parseManufacturers() {
  const src = readFileSync(resolve(__dirname, '../src/lib/manufacturers.ts'), 'utf-8');
  const MANUFACTURERS = [];
  const MODELS = [];

  // Match each manufacturer block: { id: N, name: 'X', models: [...] }
  const mfrRegex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)',\s*models:\s*\[([\s\S]*?)\]\s*\}/g;
  let m;
  while ((m = mfrRegex.exec(src)) !== null) {
    const mfrId = parseInt(m[1]);
    const mfrName = m[2];
    const seoName = mfrName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    MANUFACTURERS.push({ id: mfrId, name: mfrName, seo_name: seoName });

    // Parse models inside this manufacturer
    const modelsBlock = m[3];
    const modelRegex = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)'\s*\}/g;
    let mm;
    while ((mm = modelRegex.exec(modelsBlock)) !== null) {
      const modelId = parseInt(mm[1]);
      const modelName = mm[2];
      const modelSeo = modelName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      MODELS.push({ id: modelId, name: modelName, manufacturer_id: mfrId, seo_name: modelSeo });
    }
  }

  return { MANUFACTURERS, MODELS };
}

const { MANUFACTURERS, MODELS } = parseManufacturers();
console.log(`Parsed ${MANUFACTURERS.length} výrobců, ${MODELS.length} modelů z manufacturers.ts`);

// ============================================================
// Unsplash obrázky aut (reálné fotky)
// ============================================================
const CAR_IMAGES = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=640&h=480&fit=crop',
];

// ============================================================
// Helpers
// ============================================================
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
const MANUFACTURER_WMI = {
  2: ['WAU', 'WUA'], 5: ['WBA', 'WBS'], 12: ['VF7'], 14: ['UU1'],
  20: ['ZFA'], 21: ['WF0', '1FA'], 23: ['SHH'], 25: ['KMH', 'TMA'],
  31: ['KNA', 'KNE'], 40: ['JMZ'], 42: ['WDD', 'WDB'], 47: ['SJN'],
  48: ['W0L'], 49: ['VF3'], 52: ['VF1'], 56: ['VSS'], 57: ['TMB', 'TMP'],
  61: ['JSA'], 62: ['5YJ'], 63: ['JTD', 'SB1'], 64: ['WVW', 'WV2'],
  65: ['YV1', 'YV4'],
};

function generateVIN(mfrId) {
  const wmis = MANUFACTURER_WMI[mfrId] || ['WBA'];
  let vin = pick(wmis);
  for (let i = vin.length; i < 17; i++) vin += VIN_CHARS[rand(0, VIN_CHARS.length - 1)];
  return vin;
}

const SELLERS = [
  { name: 'Auto Palace Praha', type: 'dealer', rating: 4.7, reviews: 243 },
  { name: 'AAA Auto Brno', type: 'dealer', rating: 4.2, reviews: 187 },
  { name: 'Autocentrum Plzeň', type: 'dealer', rating: 4.5, reviews: 96 },
  { name: 'CarPoint Ostrava', type: 'dealer', rating: 4.3, reviews: 154 },
  { name: 'Premium Cars Praha', type: 'dealer', rating: 4.8, reviews: 312 },
  { name: 'Auto Jarov Praha', type: 'dealer', rating: 4.4, reviews: 201 },
  { name: 'Autoservis Novotný', type: 'dealer', rating: 4.1, reviews: 45 },
  { name: 'Car4You Brno', type: 'dealer', rating: 4.6, reviews: 178 },
  { name: 'Jan Novák', type: 'private', rating: null, reviews: 0 },
  { name: 'Petr Svoboda', type: 'private', rating: null, reviews: 0 },
  { name: 'Martin Dvořák', type: 'private', rating: null, reviews: 0 },
  { name: 'Tomáš Procházka', type: 'private', rating: null, reviews: 0 },
  { name: 'AutoMax Liberec', type: 'dealer', rating: 4.1, reviews: 67 },
  { name: 'Moje Auto Olomouc', type: 'dealer', rating: 4.3, reviews: 89 },
];

const REGIONS = [47, 72, 65, 12, 28, 1, 22, 32, 42, 50, 38, 67, 56, 57, 48, 53];
const CITIES = {
  47: 'Praha', 72: 'Brno', 65: 'Ostrava', 12: 'Plzeň',
  28: 'Hradec Králové', 1: 'České Budějovice', 22: 'Liberec',
  32: 'Pardubice', 42: 'Olomouc', 50: 'Kladno',
  38: 'Zlín', 67: 'Jihlava', 56: 'Praha-východ', 57: 'Praha-západ',
  48: 'Benešov', 53: 'Mladá Boleslav',
};

const DESCRIPTIONS = [
  'Vůz v perfektním stavu, pravidelně servisovaný u autorizovaného dealera. Nebourané, nekuřácké.',
  'Velmi zachovalý automobil s kompletní historií servisu. Nový set zimních pneumatik v ceně.',
  'Auto po prvním majiteli, garážované. Žádné investice nutné, ihned k převzetí.',
  'Elegantní vůz s bohatou výbavou včetně navigace a vyhřívaných sedadel. STK platná.',
  'Spolehlivý a úsporný automobil ideální do města i na delší cesty. Nízká spotřeba.',
  'Rodinné auto s velkým zavazadlovým prostorem. Klimatizace, tempomat, parkovací senzory.',
  'Sportovní design s dynamickým motorem. Odpočet DPH možný. Původ ČR.',
  'Prémiový automobil v nadstandardní výbavě. Kožené sedačky, panoramatická střecha.',
  'Nízký nájezd, výborný technický stav. Vůz je pravidelně umýván a ošetřován.',
  'Původní lak, bez koroze. Veškerá dokumentace k dispozici včetně servisní knížky.',
  'Jedná se o velmi dobře udržovaný vůz s minimálním opotřebením. Bez nutnosti dalších investic.',
  'Auto je vybaveno moderními asistenčními systémy. Adaptivní tempomat, LED světla.',
  'Výjimečná příležitost — vůz v nadstandardním stavu. Původ Česká republika, jeden majitel.',
  'Kompletně prověřené vozidlo s ověřenou historií. Možnost financování na splátky.',
];

const NOTES = [
  'Možnost financování na splátky.',
  'Výměna za jiný vůz možná.',
  'Cena k jednání při rychlém odběru.',
  'Nové brzdy a olej vyměněn.',
  'Možnost prohlídky kdykoliv po domluvě.',
  'Vůz k dispozici ihned.',
  null, null, null,
];

const PRICE_RATINGS = ['very_good', 'good', 'fair', 'high'];
const DOMAINS = ['email.cz', 'seznam.cz', 'centrum.cz', 'autobazar.cz', 'gmail.com'];
const PHONE_PREFIXES = ['601', '602', '603', '604', '605', '606', '607', '702', '720', '721', '723', '724', '730', '731', '732', '736', '737', '770', '775', '776', '777'];

function genEmail(name) {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
  return `${n}@${pick(DOMAINS)}`;
}

function genPhone() {
  const p = pick(PHONE_PREFIXES);
  const r = String(rand(100000, 999999));
  return `+420 ${p} ${r.slice(0, 3)} ${r.slice(3)}`;
}

// Realistic equipment sets based on car category/year
function generateEquipment(year, price, bodyType) {
  const base = [7, 8, 15, 30, 32, 51, 13]; // central lock, ABS, ESP, palubní PC, posilovač, el. okna, el. zrcátka
  const common = [17, 27, 37, 36, 118, 108, 244, 243]; // tempomat, multifunkční volant, nastav. volant, sedadla, otáčkoměr, stěrače, bluetooth, USB
  const modern = [212, 213, 228, 238, 277, 278, 214, 282, 287, 257, 248]; // start/stop, rozjezd kopec, LED, LED svět., android, apple, park senz, zadní, el. brzda, tlak, auto svícení
  const premium = [5, 3, 42, 217, 232, 241, 231, 259, 271, 289, 284, 42, 274]; // navi, kůže, vyhř.sed., panorama, adapt.tempomat, vyhř.volant, kamera, 360, premium audio, HUD, digi.štít, vyhř.sed, ventilace
  const safety = [250, 251, 252, 255, 261, 299, 311, 324, 325]; // mrtvý úhel, sledování pruhu, nouzbrzd, únava, značky, systém zastavení, asist. změny pruhu, front assist, lane assist

  const equip = new Set(base);

  // Add common for 2013+
  if (year >= 2013) common.forEach(id => equip.add(id));

  // Add modern for 2017+
  if (year >= 2017) modern.forEach(id => { if (Math.random() > 0.3) equip.add(id); });

  // Premium car (price > 600k or premium brand)
  if (price > 600000) {
    premium.forEach(id => { if (Math.random() > 0.3) equip.add(id); });
    safety.forEach(id => { if (Math.random() > 0.4) equip.add(id); });
  }

  // Add some random extras
  const extras = [16, 39, 4, 22, 45, 187, 215, 90, 221, 265, 6, 38, 105, 201];
  extras.forEach(id => { if (Math.random() > 0.5) equip.add(id); });

  return [...equip];
}

// Body type mapping for realistic combos
const MODEL_BODY_TYPES = {
  // Hatchback models
  5704: 1, 5712: 1, 6425: 1, 4808: 1, 6323: 1, 2507: 1, 2508: 1, 4907: 1,
  5608: 1, 6112: 1, 5204: 1, 1204: 1, 3112: 1, 2002: 1, 2108: 1,
  // Sedan/Liftback
  5709: 4, 5713: 2, 6423: 3, 4203: 2, 4206: 2, 204: 2, 207: 2,
  505: 2, 509: 2, 2117: 4, 6308: 2, 5609: 1, 2303: 1, 4805: 1,
  // SUV
  5707: 6, 5708: 6, 6431: 6, 6429: 6, 4718: 6, 3117: 6, 2526: 6,
  2517: 6, 4007: 6, 4006: 6, 2115: 6, 2120: 6, 6319: 6, 6324: 6,
  4908: 6, 4501: 6, 4509: 6, 5605: 6, 1212: 6, 6518: 6, 6520: 6,
  6204: 6, 6115: 6, 4811: 6, 4815: 6, 1402: 6, 5706: 6,
  // Kombi
  5709: 3, // Octavia Kombi most popular
  // MPV
  6434: 5, 5203: 5, 1403: 5,
};

function getBodyType(modelId) {
  return MODEL_BODY_TYPES[modelId] || pick([1, 2, 3, 6]);
}

// ============================================================
// Generate vehicles
// ============================================================
function generateVehicle(idx) {
  // 70% weighted top CZ models, 30% random from ALL models
  let model, mfr;

  if (Math.random() < 0.7) {
    // Top CZ market models (weighted)
    const topModelIds = [
      ...Array(6).fill(5709), ...Array(4).fill(5704), ...Array(3).fill(5713),
      ...Array(3).fill(5707), ...Array(3).fill(5708), ...Array(2).fill(5706),
      ...Array(2).fill(5712), ...Array(2).fill(5702),
      ...Array(3).fill(6413), ...Array(2).fill(6423), ...Array(2).fill(6431),
      ...Array(1).fill(6425), ...Array(1).fill(6429),
      ...Array(2).fill(2509), ...Array(2).fill(2526), ...Array(1).fill(2517),
      ...Array(2).fill(6308), ...Array(2).fill(6319), ...Array(1).fill(6323),
      ...Array(2).fill(3103), ...Array(2).fill(3117),
      ...Array(2).fill(2109), ...Array(1).fill(2115), ...Array(1).fill(2120),
      ...Array(1).fill(505), ...Array(1).fill(530), ...Array(1).fill(532),
      ...Array(1).fill(4203), ...Array(1).fill(4206), ...Array(1).fill(4210),
      ...Array(1).fill(204), ...Array(1).fill(207), ...Array(1).fill(216),
      ...Array(2).fill(1402), ...Array(1).fill(1406),
      ...Array(1).fill(4907), ...Array(1).fill(4908),
      ...Array(1).fill(5204), ...Array(1).fill(5203),
      ...Array(1).fill(4808), ...Array(1).fill(4805),
    ];
    const modelId = pick(topModelIds);
    model = MODELS.find(m => m.id === modelId);
  }

  if (!model) {
    // Random from ALL models
    model = pick(MODELS);
  }

  mfr = MANUFACTURERS.find(m => m.id === model.manufacturer_id);

  const year = rand(2012, 2025);
  const month = rand(1, 12);
  const isNew = year >= 2024 && Math.random() < 0.15;
  const km = isNew ? rand(0, 500) : (year >= 2022 ? rand(5000, 40000) : rand(20000, 220000));

  // Fuel: diesel dominant for older, more hybrid/electric for newer
  let fuel;
  if (model.manufacturer_id === 62) { // Tesla
    fuel = 4; // elektro
  } else if (model.id === 5702) { // Enyaq
    fuel = 4;
  } else if (model.id === 3106) { // EV6
    fuel = 4;
  } else if (model.id === 4708) { // Leaf
    fuel = 4;
  } else if (year >= 2020) {
    fuel = pick([1, 1, 1, 2, 2, 2, 5, 5, 4]);
  } else {
    fuel = pick([1, 1, 2, 2, 2, 3]);
  }

  const gearbox = fuel === 4 ? 3 : pick([1, 1, 3, 3]);
  const power = fuel === 4 ? rand(100, 350) : rand(55, 250);
  const bodyType = getBodyType(model.id);

  // Realistic pricing based on brand/age
  let basePrice;
  const premiumBrands = [2, 5, 42, 51, 35, 29, 62, 65]; // Audi, BMW, MB, Porsche, LR, Jaguar, Tesla, Volvo
  if (premiumBrands.includes(model.manufacturer_id)) {
    basePrice = rand(200, 2500) * 1000;
  } else if (model.manufacturer_id === 14) { // Dacia = budget
    basePrice = rand(100, 500) * 1000;
  } else {
    basePrice = rand(80, 1200) * 1000;
  }
  // Newer = more expensive
  const ageFactor = Math.max(0.3, 1 - (2025 - year) * 0.08);
  const price = Math.round(basePrice * ageFactor / 10000) * 10000;

  const color = rand(1, 17);
  const condition = isNew ? 1 : (Math.random() < 0.03 ? 3 : 2);
  const region = pick(REGIONS);
  const seller = pick(SELLERS);
  const ownerCountId = isNew ? 1 : pick([1, 1, 1, 2, 2, 3]);
  const isCrashed = condition === 3;

  const imgIdx = idx % CAR_IMAGES.length;
  const imageCount = rand(4, 10);
  const images = Array.from({ length: imageCount }, (_, i) => ({
    url: CAR_IMAGES[(imgIdx + i) % CAR_IMAGES.length],
    thumbnail_url: CAR_IMAGES[(imgIdx + i) % CAR_IMAGES.length],
    order: i,
  }));

  // Škoda Octavia Kombi is the most common variant
  let octaviaBody = bodyType;
  if (model.id === 5709) octaviaBody = Math.random() < 0.6 ? 3 : 4; // 60% kombi, 40% liftback

  const stk = new Date(Date.now() + rand(30, 730) * 86400000);
  const stkDate = `${stk.getFullYear()}-${String(stk.getMonth()+1).padStart(2,'0')}-${String(stk.getDate()).padStart(2,'0')}`;

  const equip = generateEquipment(year, price, bodyType);

  return {
    vehicle: {
      kind_id: 1,
      manufacturer_id: model.manufacturer_id,
      model_id: model.id,
      body_type_id: model.id === 5709 ? octaviaBody : bodyType,
      condition_id: condition,
      title: `${mfr.name} ${model.name}`,
      price,
      vat_deductible: Math.random() < 0.2,
      deal_type_id: 1, // Prodej
      fuel_type_id: fuel,
      gearbox_id: gearbox,
      drive_id: bodyType === 6 ? pick([1, 2, 2]) : pick([1, 9, 9, 9]),
      engine_volume: fuel === 4 ? null : rand(1000, 3000),
      engine_power: power,
      engine_power_ps: Math.round(power * 1.36),
      tachometer: km,
      tachometer_unit_id: 1,
      made_year: year,
      made_month: month,
      first_registration: `${year}-${String(month).padStart(2,'0')}-01`,
      color_id: color,
      door_count_id: pick([3, 4, 5]),
      capacity_id: 5,
      aircondition_id: year >= 2018 ? pick([3, 4]) : pick([2, 3]),
      euro_id: year >= 2016 ? 6 : (year >= 2011 ? 5 : 4),
      servicebook_id: pick([1, 1, 2]),
      country_id: pick([1, 1, 1, 1, 1, 1, 2, 5]),
      availability_id: 2,
      vin: generateVIN(model.manufacturer_id),
      owners_count: ownerCountId,
      crashed: isCrashed,
      first_owner: ownerCountId === 1 ? 1 : 2,
      owner_count_id: ownerCountId,
      region_id: region,
      city: CITIES[region] || 'Praha',
      seller_name: seller.name,
      seller_phone: genPhone(),
      seller_email: genEmail(seller.name),
      seller_type_id: seller.type === 'dealer' ? 2 : 1, // 1=Soukromý, 2=Autobazar
      seller_rating: seller.rating,
      seller_review_count: seller.reviews,
      description: pick(DESCRIPTIONS),
      note: pick(NOTES),
      images: JSON.stringify(images),
      image_count: imageCount,
      main_image_url: images[0].url,
      main_thumbnail_url: images[0].url,
      price_rating: pick(PRICE_RATINGS),
      is_top: idx % 7 === 0,
      is_promoted: idx % 5 === 0,
      is_active: true,
      views_count: rand(10, 5000),
      source: 'seed',
    },
    equipmentIds: equip,
  };
}

// ============================================================
// Main seed function
// ============================================================
async function seed() {
  console.log('🚗 AUTOVIZOR.CZ - Seed DB (KOMPLETNÍ)');
  console.log('======================================\n');

  // 0. Smazat stará seed data
  console.log('🗑️  Mažu stará data...');
  await supabase.from('vehicle_equipment').delete().neq('vehicle_id', 0);
  await supabase.from('vehicles').delete().eq('source', 'seed');
  console.log('  ✅ Stará data smazána\n');

  // 1. Insert manufacturers
  console.log('📦 Vkládám výrobce...');
  const { error: mfrError } = await supabase
    .from('manufacturers')
    .upsert(MANUFACTURERS, { onConflict: 'id' });

  if (mfrError) {
    console.error('❌ Chyba při vkládání výrobců:', mfrError.message);
    // Try one by one if bulk fails
    for (const mfr of MANUFACTURERS) {
      const { error } = await supabase.from('manufacturers').upsert(mfr, { onConflict: 'id' });
      if (error) console.warn(`  ⚠ ${mfr.name}: ${error.message}`);
    }
  } else {
    console.log(`  ✅ ${MANUFACTURERS.length} výrobců vloženo`);
  }

  // 2. Insert models
  console.log('\n📦 Vkládám modely...');
  // Insert in batches of 50
  for (let i = 0; i < MODELS.length; i += 50) {
    const batch = MODELS.slice(i, i + 50);
    const { error: modelError } = await supabase
      .from('models')
      .upsert(batch, { onConflict: 'id' });

    if (modelError) {
      console.warn(`  ⚠ Batch ${i}-${i+50}: ${modelError.message}`);
      // Try one by one
      for (const model of batch) {
        const { error } = await supabase.from('models').upsert(model, { onConflict: 'id' });
        if (error) console.warn(`    ⚠ ${model.name}: ${error.message}`);
      }
    }
  }
  console.log(`  ✅ ${MODELS.length} modelů vloženo`);

  // 3. Generate and insert vehicles
  const VEHICLE_COUNT = 500;
  console.log(`\n🚗 Generuji ${VEHICLE_COUNT} vozidel...`);

  const allVehicles = [];
  const allEquipment = []; // {vehicleIdx, equipmentIds}

  for (let i = 0; i < VEHICLE_COUNT; i++) {
    const { vehicle, equipmentIds } = generateVehicle(i);
    allVehicles.push(vehicle);
    allEquipment.push(equipmentIds);
  }

  // Insert vehicles in batches of 25
  const insertedVehicleIds = [];
  for (let i = 0; i < allVehicles.length; i += 25) {
    const batch = allVehicles.slice(i, i + 25);
    const { data, error } = await supabase
      .from('vehicles')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(`  ❌ Batch ${i}-${i+25}: ${error.message}`);
      // Try one by one
      for (let j = 0; j < batch.length; j++) {
        const { data: singleData, error: singleError } = await supabase
          .from('vehicles')
          .insert(batch[j])
          .select('id');
        if (singleError) {
          console.warn(`    ⚠ Vehicle ${i+j} (${batch[j].title}): ${singleError.message}`);
          insertedVehicleIds.push(null);
        } else {
          insertedVehicleIds.push(singleData[0].id);
        }
      }
    } else {
      data.forEach(d => insertedVehicleIds.push(d.id));
      process.stdout.write(`  📝 ${Math.min(i + 25, allVehicles.length)}/${VEHICLE_COUNT} vozidel\r`);
    }
  }

  const validCount = insertedVehicleIds.filter(id => id !== null).length;
  console.log(`\n  ✅ ${validCount} vozidel vloženo`);

  // 4. Insert vehicle equipment
  console.log('\n🔧 Vkládám výbavu vozidel...');
  let equipInserted = 0;

  for (let i = 0; i < insertedVehicleIds.length; i += 25) {
    const batch = [];
    for (let j = i; j < Math.min(i + 25, insertedVehicleIds.length); j++) {
      const vehicleId = insertedVehicleIds[j];
      if (!vehicleId) continue;
      const equipIds = allEquipment[j];
      equipIds.forEach(eqId => {
        batch.push({ vehicle_id: vehicleId, equipment_id: eqId });
      });
    }

    if (batch.length > 0) {
      const { error } = await supabase
        .from('vehicle_equipment')
        .upsert(batch, { onConflict: 'vehicle_id,equipment_id', ignoreDuplicates: true });

      if (error) {
        // Try smaller batches
        for (let k = 0; k < batch.length; k += 10) {
          const smallBatch = batch.slice(k, k + 10);
          await supabase.from('vehicle_equipment').upsert(smallBatch, { onConflict: 'vehicle_id,equipment_id', ignoreDuplicates: true });
        }
      }
      equipInserted += batch.length;
    }
    process.stdout.write(`  🔧 ${equipInserted} výbavových položek\r`);
  }
  console.log(`\n  ✅ ${equipInserted} výbavových položek vloženo`);

  // 5. Summary
  console.log('\n========================');
  console.log('✅ Seed dokončen!');
  console.log(`   ${MANUFACTURERS.length} výrobců`);
  console.log(`   ${MODELS.length} modelů`);
  console.log(`   ${validCount} vozidel`);
  console.log(`   ${equipInserted} výbavových položek`);
  console.log('========================\n');

  // Quick verification
  const { count } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  console.log(`📊 Celkem aktivních vozidel v DB: ${count}`);
}

seed().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
