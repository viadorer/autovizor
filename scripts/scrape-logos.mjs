#!/usr/bin/env node
// ============================================================
// Scrape manufacturer logos from Wikimedia Commons API
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

// ── Manufacturer → Wikimedia Commons file name mapping ───────
// These are the exact file names on Wikimedia Commons
const WIKI_FILES = {
  'Abarth':        ['Abarth logo', 'Abarth & C. logo'],
  'Aiways':        ['Aiways logo'],
  'Alfa Romeo':    ['Alfa Romeo logo', 'Alfa Romeo 2015 logo'],
  'Alpine':        ['Alpine logo'],
  'Aston Martin':  ['Aston Martin Logo 2022', 'Aston Martin logo'],
  'Audi':          ['Audi rings 2016', 'Audi logo'],
  'Austin':        ['Austin Motor Company Logo'],
  'Bentley':       ['Bentley logo 2', 'Bentley logo'],
  'BMW':           ['BMW', 'BMW logo (gray)'],
  'Bugatti':       ['Bugatti logo'],
  'Buick':         ['Buick logo'],
  'BYD':           ['BYD Auto Logo (2021)', 'BYD Auto logo'],
  'Cadillac':      ['Cadillac logo', 'Cadillac Crest'],
  'Caterham':      ['Caterham Cars logo'],
  'Chevrolet':     ['Chevrolet logo (2013)'],
  'Chrysler':      ['Chrysler logo 2024', 'Chrysler logo'],
  'Citroën':       ['Citroën 2022', 'Citroen Logo'],
  'Cupra':         ['Cupra logo 2018', 'CUPRA logo'],
  'Dacia':         ['Dacia 2021', 'Dacia logo'],
  'Daewoo':        ['Daewoo Motor logo'],
  'Daihatsu':      ['Daihatsu Logo'],
  'DFSK':          ['Dongfeng Motor logo', 'DFSK logo'],
  'Dodge':         ['Dodge logo'],
  'DS':            ['DS Automobiles logo'],
  'Ferrari':       ['Ferrari logo', 'Scuderia Ferrari Logo'],
  'Fiat':          ['Fiat Automobiles logo (2006)', 'Fiat logo'],
  'Ford':          ['Ford Motor Company Logo', 'Ford logo'],
  'Genesis':       ['Genesis motors badge', 'Genesis Motor logo'],
  'GWM':           ['GWM logo', 'Great Wall Motors logo'],
  'Honda':         ['Honda', 'Honda logo'],
  'Hummer':        ['Hummer logo'],
  'Hyundai':       ['Hyundai Motor Company logo'],
  'Infiniti':      ['Infiniti logo'],
  'Isuzu':         ['Isuzu logo'],
  'Iveco':         ['Iveco logo (2022)', 'Iveco logo'],
  'Jaguar':        ['Jaguar Cars logo 2012', 'Jaguar logo'],
  'Jeep':          ['Jeep logo 2022', 'Jeep logo'],
  'Kia':           ['Kia-logo', 'Kia logo 2021'],
  'Lada':          ['Lada Logo'],
  'Lamborghini':   ['Lamborghini Logo'],
  'Lancia':        ['Lancia logo 2022', 'Lancia logo'],
  'Land Rover':    ['Land Rover logo 2020', 'Land Rover logo'],
  'Lexus':         ['Lexus division emblem'],
  'Lincoln':       ['Lincoln Motor Company logo'],
  'Lotus':         ['Lotus Cars logo'],
  'Lynk & Co':     ['Lynk & Co logo'],
  'Maserati':      ['Maserati logo'],
  'Maxus':         ['Maxus logo 2022', 'Maxus logo'],
  'Mazda':         ['Mazda Motor logo', 'Mazda logo'],
  'McLaren':       ['McLaren Automotive logo'],
  'Mercedes-Benz': ['Mercedes-Benz Logo 2010', 'Mercedes-Benz free logo'],
  'MG':            ['MG Motor 2021 logo', 'MG logo'],
  'MINI':          ['Mini logo 2018', 'MINI logo'],
  'Mitsubishi':    ['Mitsubishi logo'],
  'Morgan':        ['Morgan Motor Company logo'],
  'NIO':           ['NIO Logo'],
  'Nissan':        ['Nissan 2020 logo', 'Nissan logo'],
  'Opel':          ['Opel logo 2024', 'Opel logo'],
  'ORA':           ['Ora (marque) Logo'],
  'Peugeot':       ['Peugeot 2021 Logo', 'Peugeot logo'],
  'Polestar':      ['Polestar logo'],
  'Porsche':       ['Porsche logo'],
  'RAM':           ['Ram Trucks logo'],
  'Renault':       ['Renault 2021 Text', 'Renault logo'],
  'Rolls-Royce':   ['Rolls-Royce Motor Cars logo'],
  'Rover':         ['Rover logo'],
  'Saab':          ['Saab Automobile logo'],
  'SEAT':          ['Seat Logo from 2017', 'SEAT logo'],
  'Škoda':         ['Škoda Auto 2022', 'Skoda Auto logo'],
  'Smart':         ['Smart Automobile logo'],
  'SsangYong':     ['SsangYong Motor logo'],
  'Subaru':        ['Subaru logo (2019)', 'Subaru logo'],
  'Suzuki':        ['Suzuki logo 2', 'Suzuki logo'],
  'Tatra':         ['Tatra logo'],
  'Tesla':         ['Tesla Motors Logo', 'Tesla wordmark'],
  'Toyota':        ['Toyota', 'Toyota logo'],
  'Volkswagen':    ['Volkswagen logo 2019'],
  'Volvo':         ['Volvo Cars logo', 'Volvo logo'],
  'Wiesmann':      ['Wiesmann logo'],
  'XPeng':         ['XPeng Motors logo', 'Xpeng logo'],
};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Search Wikimedia Commons for a logo file and get its thumb URL
async function findLogoUrl(searchTerms) {
  for (const term of searchTerms) {
    // Try both commons and en wikipedia
    for (const wiki of ['commons.wikimedia.org', 'en.wikipedia.org']) {
      try {
        // Search for the file
        const searchUrl = `https://${wiki}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term + ' logo svg')}&srnamespace=6&srlimit=5&format=json`;
        const searchRes = await fetch(searchUrl, {
          headers: { 'User-Agent': 'AutovizorBot/1.0 (autovizor.cz; logo scraper)' },
        });
        if (!searchRes.ok) continue;
        const searchData = await searchRes.json();
        const results = searchData.query?.search || [];

        for (const result of results) {
          const title = result.title; // e.g. "File:Tesla Motors Logo.svg"
          // Get image info with thumb
          const infoUrl = `https://${wiki}/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=200&format=json`;
          const infoRes = await fetch(infoUrl, {
            headers: { 'User-Agent': 'AutovizorBot/1.0 (autovizor.cz; logo scraper)' },
          });
          if (!infoRes.ok) continue;
          const infoData = await infoRes.json();
          const pages = infoData.query?.pages || {};
          for (const page of Object.values(pages)) {
            const ii = page.imageinfo?.[0];
            if (ii?.thumburl) return { thumbUrl: ii.thumburl, originalUrl: ii.url, title };
            if (ii?.url) return { thumbUrl: ii.url, originalUrl: ii.url, title };
          }
        }
      } catch {
        continue;
      }
    }

    // Also try direct file name match
    for (const ext of ['svg', 'png']) {
      const fileName = `File:${term}.${ext}`;
      for (const wiki of ['commons.wikimedia.org', 'en.wikipedia.org']) {
        try {
          const infoUrl = `https://${wiki}/w/api.php?action=query&titles=${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=200&format=json`;
          const infoRes = await fetch(infoUrl, {
            headers: { 'User-Agent': 'AutovizorBot/1.0 (autovizor.cz; logo scraper)' },
          });
          if (!infoRes.ok) continue;
          const infoData = await infoRes.json();
          const pages = infoData.query?.pages || {};
          for (const page of Object.values(pages)) {
            if (page.missing !== undefined) continue;
            const ii = page.imageinfo?.[0];
            if (ii?.thumburl) return { thumbUrl: ii.thumburl, originalUrl: ii.url, title: fileName };
            if (ii?.url) return { thumbUrl: ii.url, originalUrl: ii.url, title: fileName };
          }
        } catch {
          continue;
        }
      }
    }
  }
  return null;
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AutovizorBot/1.0 (autovizor.cz; logo scraper)' },
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/png';
    return { buffer, contentType };
  } catch {
    return null;
  }
}

