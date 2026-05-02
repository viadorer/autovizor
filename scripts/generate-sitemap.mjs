// ============================================================
// AUTOVIZOR.CZ — Sitemap generator
// Generuje:
//   - public/sitemap.xml         (index pro velký objem)
//   - public/sitemap-static.xml  (statické stránky)
//   - public/sitemap-vehicles-N.xml (vozidla, max 50k per soubor)
//   - public/sitemap-brands.xml  (značky / modely)
//   - public/robots.txt
//
// Použití:
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/generate-sitemap.mjs
//
// Doporučeno spouštět:
//   - lokálně před deploy
//   - GitHub Actions na cron 1×/den
//   - Vercel cron job (pokud jdeme tudy)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import 'dotenv/config';

const SITE_URL = process.env.SITE_URL ?? 'https://autovizor.cz';
const PUBLIC_DIR = resolve(process.cwd(), 'public');
const VEHICLES_PER_FILE = 50_000; // sitemap.xml limit per Google

if (!existsSync(PUBLIC_DIR)) {
  mkdirSync(PUBLIC_DIR, { recursive: true });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_*_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlSetXml(urls) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const u of urls) {
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(u.loc)}</loc>`);
    if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    if (u.priority != null) lines.push(`    <priority>${u.priority}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n');
}

function sitemapIndexXml(maps) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const m of maps) {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${xmlEscape(m.loc)}</loc>`);
    if (m.lastmod) lines.push(`    <lastmod>${m.lastmod}</lastmod>`);
    lines.push('  </sitemap>');
  }
  lines.push('</sitemapindex>');
  return lines.join('\n');
}

async function fetchVehicles() {
  const all = [];
  let from = 0;
  const PAGE = 5000;
  // Iterate stránky → bez OOM pro 100K+
  for (;;) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function fetchManufacturers() {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('id, name, seo_name');
  if (error) throw error;
  return data ?? [];
}

async function main() {
  console.log('▶ Generuji sitemap…');
  const [vehicles, manufacturers] = await Promise.all([
    fetchVehicles(),
    fetchManufacturers(),
  ]);
  console.log(`  Vehicles: ${vehicles.length}`);
  console.log(`  Manufacturers: ${manufacturers.length}`);

  // Static
  const staticUrls = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 1.0 },
    { loc: `${SITE_URL}/hledat`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/prodat`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${SITE_URL}/poradna`, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_URL}/porovnani`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${SITE_URL}/garaz`, changefreq: 'monthly', priority: 0.3 },
  ];
  writeFileSync(resolve(PUBLIC_DIR, 'sitemap-static.xml'), urlSetXml(staticUrls));

  // Brands & kind landing pages
  const brandUrls = [];
  for (const k of [1, 3, 4, 5, 6, 7, 9, 10, 11]) {
    brandUrls.push({
      loc: `${SITE_URL}/hledat?kind_id=${k}`,
      changefreq: 'daily',
      priority: 0.7,
    });
  }
  for (const m of manufacturers) {
    brandUrls.push({
      loc: `${SITE_URL}/hledat?manufacturer_id=${m.id}`,
      changefreq: 'weekly',
      priority: 0.6,
    });
  }
  writeFileSync(resolve(PUBLIC_DIR, 'sitemap-brands.xml'), urlSetXml(brandUrls));

  // Vehicles — chunked
  const vehicleSitemapNames = [];
  for (let i = 0; i < vehicles.length; i += VEHICLES_PER_FILE) {
    const chunk = vehicles.slice(i, i + VEHICLES_PER_FILE);
    const name = `sitemap-vehicles-${Math.floor(i / VEHICLES_PER_FILE) + 1}.xml`;
    const urls = chunk.map((v) => ({
      loc: `${SITE_URL}/vozidlo/${v.slug ?? 'vozidlo'}-${v.id}`,
      lastmod: v.updated_at ? new Date(v.updated_at).toISOString().slice(0, 10) : undefined,
      changefreq: 'weekly',
      priority: 0.8,
    }));
    writeFileSync(resolve(PUBLIC_DIR, name), urlSetXml(urls));
    vehicleSitemapNames.push(name);
  }
  if (vehicleSitemapNames.length === 0) {
    // dummy
    writeFileSync(resolve(PUBLIC_DIR, 'sitemap-vehicles-1.xml'), urlSetXml([]));
    vehicleSitemapNames.push('sitemap-vehicles-1.xml');
  }

  // Index
  const today = new Date().toISOString().slice(0, 10);
  const indexEntries = [
    { loc: `${SITE_URL}/sitemap-static.xml`, lastmod: today },
    { loc: `${SITE_URL}/sitemap-brands.xml`, lastmod: today },
    ...vehicleSitemapNames.map((name) => ({
      loc: `${SITE_URL}/${name}`,
      lastmod: today,
    })),
  ];
  writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemapIndexXml(indexEntries));

  // robots.txt
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /prihlaseni',
    'Disallow: /garaz',
    'Disallow: /oblibene',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
  writeFileSync(resolve(PUBLIC_DIR, 'robots.txt'), robots);

  console.log(`✔ Sitemap ${indexEntries.length} souborů + robots.txt → ${PUBLIC_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
