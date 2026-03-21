#!/usr/bin/env node
/**
 * Downloads emblem logos for new manufacturers (motorcycles, trucks, RVs, etc.)
 * Sources: filippofilip95/car-logos-dataset on GitHub, with fallbacks
 */
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

// Map: safe filename → GitHub car-logos-dataset slug (or direct URL)
const BRAND_LOGOS = {
  // Motorcycles
  'harley-davidson': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/harley-davidson.png',
  'yamaha': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/yamaha.png',
  'kawasaki': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/kawasaki.png',
  'ducati': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ducati.png',
  'ktm': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ktm.png',
  'triumph': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/triumph.png',
  'aprilia': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/aprilia.png',
  'mv-agusta': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mv-agusta.png',
  'royal-enfield': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/royal-enfield.png',
  'husqvarna': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/husqvarna.png',
  'indian': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/indian.png',
  'moto-guzzi': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/moto-guzzi.png',
  'benelli': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/benelli.png',
  'cf-moto': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/cf-moto.png',
  'gas-gas': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/gas-gas.png',
  'beta': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/beta.png',
  'swm': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/swm.png',
  // Trucks
  'man': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/man.png',
  'daf': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/daf.png',
  'scania': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/scania.png',
  'volvo-trucks': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png',
  'renault-trucks': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/renault.png',
  'liaz': null, // No logo available
  'avia': null,
  // Buses
  'sor': null,
  'solaris': null,
  'setra': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/setra.png',
  'irisbus': null,
  // RVs
  'adria': null,
  'hymer': null,
  'burstner': null,
  'knaus': null,
  'carthago': null,
  'dethleffs': null,
  'carado': null,
  'weinsberg': null,
  'sunlight': null,
  // Trailers
  'kogel': null,
  'schmitz-cargobull': null,
  'schwarzmuller': null,
  'agados': null,
};

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function downloadAndUpload(name, url) {
  const key = `logos/${name}.png`;

  if (await exists(key)) {
    console.log(`  ⏭ ${name} — already exists`);
    return true;
  }

  if (!url) {
    console.log(`  ⚠ ${name} — no logo source`);
    return false;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Try alternative slug formats
      const altSlugs = [
        name.replace(/-/g, '_'),
        name.replace(/-/g, ''),
      ];
      for (const slug of altSlugs) {
        const altUrl = `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${slug}.png`;
        const altRes = await fetch(altUrl);
        if (altRes.ok) {
          const buf = Buffer.from(await altRes.arrayBuffer());
          await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buf,
            ContentType: 'image/png',
          }));
          console.log(`  ✓ ${name} (${(buf.length / 1024).toFixed(1)} KB) — alt slug: ${slug}`);
          return true;
        }
      }
      console.log(`  ✗ ${name} — HTTP ${res.status}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: 'image/png',
    }));
    console.log(`  ✓ ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name} — ${err.message}`);
    return false;
  }
}

async function main() {
  let ok = 0, fail = 0, skip = 0;

  for (const [name, url] of Object.entries(BRAND_LOGOS)) {
    const result = await downloadAndUpload(name, url);
    if (result) ok++;
    else if (url === null) skip++;
    else fail++;

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone: ${ok} uploaded, ${fail} failed, ${skip} no source`);
}

main().catch(console.error);