function safeName(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

async function uploadToR2(buffer, contentType, name) {
  const ext = contentType.includes('svg') ? 'svg' : contentType.includes('png') ? 'png' : 'jpg';
  const key = `logos/${safeName(name)}.${ext}`;

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
  const sn = safeName(name);
  for (const ext of ['png', 'svg', 'jpg']) {
    try {
      await s3.send(new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: `logos/${sn}.${ext}`,
      }));
      return `${R2_PUBLIC_URL}/logos/${sn}.${ext}`;
    } catch {
      // not found
    }
  }
  return null;
}

async function main() {
  const forceAll = process.argv.includes('--force');
  const brands = Object.keys(WIKI_FILES);
  console.log('=== Manufacturer Logo Scraper (Wikimedia API) ===');
  console.log(`Brands: ${brands.length}`);
  console.log(`R2 Bucket: ${R2_BUCKET}\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const results = {};

  for (const name of brands) {
    // Check if already exists in R2
    if (!forceAll) {
      const existing = await checkExists(name);
      if (existing) {
        process.stdout.write(`  ✓ ${name} (already in R2)\n`);
        results[name] = existing;
        skipped++;
        continue;
      }
    }

    // Find logo URL via Wikimedia API
    const logoInfo = await findLogoUrl(WIKI_FILES[name]);
    if (!logoInfo) {
      console.log(`  ✗ ${name} — not found on Wikimedia`);
      failed++;
      continue;
    }

    // Download the thumbnail (PNG rendered from SVG, 200px wide)
    const imgData = await downloadImage(logoInfo.thumbUrl);
    if (!imgData || imgData.buffer.length < 100) {
      // Try original URL as fallback
      const origData = await downloadImage(logoInfo.originalUrl);
      if (!origData || origData.buffer.length < 100) {
        console.log(`  ✗ ${name} — download failed (${logoInfo.title})`);
        failed++;
        continue;
      }
      try {
        const r2Url = await uploadToR2(origData.buffer, origData.contentType, name);
        results[name] = r2Url;
        process.stdout.write(`  ✓ ${name} → ${r2Url} (${(origData.buffer.length / 1024).toFixed(1)} KB) [original]\n`);
        downloaded++;
      } catch (err) {
        console.log(`  ✗ ${name} — R2 upload failed: ${err.message}`);
        failed++;
      }
      await sleep(300);
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

    await sleep(300); // polite delay for Wikimedia API
  }

  console.log(`\nDone!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped (already in R2): ${skipped}`);
  console.log(`  Failed: ${failed}`);

  // Output URL mapping
  console.log(`\n--- Logo URL mapping ---`);
  for (const [name, url] of Object.entries(results)) {
    console.log(`  ${name}: ${url}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
