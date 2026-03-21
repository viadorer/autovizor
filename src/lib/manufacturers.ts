// ============================================================
// AUTOVIZOR.CZ - Kompletní seznam výrobců a modelů
// Synchronizováno ze Sauto.cz API (2026-03-21)
// ============================================================

export interface ManufacturerWithModels {
  id: number;
  name: string;
  seo_name: string;
  kind_ids?: number[]; // 1=Osobní, 3=Motocykl, 4=Užitkové, 5=Nákladní, 6=Autobus, 7=Přívěs, 9=Obytné, 10=Pracovní stroj, 11=Čtyřkolka
  models: { id: number; name: string; seo_name: string }[];
}

const R2_LOGOS = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev';

export function getManufacturerLogoUrl(name: string): string {
  const safeName = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  return `${R2_LOGOS}/logos/${safeName}.png`;
}

// Sauto category_id → kind_id mapping for reference:
// 838=Osobní(1), 839=Užitková(4), 840=Nákladní(5), 841=Motorky(3),
// 842=Čtyřkolky(11), 843=Přívěsy(7), 844=Obytné(9), 845=Prac.stroje(10), 846=Autobusy(6)

export const MANUFACTURERS: ManufacturerWithModels[] = [
  { id: 1049, name: 'Abarth', seo_name: 'abarth', models: [
    { id: 6966, name: '500', seo_name: '500' }
  ]},
  { id: 364, name: 'Access', seo_name: 'access', kind_ids: [11], models: [
    { id: 5399, name: 'DRR 100', seo_name: 'drr-100' }, { id: 5407, name: 'Tomahawk 300', seo_name: 'tomahawk-300' }, 
  ]},
  { id: 331, name: 'Adria', seo_name: 'adria', kind_ids: [9], models: [
    { id: 1325, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1440, name: 'Affinity', seo_name: 'affinity', kind_ids: [9], models: [
    { id: 8927, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 411, name: 'Agados', seo_name: 'agados', kind_ids: [7], models: [
    { id: 5703, name: 'Adam', seo_name: 'adam' }, { id: 5699, name: 'Dona', seo_name: 'dona' }, 
    { id: 5719, name: 'Expres', seo_name: 'expres' }, { id: 5695, name: 'Kangaro', seo_name: 'kangaro' }, 
    { id: 1607, name: 'Ostatní', seo_name: 'ostatni' }, { id: 5697, name: 'VZ', seo_name: 'vz' }, 
  ]},
  { id: 1469, name: 'Agro', seo_name: 'agro', kind_ids: [7], models: [
    { id: 9061, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1238, name: 'Ahorn', seo_name: 'ahorn', kind_ids: [9], models: [
    { id: 8013, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1541, name: 'Alaspro', seo_name: 'alaspro', kind_ids: [7], models: [
    { id: 9498, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 955, name: 'Alpina', seo_name: 'alpina', models: [
    { id: 9545, name: 'B8', seo_name: 'b8' }, { id: 6352, name: 'D3', seo_name: 'd3' }
  ]},
  { id: 212, name: 'Aprilia', seo_name: 'aprilia', kind_ids: [3], models: [
    { id: 8786, name: 'MANA 850', seo_name: 'mana-850' }, { id: 6700, name: 'Motard', seo_name: 'motard' }, 
    { id: 1046, name: 'Ostatní', seo_name: 'ostatni' }, { id: 1746, name: 'Pegaso', seo_name: 'pegaso' }, 
    { id: 8890, name: 'RSV 4 Factory', seo_name: 'rsv-4-factory' }, { id: 1756, name: 'SR', seo_name: 'sr' }, 
    { id: 1758, name: 'Tuareg', seo_name: 'tuareg' }, { id: 1759, name: 'Tuono', seo_name: 'tuono' }, 
  ]},
  { id: 377, name: 'Arca', seo_name: 'arca', kind_ids: [9], models: [
    { id: 9466, name: 'America', seo_name: 'america' }, 
    { id: 9467, name: 'America Compact', seo_name: 'america-compact' }, 
  ]},
  { id: 138, name: 'Aston Martin', seo_name: 'aston-martin', models: [
    { id: 9386, name: 'DBX', seo_name: 'dbx' }
  ]},
  { id: 2, name: 'Audi', seo_name: 'audi', models: [
    { id: 13, name: 'A3', seo_name: 'a3' }, { id: 15, name: 'A4', seo_name: 'a4' }, 
    { id: 7469, name: 'A4 Avant', seo_name: 'a4-avant' }, { id: 1377, name: 'A5', seo_name: 'a5' }, 
    { id: 19, name: 'A6', seo_name: 'a6' }, { id: 5959, name: 'A6 allroad', seo_name: 'a6-allroad' }, 
    { id: 7470, name: 'A6 Avant', seo_name: 'a6-avant' }, { id: 21, name: 'A8', seo_name: 'a8' }, 
    { id: 6310, name: 'Q3', seo_name: 'q3' }, { id: 9017, name: 'Q4 e-tron', seo_name: 'q4-e-tron' }, 
    { id: 1620, name: 'Q5', seo_name: 'q5' }, { id: 1581, name: 'Q7', seo_name: 'q7' }, 
    { id: 8036, name: 'Q8', seo_name: 'q8' }, { id: 8600, name: 'RS Q8', seo_name: 'rs-q8' }, 
    { id: 5130, name: 'RS6', seo_name: 'rs6' }, { id: 6648, name: 'RS7', seo_name: 'rs7' }, 
    { id: 1378, name: 'S5', seo_name: 's5' }, { id: 1095, name: 'S6', seo_name: 's6' }, 
    { id: 6650, name: 'S7', seo_name: 's7' }, { id: 1644, name: 'S8', seo_name: 's8' }, 
    { id: 7733, name: 'SQ7', seo_name: 'sq7' }, { id: 8406, name: 'SQ8', seo_name: 'sq8' }, 
  ]},
  { id: 1163, name: 'Autostar', seo_name: 'autostar', kind_ids: [9], models: [
    { id: 7731, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 279, name: 'Autovia', seo_name: 'autovia', kind_ids: [7], models: [
    { id: 1220, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1531, name: 'Avento', seo_name: 'avento', kind_ids: [9], models: [
    { id: 9400, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 164, name: 'Avia', seo_name: 'avia', kind_ids: [5], models: [
    { id: 992, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1511, name: 'Basak', seo_name: 'basak', kind_ids: [10], models: [
    { id: 9325, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1562, name: 'Benda', seo_name: 'benda', kind_ids: [11], models: [
    { id: 9614, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 297, name: 'Benelli', seo_name: 'benelli', kind_ids: [3], models: [
    { id: 1314, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1051, name: 'Benimar', seo_name: 'benimar', kind_ids: [9], models: [
    { id: 6972, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 4, name: 'Bentley', seo_name: 'bentley', models: [
    { id: 7853, name: 'Bentayga', seo_name: 'bentayga' }, 
    { id: 6590, name: 'Continental GT', seo_name: 'continental-gt' }, 
  ]},
  { id: 915, name: 'Beta', seo_name: 'beta', kind_ids: [3], models: [
    { id: 6089, name: 'Alp 4.0', seo_name: 'alp-40' }, { id: 6067, name: 'EVO 125', seo_name: 'evo-125' }, 
    { id: 6121, name: 'Ostatní', seo_name: 'ostatni' }, { id: 6081, name: 'RR Enduro 50', seo_name: 'rr-enduro-50' }, 
  ]},
  { id: 988, name: 'BluCamp', seo_name: 'blucamp', kind_ids: [9], models: [
    { id: 6742, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 5, name: 'BMW', seo_name: 'bmw', models: [
    { id: 6835, name: 'i3', seo_name: 'i3' }, { id: 9279, name: 'iX2', seo_name: 'ix2' }, 
    { id: 7585, name: 'M2', seo_name: 'm2' }, { id: 1262, name: 'M5', seo_name: 'm5' }, 
    { id: 8805, name: 'M8', seo_name: 'm8' }, { id: 48, name: 'Řada 1', seo_name: 'rada-1' }, 
    { id: 39, name: 'Řada 3', seo_name: 'rada-3' }, { id: 40, name: 'Řada 5', seo_name: 'rada-5' }, 
    { id: 41, name: 'Řada 6', seo_name: 'rada-6' }, { id: 42, name: 'Řada 7', seo_name: 'rada-7' }, 
    { id: 43, name: 'Řada 8', seo_name: 'rada-8' }, { id: 7906, name: 'X2', seo_name: 'x2' }, 
    { id: 1445, name: 'X3', seo_name: 'x3' }, { id: 1444, name: 'X5', seo_name: 'x5' }, 
    { id: 1446, name: 'X6', seo_name: 'x6' }, { id: 8208, name: 'X7', seo_name: 'x7' }, 
    { id: 9236, name: 'XM', seo_name: 'xm' }, { id: 44, name: 'Z3', seo_name: 'z3' }, 
  ]},
  { id: 7, name: 'BMW', seo_name: 'bmw', kind_ids: [3], models: [
    { id: 1781, name: 'F 650', seo_name: 'f-650' }, { id: 1782, name: 'F 800', seo_name: 'f-800' }, 
    { id: 9440, name: 'F 900 XR', seo_name: 'f-900-xr' }, { id: 1786, name: 'K 1200', seo_name: 'k-1200' }, 
    { id: 54, name: 'Ostatní', seo_name: 'ostatni' }, { id: 1793, name: 'R 1150', seo_name: 'r-1150' }, 
    { id: 1794, name: 'R 1200', seo_name: 'r-1200' }, { id: 9006, name: 'R18', seo_name: 'r18' }, 
    { id: 9443, name: 'S 1000 XR', seo_name: 's-1000-xr' }, 
  ]},
  { id: 367, name: 'Bobcat', seo_name: 'bobcat', kind_ids: [10], models: [
    { id: 1380, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1141, name: 'Bodex', seo_name: 'bodex', kind_ids: [7], models: [
    { id: 7663, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 362, name: 'Bombardier', seo_name: 'bombardier', kind_ids: [11], models: [
    { id: 1368, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1275, name: 'Boro', seo_name: 'boro', kind_ids: [7], models: [
    { id: 8135, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1513, name: 'Brian James', seo_name: 'brian-james', kind_ids: [7], models: [
    { id: 9334, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1497, name: 'Brixton', seo_name: 'brixton', kind_ids: [3], models: [
    { id: 9221, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 306, name: 'Bürstner', seo_name: 'burstner', kind_ids: [9], models: [
    { id: 8612, name: 'Ixeo', seo_name: 'ixeo' }, { id: 1285, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 10, name: 'Cadillac', seo_name: 'cadillac', models: [
    { id: 1159, name: 'Escalade', seo_name: 'escalade' }
  ]},
  { id: 191, name: 'Cagiva', seo_name: 'cagiva', kind_ids: [3], models: [
    { id: 1805, name: 'Elefant', seo_name: 'elefant' }
  ]},
  { id: 853, name: 'Can-Am', seo_name: 'can-am', kind_ids: [11], models: [
    { id: 5170, name: 'Ostatní', seo_name: 'ostatni' }, { id: 5287, name: 'Outlander', seo_name: 'outlander' }, 
    { id: 5293, name: 'Renegade', seo_name: 'renegade' }, 
  ]},
  { id: 982, name: 'Carado', seo_name: 'carado', kind_ids: [9], models: [
    { id: 6736, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1560, name: 'Carox', seo_name: 'carox', kind_ids: [9], models: [
    { id: 9603, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 984, name: 'Carthago', seo_name: 'carthago', kind_ids: [9], models: [
    { id: 6738, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 350, name: 'Case', seo_name: 'case', kind_ids: [10], models: [
    { id: 1352, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 269, name: 'Caterpillar', seo_name: 'caterpillar', kind_ids: [10], models: [
    { id: 1209, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1105, name: 'CFMOTO', seo_name: 'cfmoto', kind_ids: [3], models: [
    { id: 7485, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1109, name: 'CFMOTO', seo_name: 'cfmoto', kind_ids: [11], models: [
    { id: 8049, name: 'GLADIATOR', seo_name: 'gladiator' }, { id: 7494, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 338, name: 'CI', seo_name: 'ci', kind_ids: [9], models: [
    { id: 1326, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 13, name: 'Citroën', seo_name: 'citroen', models: [
    { id: 1270, name: 'Berlingo', seo_name: 'berlingo' }, { id: 1323, name: 'C4 Picasso', seo_name: 'c4-picasso' }, 
  ]},
  { id: 14, name: 'Citroën', seo_name: 'citroen', kind_ids: [4], models: [
    { id: 97, name: 'Berlingo', seo_name: 'berlingo' }, { id: 99, name: 'Jumper', seo_name: 'jumper' }, 
    { id: 98, name: 'Jumpy', seo_name: 'jumpy' }, { id: 1427, name: 'Nemo', seo_name: 'nemo' }, 
  ]},
  { id: 437, name: 'Citroën', seo_name: 'citroen', kind_ids: [9], models: [
    { id: 9412, name: 'Jumper', seo_name: 'jumper' }
  ]},
  { id: 1406, name: 'Claas', seo_name: 'claas', kind_ids: [10], models: [
    { id: 8726, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1248, name: 'Clever Vans', seo_name: 'clever-vans', kind_ids: [9], models: [
    { id: 8051, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 986, name: 'Concorde', seo_name: 'concorde', kind_ids: [9], models: [
    { id: 6740, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 281, name: 'CPI', seo_name: 'cpi', kind_ids: [3], models: [
    { id: 1813, name: 'Hussar 50', seo_name: 'hussar-50' }
  ]},
  { id: 1354, name: 'Cupra', seo_name: 'cupra', models: [
    { id: 8414, name: 'Ateca', seo_name: 'ateca' }, { id: 9071, name: 'Born', seo_name: 'born' }, 
    { id: 8418, name: 'Formentor', seo_name: 'formentor' }, 
  ]},
  { id: 15, name: 'Dacia', seo_name: 'dacia', models: [
    { id: 5751, name: 'Duster', seo_name: 'duster' }, { id: 1604, name: 'Sandero', seo_name: 'sandero' }
  ]},
  { id: 892, name: 'Dacia', seo_name: 'dacia', kind_ids: [4], models: [
    { id: 6974, name: 'Dokker', seo_name: 'dokker' }
  ]},
  { id: 447, name: 'Daelim', seo_name: 'daelim', kind_ids: [3], models: [
    { id: 1832, name: 'Otello', seo_name: 'otello' }
  ]},
  { id: 166, name: 'DAF', seo_name: 'daf', kind_ids: [5], models: [
    { id: 6611, name: 'CF', seo_name: 'cf' }, { id: 6613, name: 'LF', seo_name: 'lf' }, 
    { id: 996, name: 'Ostatní', seo_name: 'ostatni' }, { id: 6610, name: 'XF', seo_name: 'xf' }, 
  ]},
  { id: 1468, name: 'Debon', seo_name: 'debon', kind_ids: [7], models: [
    { id: 9050, name: 'Cargo 1300', seo_name: 'cargo-1300' }, { id: 9048, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 194, name: 'Derbi', seo_name: 'derbi', kind_ids: [3], models: [
    { id: 1835, name: 'Atlantis', seo_name: 'atlantis' }
  ]},
  { id: 314, name: 'Desta', seo_name: 'desta', kind_ids: [10], models: [
    { id: 1293, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 332, name: 'Dethleffs', seo_name: 'dethleffs', kind_ids: [9], models: [
    { id: 9132, name: 'Crosscamp', seo_name: 'crosscamp' }, { id: 1327, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 134, name: 'Dodge', seo_name: 'dodge', models: [
    { id: 1709, name: 'Challenger', seo_name: 'challenger' }, { id: 1640, name: 'Ram', seo_name: 'ram' }, 
    { id: 5915, name: 'Ram 1500', seo_name: 'ram-1500' }, 
  ]},
  { id: 1509, name: 'Dreamer', seo_name: 'dreamer', kind_ids: [9], models: [
    { id: 9320, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 196, name: 'Ducati', seo_name: 'ducati', kind_ids: [3], models: [
    { id: 1854, name: '750', seo_name: '750' }, { id: 1856, name: '848', seo_name: '848' }, 
    { id: 9435, name: 'Diavel V4', seo_name: 'diavel-v4' }, { id: 1868, name: 'GT 1000', seo_name: 'gt-1000' }, 
    { id: 8384, name: 'Hypermotard 796', seo_name: 'hypermotard-796' }, 
    { id: 1869, name: 'Monster', seo_name: 'monster' }, { id: 1870, name: 'Multistrada', seo_name: 'multistrada' }, 
    { id: 9420, name: 'Multistrada V4', seo_name: 'multistrada-v4' }, 
    { id: 1030, name: 'Ostatní', seo_name: 'ostatni' }, { id: 9431, name: 'Panigale V2', seo_name: 'panigale-v2' }, 
    { id: 9432, name: 'Panigale V2S', seo_name: 'panigale-v2s' }, 
    { id: 9433, name: 'Panigale V4', seo_name: 'panigale-v4' }, 
    { id: 9434, name: 'Panigale V4S', seo_name: 'panigale-v4s' }, 
    { id: 9421, name: 'Scrambler', seo_name: 'scrambler' }, { id: 1871, name: 'Supersport', seo_name: 'supersport' }, 
  ]},
  { id: 333, name: 'Elnagh', seo_name: 'elnagh', kind_ids: [9], models: [
    { id: 9094, name: 'Baron', seo_name: 'baron' }, { id: 9097, name: 'E-Van', seo_name: 'e-van' }, 
    { id: 9096, name: 'Magnum', seo_name: 'magnum' }, { id: 1328, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 9095, name: 'T-Loft', seo_name: 't-loft' }, 
  ]},
  { id: 448, name: 'Enfield', seo_name: 'enfield', kind_ids: [3], models: [
    { id: 1872, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1456, name: 'Eriba', seo_name: 'eriba', kind_ids: [9], models: [
    { id: 8980, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1446, name: 'Etrusco', seo_name: 'etrusco', kind_ids: [9], models: [
    { id: 8941, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1076, name: 'Eura Mobil', seo_name: 'eura-mobil', kind_ids: [9], models: [
    { id: 9144, name: 'Integra 890 QB', seo_name: 'integra-890-qb' }, 
    { id: 7241, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 879, name: 'Eurotrailers', seo_name: 'eurotrailers', kind_ids: [7], models: [
    { id: 5411, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 449, name: 'Fantic', seo_name: 'fantic', kind_ids: [3], models: [
    { id: 9657, name: 'Caballero', seo_name: 'caballero' }, { id: 1875, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 403, name: 'Fendt', seo_name: 'fendt', kind_ids: [9], models: [
    { id: 9161, name: 'Apero', seo_name: 'apero' }, { id: 9163, name: 'Bianco Activ', seo_name: 'bianco-activ' }, 
    { id: 9162, name: 'Bianco Selection', seo_name: 'bianco-selection' }, 
    { id: 1592, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 21, name: 'Ferrari', seo_name: 'ferrari', models: [
    { id: 8487, name: 'GTC4 Lusso', seo_name: 'gtc4-lusso' }
  ]},
  { id: 22, name: 'Fiat', seo_name: 'fiat', models: [
    { id: 1406, name: '500', seo_name: '500' }, { id: 8172, name: 'Ducato', seo_name: 'ducato' }, 
    { id: 153, name: 'Panda', seo_name: 'panda' }, { id: 5265, name: 'Qubo', seo_name: 'qubo' }, 
  ]},
  { id: 23, name: 'Fiat', seo_name: 'fiat', kind_ids: [4], models: [
    { id: 7677, name: 'Dobló', seo_name: 'doblo' }, { id: 172, name: 'Dobló cargo', seo_name: 'doblo-cargo' }, 
    { id: 175, name: 'Ducato', seo_name: 'ducato' }, { id: 177, name: 'Fiorino', seo_name: 'fiorino' }, 
    { id: 176, name: 'Scudo', seo_name: 'scudo' }, { id: 173, name: 'Talento', seo_name: 'talento' }, 
  ]},
  { id: 433, name: 'Fiat', seo_name: 'fiat', kind_ids: [9], models: [
    { id: 7574, name: 'Ducato', seo_name: 'ducato' }, { id: 1699, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 326, name: 'Fliegl', seo_name: 'fliegl', kind_ids: [7], models: [
    { id: 1308, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 24, name: 'Ford', seo_name: 'ford', models: [
    { id: 1619, name: 'Edge', seo_name: 'edge' }, { id: 186, name: 'Fiesta', seo_name: 'fiesta' }, 
    { id: 197, name: 'Focus', seo_name: 'focus' }, { id: 6564, name: 'Grand C-MAX', seo_name: 'grand-c-max' }, 
    { id: 1591, name: 'Kuga', seo_name: 'kuga' }, { id: 190, name: 'Mondeo', seo_name: 'mondeo' }, 
    { id: 194, name: 'Mustang', seo_name: 'mustang' }, 
    { id: 8983, name: 'Mustang Mach-E', seo_name: 'mustang-mach-e' }, { id: 195, name: 'Puma', seo_name: 'puma' }, 
    { id: 1282, name: 'S-MAX', seo_name: 's-max' }, { id: 6656, name: 'Tourneo Custom', seo_name: 'tourneo-custom' }, 
  ]},
  { id: 26, name: 'Ford', seo_name: 'ford', kind_ids: [4], models: [
    { id: 9292, name: 'E-Transit', seo_name: 'e-transit' }, { id: 212, name: 'Ranger', seo_name: 'ranger' }, 
    { id: 221, name: 'Transit', seo_name: 'transit' }, 
    { id: 1631, name: 'Transit Connect', seo_name: 'transit-connect' }, 
    { id: 7671, name: 'Transit Courier', seo_name: 'transit-courier' }, 
    { id: 6652, name: 'Transit Custom', seo_name: 'transit-custom' }, 
  ]},
  { id: 27, name: 'Ford', seo_name: 'ford', kind_ids: [5], models: [
    { id: 225, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 435, name: 'Ford', seo_name: 'ford', kind_ids: [9], models: [
    { id: 1705, name: 'Ostatní', seo_name: 'ostatni' }, { id: 7656, name: 'Transit', seo_name: 'transit' }, 
  ]},
  { id: 1014, name: 'Ford', seo_name: 'ford', kind_ids: [6], models: [
    { id: 6816, name: 'Transit', seo_name: 'transit' }
  ]},
  { id: 1449, name: 'Forster', seo_name: 'forster', kind_ids: [9], models: [
    { id: 8998, name: '699 DVB', seo_name: '699-dvb' }, { id: 8997, name: '699 EB', seo_name: '699-eb' }, 
    { id: 8960, name: '699 HB', seo_name: '699-hb' }, { id: 8999, name: '741 EB', seo_name: '741-eb' }, 
    { id: 9002, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 251, name: 'Frankia', seo_name: 'frankia', kind_ids: [9], models: [
    { id: 1085, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1063, name: 'Fuchs', seo_name: 'fuchs', kind_ids: [10], models: [
    { id: 7182, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1305, name: 'Fuso', seo_name: 'fuso', kind_ids: [5], models: [
    { id: 8220, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 303, name: 'Gas Gas', seo_name: 'gas-gas', kind_ids: [3], models: [
    { id: 1881, name: 'EC', seo_name: 'ec' }, { id: 1883, name: 'MC', seo_name: 'mc' }
  ]},
  { id: 425, name: 'GAZ', seo_name: 'gaz', kind_ids: [4], models: [
    { id: 1639, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 282, name: 'Gilera', seo_name: 'gilera', kind_ids: [3], models: [
    { id: 1897, name: 'Runner', seo_name: 'runner' }
  ]},
  { id: 343, name: 'Giottiline', seo_name: 'giottiline', kind_ids: [9], models: [
    { id: 1343, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 894, name: 'Goes', seo_name: 'goes', kind_ids: [11], models: [
    { id: 5869, name: 'Ostatní', seo_name: 'ostatni' }, { id: 9345, name: 'Terrox 400', seo_name: 'terrox-400' }, 
    { id: 9347, name: 'Terrox 500', seo_name: 'terrox-500' }, 
    { id: 9348, name: 'Terrox 500-A', seo_name: 'terrox-500-a' }, 
  ]},
  { id: 1467, name: 'Gromex', seo_name: 'gromex', kind_ids: [7], models: [
    { id: 9047, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 197, name: 'Harley-Davidson', seo_name: 'harley-davidson', kind_ids: [3], models: [
    { id: 1906, name: '1200 Sportster', seo_name: '1200-sportster' }, 
    { id: 1905, name: '883 Sportster', seo_name: '883-sportster' }, 
    { id: 1910, name: 'Dyna Low Rider', seo_name: 'dyna-low-rider' }, 
    { id: 1909, name: 'Dyna Street Bob', seo_name: 'dyna-street-bob' }, 
    { id: 1907, name: 'Dyna Super Glide', seo_name: 'dyna-super-glide' }, 
    { id: 1912, name: 'Dyna Wide Glide', seo_name: 'dyna-wide-glide' }, 
    { id: 1927, name: 'Electra Glide Classic', seo_name: 'electra-glide-classic' }, 
    { id: 7376, name: 'Electra Glide Ultra Classic', seo_name: 'electra-glide-ultra-classic' }, 
    { id: 7370, name: 'FXSE Pro Street Breakout', seo_name: 'fxse-pro-street-breakout' }, 
    { id: 5104, name: 'Heritage Softail', seo_name: 'heritage-softail' }, 
    { id: 1921, name: 'Night Rod', seo_name: 'night-rod' }, { id: 1031, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 1925, name: 'Road Glide', seo_name: 'road-glide' }, { id: 1922, name: 'Road King', seo_name: 'road-king' }, 
    { id: 7322, name: 'Street 750', seo_name: 'street-750' }, 
    { id: 1924, name: 'Street Glide', seo_name: 'street-glide' }, 
    { id: 7374, name: 'Street Glide Special', seo_name: 'street-glide-special' }, 
    { id: 7378, name: 'Ultra Limited', seo_name: 'ultra-limited' }, { id: 1920, name: 'V-Rod', seo_name: 'v-rod' }, 
    { id: 6382, name: 'XL 1200', seo_name: 'xl-1200' }, 
  ]},
  { id: 1324, name: 'Hecht', seo_name: 'hecht', kind_ids: [3], models: [
    { id: 8286, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 252, name: 'Hobby', seo_name: 'hobby', kind_ids: [9], models: [
    { id: 9393, name: 'De Luxe 545', seo_name: 'de-luxe-545' }, { id: 1086, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 1529, name: 'Hobby', seo_name: 'hobby', kind_ids: [7], models: [
    { id: 9392, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 863, name: 'Home-Car', seo_name: 'home-car', kind_ids: [9], models: [
    { id: 5212, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 28, name: 'Honda', seo_name: 'honda', models: [
    { id: 226, name: 'Civic', seo_name: 'civic' }, { id: 1458, name: 'CR-V', seo_name: 'cr-v' }, 
    { id: 1459, name: 'HR-V', seo_name: 'hr-v' }, { id: 234, name: 'Jazz', seo_name: 'jazz' }, 
  ]},
  { id: 30, name: 'Honda', seo_name: 'honda', kind_ids: [3], models: [
    { id: 7968, name: 'ADV 750', seo_name: 'adv-750' }, { id: 5106, name: 'CB', seo_name: 'cb' }, 
    { id: 1940, name: 'CBF', seo_name: 'cbf' }, { id: 1939, name: 'CBR', seo_name: 'cbr' }, 
    { id: 1941, name: 'CRF', seo_name: 'crf' }, { id: 1948, name: 'Forza', seo_name: 'forza' }, 
    { id: 1949, name: 'Gold Wing', seo_name: 'gold-wing' }, { id: 1953, name: 'Hornet', seo_name: 'hornet' }, 
    { id: 7503, name: 'NC 700 X', seo_name: 'nc-700-x' }, { id: 246, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 1957, name: 'Pantheon', seo_name: 'pantheon' }, { id: 7467, name: 'PCX', seo_name: 'pcx' }, 
    { id: 1959, name: 'Rebel', seo_name: 'rebel' }, { id: 1963, name: 'SH', seo_name: 'sh' }, 
    { id: 1962, name: 'Shadow', seo_name: 'shadow' }, 
    { id: 1970, name: 'Transalp Travel', seo_name: 'transalp-travel' }, 
    { id: 1971, name: 'Valkyrie', seo_name: 'valkyrie' }, { id: 1972, name: 'Varadero', seo_name: 'varadero' }, 
    { id: 1975, name: 'VFR', seo_name: 'vfr' }, { id: 1976, name: 'VT', seo_name: 'vt' }, 
    { id: 1977, name: 'VTX', seo_name: 'vtx' }, { id: 1979, name: 'XL', seo_name: 'xl' }, 
  ]},
  { id: 305, name: 'Humbaur', seo_name: 'humbaur', kind_ids: [7], models: [
    { id: 8543, name: 'HA', seo_name: 'ha' }, { id: 8553, name: 'HK', seo_name: 'hk' }, 
    { id: 8559, name: 'HM', seo_name: 'hm' }, { id: 8545, name: 'HN', seo_name: 'hn' }, 
    { id: 8547, name: 'HT', seo_name: 'ht' }, { id: 8555, name: 'HUK', seo_name: 'huk' }, 
    { id: 8569, name: 'MAXIMUS', seo_name: 'maximus' }, { id: 1284, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 8567, name: 'REXUS', seo_name: 'rexus' }, { id: 8541, name: 'STARTRAILER', seo_name: 'startrailer' }, 
    { id: 8539, name: 'STEELY', seo_name: 'steely' }, { id: 8561, name: 'UNIVERSAL', seo_name: 'universal' }, 
  ]},
  { id: 198, name: 'Husqvarna', seo_name: 'husqvarna', kind_ids: [3], models: [
    { id: 1032, name: 'Ostatní', seo_name: 'ostatni' }, { id: 2008, name: 'TE', seo_name: 'te' }
  ]},
  { id: 253, name: 'Hymer', seo_name: 'hymer', kind_ids: [9], models: [
    { id: 8602, name: 'Grand Canyon', seo_name: 'grand-canyon' }, { id: 1087, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 31, name: 'Hyundai', seo_name: 'hyundai', models: [
    { id: 8967, name: 'Bayon', seo_name: 'bayon' }, { id: 1595, name: 'i10', seo_name: 'i10' }, 
    { id: 1633, name: 'i20', seo_name: 'i20' }, { id: 1376, name: 'i30', seo_name: 'i30' }, 
    { id: 7881, name: 'Kona', seo_name: 'kona' }, { id: 1463, name: 'Santa Fe', seo_name: 'santa-fe' }, 
    { id: 1465, name: 'Tucson', seo_name: 'tucson' }, 
  ]},
  { id: 33, name: 'Hyundai', seo_name: 'hyundai', kind_ids: [4], models: [
    { id: 7272, name: 'H 350', seo_name: 'h-350' }
  ]},
  { id: 1264, name: 'Challenger', seo_name: 'challenger', kind_ids: [9], models: [
    { id: 8101, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 432, name: 'Chateau', seo_name: 'chateau', kind_ids: [9], models: [
    { id: 1698, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 420, name: 'Chausson', seo_name: 'chausson', kind_ids: [9], models: [
    { id: 1623, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1298, name: 'Cheval Liberté', seo_name: 'cheval-liberte', kind_ids: [7], models: [
    { id: 8194, name: 'Debon Roadster', seo_name: 'debon-roadster' }
  ]},
  { id: 34, name: 'Chevrolet', seo_name: 'chevrolet', models: [
    { id: 274, name: 'Camaro', seo_name: 'camaro' }
  ]},
  { id: 1318, name: 'Indian', seo_name: 'indian', kind_ids: [3], models: [
    { id: 8249, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1496, name: 'Indian', seo_name: 'indian', kind_ids: [3], models: [
    { id: 9220, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1401, name: 'Irisbus', seo_name: 'irisbus', kind_ids: [6], models: [
    { id: 8659, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1258, name: 'Iseki', seo_name: 'iseki', kind_ids: [10], models: [
    { id: 8087, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 494, name: 'Isuzu', seo_name: 'isuzu', kind_ids: [6], models: [
    { id: 2714, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1140, name: 'Isuzu', seo_name: 'isuzu', kind_ids: [5], models: [
    { id: 7651, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 218, name: 'Italjet', seo_name: 'italjet', kind_ids: [3], models: [
    { id: 1052, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1067, name: 'Itineo', seo_name: 'itineo', kind_ids: [9], models: [
    { id: 7191, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 168, name: 'Iveco', seo_name: 'iveco', kind_ids: [4], models: [
    { id: 998, name: 'Daily', seo_name: 'daily' }
  ]},
  { id: 169, name: 'Iveco', seo_name: 'iveco', kind_ids: [5], models: [
    { id: 9555, name: 'Daily', seo_name: 'daily' }, { id: 5687, name: 'Eurocargo', seo_name: 'eurocargo' }, 
    { id: 1003, name: 'Ostatní', seo_name: 'ostatni' }, { id: 9447, name: 'S-WAY', seo_name: 's-way' }, 
    { id: 5138, name: 'Stralis', seo_name: 'stralis' }, { id: 5689, name: 'Trakker', seo_name: 'trakker' }, 
    { id: 9448, name: 'X-WAY', seo_name: 'x-way' }, 
  ]},
  { id: 170, name: 'Iveco', seo_name: 'iveco', kind_ids: [6], models: [
    { id: 9650, name: 'Daily', seo_name: 'daily' }, { id: 1004, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1075, name: 'Iveco', seo_name: 'iveco', kind_ids: [9], models: [
    { id: 7240, name: 'Daily', seo_name: 'daily' }, { id: 7239, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 38, name: 'Jaguar', seo_name: 'jaguar', models: [
    { id: 7417, name: 'F-Pace', seo_name: 'f-pace' }, { id: 6732, name: 'F-Type', seo_name: 'f-type' }, 
    { id: 1173, name: 'XKR', seo_name: 'xkr' }, 
  ]},
  { id: 199, name: 'Jawa', seo_name: 'jawa', kind_ids: [3], models: [
    { id: 1033, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 392, name: 'Jeep', seo_name: 'jeep', models: [
    { id: 8443, name: 'Gladiator', seo_name: 'gladiator' }, 
    { id: 1532, name: 'Grand Cherokee', seo_name: 'grand-cherokee' }, 
    { id: 9074, name: 'Grand Wagoneer', seo_name: 'grand-wagoneer' }, 
  ]},
  { id: 1522, name: 'JJM', seo_name: 'jjm', kind_ids: [11], models: [
    { id: 9366, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1041, name: 'JMSTAR', seo_name: 'jmstar', kind_ids: [3], models: [
    { id: 6911, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 296, name: 'John Deere', seo_name: 'john-deere', kind_ids: [10], models: [
    { id: 1315, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1442, name: 'Kabe', seo_name: 'kabe', kind_ids: [9], models: [
    { id: 9153, name: 'Royal', seo_name: 'royal' }
  ]},
  { id: 917, name: 'Karmann', seo_name: 'karmann', kind_ids: [9], models: [
    { id: 6127, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 241, name: 'Karosa', seo_name: 'karosa', kind_ids: [6], models: [
    { id: 1075, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 408, name: 'Kässbohrer', seo_name: 'kassbohrer', kind_ids: [7], models: [
    { id: 1601, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 200, name: 'Kawasaki', seo_name: 'kawasaki', kind_ids: [3], models: [
    { id: 2076, name: 'ER', seo_name: 'er' }, { id: 2084, name: 'Ninja', seo_name: 'ninja' }, 
    { id: 1034, name: 'Ostatní', seo_name: 'ostatni' }, { id: 2086, name: 'Versys', seo_name: 'versys' }, 
    { id: 2089, name: 'VN 900', seo_name: 'vn-900' }, { id: 2102, name: 'Z 1000', seo_name: 'z-1000' }, 
    { id: 2101, name: 'Z 750', seo_name: 'z-750' }, { id: 2106, name: 'ZR', seo_name: 'zr' }, 
    { id: 6438, name: 'ZZR', seo_name: 'zzr' }, 
  ]},
  { id: 227, name: 'Keeway', seo_name: 'keeway', kind_ids: [3], models: [
    { id: 6952, name: 'Logik', seo_name: 'logik' }, { id: 1061, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 221, name: 'Kentoya', seo_name: 'kentoya', kind_ids: [3], models: [
    { id: 1682, name: 'Extra', seo_name: 'extra' }, { id: 1055, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 39, name: 'Kia', seo_name: 'kia', models: [
    { id: 1334, name: 'Cee´d', seo_name: 'cee-d' }, { id: 1479, name: 'Sportage', seo_name: 'sportage' }, 
    { id: 8368, name: 'XCee´d', seo_name: 'xcee-d' }, 
  ]},
  { id: 861, name: 'Kip', seo_name: 'kip', kind_ids: [9], models: [
    { id: 5210, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 264, name: 'Knaus', seo_name: 'knaus', kind_ids: [9], models: [
    { id: 9405, name: 'BoxLife', seo_name: 'boxlife' }, { id: 9224, name: 'BoxStar', seo_name: 'boxstar' }, 
    { id: 9180, name: 'Live I', seo_name: 'live-i' }, { id: 9175, name: 'Live Wave', seo_name: 'live-wave' }, 
    { id: 1201, name: 'Ostatní', seo_name: 'ostatni' }, { id: 9166, name: 'Sport', seo_name: 'sport' }, 
    { id: 9167, name: 'Südwind', seo_name: 'sudwind' }, { id: 9172, name: 'Tourer Van', seo_name: 'tourer-van' }, 
    { id: 9177, name: 'Van I', seo_name: 'van-i' }, { id: 9171, name: 'Van TI', seo_name: 'van-ti' }, 
    { id: 9173, name: 'Van TI Plus', seo_name: 'van-ti-plus' }, 
  ]},
  { id: 289, name: 'Kobelco', seo_name: 'kobelco', kind_ids: [10], models: [
    { id: 1263, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 950, name: 'Kobras', seo_name: 'kobras', kind_ids: [7], models: [
    { id: 6314, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 259, name: 'Kögel', seo_name: 'kogel', kind_ids: [7], models: [
    { id: 1104, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 273, name: 'Kramer', seo_name: 'kramer', kind_ids: [10], models: [
    { id: 1213, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 262, name: 'Krone', seo_name: 'krone', kind_ids: [7], models: [
    { id: 1105, name: 'Ostatní', seo_name: 'ostatni' }, { id: 8838, name: 'SD', seo_name: 'sd' }
  ]},
  { id: 201, name: 'KTM', seo_name: 'ktm', kind_ids: [3], models: [
    { id: 6454, name: '125 Duke', seo_name: '125-duke' }, { id: 2139, name: '50 SX', seo_name: '50-sx' }, 
    { id: 2160, name: '990 Adventure', seo_name: '990-adventure' }, { id: 2141, name: 'EXC', seo_name: 'exc' }, 
    { id: 1035, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 280, name: 'Kymco', seo_name: 'kymco', kind_ids: [3], models: [
    { id: 2163, name: 'Agility', seo_name: 'agility' }, { id: 7316, name: 'Downtown', seo_name: 'downtown' }, 
    { id: 1256, name: 'Ostatní', seo_name: 'ostatni' }, { id: 2171, name: 'People', seo_name: 'people' }, 
  ]},
  { id: 359, name: 'Kymco', seo_name: 'kymco', kind_ids: [11], models: [
    { id: 1364, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 330, name: 'Laika', seo_name: 'laika', kind_ids: [9], models: [
    { id: 9212, name: 'Ecovip', seo_name: 'ecovip' }, { id: 9211, name: 'Kosmo', seo_name: 'kosmo' }
  ]},
  { id: 1034, name: 'Lamberet', seo_name: 'lamberet', kind_ids: [7], models: [
    { id: 6892, name: 'LVF', seo_name: 'lvf' }
  ]},
  { id: 141, name: 'Lamborghini', seo_name: 'lamborghini', models: [
    { id: 7813, name: 'Urus', seo_name: 'urus' }
  ]},
  { id: 391, name: 'Land Rover', seo_name: 'land-rover', models: [
    { id: 1513, name: 'Defender', seo_name: 'defender' }, { id: 1514, name: 'Discovery', seo_name: 'discovery' }, 
    { id: 6874, name: 'Discovery Sport', seo_name: 'discovery-sport' }, 
    { id: 1515, name: 'Range Rover', seo_name: 'range-rover' }, 
    { id: 5963, name: 'Range Rover Evoque', seo_name: 'range-rover-evoque' }, 
    { id: 5961, name: 'Range Rover Sport', seo_name: 'range-rover-sport' }, 
  ]},
  { id: 1293, name: 'Land Rover', seo_name: 'land-rover', kind_ids: [9], models: [
    { id: 8165, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1330, name: 'Langendorf', seo_name: 'langendorf', kind_ids: [7], models: [
    { id: 8306, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 263, name: 'Legras', seo_name: 'legras', kind_ids: [7], models: [
    { id: 1106, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 334, name: 'LeVoyageur', seo_name: 'levoyageur', kind_ids: [9], models: [
    { id: 1329, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 45, name: 'Lexus', seo_name: 'lexus', models: [
    { id: 8388, name: 'ES 300h', seo_name: 'es-300h' }, { id: 7994, name: 'LC 500', seo_name: 'lc-500' }
  ]},
  { id: 171, name: 'Liaz', seo_name: 'liaz', kind_ids: [5], models: [
    { id: 1005, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 274, name: 'Liebherr', seo_name: 'liebherr', kind_ids: [10], models: [
    { id: 1214, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 310, name: 'Linde', seo_name: 'linde', kind_ids: [10], models: [
    { id: 1296, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 225, name: 'Linhai', seo_name: 'linhai', kind_ids: [3], models: [
    { id: 1059, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 357, name: 'Linhai', seo_name: 'linhai', kind_ids: [11], models: [
    { id: 5324, name: 'ATV 300', seo_name: 'atv-300' }, { id: 5326, name: 'ATV 520', seo_name: 'atv-520' }, 
    { id: 1363, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 255, name: 'LMC', seo_name: 'lmc', kind_ids: [9], models: [
    { id: 1089, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1134, name: 'Longjia', seo_name: 'longjia', kind_ids: [3], models: [
    { id: 7627, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 142, name: 'Lotus', seo_name: 'lotus', models: [
    { id: 9469, name: 'Emeya', seo_name: 'emeya' }, { id: 9409, name: 'Emira', seo_name: 'emira' }, 
    { id: 941, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 202, name: 'Malaguti', seo_name: 'malaguti', kind_ids: [3], models: [
    { id: 2197, name: 'Madison', seo_name: 'madison' }, { id: 1036, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 2201, name: 'Spidermax', seo_name: 'spidermax' }, 
  ]},
  { id: 990, name: 'Malibu', seo_name: 'malibu', kind_ids: [9], models: [
    { id: 6744, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 172, name: 'MAN', seo_name: 'man', kind_ids: [5], models: [
    { id: 6642, name: 'L2000', seo_name: 'l2000' }, { id: 1006, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 6644, name: 'TGA', seo_name: 'tga' }, { id: 6634, name: 'TGL', seo_name: 'tgl' }, 
    { id: 6636, name: 'TGM', seo_name: 'tgm' }, { id: 6638, name: 'TGS', seo_name: 'tgs' }, 
    { id: 6640, name: 'TGX', seo_name: 'tgx' }, 
  ]},
  { id: 173, name: 'MAN', seo_name: 'man', kind_ids: [6], models: [
    { id: 1007, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1245, name: 'MAN', seo_name: 'man', kind_ids: [4], models: [
    { id: 8030, name: 'TGE', seo_name: 'tge' }
  ]},
  { id: 370, name: 'Maro', seo_name: 'maro', kind_ids: [7], models: [
    { id: 1384, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1205, name: 'Massey Ferguson', seo_name: 'massey-ferguson', kind_ids: [10], models: [
    { id: 7842, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1554, name: 'Masuria', seo_name: 'masuria', kind_ids: [9], models: [
    { id: 9556, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 906, name: 'Maxon', seo_name: 'maxon', kind_ids: [3], models: [
    { id: 6054, name: 'Ardour', seo_name: 'ardour' }, { id: 6059, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 48, name: 'Mazda', seo_name: 'mazda', models: [
    { id: 6156, name: 'CX-5', seo_name: 'cx-5' }
  ]},
  { id: 1525, name: 'MBP', seo_name: 'mbp', kind_ids: [3], models: [
    { id: 9374, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1055, name: 'McLaren', seo_name: 'mclaren', models: [
    { id: 8517, name: '720S', seo_name: '720s' }
  ]},
  { id: 927, name: 'McLouis', seo_name: 'mclouis', kind_ids: [9], models: [
    { id: 6167, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1254, name: 'Megamobil', seo_name: 'megamobil', kind_ids: [9], models: [
    { id: 8081, name: '640 Megarevolution', seo_name: '640-megarevolution' }, 
    { id: 8079, name: '640 Megasport', seo_name: '640-megasport' }, { id: 8075, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 999, name: 'Meiller', seo_name: 'meiller', kind_ids: [7], models: [
    { id: 6767, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 51, name: 'Mercedes-Benz', seo_name: 'mercedes-benz', models: [
    { id: 7454, name: 'AMG GT', seo_name: 'amg-gt' }, { id: 6617, name: 'CLA', seo_name: 'cla' }, 
    { id: 9318, name: 'CLE', seo_name: 'cle' }, { id: 1181, name: 'CLS', seo_name: 'cls' }, 
    { id: 8447, name: 'EQC', seo_name: 'eqc' }, { id: 9104, name: 'EQE', seo_name: 'eqe' }, 
    { id: 9070, name: 'EQS', seo_name: 'eqs' }, { id: 6619, name: 'GLA', seo_name: 'gla' }, 
    { id: 8449, name: 'GLB', seo_name: 'glb' }, { id: 7249, name: 'GLC', seo_name: 'glc' }, 
    { id: 7446, name: 'GLE', seo_name: 'gle' }, { id: 1629, name: 'GLK', seo_name: 'glk' }, 
    { id: 7450, name: 'GLS', seo_name: 'gls' }, { id: 435, name: 'SL', seo_name: 'sl' }, 
    { id: 422, name: 'Třídy A', seo_name: 'tridy-a' }, { id: 430, name: 'Třídy C', seo_name: 'tridy-c' }, 
    { id: 431, name: 'Třídy E', seo_name: 'tridy-e' }, { id: 1488, name: 'Třídy G', seo_name: 'tridy-g' }, 
    { id: 433, name: 'Třídy S', seo_name: 'tridy-s' }, { id: 436, name: 'Třídy V', seo_name: 'tridy-v' }, 
  ]},
  { id: 53, name: 'Mercedes-Benz', seo_name: 'mercedes-benz', kind_ids: [4], models: [
    { id: 6588, name: 'Citan', seo_name: 'citan' }, { id: 443, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 441, name: 'Sprinter', seo_name: 'sprinter' }, { id: 442, name: 'Vito', seo_name: 'vito' }, 
  ]},
  { id: 54, name: 'Mercedes-Benz', seo_name: 'mercedes-benz', kind_ids: [5], models: [
    { id: 5998, name: 'Actros', seo_name: 'actros' }, { id: 6002, name: 'Atego', seo_name: 'atego' }, 
    { id: 6000, name: 'Axor', seo_name: 'axor' }, { id: 444, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 55, name: 'Mercedes-Benz', seo_name: 'mercedes-benz', kind_ids: [6], models: [
    { id: 445, name: 'Ostatní', seo_name: 'ostatni' }, { id: 9651, name: 'Sprinter', seo_name: 'sprinter' }, 
  ]},
  { id: 438, name: 'Mercedes-Benz', seo_name: 'mercedes-benz', kind_ids: [9], models: [
    { id: 1708, name: 'Ostatní', seo_name: 'ostatni' }, { id: 8175, name: 'Sprinter', seo_name: 'sprinter' }, 
    { id: 8630, name: 'Vito', seo_name: 'vito' }, 
  ]},
  { id: 146, name: 'MG', seo_name: 'mg', models: [
    { id: 1388, name: 'ZS', seo_name: 'zs' }
  ]},
  { id: 368, name: 'Miller', seo_name: 'miller', kind_ids: [9], models: [
    { id: 1381, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 147, name: 'Mini', seo_name: 'mini', models: [
    { id: 6870, name: 'Cooper S', seo_name: 'cooper-s' }, { id: 5832, name: 'Countryman', seo_name: 'countryman' }, 
  ]},
  { id: 56, name: 'Mitsubishi', seo_name: 'mitsubishi', models: [
    { id: 1493, name: 'Outlander', seo_name: 'outlander' }
  ]},
  { id: 58, name: 'Mitsubishi', seo_name: 'mitsubishi', kind_ids: [4], models: [
    { id: 457, name: 'L 200', seo_name: 'l-200' }
  ]},
  { id: 59, name: 'Mitsubishi', seo_name: 'mitsubishi', kind_ids: [5], models: [
    { id: 462, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 341, name: 'Mobilvetta', seo_name: 'mobilvetta', kind_ids: [9], models: [
    { id: 1341, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1532, name: 'Morbidelli', seo_name: 'morbidelli', kind_ids: [3], models: [
    { id: 9402, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 148, name: 'Morgan', seo_name: 'morgan', models: [
    { id: 954, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 204, name: 'Moto Guzzi', seo_name: 'moto-guzzi', kind_ids: [3], models: [
    { id: 2233, name: 'Nevada', seo_name: 'nevada' }, { id: 2234, name: 'Norge', seo_name: 'norge' }, 
    { id: 8846, name: 'Stelvio', seo_name: 'stelvio' }, { id: 8880, name: 'V 1000 G 5', seo_name: 'v-1000-g-5' }, 
    { id: 8878, name: 'V 85 TT', seo_name: 'v-85-tt' }, { id: 7727, name: 'V7', seo_name: 'v7' }, 
    { id: 8862, name: 'V7 III Stone', seo_name: 'v7-iii-stone' }, 
  ]},
  { id: 466, name: 'Moto Morini', seo_name: 'moto-morini', kind_ids: [3], models: [
    { id: 2238, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 904, name: 'Motorro', seo_name: 'motorro', kind_ids: [3], models: [
    { id: 6021, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1519, name: 'Motron', seo_name: 'motron', kind_ids: [3], models: [
    { id: 9362, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 216, name: 'MV Agusta', seo_name: 'mv-agusta', kind_ids: [3], models: [
    { id: 1050, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 953, name: 'Niesmann-Bischoff', seo_name: 'niesmann-bischoff', kind_ids: [9], models: [
    { id: 6341, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1394, name: 'Niewiadów', seo_name: 'niewiadow', kind_ids: [9], models: [
    { id: 8640, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 62, name: 'Nissan', seo_name: 'nissan', models: [
    { id: 9131, name: 'Ariya', seo_name: 'ariya' }
  ]},
  { id: 64, name: 'Nissan', seo_name: 'nissan', kind_ids: [4], models: [
    { id: 8811, name: 'e-NV200', seo_name: 'e-nv200' }, { id: 1597, name: 'Interstar', seo_name: 'interstar' }, 
    { id: 7441, name: 'Navara', seo_name: 'navara' }, { id: 7227, name: 'NV400', seo_name: 'nv400' }, 
  ]},
  { id: 1504, name: 'nobelART', seo_name: 'nobelart', kind_ids: [9], models: [
    { id: 9265, name: 'A-7000', seo_name: 'a-7000' }, { id: 9266, name: 'A-9000', seo_name: 'a-9000' }
  ]},
  { id: 1550, name: 'North Cape', seo_name: 'north-cape', kind_ids: [9], models: [
    { id: 9534, name: 'Adventure 6XT', seo_name: 'adventure-6xt' }
  ]},
  { id: 1434, name: 'Notin', seo_name: 'notin', kind_ids: [9], models: [
    { id: 8836, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 67, name: 'Opel', seo_name: 'opel', models: [
    { id: 6384, name: 'Combo', seo_name: 'combo' }, { id: 532, name: 'Meriva', seo_name: 'meriva' }
  ]},
  { id: 69, name: 'Opel', seo_name: 'opel', kind_ids: [4], models: [
    { id: 538, name: 'Combo', seo_name: 'combo' }, { id: 539, name: 'Movano', seo_name: 'movano' }, 
    { id: 540, name: 'Vivaro', seo_name: 'vivaro' }, 
  ]},
  { id: 1502, name: 'Opel', seo_name: 'opel', kind_ids: [9], models: [
    { id: 9260, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 162, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [4], models: [
    { id: 986, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 184, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [5], models: [
    { id: 1018, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 188, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [7], models: [
    { id: 1022, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 230, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [3], models: [
    { id: 1064, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 250, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [6], models: [
    { id: 1084, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 256, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [9], models: [
    { id: 1090, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 277, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [10], models: [
    { id: 1217, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 351, name: 'Ostatní', seo_name: 'ostatni', kind_ids: [11], models: [
    { id: 1353, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 187, name: 'Panav', seo_name: 'panav', kind_ids: [7], models: [
    { id: 1021, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 70, name: 'Peugeot', seo_name: 'peugeot', models: [
    { id: 6792, name: '108', seo_name: '108' }, { id: 6576, name: '2008', seo_name: '2008' }, 
    { id: 6388, name: '208', seo_name: '208' }, { id: 1670, name: '3008', seo_name: '3008' }, 
    { id: 553, name: '307', seo_name: '307' }, { id: 1416, name: '308', seo_name: '308' }, 
  ]},
  { id: 71, name: 'Peugeot', seo_name: 'peugeot', kind_ids: [4], models: [
    { id: 560, name: 'Boxer', seo_name: 'boxer' }, { id: 559, name: 'Expert', seo_name: 'expert' }, 
    { id: 558, name: 'Partner', seo_name: 'partner' }, 
  ]},
  { id: 161, name: 'Peugeot', seo_name: 'peugeot', kind_ids: [3], models: [
    { id: 8784, name: 'Kisbee 50i 2T', seo_name: 'kisbee-50i-2t' }, { id: 2332, name: 'Ludix', seo_name: 'ludix' }, 
    { id: 985, name: 'Ostatní', seo_name: 'ostatni' }, { id: 2333, name: 'Satelis', seo_name: 'satelis' }, 
    { id: 2337, name: 'Trekker', seo_name: 'trekker' }, 
  ]},
  { id: 373, name: 'Peugeot', seo_name: 'peugeot', kind_ids: [9], models: [
    { id: 1398, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1161, name: 'Phoenix', seo_name: 'phoenix', kind_ids: [9], models: [
    { id: 7713, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 206, name: 'Piaggio', seo_name: 'piaggio', kind_ids: [3], models: [
    { id: 2343, name: 'Beverly', seo_name: 'beverly' }, { id: 2344, name: 'Fly', seo_name: 'fly' }, 
    { id: 2346, name: 'Liberty', seo_name: 'liberty' }, { id: 7717, name: 'Medley', seo_name: 'medley' }, 
    { id: 6698, name: 'MP3', seo_name: 'mp3' }, { id: 7719, name: 'New Liberty', seo_name: 'new-liberty' }, 
    { id: 1040, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 423, name: 'Piaggio', seo_name: 'piaggio', kind_ids: [4], models: [
    { id: 5162, name: 'Porter', seo_name: 'porter' }
  ]},
  { id: 299, name: 'Pilote', seo_name: 'pilote', kind_ids: [9], models: [
    { id: 1275, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 215, name: 'Polaris', seo_name: 'polaris', kind_ids: [3], models: [
    { id: 1049, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 354, name: 'Polaris', seo_name: 'polaris', kind_ids: [11], models: [
    { id: 1357, name: 'Ostatní', seo_name: 'ostatni' }, { id: 5342, name: 'Outlaw', seo_name: 'outlaw' }, 
    { id: 5348, name: 'Phoenix', seo_name: 'phoenix' }, { id: 5594, name: 'Ranger', seo_name: 'ranger' }, 
    { id: 9253, name: 'RZR', seo_name: 'rzr' }, { id: 5344, name: 'Scrambler', seo_name: 'scrambler' }, 
    { id: 5332, name: 'Sportsman', seo_name: 'sportsman' }, 
  ]},
  { id: 925, name: 'Pongratz', seo_name: 'pongratz', kind_ids: [7], models: [
    { id: 6159, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 75, name: 'Porsche', seo_name: 'porsche', models: [
    { id: 8813, name: '718', seo_name: '718' }, { id: 586, name: '911', seo_name: '911' }, 
    { id: 1512, name: 'Cayenne', seo_name: 'cayenne' }, { id: 1671, name: 'Cayman', seo_name: 'cayman' }, 
    { id: 6662, name: 'Macan', seo_name: 'macan' }, { id: 1654, name: 'Panamera', seo_name: 'panamera' }, 
    { id: 8529, name: 'Taycan', seo_name: 'taycan' }, 
  ]},
  { id: 885, name: 'Pössl', seo_name: 'possl', kind_ids: [9], models: [
    { id: 5684, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1454, name: 'RAM', seo_name: 'ram', kind_ids: [4], models: [
    { id: 8974, name: '1500', seo_name: '1500' }
  ]},
  { id: 335, name: 'Rapido', seo_name: 'rapido', kind_ids: [9], models: [
    { id: 1330, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 78, name: 'Renault', seo_name: 'renault', models: [
    { id: 8953, name: 'Arkana', seo_name: 'arkana' }, { id: 617, name: 'Espace', seo_name: 'espace' }, 
    { id: 612, name: 'Mégane', seo_name: 'megane' }, { id: 607, name: 'R5', seo_name: 'r5' }, 
    { id: 620, name: 'Scénic', seo_name: 'scenic' }, { id: 619, name: 'Thalia', seo_name: 'thalia' }, 
    { id: 6387, name: 'Trafic', seo_name: 'trafic' }, 
  ]},
  { id: 79, name: 'Renault', seo_name: 'renault', kind_ids: [4], models: [
    { id: 630, name: 'Express', seo_name: 'express' }, { id: 8955, name: 'Express VAN', seo_name: 'express-van' }, 
    { id: 627, name: 'Kangoo', seo_name: 'kangoo' }, { id: 7700, name: 'Mascott', seo_name: 'mascott' }, 
    { id: 628, name: 'Master', seo_name: 'master' }, { id: 629, name: 'Trafic', seo_name: 'trafic' }, 
  ]},
  { id: 80, name: 'Renault', seo_name: 'renault', kind_ids: [5], models: [
    { id: 6010, name: 'KERAX', seo_name: 'kerax' }, { id: 6012, name: 'Magnum', seo_name: 'magnum' }, 
    { id: 6458, name: 'Mascott', seo_name: 'mascott' }, { id: 6018, name: 'Midlum', seo_name: 'midlum' }, 
    { id: 632, name: 'Ostatní', seo_name: 'ostatni' }, { id: 1666, name: 'Premium', seo_name: 'premium' }, 
  ]},
  { id: 81, name: 'Renault', seo_name: 'renault', kind_ids: [6], models: [
    { id: 7255, name: 'Master', seo_name: 'master' }
  ]},
  { id: 436, name: 'Renault', seo_name: 'renault', kind_ids: [9], models: [
    { id: 1706, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1514, name: 'Respo', seo_name: 'respo', kind_ids: [7], models: [
    { id: 9335, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 336, name: 'Rimor', seo_name: 'rimor', kind_ids: [9], models: [
    { id: 9140, name: 'EVO 5', seo_name: 'evo-5' }, { id: 9146, name: 'EVO 95 PLUS', seo_name: 'evo-95-plus' }, 
    { id: 1331, name: 'Ostatní', seo_name: 'ostatni' }, { id: 9141, name: 'SEAL 5', seo_name: 'seal-5' }, 
    { id: 9142, name: 'SEAL 695', seo_name: 'seal-695' }, 
  ]},
  { id: 1424, name: 'Robeta', seo_name: 'robeta', kind_ids: [9], models: [
    { id: 8770, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1179, name: 'RollerTeam', seo_name: 'rollerteam', kind_ids: [9], models: [
    { id: 7806, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1466, name: 'Royal Enfield', seo_name: 'royal-enfield', kind_ids: [3], models: [
    { id: 9046, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1028, name: 'Rydwan', seo_name: 'rydwan', kind_ids: [7], models: [
    { id: 6864, name: 'R-EU-H2 euro B', seo_name: 'r-eu-h2-euro-b' }
  ]},
  { id: 1003, name: 'Sacher', seo_name: 'sacher', kind_ids: [7], models: [
    { id: 6796, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 175, name: 'Scania', seo_name: 'scania', kind_ids: [5], models: [
    { id: 1009, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 176, name: 'Scania', seo_name: 'scania', kind_ids: [6], models: [
    { id: 1010, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1493, name: 'Sea-Doo', seo_name: 'sea-doo', kind_ids: [3], models: [
    { id: 9216, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 86, name: 'Seat', seo_name: 'seat', models: [
    { id: 7599, name: 'Ateca', seo_name: 'ateca' }, { id: 668, name: 'Leon', seo_name: 'leon' }, 
    { id: 6600, name: 'Mii', seo_name: 'mii' }, { id: 8125, name: 'Tarraco', seo_name: 'tarraco' }, 
  ]},
  { id: 1457, name: 'Segway', seo_name: 'segway', kind_ids: [11], models: [
    { id: 8990, name: 'AT10  L', seo_name: 'at10-l' }, { id: 8987, name: 'AT6 L', seo_name: 'at6-l' }, 
    { id: 8988, name: 'AT6 L Limited', seo_name: 'at6-l-limited' }, { id: 8985, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 1471, name: 'Selvo', seo_name: 'selvo', kind_ids: [11], models: [
    { id: 9083, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 246, name: 'Setra', seo_name: 'setra', kind_ids: [6], models: [
    { id: 1080, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 479, name: 'Sherco', seo_name: 'sherco', kind_ids: [3], models: [
    { id: 2391, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 261, name: 'Schmitz', seo_name: 'schmitz', kind_ids: [7], models: [
    { id: 1107, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 260, name: 'Schwarzmüller', seo_name: 'schwarzmuller', kind_ids: [7], models: [
    { id: 1108, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 859, name: 'Sprite', seo_name: 'sprite', kind_ids: [9], models: [
    { id: 5208, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1303, name: 'SsangYong', seo_name: 'ssangyong', kind_ids: [4], models: [
    { id: 8215, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 322, name: 'Stas', seo_name: 'stas', kind_ids: [7], models: [
    { id: 1306, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 312, name: 'Steinbock', seo_name: 'steinbock', kind_ids: [10], models: [
    { id: 1297, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1301, name: 'Sterckeman', seo_name: 'sterckeman', kind_ids: [9], models: [
    { id: 8210, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 309, name: 'Still', seo_name: 'still', kind_ids: [10], models: [
    { id: 1298, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 88, name: 'Subaru', seo_name: 'subaru', models: [
    { id: 1193, name: 'Outback', seo_name: 'outback' }
  ]},
  { id: 1448, name: 'Sun Living', seo_name: 'sun-living', kind_ids: [9], models: [
    { id: 8959, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 967, name: 'Sunlight', seo_name: 'sunlight', kind_ids: [9], models: [
    { id: 6582, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1339, name: 'Super SOCO', seo_name: 'super-soco', kind_ids: [3], models: [
    { id: 8334, name: 'TC', seo_name: 'tc' }
  ]},
  { id: 92, name: 'Suzuki', seo_name: 'suzuki', kind_ids: [3], models: [
    { id: 2431, name: 'Address', seo_name: 'address' }, { id: 2435, name: 'Burgman', seo_name: 'burgman' }, 
    { id: 2445, name: 'GSF Bandit', seo_name: 'gsf-bandit' }, { id: 5763, name: 'GSR', seo_name: 'gsr' }, 
    { id: 2448, name: 'Hayabusa', seo_name: 'hayabusa' }, { id: 5110, name: 'Intruder', seo_name: 'intruder' }, 
    { id: 2454, name: 'RV', seo_name: 'rv' }, { id: 6302, name: 'V-Strom 650', seo_name: 'v-strom-650' }, 
  ]},
  { id: 327, name: 'Svan', seo_name: 'svan', kind_ids: [7], models: [
    { id: 1309, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1518, name: 'SWM', seo_name: 'swm', kind_ids: [3], models: [
    { id: 9359, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 482, name: 'Sym', seo_name: 'sym', kind_ids: [3], models: [
    { id: 2471, name: 'Jet', seo_name: 'jet' }, { id: 2465, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 93, name: 'Škoda', seo_name: 'skoda', models: [
    { id: 9415, name: 'Elroq', seo_name: 'elroq' }, { id: 9523, name: 'Enyaq', seo_name: 'enyaq' }, 
    { id: 9302, name: 'Enyaq Coupé', seo_name: 'enyaq-coupe' }, { id: 8744, name: 'Enyaq iV', seo_name: 'enyaq-iv' }, 
    { id: 707, name: 'Fabia', seo_name: 'fabia' }, { id: 8290, name: 'Kamiq', seo_name: 'kamiq' }, 
    { id: 7665, name: 'Karoq', seo_name: 'karoq' }, { id: 7595, name: 'Kodiaq', seo_name: 'kodiaq' }, 
    { id: 705, name: 'Octavia', seo_name: 'octavia' }, { id: 6445, name: 'Rapid', seo_name: 'rapid' }, 
    { id: 8155, name: 'Scala', seo_name: 'scala' }, { id: 708, name: 'Superb', seo_name: 'superb' }, 
    { id: 1703, name: 'Yeti', seo_name: 'yeti' }, 
  ]},
  { id: 94, name: 'Škoda', seo_name: 'skoda', kind_ids: [4], models: [
    { id: 1648, name: 'Praktik', seo_name: 'praktik' }
  ]},
  { id: 1523, name: 'TA-NO', seo_name: 'ta-no', kind_ids: [7], models: [
    { id: 9368, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 429, name: 'Tabbert', seo_name: 'tabbert', kind_ids: [9], models: [
    { id: 9185, name: 'Cellini', seo_name: 'cellini' }, { id: 1657, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 97, name: 'Tatra', seo_name: 'tatra', kind_ids: [5], models: [
    { id: 720, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1294, name: 'Tema', seo_name: 'tema', kind_ids: [7], models: [
    { id: 8167, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 846, name: 'Temsa', seo_name: 'temsa', kind_ids: [6], models: [
    { id: 9648, name: 'HD', seo_name: 'hd' }, { id: 9646, name: 'Prestij', seo_name: 'prestij' }
  ]},
  { id: 951, name: 'Tesla', seo_name: 'tesla', models: [
    { id: 8190, name: 'Model 3', seo_name: 'model-3' }
  ]},
  { id: 387, name: 'TGB', seo_name: 'tgb', kind_ids: [11], models: [
    { id: 5622, name: 'Blade 550', seo_name: 'blade-550' }, { id: 1437, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 1481, name: 'Tourne', seo_name: 'tourne', kind_ids: [9], models: [
    { id: 9128, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 99, name: 'Toyota', seo_name: 'toyota', models: [
    { id: 1411, name: 'Auris', seo_name: 'auris' }, { id: 730, name: 'Corolla', seo_name: 'corolla' }, 
    { id: 9102, name: 'Corolla Cross', seo_name: 'corolla-cross' }, 
    { id: 8943, name: 'Yaris Cross', seo_name: 'yaris-cross' }, 
  ]},
  { id: 101, name: 'Toyota', seo_name: 'toyota', kind_ids: [4], models: [
    { id: 751, name: 'Hilux', seo_name: 'hilux' }, { id: 6659, name: 'Proace', seo_name: 'proace' }, 
    { id: 9445, name: 'Proace Max', seo_name: 'proace-max' }, 
  ]},
  { id: 1557, name: 'Toyota', seo_name: 'toyota', kind_ids: [9], models: [
    { id: 9591, name: 'Proace Max', seo_name: 'proace-max' }
  ]},
  { id: 947, name: 'Trailis', seo_name: 'trailis', kind_ids: [7], models: [
    { id: 6285, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 210, name: 'Triumph', seo_name: 'triumph', kind_ids: [3], models: [
    { id: 1044, name: 'Ostatní', seo_name: 'ostatni' }, { id: 2529, name: 'Rocket III', seo_name: 'rocket-iii' }, 
    { id: 2532, name: 'Speed Triple', seo_name: 'speed-triple' }, { id: 2538, name: 'Tiger', seo_name: 'tiger' }, 
  ]},
  { id: 1576, name: 'UNU', seo_name: 'unu', kind_ids: [3], models: [
    { id: 9687, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 413, name: 'VAPP', seo_name: 'vapp', kind_ids: [7], models: [
    { id: 1609, name: 'Ostatní', seo_name: 'ostatni' }, { id: 8047, name: 'PAV', seo_name: 'pav' }
  ]},
  { id: 284, name: 'Vespa', seo_name: 'vespa', kind_ids: [3], models: [
    { id: 2560, name: 'GTS 125', seo_name: 'gts-125' }, { id: 7723, name: 'GTS 300', seo_name: 'gts-300' }, 
    { id: 1258, name: 'Ostatní', seo_name: 'ostatni' }, { id: 7721, name: 'Primavera', seo_name: 'primavera' }, 
  ]},
  { id: 412, name: 'Vezeko', seo_name: 'vezeko', kind_ids: [7], models: [
    { id: 1608, name: 'Ostatní', seo_name: 'ostatni' }, { id: 6550, name: 'VARIO', seo_name: 'vario' }
  ]},
  { id: 1432, name: 'Voge', seo_name: 'voge', kind_ids: [3], models: [
    { id: 8826, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 103, name: 'Volkswagen', seo_name: 'volkswagen', models: [
    { id: 7701, name: 'Arteon', seo_name: 'arteon' }, 
    { id: 8947, name: 'Arteon Shooting Brake', seo_name: 'arteon-shooting-brake' }, 
    { id: 1615, name: 'Caddy', seo_name: 'caddy' }, { id: 8202, name: 'California', seo_name: 'california' }, 
    { id: 6060, name: 'Caravelle', seo_name: 'caravelle' }, { id: 8978, name: 'e-Golf', seo_name: 'e-golf' }, 
    { id: 759, name: 'Golf', seo_name: 'golf' }, { id: 8949, name: 'Golf Variant', seo_name: 'golf-variant' }, 
    { id: 8742, name: 'ID.3', seo_name: 'id3' }, { id: 8793, name: 'ID.4', seo_name: 'id4' }, 
    { id: 9079, name: 'ID.5', seo_name: 'id5' }, { id: 760, name: 'Jetta', seo_name: 'jetta' }, 
    { id: 6037, name: 'Multivan', seo_name: 'multivan' }, { id: 762, name: 'Passat', seo_name: 'passat' }, 
    { id: 6169, name: 'Passat CC', seo_name: 'passat-cc' }, 
    { id: 8951, name: 'Passat Variant', seo_name: 'passat-variant' }, { id: 758, name: 'Polo', seo_name: 'polo' }, 
    { id: 763, name: 'Scirocco', seo_name: 'scirocco' }, { id: 765, name: 'Sharan', seo_name: 'sharan' }, 
    { id: 7802, name: 'T-Roc', seo_name: 't-roc' }, { id: 1583, name: 'Tiguan', seo_name: 'tiguan' }, 
    { id: 8471, name: 'Tiguan Allspace', seo_name: 'tiguan-allspace' }, 
    { id: 1582, name: 'Touareg', seo_name: 'touareg' }, { id: 771, name: 'Touran', seo_name: 'touran' }, 
    { id: 6311, name: 'Transporter', seo_name: 'transporter' }, { id: 6393, name: 'Up!', seo_name: 'up' }, 
  ]},
  { id: 104, name: 'Volkswagen', seo_name: 'volkswagen', kind_ids: [4], models: [
    { id: 7662, name: 'Amarok', seo_name: 'amarok' }, { id: 773, name: 'Caddy', seo_name: 'caddy' }, 
    { id: 775, name: 'Caravelle', seo_name: 'caravelle' }, { id: 1321, name: 'Crafter', seo_name: 'crafter' }, 
    { id: 774, name: 'Transporter', seo_name: 'transporter' }, 
  ]},
  { id: 105, name: 'Volkswagen', seo_name: 'volkswagen', kind_ids: [5], models: [
    { id: 780, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 414, name: 'Volkswagen', seo_name: 'volkswagen', kind_ids: [9], models: [
    { id: 9069, name: 'Grand California', seo_name: 'grand-california' }, 
    { id: 1613, name: 'Ostatní', seo_name: 'ostatni' }, { id: 1612, name: 'T3', seo_name: 't3' }, 
    { id: 8937, name: 'T5 California', seo_name: 't5-california' }, { id: 9256, name: 'T6', seo_name: 't6' }, 
    { id: 9257, name: 'T6.1', seo_name: 't61' }, 
  ]},
  { id: 1094, name: 'Volkswagen', seo_name: 'volkswagen', kind_ids: [6], models: [
    { id: 7434, name: 'LT', seo_name: 'lt' }
  ]},
  { id: 106, name: 'Volvo', seo_name: 'volvo', models: [
    { id: 801, name: 'S80', seo_name: 's80' }, { id: 1585, name: 'XC90', seo_name: 'xc90' }
  ]},
  { id: 107, name: 'Volvo', seo_name: 'volvo', kind_ids: [5], models: [
    { id: 6608, name: 'FE', seo_name: 'fe' }, { id: 6602, name: 'FH', seo_name: 'fh' }, 
    { id: 6606, name: 'FL', seo_name: 'fl' }, { id: 6604, name: 'FM', seo_name: 'fm' }, 
    { id: 806, name: 'Ostatní', seo_name: 'ostatni' }, 
  ]},
  { id: 275, name: 'Volvo', seo_name: 'volvo', kind_ids: [10], models: [
    { id: 1215, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 913, name: 'Wacker', seo_name: 'wacker', kind_ids: [10], models: [
    { id: 6058, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 994, name: 'Weinsberg', seo_name: 'weinsberg', kind_ids: [9], models: [
    { id: 9190, name: 'CaraCompact', seo_name: 'caracompact' }, 
    { id: 9192, name: 'CaraCompact MB', seo_name: 'caracompact-mb' }, 
    { id: 9194, name: 'CaraCore', seo_name: 'caracore' }, { id: 9196, name: 'CaraHome', seo_name: 'carahome' }, 
    { id: 9188, name: 'CaraOne', seo_name: 'caraone' }, { id: 6748, name: 'Ostatní', seo_name: 'ostatni' }, 
    { id: 9193, name: 'X-Cursion Van', seo_name: 'x-cursion-van' }, 
    { id: 9608, name: 'X-Pedition', seo_name: 'x-pedition' }, 
  ]},
  { id: 996, name: 'Weinsberg', seo_name: 'weinsberg', kind_ids: [7], models: [
    { id: 6750, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 418, name: 'Wielton', seo_name: 'wielton', kind_ids: [7], models: [
    { id: 1621, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 405, name: 'Wilk', seo_name: 'wilk', kind_ids: [9], models: [
    { id: 1594, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 211, name: 'Yamaha', seo_name: 'yamaha', kind_ids: [3], models: [
    { id: 2621, name: 'FZ6', seo_name: 'fz6' }, { id: 5769, name: 'FZ8', seo_name: 'fz8' }, 
    { id: 2623, name: 'FZS', seo_name: 'fzs' }, { id: 2631, name: 'MT-03', seo_name: 'mt-03' }, 
    { id: 6776, name: 'MT-07', seo_name: 'mt-07' }, { id: 6778, name: 'MT-09', seo_name: 'mt-09' }, 
    { id: 1045, name: 'Ostatní', seo_name: 'ostatni' }, { id: 2643, name: 'T-Max', seo_name: 't-max' }, 
    { id: 2641, name: 'TDM', seo_name: 'tdm' }, { id: 2663, name: 'X-Max', seo_name: 'x-max' }, 
    { id: 2666, name: 'XTZ', seo_name: 'xtz' }, { id: 2668, name: 'XVS DragStar', seo_name: 'xvs-dragstar' }, 
    { id: 2672, name: 'YZ', seo_name: 'yz' }, { id: 2673, name: 'YZF', seo_name: 'yzf' }, 
  ]},
  { id: 353, name: 'Yamaha', seo_name: 'yamaha', kind_ids: [11], models: [
    { id: 1355, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1491, name: 'Z-Trailer', seo_name: 'z-trailer', kind_ids: [7], models: [
    { id: 9209, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1218, name: 'Zaslaw', seo_name: 'zaslaw', kind_ids: [7], models: [
    { id: 7896, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1117, name: 'Zero', seo_name: 'zero', kind_ids: [3], models: [
    { id: 7540, name: 'S', seo_name: 's' }
  ]},
  { id: 340, name: 'Zetor', seo_name: 'zetor', kind_ids: [10], models: [
    { id: 1339, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
  { id: 1499, name: 'Zontes', seo_name: 'zontes', kind_ids: [3], models: [
    { id: 9223, name: 'Ostatní', seo_name: 'ostatni' }
  ]},
];

