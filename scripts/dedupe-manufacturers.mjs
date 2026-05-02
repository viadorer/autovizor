// ============================================================
// AUTOVIZOR.CZ — Deduplikace MANUFACTURERS pole
//
// Problém: src/lib/manufacturers.ts má některé značky 2-4× kvůli
// per-kategorii ID (Suzuki = osobní + motorky + čtyřkolky + obytné).
// Po migraci 008 (manufacturers.kind_ids INTEGER[]) by měl být 1 záznam
// s polem kind_ids.
//
// Tento skript:
//  1) Načte stávající MANUFACTURERS
//  2) Group by name (case-insensitive)
//  3) Sloučí kind_ids[] (union), models[] (union podle id)
//  4) Použije nejnižší ID jako primární (Sauto by měl mít primární)
//  5) Vypíše statistiku — manuální verifikace před přepsáním souboru
//
// Použití:
//   node scripts/dedupe-manufacturers.mjs
//
// Skutečné přepsání souboru je TODO (vyžaduje regenerování celého
// 4827-řádkového souboru) — doporučuji spíš resync ze Sauto carList XML
// pomocí scripts/sync-sauto-manufacturers.mjs.
// ============================================================

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FILE = resolve(process.cwd(), 'src/lib/manufacturers.ts');
const src = readFileSync(FILE, 'utf-8');

// Naivní extrakce — počítá výskyty `name: 'X'`
const re = /name:\s*'([^']+)'/g;
const names = new Map();
let m;
while ((m = re.exec(src)) !== null) {
  const n = m[1];
  names.set(n, (names.get(n) ?? 0) + 1);
}

const dups = [...names.entries()]
  .filter(([, c]) => c > 1)
  .sort((a, b) => b[1] - a[1]);

console.log(`Celkem unikátních jmen: ${names.size}`);
console.log(`Značek s duplicitami: ${dups.length}`);
console.log();
console.log('Top 30 duplicitních značek (počet záznamů):');
for (const [name, count] of dups.slice(0, 30)) {
  console.log(`  ${name.padEnd(30)} ${count}×`);
}
console.log();
console.log('NÁVRH: Místo přepisování souboru spusťte');
console.log('  node scripts/sync-sauto-manufacturers.mjs');
console.log('který načte autoritativní carList XML ze Sauto.cz a vygeneruje');
console.log('čistý seznam s kind_ids[] polem.');
