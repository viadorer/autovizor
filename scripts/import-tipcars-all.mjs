#!/usr/bin/env node
// ============================================================
// Batch TipCars import - all brands, max N per brand
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BRANDS = [
  // Popular Czech brands first
  'skoda', 'volkswagen', 'ford', 'hyundai', 'kia', 'toyota', 'renault',
  'peugeot', 'citroen', 'opel', 'bmw', 'audi', 'mercedes-benz',
  'seat', 'dacia', 'fiat', 'mazda', 'honda', 'nissan', 'suzuki',
  'mitsubishi', 'volvo', 'subaru', 'chevrolet', 'dodge', 'jeep',
  'land-rover', 'jaguar', 'mini', 'alfa-romeo', 'porsche',
  'lexus', 'infiniti', 'tesla', 'cupra', 'ds',
  // Premium & sports
  'ferrari', 'lamborghini', 'maserati', 'bentley', 'rolls-royce',
  'aston-martin', 'mclaren', 'bugatti', 'lotus', 'morgan',
  'caterham', 'wiesmann', 'alpine',
  // Others
  'chrysler', 'cadillac', 'buick', 'lincoln', 'hummer',
  'ssangyong', 'daihatsu', 'daewoo', 'lancia', 'saab', 'rover',
  'isuzu', 'iveco', 'lada', 'smart', 'genesis', 'polestar',
  'mg', 'byd', 'ora', 'nio', 'aiways', 'xpeng', 'gwm',
  'lynk-co', 'dfsk', 'maxus', 'ram', 'tatra', 'abarth', 'austin',
];

const MAX_PER_BRAND = parseInt(process.argv[2] || '100');
console.log(`=== Batch TipCars Import ===`);
console.log(`Max per brand: ${MAX_PER_BRAND}`);
console.log(`Brands: ${BRANDS.length}`);
console.log('');

let totalInserted = 0;
let totalErrors = 0;
let totalSkipped = 0;

for (const brand of BRANDS) {
  console.log(`\n──── ${brand.toUpperCase()} ────`);
  try {
    const result = execFileSync('node', [
      resolve(__dirname, 'import-tipcars.mjs'),
      '-b', brand,
      '--no-images',
      '--max', String(MAX_PER_BRAND),
    ], {
      timeout: 300000, // 5 min per brand
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(result);

    // Parse results
    const insertedMatch = result.match(/Inserted:\s*(\d+)/);
    const errorsMatch = result.match(/Errors:\s*(\d+)/);
    const skippedMatch = result.match(/Skipped:\s*(\d+)/);
    if (insertedMatch) totalInserted += parseInt(insertedMatch[1]);
    if (errorsMatch) totalErrors += parseInt(errorsMatch[1]);
    if (skippedMatch) totalSkipped += parseInt(skippedMatch[1]);
  } catch (err) {
    console.error(`  FAILED: ${err.message?.slice(0, 200)}`);
    totalErrors++;
  }
}

console.log(`\n\n========== SUMMARY ==========`);
console.log(`Total inserted: ${totalInserted}`);
console.log(`Total skipped: ${totalSkipped}`);
console.log(`Total errors: ${totalErrors}`);
