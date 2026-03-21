#!/usr/bin/env node
/**
 * Fix logos that got the wrong image from Wikimedia search
 * Delete wrong ones and try more specific searches
 */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

// Direct Wikimedia Commons thumb URLs (manually verified correct logos)
const FIXES = {
  // Kawasaki - got city emblem, need motorcycle logo
  'kawasaki': {
    delete: true,
    // Kawasaki river mark logo
    file: 'Kawasaki_motorcycles_logo.svg',
    search: 'Kawasaki Heavy Industries logo',
  },
  // Indian - got Hero MotoCorp, need Indian Motorcycle
  'indian': {
    delete: true,
    file: 'Indian_Motorcycle_logo.svg',
    search: 'Indian Motorcycle logo',
  },
  // SOR - got South Korea emblem
  'sor': {
    delete: true,
    search: 'SOR Libchavy logo',
  },
  // Solaris - got old Solaris logo
  'solaris': {
    delete: true,
    search: 'Solaris Bus Coach logo',
  },
  // Adria - got Adria Airways
  'adria': {
    delete: true,
    search: 'Adria Mobil logo',
  },
};

async function getWikimediaThumb(searchTerm, safeName) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=10&format=json`;
  const searchRes = await fetch(searchUrl, {
    headers: { 'User-Agent': 'AutovizorBot/1.0 (logo-collection)' },
  });
  if (!searchRes.ok) return null;

  const data = await searchRes.json();
  const results = data.query?.search || [];

  for (const result of results) {
    const title = result.title;
    if (!title.match(/\.(svg|png)$/i)) continue;
    // Strict filtering - must contain brand-related terms
    const titleLower = title.toLowerCase();
    const nameClean = safeName.replace(/-/g, ' ').toLowerCase();
    if (!titleLower.includes(nameClean.split(' ')[0])) continue;
    // Skip obviously wrong results
    if (titleLower.match(/emblem of|flag of|coat of|ward|city|prefecture|district|province/i)) continue;

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

    console.log(`    Found: ${title}`);
    return thumbUrl;
  }
  return null;
}

async function main() {
  for (const [name, fix] of Object.entries(FIXES)) {
    const key = `logos/${name}.png`;
    console.log(`${name}:`);

    if (fix.delete) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
        console.log(`  Deleted wrong logo`);
      } catch { }
    }

    // Try specific file first
    if (fix.file) {
      const fileUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fix.file)}&prop=imageinfo&iiprop=url&iiurlwidth=200&format=json`;
      const fileRes = await fetch(fileUrl, {
        headers: { 'User-Agent': 'AutovizorBot/1.0 (logo-collection)' },
      });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        const pages = fileData.query?.pages || {};
        const page = Object.values(pages)[0];
        const thumbUrl = page?.imageinfo?.[0]?.thumburl;
        if (thumbUrl) {
          const imgRes = await fetch(thumbUrl);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length > 500) {
              await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buf, ContentType: 'image/png' }));
              console.log(`  ✓ ${name} (${(buf.length / 1024).toFixed(1)} KB) — ${fix.file}`);
              continue;
            }
          }
        }
      }
    }

    // Search fallback
    if (fix.search) {
      const url = await getWikimediaThumb(fix.search, name);
      if (url) {
        const imgRes = await fetch(url);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 500) {
            await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buf, ContentType: 'image/png' }));
            console.log(`  ✓ ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
            continue;
          }
        }
      }
    }

    console.log(`  ✗ ${name} — could not fix`);
    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(console.error);
