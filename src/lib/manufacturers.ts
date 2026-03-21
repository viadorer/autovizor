// ============================================================
// AUTOVIZOR.CZ - Kompletní seznam výrobců a modelů
// Ze Sauto.cz carList (100+ značek, 2000+ modelů)
// ============================================================

export interface ManufacturerWithModels {
  id: number;
  name: string;
  models: { id: number; name: string }[];
}

const R2_LOGOS = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev';

export function getManufacturerLogoUrl(name: string): string {
  const safeName = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  return `${R2_LOGOS}/logos/${safeName}.png`;
}

export const MANUFACTURERS: ManufacturerWithModels[] = [
  { id: 1, name: 'Alfa Romeo', models: [
    { id: 101, name: '145' }, { id: 102, name: '146' }, { id: 103, name: '147' },
    { id: 104, name: '155' }, { id: 105, name: '156' }, { id: 106, name: '159' },
    { id: 107, name: '164' }, { id: 108, name: '166' }, { id: 109, name: 'Brera' },
    { id: 110, name: 'Giulia' }, { id: 111, name: 'Giulietta' }, { id: 112, name: 'GT' },
    { id: 113, name: 'GTV' }, { id: 114, name: 'MiTo' }, { id: 115, name: 'Spider' },
    { id: 116, name: 'Stelvio' }, { id: 117, name: 'Tonale' }, { id: 118, name: '4C' },
  ]},
  { id: 2, name: 'Audi', models: [
    { id: 201, name: 'A1' }, { id: 202, name: 'A2' }, { id: 203, name: 'A3' },
    { id: 204, name: 'A4' }, { id: 205, name: 'A4 Allroad' }, { id: 206, name: 'A5' },
    { id: 207, name: 'A6' }, { id: 208, name: 'A6 Allroad' }, { id: 209, name: 'A7' },
    { id: 210, name: 'A8' }, { id: 211, name: 'e-tron' }, { id: 212, name: 'e-tron GT' },
    { id: 213, name: 'Q2' }, { id: 214, name: 'Q3' }, { id: 215, name: 'Q4 e-tron' },
    { id: 216, name: 'Q5' }, { id: 217, name: 'Q7' }, { id: 218, name: 'Q8' },
    { id: 219, name: 'R8' }, { id: 220, name: 'RS3' }, { id: 221, name: 'RS4' },
    { id: 222, name: 'RS5' }, { id: 223, name: 'RS6' }, { id: 224, name: 'RS7' },
    { id: 225, name: 'RS Q8' }, { id: 226, name: 'S3' }, { id: 227, name: 'S4' },
    { id: 228, name: 'S5' }, { id: 229, name: 'S6' }, { id: 230, name: 'S7' },
    { id: 231, name: 'S8' }, { id: 232, name: 'SQ5' }, { id: 233, name: 'SQ7' },
    { id: 234, name: 'SQ8' }, { id: 235, name: 'TT' }, { id: 236, name: 'TTS' },
  ]},
  { id: 3, name: 'Austin', models: [
    { id: 301, name: 'Mini' }, { id: 302, name: 'Healey' },
  ]},
  { id: 4, name: 'Bentley', models: [
    { id: 401, name: 'Bentayga' }, { id: 402, name: 'Continental GT' },
    { id: 403, name: 'Continental Flying Spur' }, { id: 404, name: 'Mulsanne' },
  ]},
  { id: 5, name: 'BMW', models: [
    { id: 501, name: 'Řada 1' }, { id: 502, name: 'Řada 2' }, { id: 503, name: 'Řada 2 Active Tourer' },
    { id: 504, name: 'Řada 2 Gran Tourer' }, { id: 505, name: 'Řada 3' }, { id: 506, name: 'Řada 3 GT' },
    { id: 507, name: 'Řada 4' }, { id: 508, name: 'Řada 4 Gran Coupé' }, { id: 509, name: 'Řada 5' },
    { id: 510, name: 'Řada 5 GT' }, { id: 511, name: 'Řada 6' }, { id: 512, name: 'Řada 6 GT' },
    { id: 513, name: 'Řada 7' }, { id: 514, name: 'Řada 8' }, { id: 515, name: 'i3' },
    { id: 516, name: 'i4' }, { id: 517, name: 'i5' }, { id: 518, name: 'i7' },
    { id: 519, name: 'iX' }, { id: 520, name: 'iX1' }, { id: 521, name: 'iX3' },
    { id: 522, name: 'M2' }, { id: 523, name: 'M3' }, { id: 524, name: 'M4' },
    { id: 525, name: 'M5' }, { id: 526, name: 'M6' }, { id: 527, name: 'M8' },
    { id: 528, name: 'X1' }, { id: 529, name: 'X2' }, { id: 530, name: 'X3' },
    { id: 531, name: 'X4' }, { id: 532, name: 'X5' }, { id: 533, name: 'X6' },
    { id: 534, name: 'X7' }, { id: 535, name: 'XM' }, { id: 536, name: 'Z3' },
    { id: 537, name: 'Z4' },
  ]},
  { id: 6, name: 'Bugatti', models: [
    { id: 601, name: 'Chiron' }, { id: 602, name: 'Veyron' },
  ]},
  { id: 7, name: 'Buick', models: [
    { id: 701, name: 'Enclave' }, { id: 702, name: 'Regal' },
  ]},
  { id: 8, name: 'Cadillac', models: [
    { id: 801, name: 'CTS' }, { id: 802, name: 'Escalade' }, { id: 803, name: 'SRX' },
    { id: 804, name: 'XT5' }, { id: 805, name: 'CT5' },
  ]},
  { id: 9, name: 'Caterham', models: [
    { id: 901, name: 'Seven' },
  ]},
  { id: 10, name: 'Chevrolet', models: [
    { id: 1001, name: 'Aveo' }, { id: 1002, name: 'Camaro' }, { id: 1003, name: 'Captiva' },
    { id: 1004, name: 'Corvette' }, { id: 1005, name: 'Cruze' }, { id: 1006, name: 'Equinox' },
    { id: 1007, name: 'Malibu' }, { id: 1008, name: 'Orlando' }, { id: 1009, name: 'Spark' },
    { id: 1010, name: 'Tahoe' }, { id: 1011, name: 'Trax' }, { id: 1012, name: 'Suburban' },
    { id: 1013, name: 'Silverado' },
  ]},
  { id: 11, name: 'Chrysler', models: [
    { id: 1101, name: '300C' }, { id: 1102, name: 'Grand Voyager' }, { id: 1103, name: 'Pacifica' },
    { id: 1104, name: 'PT Cruiser' }, { id: 1105, name: 'Sebring' }, { id: 1106, name: 'Town & Country' },
    { id: 1107, name: 'Voyager' },
  ]},
  { id: 12, name: 'Citroën', models: [
    { id: 1201, name: 'Berlingo' }, { id: 1202, name: 'C1' }, { id: 1203, name: 'C2' },
    { id: 1204, name: 'C3' }, { id: 1205, name: 'C3 Aircross' }, { id: 1206, name: 'C3 Picasso' },
    { id: 1207, name: 'C4' }, { id: 1208, name: 'C4 Cactus' }, { id: 1209, name: 'C4 Picasso' },
    { id: 1210, name: 'C4 SpaceTourer' }, { id: 1211, name: 'C5' }, { id: 1212, name: 'C5 Aircross' },
    { id: 1213, name: 'C5 X' }, { id: 1214, name: 'C6' }, { id: 1215, name: 'C8' },
    { id: 1216, name: 'DS3' }, { id: 1217, name: 'DS4' }, { id: 1218, name: 'DS5' },
    { id: 1219, name: 'Grand C4 Picasso' }, { id: 1220, name: 'Grand C4 SpaceTourer' },
    { id: 1221, name: 'Jumper' }, { id: 1222, name: 'Jumpy' }, { id: 1223, name: 'Nemo' },
    { id: 1224, name: 'Saxo' }, { id: 1225, name: 'Xsara' }, { id: 1226, name: 'Xsara Picasso' },
    { id: 1227, name: 'ë-C4' },
  ]},
  { id: 13, name: 'Cupra', models: [
    { id: 1301, name: 'Ateca' }, { id: 1302, name: 'Born' }, { id: 1303, name: 'Formentor' },
    { id: 1304, name: 'Leon' }, { id: 1305, name: 'Tavascan' },
  ]},
  { id: 14, name: 'Dacia', models: [
    { id: 1401, name: 'Dokker' }, { id: 1402, name: 'Duster' }, { id: 1403, name: 'Jogger' },
    { id: 1404, name: 'Lodgy' }, { id: 1405, name: 'Logan' }, { id: 1406, name: 'Sandero' },
    { id: 1407, name: 'Spring' },
  ]},
  { id: 15, name: 'Daewoo', models: [
    { id: 1501, name: 'Kalos' }, { id: 1502, name: 'Lacetti' }, { id: 1503, name: 'Matiz' },
    { id: 1504, name: 'Nexia' }, { id: 1505, name: 'Nubira' },
  ]},
  { id: 16, name: 'Daihatsu', models: [
    { id: 1601, name: 'Charade' }, { id: 1602, name: 'Copen' }, { id: 1603, name: 'Cuore' },
    { id: 1604, name: 'Sirion' }, { id: 1605, name: 'Terios' },
  ]},
  { id: 17, name: 'Dodge', models: [
    { id: 1701, name: 'Caliber' }, { id: 1702, name: 'Challenger' }, { id: 1703, name: 'Charger' },
    { id: 1704, name: 'Durango' }, { id: 1705, name: 'Journey' }, { id: 1706, name: 'Nitro' },
    { id: 1707, name: 'RAM' }, { id: 1708, name: 'Viper' },
  ]},
  { id: 18, name: 'DS', models: [
    { id: 1801, name: 'DS 3' }, { id: 1802, name: 'DS 3 Crossback' }, { id: 1803, name: 'DS 4' },
    { id: 1804, name: 'DS 5' }, { id: 1805, name: 'DS 7' }, { id: 1806, name: 'DS 9' },
  ]},
  { id: 19, name: 'Ferrari', models: [
    { id: 1901, name: '296 GTB' }, { id: 1902, name: '458 Italia' }, { id: 1903, name: '488 GTB' },
    { id: 1904, name: '488 Pista' }, { id: 1905, name: '812 Superfast' }, { id: 1906, name: 'California' },
    { id: 1907, name: 'F12berlinetta' }, { id: 1908, name: 'F8 Tributo' }, { id: 1909, name: 'GTC4Lusso' },
    { id: 1910, name: 'Portofino' }, { id: 1911, name: 'Roma' }, { id: 1912, name: 'SF90 Stradale' },
    { id: 1913, name: 'Purosangue' },
  ]},
  { id: 20, name: 'Fiat', models: [
    { id: 2001, name: '124 Spider' }, { id: 2002, name: '500' }, { id: 2003, name: '500C' },
    { id: 2004, name: '500e' }, { id: 2005, name: '500L' }, { id: 2006, name: '500X' },
    { id: 2007, name: 'Bravo' }, { id: 2008, name: 'Croma' }, { id: 2009, name: 'Doblò' },
    { id: 2010, name: 'Ducato' }, { id: 2011, name: 'Fiorino' }, { id: 2012, name: 'Freemont' },
    { id: 2013, name: 'Grande Punto' }, { id: 2014, name: 'Idea' }, { id: 2015, name: 'Linea' },
    { id: 2016, name: 'Multipla' }, { id: 2017, name: 'Panda' }, { id: 2018, name: 'Punto' },
    { id: 2019, name: 'Qubo' }, { id: 2020, name: 'Sedici' }, { id: 2021, name: 'Stilo' },
    { id: 2022, name: 'Talento' }, { id: 2023, name: 'Tipo' }, { id: 2024, name: '600e' },
  ]},
  { id: 21, name: 'Ford', models: [
    { id: 2101, name: 'B-Max' }, { id: 2102, name: 'C-Max' }, { id: 2103, name: 'EcoSport' },
    { id: 2104, name: 'Edge' }, { id: 2105, name: 'Escape' }, { id: 2106, name: 'Explorer' },
    { id: 2107, name: 'F-150' }, { id: 2108, name: 'Fiesta' }, { id: 2109, name: 'Focus' },
    { id: 2110, name: 'Fusion' }, { id: 2111, name: 'Galaxy' }, { id: 2112, name: 'Grand C-Max' },
    { id: 2113, name: 'Ka' }, { id: 2114, name: 'Ka+' }, { id: 2115, name: 'Kuga' },
    { id: 2116, name: 'Maverick' }, { id: 2117, name: 'Mondeo' }, { id: 2118, name: 'Mustang' },
    { id: 2119, name: 'Mustang Mach-E' }, { id: 2120, name: 'Puma' }, { id: 2121, name: 'Ranger' },
    { id: 2122, name: 'S-Max' }, { id: 2123, name: 'Tourneo Connect' }, { id: 2124, name: 'Tourneo Courier' },
    { id: 2125, name: 'Tourneo Custom' }, { id: 2126, name: 'Transit' }, { id: 2127, name: 'Transit Connect' },
    { id: 2128, name: 'Transit Custom' }, { id: 2129, name: 'Transit Courier' },
  ]},
  { id: 22, name: 'Genesis', models: [
    { id: 2201, name: 'G70' }, { id: 2202, name: 'G80' }, { id: 2203, name: 'G90' },
    { id: 2204, name: 'GV60' }, { id: 2205, name: 'GV70' }, { id: 2206, name: 'GV80' },
  ]},
  { id: 23, name: 'Honda', models: [
    { id: 2301, name: 'Accord' }, { id: 2302, name: 'City' }, { id: 2303, name: 'Civic' },
    { id: 2304, name: 'CR-V' }, { id: 2305, name: 'CR-Z' }, { id: 2306, name: 'e' },
    { id: 2307, name: 'FR-V' }, { id: 2308, name: 'HR-V' }, { id: 2309, name: 'Insight' },
    { id: 2310, name: 'Jazz' }, { id: 2311, name: 'Legend' }, { id: 2312, name: 'S2000' },
    { id: 2313, name: 'ZR-V' },
  ]},
  { id: 24, name: 'Hummer', models: [
    { id: 2401, name: 'H2' }, { id: 2402, name: 'H3' },
  ]},
  { id: 25, name: 'Hyundai', models: [
    { id: 2501, name: 'Accent' }, { id: 2502, name: 'Bayon' }, { id: 2503, name: 'Coupe' },
    { id: 2504, name: 'Elantra' }, { id: 2505, name: 'Getz' }, { id: 2506, name: 'Grand Santa Fe' },
    { id: 2507, name: 'i10' }, { id: 2508, name: 'i20' }, { id: 2509, name: 'i30' },
    { id: 2510, name: 'i40' }, { id: 2511, name: 'IONIQ' }, { id: 2512, name: 'IONIQ 5' },
    { id: 2513, name: 'IONIQ 6' }, { id: 2514, name: 'ix20' }, { id: 2515, name: 'ix35' },
    { id: 2516, name: 'ix55' }, { id: 2517, name: 'Kona' }, { id: 2518, name: 'Kona Electric' },
    { id: 2519, name: 'Matrix' }, { id: 2520, name: 'Nexo' }, { id: 2521, name: 'Palisade' },
    { id: 2522, name: 'Santa Fe' }, { id: 2523, name: 'Sonata' }, { id: 2524, name: 'Staria' },
    { id: 2525, name: 'Terracan' }, { id: 2526, name: 'Tucson' }, { id: 2527, name: 'Veloster' },
  ]},
  { id: 26, name: 'Infiniti', models: [
    { id: 2601, name: 'EX' }, { id: 2602, name: 'FX' }, { id: 2603, name: 'G' },
    { id: 2604, name: 'Q30' }, { id: 2605, name: 'Q50' }, { id: 2606, name: 'Q60' },
    { id: 2607, name: 'Q70' }, { id: 2608, name: 'QX30' }, { id: 2609, name: 'QX50' },
    { id: 2610, name: 'QX70' },
  ]},
  { id: 27, name: 'Isuzu', models: [
    { id: 2701, name: 'D-Max' }, { id: 2702, name: 'Trooper' },
  ]},
  { id: 28, name: 'Iveco', models: [
    { id: 2801, name: 'Daily' }, { id: 2802, name: 'Eurocargo' }, { id: 2803, name: 'Stralis' },
  ]},
  { id: 29, name: 'Jaguar', models: [
    { id: 2901, name: 'E-Pace' }, { id: 2902, name: 'F-Pace' }, { id: 2903, name: 'F-Type' },
    { id: 2904, name: 'I-Pace' }, { id: 2905, name: 'S-Type' }, { id: 2906, name: 'X-Type' },
    { id: 2907, name: 'XE' }, { id: 2908, name: 'XF' }, { id: 2909, name: 'XJ' },
    { id: 2910, name: 'XK' },
  ]},
  { id: 30, name: 'Jeep', models: [
    { id: 3001, name: 'Cherokee' }, { id: 3002, name: 'Commander' }, { id: 3003, name: 'Compass' },
    { id: 3004, name: 'Gladiator' }, { id: 3005, name: 'Grand Cherokee' }, { id: 3006, name: 'Patriot' },
    { id: 3007, name: 'Renegade' }, { id: 3008, name: 'Wrangler' }, { id: 3009, name: 'Avenger' },
  ]},
  { id: 31, name: 'Kia', models: [
    { id: 3101, name: 'Carens' }, { id: 3102, name: 'Carnival' }, { id: 3103, name: 'Ceed' },
    { id: 3104, name: 'Cerato' }, { id: 3105, name: 'e-Niro' }, { id: 3106, name: 'EV6' },
    { id: 3107, name: 'EV9' }, { id: 3108, name: 'Magentis' }, { id: 3109, name: 'Niro' },
    { id: 3110, name: 'Opirus' }, { id: 3111, name: 'Optima' }, { id: 3112, name: 'Picanto' },
    { id: 3113, name: 'ProCeed' }, { id: 3114, name: 'Rio' }, { id: 3115, name: 'Sorento' },
    { id: 3116, name: 'Soul' }, { id: 3117, name: 'Sportage' }, { id: 3118, name: 'Stinger' },
    { id: 3119, name: 'Stonic' }, { id: 3120, name: 'Venga' }, { id: 3121, name: 'XCeed' },
  ]},
  { id: 32, name: 'Lada', models: [
    { id: 3201, name: 'Niva' }, { id: 3202, name: 'Vesta' },
  ]},
  { id: 33, name: 'Lamborghini', models: [
    { id: 3301, name: 'Aventador' }, { id: 3302, name: 'Gallardo' }, { id: 3303, name: 'Huracán' },
    { id: 3304, name: 'Urus' }, { id: 3305, name: 'Revuelto' },
  ]},
  { id: 34, name: 'Lancia', models: [
    { id: 3401, name: 'Delta' }, { id: 3402, name: 'Musa' }, { id: 3403, name: 'Thesis' },
    { id: 3404, name: 'Ypsilon' },
  ]},
  { id: 35, name: 'Land Rover', models: [
    { id: 3501, name: 'Defender' }, { id: 3502, name: 'Discovery' }, { id: 3503, name: 'Discovery Sport' },
    { id: 3504, name: 'Freelander' }, { id: 3505, name: 'Range Rover' }, { id: 3506, name: 'Range Rover Evoque' },
    { id: 3507, name: 'Range Rover Sport' }, { id: 3508, name: 'Range Rover Velar' },
  ]},
  { id: 36, name: 'Lexus', models: [
    { id: 3601, name: 'CT' }, { id: 3602, name: 'ES' }, { id: 3603, name: 'GS' },
    { id: 3604, name: 'IS' }, { id: 3605, name: 'LC' }, { id: 3606, name: 'LS' },
    { id: 3607, name: 'LX' }, { id: 3608, name: 'NX' }, { id: 3609, name: 'RC' },
    { id: 3610, name: 'RX' }, { id: 3611, name: 'UX' }, { id: 3612, name: 'RZ' },
  ]},
  { id: 37, name: 'Lincoln', models: [
    { id: 3701, name: 'Continental' }, { id: 3702, name: 'Navigator' }, { id: 3703, name: 'Town Car' },
  ]},
  { id: 38, name: 'Lotus', models: [
    { id: 3801, name: 'Elise' }, { id: 3802, name: 'Evora' }, { id: 3803, name: 'Exige' },
    { id: 3804, name: 'Emira' },
  ]},
  { id: 39, name: 'Maserati', models: [
    { id: 3901, name: 'Ghibli' }, { id: 3902, name: 'GranTurismo' }, { id: 3903, name: 'Grecale' },
    { id: 3904, name: 'Levante' }, { id: 3905, name: 'MC20' }, { id: 3906, name: 'Quattroporte' },
  ]},
  { id: 40, name: 'Mazda', models: [
    { id: 4001, name: '2' }, { id: 4002, name: '3' }, { id: 4003, name: '5' },
    { id: 4004, name: '6' }, { id: 4005, name: 'CX-3' }, { id: 4006, name: 'CX-30' },
    { id: 4007, name: 'CX-5' }, { id: 4008, name: 'CX-60' }, { id: 4009, name: 'CX-7' },
    { id: 4010, name: 'CX-9' }, { id: 4011, name: 'MX-30' }, { id: 4012, name: 'MX-5' },
    { id: 4013, name: 'RX-8' },
  ]},
  { id: 41, name: 'McLaren', models: [
    { id: 4101, name: '540C' }, { id: 4102, name: '570S' }, { id: 4103, name: '600LT' },
    { id: 4104, name: '620R' }, { id: 4105, name: '720S' }, { id: 4106, name: 'GT' },
    { id: 4107, name: 'Artura' },
  ]},
  { id: 42, name: 'Mercedes-Benz', models: [
    { id: 4201, name: 'Třída A' }, { id: 4202, name: 'Třída B' }, { id: 4203, name: 'Třída C' },
    { id: 4204, name: 'CLA' }, { id: 4205, name: 'CLS' }, { id: 4206, name: 'Třída E' },
    { id: 4207, name: 'Třída G' }, { id: 4208, name: 'GLA' }, { id: 4209, name: 'GLB' },
    { id: 4210, name: 'GLC' }, { id: 4211, name: 'GLC Coupé' }, { id: 4212, name: 'GLE' },
    { id: 4213, name: 'GLE Coupé' }, { id: 4214, name: 'GLS' }, { id: 4215, name: 'Třída S' },
    { id: 4216, name: 'SL' }, { id: 4217, name: 'SLC' }, { id: 4218, name: 'SLK' },
    { id: 4219, name: 'AMG GT' }, { id: 4220, name: 'Třída V' }, { id: 4221, name: 'Vito' },
    { id: 4222, name: 'Sprinter' }, { id: 4223, name: 'Citan' }, { id: 4224, name: 'Třída T' },
    { id: 4225, name: 'EQA' }, { id: 4226, name: 'EQB' }, { id: 4227, name: 'EQC' },
    { id: 4228, name: 'EQE' }, { id: 4229, name: 'EQS' }, { id: 4230, name: 'EQV' },
    { id: 4231, name: 'Marco Polo' },
  ]},
  { id: 43, name: 'MG', models: [
    { id: 4301, name: 'EHS' }, { id: 4302, name: 'MG4' }, { id: 4303, name: 'Marvel R' },
    { id: 4304, name: 'ZS' }, { id: 4305, name: 'ZS EV' }, { id: 4306, name: 'MG5' },
  ]},
  { id: 44, name: 'MINI', models: [
    { id: 4401, name: 'Clubman' }, { id: 4402, name: 'Cooper' }, { id: 4403, name: 'Cooper Cabrio' },
    { id: 4404, name: 'Cooper S' }, { id: 4405, name: 'Countryman' }, { id: 4406, name: 'John Cooper Works' },
    { id: 4407, name: 'One' }, { id: 4408, name: 'Paceman' }, { id: 4409, name: 'Cooper SE' },
  ]},
  { id: 45, name: 'Mitsubishi', models: [
    { id: 4501, name: 'ASX' }, { id: 4502, name: 'Colt' }, { id: 4503, name: 'Eclipse Cross' },
    { id: 4504, name: 'Galant' }, { id: 4505, name: 'Grandis' }, { id: 4506, name: 'i-MiEV' },
    { id: 4507, name: 'L200' }, { id: 4508, name: 'Lancer' }, { id: 4509, name: 'Outlander' },
    { id: 4510, name: 'Pajero' }, { id: 4511, name: 'Space Star' },
  ]},
  { id: 46, name: 'Morgan', models: [
    { id: 4601, name: 'Plus Four' }, { id: 4602, name: 'Plus Six' },
  ]},
  { id: 47, name: 'Nissan', models: [
    { id: 4701, name: '350Z' }, { id: 4702, name: '370Z' }, { id: 4703, name: 'Almera' },
    { id: 4704, name: 'Ariya' }, { id: 4705, name: 'e-NV200' }, { id: 4706, name: 'GT-R' },
    { id: 4707, name: 'Juke' }, { id: 4708, name: 'Leaf' }, { id: 4709, name: 'Micra' },
    { id: 4710, name: 'Murano' }, { id: 4711, name: 'Navara' }, { id: 4712, name: 'Note' },
    { id: 4713, name: 'NV200' }, { id: 4714, name: 'NV300' }, { id: 4715, name: 'Pathfinder' },
    { id: 4716, name: 'Primera' }, { id: 4717, name: 'Pulsar' }, { id: 4718, name: 'Qashqai' },
    { id: 4719, name: 'Terrano' }, { id: 4720, name: 'Tiida' }, { id: 4721, name: 'Townstar' },
    { id: 4722, name: 'X-Trail' },
  ]},
  { id: 48, name: 'Opel', models: [
    { id: 4801, name: 'Adam' }, { id: 4802, name: 'Agila' }, { id: 4803, name: 'Ampera' },
    { id: 4804, name: 'Antara' }, { id: 4805, name: 'Astra' }, { id: 4806, name: 'Cascada' },
    { id: 4807, name: 'Combo' }, { id: 4808, name: 'Corsa' }, { id: 4809, name: 'Corsa-e' },
    { id: 4810, name: 'Crossland' }, { id: 4811, name: 'Grandland' }, { id: 4812, name: 'Insignia' },
    { id: 4813, name: 'Karl' }, { id: 4814, name: 'Meriva' }, { id: 4815, name: 'Mokka' },
    { id: 4816, name: 'Mokka-e' }, { id: 4817, name: 'Movano' }, { id: 4818, name: 'Signum' },
    { id: 4819, name: 'Tigra' }, { id: 4820, name: 'Vectra' }, { id: 4821, name: 'Vivaro' },
    { id: 4822, name: 'Zafira' }, { id: 4823, name: 'Zafira Life' },
  ]},
  { id: 49, name: 'Peugeot', models: [
    { id: 4901, name: '1007' }, { id: 4902, name: '107' }, { id: 4903, name: '108' },
    { id: 4904, name: '2008' }, { id: 4905, name: '206' }, { id: 4906, name: '207' },
    { id: 4907, name: '208' }, { id: 4908, name: '3008' }, { id: 4909, name: '301' },
    { id: 4910, name: '307' }, { id: 4911, name: '308' }, { id: 4912, name: '4007' },
    { id: 4913, name: '4008' }, { id: 4914, name: '407' }, { id: 4915, name: '408' },
    { id: 4916, name: '5008' }, { id: 4917, name: '508' }, { id: 4918, name: '607' },
    { id: 4919, name: '807' }, { id: 4920, name: 'Bipper' }, { id: 4921, name: 'Boxer' },
    { id: 4922, name: 'Expert' }, { id: 4923, name: 'Partner' }, { id: 4924, name: 'RCZ' },
    { id: 4925, name: 'Rifter' }, { id: 4926, name: 'Traveller' },
    { id: 4927, name: 'e-208' }, { id: 4928, name: 'e-2008' },
  ]},
  { id: 50, name: 'Polestar', models: [
    { id: 5001, name: '1' }, { id: 5002, name: '2' }, { id: 5003, name: '3' }, { id: 5004, name: '4' },
  ]},
  { id: 51, name: 'Porsche', models: [
    { id: 5101, name: '718 Boxster' }, { id: 5102, name: '718 Cayman' }, { id: 5103, name: '911' },
    { id: 5104, name: 'Cayenne' }, { id: 5105, name: 'Macan' }, { id: 5106, name: 'Panamera' },
    { id: 5107, name: 'Taycan' },
  ]},
  { id: 52, name: 'Renault', models: [
    { id: 5201, name: 'Arkana' }, { id: 5202, name: 'Austral' }, { id: 5203, name: 'Captur' },
    { id: 5204, name: 'Clio' }, { id: 5205, name: 'Espace' }, { id: 5206, name: 'Fluence' },
    { id: 5207, name: 'Grand Scénic' }, { id: 5208, name: 'Kadjar' }, { id: 5209, name: 'Kangoo' },
    { id: 5210, name: 'Koleos' }, { id: 5211, name: 'Laguna' }, { id: 5212, name: 'Latitude' },
    { id: 5213, name: 'Master' }, { id: 5214, name: 'Mégane' }, { id: 5215, name: 'Mégane E-Tech' },
    { id: 5216, name: 'Modus' }, { id: 5217, name: 'Scénic' }, { id: 5218, name: 'Talisman' },
    { id: 5219, name: 'Thalia' }, { id: 5220, name: 'Trafic' }, { id: 5221, name: 'Twingo' },
    { id: 5222, name: 'Vel Satis' }, { id: 5223, name: 'Wind' }, { id: 5224, name: 'ZOE' },
    { id: 5225, name: 'Rafale' },
  ]},
  { id: 53, name: 'Rolls-Royce', models: [
    { id: 5301, name: 'Cullinan' }, { id: 5302, name: 'Dawn' }, { id: 5303, name: 'Ghost' },
    { id: 5304, name: 'Phantom' }, { id: 5305, name: 'Wraith' }, { id: 5306, name: 'Spectre' },
  ]},
  { id: 54, name: 'Rover', models: [
    { id: 5401, name: '25' }, { id: 5402, name: '45' }, { id: 5403, name: '75' },
  ]},
  { id: 55, name: 'Saab', models: [
    { id: 5501, name: '9-3' }, { id: 5502, name: '9-5' },
  ]},
  { id: 56, name: 'SEAT', models: [
    { id: 5601, name: 'Alhambra' }, { id: 5602, name: 'Altea' }, { id: 5603, name: 'Arona' },
    { id: 5604, name: 'Arosa' }, { id: 5605, name: 'Ateca' }, { id: 5606, name: 'Córdoba' },
    { id: 5607, name: 'Exeo' }, { id: 5608, name: 'Ibiza' }, { id: 5609, name: 'Leon' },
    { id: 5610, name: 'Mii' }, { id: 5611, name: 'Tarraco' }, { id: 5612, name: 'Toledo' },
  ]},
  { id: 57, name: 'Škoda', models: [
    { id: 5701, name: 'Citigo' }, { id: 5702, name: 'Enyaq' }, { id: 5703, name: 'Enyaq Coupé' },
    { id: 5704, name: 'Fabia' }, { id: 5705, name: 'Felicia' }, { id: 5706, name: 'Kamiq' },
    { id: 5707, name: 'Karoq' }, { id: 5708, name: 'Kodiaq' }, { id: 5709, name: 'Octavia' },
    { id: 5710, name: 'Rapid' }, { id: 5711, name: 'Roomster' }, { id: 5712, name: 'Scala' },
    { id: 5713, name: 'Superb' }, { id: 5714, name: 'Yeti' }, { id: 5715, name: 'Elroq' },
    { id: 5716, name: 'Epiq' },
  ]},
  { id: 58, name: 'Smart', models: [
    { id: 5801, name: 'Forfour' }, { id: 5802, name: 'Fortwo' }, { id: 5803, name: '#1' },
    { id: 5804, name: '#3' },
  ]},
  { id: 59, name: 'SsangYong', models: [
    { id: 5901, name: 'Actyon' }, { id: 5902, name: 'Korando' }, { id: 5903, name: 'Kyron' },
    { id: 5904, name: 'Musso' }, { id: 5905, name: 'Rexton' }, { id: 5906, name: 'Tivoli' },
    { id: 5907, name: 'Torres' }, { id: 5908, name: 'XLV' },
  ]},
  { id: 60, name: 'Subaru', models: [
    { id: 6001, name: 'BRZ' }, { id: 6002, name: 'Crosstrek' }, { id: 6003, name: 'Forester' },
    { id: 6004, name: 'Impreza' }, { id: 6005, name: 'Legacy' }, { id: 6006, name: 'Levorg' },
    { id: 6007, name: 'Outback' }, { id: 6008, name: 'Solterra' }, { id: 6009, name: 'WRX' },
    { id: 6010, name: 'XV' },
  ]},
  { id: 61, name: 'Suzuki', models: [
    { id: 6101, name: 'Across' }, { id: 6102, name: 'Alto' }, { id: 6103, name: 'Baleno' },
    { id: 6104, name: 'Celerio' }, { id: 6105, name: 'Grand Vitara' }, { id: 6106, name: 'Ignis' },
    { id: 6107, name: 'Jimny' }, { id: 6108, name: 'Kizashi' }, { id: 6109, name: 'Liana' },
    { id: 6110, name: 'S-Cross' }, { id: 6111, name: 'Splash' }, { id: 6112, name: 'Swift' },
    { id: 6113, name: 'SX4' }, { id: 6114, name: 'SX4 S-Cross' }, { id: 6115, name: 'Vitara' },
    { id: 6116, name: 'Wagon R' },
  ]},
  { id: 62, name: 'Tesla', models: [
    { id: 6201, name: 'Model 3' }, { id: 6202, name: 'Model S' }, { id: 6203, name: 'Model X' },
    { id: 6204, name: 'Model Y' }, { id: 6205, name: 'Cybertruck' },
  ]},
  { id: 63, name: 'Toyota', models: [
    { id: 6301, name: 'Auris' }, { id: 6302, name: 'Avensis' }, { id: 6303, name: 'Aygo' },
    { id: 6304, name: 'Aygo X' }, { id: 6305, name: 'bZ4X' }, { id: 6306, name: 'C-HR' },
    { id: 6307, name: 'Camry' }, { id: 6308, name: 'Corolla' }, { id: 6309, name: 'Corolla Cross' },
    { id: 6310, name: 'GR86' }, { id: 6311, name: 'GT86' }, { id: 6312, name: 'Highlander' },
    { id: 6313, name: 'Hilux' }, { id: 6314, name: 'Land Cruiser' }, { id: 6315, name: 'Mirai' },
    { id: 6316, name: 'Prius' }, { id: 6317, name: 'ProAce' }, { id: 6318, name: 'ProAce City' },
    { id: 6319, name: 'RAV4' }, { id: 6320, name: 'Supra' }, { id: 6321, name: 'Urban Cruiser' },
    { id: 6322, name: 'Verso' }, { id: 6323, name: 'Yaris' }, { id: 6324, name: 'Yaris Cross' },
  ]},
  { id: 64, name: 'Volkswagen', models: [
    { id: 6401, name: 'Amarok' }, { id: 6402, name: 'Arteon' }, { id: 6403, name: 'Beetle' },
    { id: 6404, name: 'Caddy' }, { id: 6405, name: 'California' }, { id: 6406, name: 'Caravelle' },
    { id: 6407, name: 'CC' }, { id: 6408, name: 'Crafter' }, { id: 6409, name: 'e-Golf' },
    { id: 6410, name: 'e-Up!' }, { id: 6411, name: 'Eos' }, { id: 6412, name: 'Fox' },
    { id: 6413, name: 'Golf' }, { id: 6414, name: 'Golf Plus' }, { id: 6415, name: 'Golf Sportsvan' },
    { id: 6416, name: 'ID.3' }, { id: 6417, name: 'ID.4' }, { id: 6418, name: 'ID.5' },
    { id: 6419, name: 'ID.7' }, { id: 6420, name: 'ID. Buzz' }, { id: 6421, name: 'Jetta' },
    { id: 6422, name: 'Multivan' }, { id: 6423, name: 'Passat' }, { id: 6424, name: 'Phaeton' },
    { id: 6425, name: 'Polo' }, { id: 6426, name: 'Scirocco' }, { id: 6427, name: 'Sharan' },
    { id: 6428, name: 'T-Cross' }, { id: 6429, name: 'T-Roc' }, { id: 6430, name: 'Taigo' },
    { id: 6431, name: 'Tiguan' }, { id: 6432, name: 'Tiguan Allspace' }, { id: 6433, name: 'Touareg' },
    { id: 6434, name: 'Touran' }, { id: 6435, name: 'Transporter' }, { id: 6436, name: 'Up!' },
  ]},
  { id: 65, name: 'Volvo', models: [
    { id: 6501, name: 'C30' }, { id: 6502, name: 'C40' }, { id: 6503, name: 'C70' },
    { id: 6504, name: 'EX30' }, { id: 6505, name: 'EX90' }, { id: 6506, name: 'S40' },
    { id: 6507, name: 'S60' }, { id: 6508, name: 'S80' }, { id: 6509, name: 'S90' },
    { id: 6510, name: 'V40' }, { id: 6511, name: 'V50' }, { id: 6512, name: 'V60' },
    { id: 6513, name: 'V60 Cross Country' }, { id: 6514, name: 'V70' }, { id: 6515, name: 'V90' },
    { id: 6516, name: 'V90 Cross Country' }, { id: 6517, name: 'XC40' }, { id: 6518, name: 'XC60' },
    { id: 6519, name: 'XC70' }, { id: 6520, name: 'XC90' },
  ]},
  { id: 66, name: 'BYD', models: [
    { id: 6601, name: 'Atto 3' }, { id: 6602, name: 'Dolphin' }, { id: 6603, name: 'Han' },
    { id: 6604, name: 'Seal' }, { id: 6605, name: 'Tang' },
  ]},
  { id: 67, name: 'Lynk & Co', models: [
    { id: 6701, name: '01' },
  ]},
  { id: 68, name: 'ORA', models: [
    { id: 6801, name: 'Funky Cat' },
  ]},
  { id: 69, name: 'NIO', models: [
    { id: 6901, name: 'EL6' }, { id: 6902, name: 'EL7' }, { id: 6903, name: 'ET5' },
    { id: 6904, name: 'ET7' },
  ]},
  { id: 70, name: 'Aiways', models: [
    { id: 7001, name: 'U5' }, { id: 7002, name: 'U6' },
  ]},
  { id: 71, name: 'XPeng', models: [
    { id: 7101, name: 'G9' }, { id: 7102, name: 'P5' }, { id: 7103, name: 'P7' },
  ]},
  { id: 72, name: 'GWM', models: [
    { id: 7201, name: 'Ora 03' }, { id: 7202, name: 'WEY Coffee 01' },
  ]},
  { id: 73, name: 'Abarth', models: [
    { id: 7301, name: '500' }, { id: 7302, name: '595' }, { id: 7303, name: '695' },
  ]},
  { id: 74, name: 'Alpine', models: [
    { id: 7401, name: 'A110' },
  ]},
  { id: 75, name: 'Aston Martin', models: [
    { id: 7501, name: 'DB9' }, { id: 7502, name: 'DB11' }, { id: 7503, name: 'DBS' },
    { id: 7504, name: 'DBX' }, { id: 7505, name: 'Rapide' }, { id: 7506, name: 'Vantage' },
    { id: 7507, name: 'Vanquish' },
  ]},
  { id: 76, name: 'DFSK', models: [
    { id: 7601, name: 'Seres 3' }, { id: 7602, name: 'Glory 580' },
  ]},
  { id: 77, name: 'Maxus', models: [
    { id: 7701, name: 'Deliver 9' }, { id: 7702, name: 'eDeliver 3' }, { id: 7703, name: 'T90' },
  ]},
  { id: 78, name: 'RAM', models: [
    { id: 7801, name: '1500' }, { id: 7802, name: '2500' }, { id: 7803, name: '3500' },
  ]},
  { id: 79, name: 'Tatra', models: [
    { id: 7901, name: 'Phoenix' }, { id: 7902, name: 'T815' },
  ]},
  { id: 80, name: 'Wiesmann', models: [
    { id: 8001, name: 'GT MF4' }, { id: 8002, name: 'GT MF5' },
  ]},
];
