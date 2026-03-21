#!/usr/bin/env node
// ============================================================
// Scrape manufacturer logos from Wikipedia/Wikimedia Commons
// and upload to Cloudflare R2
// ============================================================

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
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

// ── Manufacturer → Wikipedia page mapping ────────────────────
// Most Wikipedia car articles follow pattern: "{Name}_(automobile)" or just "{Name}"
const LOGO_SOURCES = {
  'Abarth':        'https://upload.wikimedia.org/wikipedia/en/7/7b/Abarth_logo.png',
  'Aiways':        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Aiways_logo.svg/200px-Aiways_logo.svg.png',
  'Alfa Romeo':    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Alfa_Romeo_logo_%282015%29.svg/200px-Alfa_Romeo_logo_%282015%29.svg.png',
  'Alpine':        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Alpine_logo.svg/200px-Alpine_logo.svg.png',
  'Aston Martin':  'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Aston_Martin_Logo_2022.svg/200px-Aston_Martin_Logo_2022.svg.png',
  'Audi':          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Audi_rings_2016.svg/200px-Audi_rings_2016.svg.png',
  'Austin':        'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Austin_Motor_Company_Logo.svg/200px-Austin_Motor_Company_Logo.svg.png',
  'Bentley':       'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Bentley_logo_2.svg/200px-Bentley_logo_2.svg.png',
  'BMW':           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png',
  'Bugatti':       'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Bugatti_logo.svg/200px-Bugatti_logo.svg.png',
  'Buick':         'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Buick_logo.svg/200px-Buick_logo.svg.png',
  'BYD':           'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/BYD_Auto_Logo_%282021%29.svg/200px-BYD_Auto_Logo_%282021%29.svg.png',
  'Cadillac':      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Cadillac_logo.svg/200px-Cadillac_logo.svg.png',
  'Caterham':      'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Caterham_Cars_logo.svg/200px-Caterham_Cars_logo.svg.png',
  'Chevrolet':     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Chevrolet_logo_%282013%29.svg/200px-Chevrolet_logo_%282013%29.svg.png',
  'Chrysler':      'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/Chrysler_logo_2024.svg/200px-Chrysler_logo_2024.svg.png',
  'Citroën':       'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Citro%C3%ABn_2022.svg/200px-Citro%C3%ABn_2022.svg.png',
  'Cupra':         'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Cupra_logo_2018.svg/200px-Cupra_logo_2018.svg.png',
  'Dacia':         'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Dacia_2021.svg/200px-Dacia_2021.svg.png',
  'Daewoo':        'https://upload.wikimedia.org/wikipedia/en/thumb/9/94/Daewoo_Motor_logo.svg/200px-Daewoo_Motor_logo.svg.png',
  'Daihatsu':      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Daihatsu_Logo.svg/200px-Daihatsu_Logo.svg.png',
  'DFSK':          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Dongfeng_Motor_logo.svg/200px-Dongfeng_Motor_logo.svg.png',
  'Dodge':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Dodge_logo.svg/200px-Dodge_logo.svg.png',
  'DS':            'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/DS_Automobiles_logo.svg/200px-DS_Automobiles_logo.svg.png',
  'Ferrari':       'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Ferrari_logo.svg/200px-Ferrari_logo.svg.png',
  'Fiat':          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Fiat_Automobiles_logo_%282006%29.svg/200px-Fiat_Automobiles_logo_%282006%29.svg.png',
  'Ford':          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ford_Motor_Company_Logo.svg/200px-Ford_Motor_Company_Logo.svg.png',
  'Genesis':       'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Genesis_motors_badge.svg/200px-Genesis_motors_badge.svg.png',
  'GWM':           'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/GWM_logo.svg/200px-GWM_logo.svg.png',
  'Honda':         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/200px-Honda.svg.png',
  'Hummer':        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hummer_logo.svg/200px-Hummer_logo.svg.png',
  'Hyundai':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png',
  'Infiniti':      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Infiniti_logo.svg/200px-Infiniti_logo.svg.png',
  'Isuzu':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Isuzu_logo.svg/200px-Isuzu_logo.svg.png',
  'Iveco':         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Iveco_logo_%282022%29.svg/200px-Iveco_logo_%282022%29.svg.png',
  'Jaguar':        'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Jaguar_Cars_logo_2012.svg/200px-Jaguar_Cars_logo_2012.svg.png',
  'Jeep':          'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Jeep_logo_2022.svg/200px-Jeep_logo_2022.svg.png',
  'Kia':           'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.svg/200px-Kia-logo.svg.png',
  'Lada':          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lada_Logo.svg/200px-Lada_Logo.svg.png',
  'Lamborghini':   'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Lamborghini_Logo.svg/200px-Lamborghini_Logo.svg.png',
  'Lancia':        'https://upload.wikimedia.org/wikipedia/en/thumb/7/79/Lancia_logo_2022.svg/200px-Lancia_logo_2022.svg.png',
  'Land Rover':    'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Land_Rover_logo_2020.svg/200px-Land_Rover_logo_2020.svg.png',
  'Lexus':         'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Lexus_division_emblem.svg/200px-Lexus_division_emblem.svg.png',
  'Lincoln':       'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Lincoln_Motor_Company_logo.svg/200px-Lincoln_Motor_Company_logo.svg.png',
  'Lotus':         'https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Lotus_Cars_logo.svg/200px-Lotus_Cars_logo.svg.png',
  'Lynk & Co':     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Lynk_%26_Co_logo.svg/200px-Lynk_%26_Co_logo.svg.png',
  'Maserati':      'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Maserati_logo.svg/200px-Maserati_logo.svg.png',
  'Maxus':         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Maxus_logo_2022.svg/200px-Maxus_logo_2022.svg.png',
  'Mazda':         'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mazda_Motor_logo.svg/200px-Mazda_Motor_logo.svg.png',
  'McLaren':       'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/McLaren_Automotive_logo.svg/200px-McLaren_Automotive_logo.svg.png',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Benz_Logo_2010.svg/200px-Mercedes-Benz_Logo_2010.svg.png',
  'MG':            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/MG_Motor_2021_logo.svg/200px-MG_Motor_2021_logo.svg.png',
  'MINI':          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mini_logo_2018.svg/200px-Mini_logo_2018.svg.png',
  'Mitsubishi':    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mitsubishi_logo.svg/200px-Mitsubishi_logo.svg.png',
  'Morgan':        'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Morgan_Motor_Company_logo.svg/200px-Morgan_Motor_Company_logo.svg.png',
  'NIO':           'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/NIO_Logo.svg/200px-NIO_Logo.svg.png',
  'Nissan':        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nissan_2020_logo.svg/200px-Nissan_2020_logo.svg.png',
  'Opel':          'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Opel_logo_2024.svg/200px-Opel_logo_2024.svg.png',
  'ORA':           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ora_%28marque%29_Logo.svg/200px-Ora_%28marque%29_Logo.svg.png',
  'Peugeot':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Peugeot_2021_Logo.svg/200px-Peugeot_2021_Logo.svg.png',
  'Polestar':      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Polestar_logo.svg/200px-Polestar_logo.svg.png',
  'Porsche':       'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Porsche_logo.svg/200px-Porsche_logo.svg.png',
  'RAM':           'https://upload.wikimedia.org/wikipedia/en/thumb/3/38/Ram_Trucks_logo.svg/200px-Ram_Trucks_logo.svg.png',
  'Renault':       'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Renault_2021_Text.svg/200px-Renault_2021_Text.svg.png',
  'Rolls-Royce':   'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Rolls-Royce_Motor_Cars_logo.svg/200px-Rolls-Royce_Motor_Cars_logo.svg.png',
  'Rover':         'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Rover_logo.svg/200px-Rover_logo.svg.png',
  'Saab':          'https://upload.wikimedia.org/wikipedia/en/thumb/8/83/Saab_Automobile_logo.svg/200px-Saab_Automobile_logo.svg.png',
  'SEAT':          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Seat_Logo_from_2017.svg/200px-Seat_Logo_from_2017.svg.png',
  'Škoda':         'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/%C5%A0koda_Auto_2022.svg/200px-%C5%A0koda_Auto_2022.svg.png',
  'Smart':         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Smart_Automobile_logo.svg/200px-Smart_Automobile_logo.svg.png',
  'SsangYong':     'https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/SsangYong_Motor_logo.svg/200px-SsangYong_Motor_logo.svg.png',
  'Subaru':        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Subaru_logo_%282019%29.svg/200px-Subaru_logo_%282019%29.svg.png',
  'Suzuki':        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Suzuki_logo_2.svg/200px-Suzuki_logo_2.svg.png',
  'Tatra':         'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Tatra_logo.svg/200px-Tatra_logo.svg.png',
  'Tesla':         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tesla_logo.svg/200px-Tesla_logo.svg.png',
  'Toyota':        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota.svg/200px-Toyota.svg.png',
  'Volkswagen':    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png',
  'Volvo':         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Volvo_Cars_logo.svg/200px-Volvo_Cars_logo.svg.png',
  'Wiesmann':      'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/Wiesmann_logo.svg/200px-Wiesmann_logo.svg.png',
  'XPeng':         'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/XPeng_Motors_logo.svg/200px-XPeng_Motors_logo.svg.png',
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';
    return { buffer, contentType };
  } catch {
    return null;
  }
}

