#!/usr/bin/env node
// ============================================================
// Migrate vehicle images: Sauto CDN → R2 via Puppeteer
// sdn.cz CDN blocks server-side requests (401), so we use
// a headless browser to download images, then upload to R2.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import puppeteer from 'puppeteer-core';
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

// ── Chrome path ─────────────────────────────────────────────
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Config ──────────────────────────────────────────────────
const MAX_IMAGES_PER_VEHICLE = 10;
const BATCH_SIZE = 20;
const DELAY_BETWEEN_VEHICLES = 200; // ms

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Download image via Puppeteer page context ───────────────
async function downloadImageInBrowser(page, imageUrl) {
  try {
    // Use page.evaluate to fetch image as ArrayBuffer inside the browser
    const result = await page.evaluate(async (url) => {
      try {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) return { error: res.status };
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        // Convert to base64 to pass back to Node
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return {
          data: btoa(binary),
          contentType: res.headers.get('content-type') || 'image/jpeg',
          size: bytes.length,
        };
      } catch (e) {
        return { error: e.message };
      }
    }, imageUrl);

    if (result.error) {
      return null;
    }

    return {
      buffer: Buffer.from(result.data, 'base64'),
      contentType: result.contentType,
    };
  } catch (err) {
    return null;
  }
}

// ── Upload to R2 ────────────────────────────────────────────
async function uploadToR2(buffer, contentType, vehicleId, index) {
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const key = `vehicles/${vehicleId}/${index}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}

// ── Process one vehicle ─────────────────────────────────────
async function processVehicle(page, vehicle) {
  let images = vehicle.images;

  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch { return null; }
  }

  if (!Array.isArray(images) || images.length === 0) return null;

  // Normalize to array of URL strings
  const urls = images.map(img => {
    let url = typeof img === 'string' ? img : img?.url;
    if (!url) return null;
    if (url.startsWith('//')) url = 'https:' + url;
    return url;
  }).filter(Boolean);

  if (urls.length === 0) return null;

  // Skip if already on R2
  if (urls[0].includes(R2_PUBLIC_URL)) return null;

  const toProcess = urls.slice(0, MAX_IMAGES_PER_VEHICLE);
  const r2Urls = [];

  for (let i = 0; i < toProcess.length; i++) {
    const imgData = await downloadImageInBrowser(page, toProcess[i]);
    if (!imgData || imgData.buffer.length < 1000) continue; // skip tiny/broken images

    try {
      const r2Url = await uploadToR2(imgData.buffer, imgData.contentType, vehicle.sauto_id || vehicle.id, i);
      r2Urls.push(r2Url);
    } catch (err) {
      // R2 upload failed, continue with next image
    }
  }

  if (r2Urls.length === 0) return null;

  // Update DB
  const { error } = await supabase
    .from('vehicles')
    .update({
      images: JSON.stringify(r2Urls),
      main_image_url: r2Urls[0],
      main_thumbnail_url: r2Urls[0],
    })
    .eq('id', vehicle.id);

  if (error) {
    console.error(`\n  DB update error for vehicle ${vehicle.id}: ${error.message}`);
    return null;
  }

  return r2Urls.length;
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  let limit = 0;
  let manufacturerId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit') limit = parseInt(args[++i]);
    if (args[i] === '--manufacturer-id') manufacturerId = parseInt(args[++i]);
  }

  console.log('=== Image Migration: Sauto CDN → R2 (Puppeteer) ===');
  console.log(`R2 bucket: ${R2_BUCKET}`);
  console.log(`Max images/vehicle: ${MAX_IMAGES_PER_VEHICLE}`);
  console.log(`Limit: ${limit || 'all'}`);

  // Launch browser
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Navigate to sauto.cz first to get cookies/session
  console.log('Visiting sauto.cz to establish session...');
  await page.goto('https://www.sauto.cz/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  console.log('Session established.');

  let totalProcessed = 0;
  let totalImages = 0;
  let totalSkipped = 0;
  let offset = 0;

  while (true) {
    let query = supabase
      .from('vehicles')
      .select('id, sauto_id, images, main_image_url')
      .eq('source', 'sauto')
      .not('images', 'is', null)
      .order('id')
      .range(offset, offset + BATCH_SIZE - 1);

    if (manufacturerId) {
      query = query.eq('manufacturer_id', manufacturerId);
    }

    const { data: vehicles, error } = await query;

    if (error) {
      console.error('DB query error:', error.message);
      break;
    }

    if (!vehicles || vehicles.length === 0) {
      console.log('\nNo more vehicles to process.');
      break;
    }

    for (const v of vehicles) {
      // Quick check: skip already migrated
      const mainUrl = v.main_image_url || '';
      if (mainUrl.includes(R2_PUBLIC_URL)) {
        totalSkipped++;
        offset++;
        continue;
      }

      const count = await processVehicle(page, v);
      if (count) {
        totalProcessed++;
        totalImages += count;
      } else {
        totalSkipped++;
      }

      process.stdout.write(`\r  Migrated: ${totalProcessed} vehicles (${totalImages} images), skipped: ${totalSkipped}`);

      if (limit > 0 && totalProcessed >= limit) break;
      await sleep(DELAY_BETWEEN_VEHICLES);
    }

    if (limit > 0 && totalProcessed >= limit) {
      console.log(`\nReached limit of ${limit}.`);
      break;
    }

    offset += BATCH_SIZE;
  }

  await browser.close();

  console.log(`\n\nDone!`);
  console.log(`  Vehicles migrated: ${totalProcessed}`);
  console.log(`  Images uploaded to R2: ${totalImages}`);
  console.log(`  Skipped: ${totalSkipped}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
