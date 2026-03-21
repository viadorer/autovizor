#!/usr/bin/env node
/**
 * Downloads motorcycle & other missing brand logos from Wikimedia Commons
 * Uses API search to find emblem/logo files
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

// Direct Wikimedia Commons file URLs for motorcycle/truck/RV brand logos (manually curated emblems)
const LOGOS = {
  // Motorcycles - using known Wikimedia filenames
  'harley-davidson': 'Harley-Davidson_logo.svg',
  'yamaha': 'Yamaha_Motor_Logo_(2024).svg',
  'kawasaki': 'Kawasaki_logo_2024.svg',
  'ducati': 'Ducati_red_logo.svg',
  'aprilia': 'Aprilia-logo.svg',
  'mv-agusta': 'MV-Agusta-Logo.svg',
  'royal-enfield': 'Royal_Enfield_logo.svg',
  'husqvarna': 'Husqvarna_logo.svg',
  'indian': 'Indian_Motorcycle_logo.svg',
  'moto-guzzi': 'Moto_Guzzi_logo.svg',
  'benelli': 'Benelli_logo.svg',
  'cf-moto': 'CFMoto_logo.svg',
  'gas-gas': 'GasGas_logo.svg',
  'beta': 'Beta_Motorcycles_logo.svg',
  'swm': 'SWM_Motorcycles_logo.svg',
  // Missing trucks/buses/RVs
  'liaz': 'LIAZ_logo.svg',
  'avia': 'Avia_Motors_logo.svg',
  'sor': 'SOR_Libchavy_logo.svg',
  'solaris': 'Solaris_Bus_%26_Coach_logo.svg',
  'irisbus': 'Irisbus_logo.svg',
  'adria': 'Adria_Mobil_logo.svg',
  'hymer': 'Hymer_logo.svg',
  'knaus': 'Knaus_Tabbert_logo.svg',
};

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function searchAndDownload(safeName, searchFile) {
  const key = `logos/${safeName}.png`;

  if (await exists(key)) {
    console.log(`  ⏭ ${safeName} — already exists`);
    return true;
  }

  // Try Wikimedia Commons API to search for the file
  const searchTerms = [
    searchFile,
    `${safeName.replace(/-/g, ' ')} logo`,
    `${safeName.replace(/-/g, ' ')} emblem`,
  ];

  for (const term of searchTerms) {
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=6&srlimit=5&format=json`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'AutovizorBot/1.0 (logo-collection)' },
      });
      if (!searchRes.ok) continue;

      const data = await searchRes.json();
      const results = data.query?.search || [];

      for (const result of results) {
        const title = result.title;
        // Only SVG or PNG files
        if (!title.match(/\.(svg|png)$/i)) continue;
        // Skip if it's clearly not a logo/emblem
        if (title.match(/photo|car\b|vehicle|factory|museum|dealer|showroom|model|building/i)) continue;

        // Get the actual file URL
        const fileUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=200&format=json`;
        const fileRes = await fetch(fileUrl, {
          headers: { 'User-Agent': 'AutovizorBot/1.0 (logo-collection)' },
        });
        if (!fileRes.ok) continue;

        const fileData = await fileRes.json();
        const pages = fileData.query?.pages || {};
        const page = Object.values(pages)[0];
        const thumbUrl = page?.imageinfo?.[0]?.thumburl;

        if (!thumbUrl) continue;

        const imgRes = await fetch(thumbUrl);
        if (!imgRes.ok) continue;

        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.length < 500) continue; // Too small, probably broken

        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buf,
          ContentType: 'image/png',
        }));
        console.log(`  ✓ ${safeName} (${(buf.length / 1024).toFixed(1)} KB) — ${title}`);
        return true;
      }
    } catch (err) {
      // Continue to next search term
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`  ✗ ${safeName} — not found`);
  return false;
}

async function main() {
  let ok = 0, fail = 0;

  for (const [name, searchFile] of Object.entries(LOGOS)) {
    const result = await searchAndDownload(name, searchFile);
    if (result) ok++;
    else fail++;
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
}

main().catch(console.error);