async function uploadToR2(buffer, contentType, name) {
  const ext = contentType.includes('svg') ? 'svg' : contentType.includes('png') ? 'png' : 'jpg';
  const safeName = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  const key = `logos/${safeName}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}

async function checkExists(name) {
  const safeName = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  for (const ext of ['png', 'svg', 'jpg']) {
    try {
      await s3.send(new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: `logos/${safeName}.${ext}`,
      }));
      return `${R2_PUBLIC_URL}/logos/${safeName}.${ext}`;
    } catch {
      // not found
    }
  }
  return null;
}

async function main() {
  const forceAll = process.argv.includes('--force');
  console.log('=== Manufacturer Logo Scraper ===');
  console.log(`Brands: ${Object.keys(LOGO_SOURCES).length}`);
  console.log(`R2 Bucket: ${R2_BUCKET}\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const results = {};

  for (const [name, url] of Object.entries(LOGO_SOURCES)) {
    // Check if already exists
    if (!forceAll) {
      const existing = await checkExists(name);
      if (existing) {
        process.stdout.write(`  ✓ ${name} (already in R2)\n`);
        results[name] = existing;
        skipped++;
        continue;
      }
    }

    const imgData = await downloadImage(url);
    if (!imgData || imgData.buffer.length < 100) {
      console.log(`  ✗ ${name} — download failed from ${url}`);
      failed++;
      continue;
    }

    try {
      const r2Url = await uploadToR2(imgData.buffer, imgData.contentType, name);
      results[name] = r2Url;
      process.stdout.write(`  ✓ ${name} → ${r2Url} (${(imgData.buffer.length / 1024).toFixed(1)} KB)\n`);
      downloaded++;
    } catch (err) {
      console.log(`  ✗ ${name} — R2 upload failed: ${err.message}`);
      failed++;
    }

    await sleep(200); // polite delay
  }

  console.log(`\nDone!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped (already in R2): ${skipped}`);
  console.log(`  Failed: ${failed}`);

  // Output URL mapping for frontend use
  console.log(`\n--- Logo URL mapping ---`);
  for (const [name, url] of Object.entries(results)) {
    console.log(`  ${name}: ${url}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
