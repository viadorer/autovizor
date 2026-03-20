// ============================================================
// Mock data pro vývoj bez Supabase
// Generuje realistická data vozidel
// ============================================================

import type { Vehicle } from '../types';
import { MANUFACTURERS } from './manufacturers';

// Hlavní značky pro generování mock dat (nejprodávanější v ČR)
const MOCK_MANUFACTURERS = MANUFACTURERS.filter((m) =>
  [2, 5, 12, 20, 21, 23, 25, 31, 40, 42, 47, 48, 49, 52, 57, 61, 62, 63, 64, 65].includes(m.id)
);

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=640&h=480&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=640&h=480&fit=crop',
];

const SELLERS = [
  { name: 'Auto Palace Praha', type: 'dealer', rating: 4.7, reviews: 243 },
  { name: 'AAA Auto Brno', type: 'dealer', rating: 4.2, reviews: 187 },
  { name: 'Autocentrum Plzeň', type: 'dealer', rating: 4.5, reviews: 96 },
  { name: 'CarPoint Ostrava', type: 'dealer', rating: 4.3, reviews: 154 },
  { name: 'Premium Cars Praha', type: 'dealer', rating: 4.8, reviews: 312 },
  { name: 'Jan Novák', type: 'private', rating: undefined, reviews: 0 },
  { name: 'Petr Svoboda', type: 'private', rating: undefined, reviews: 0 },
  { name: 'AutoMax Liberec', type: 'dealer', rating: 4.1, reviews: 67 },
];

const REGIONS = [47, 72, 65, 12, 28, 1, 22, 32, 42, 50];
const REGION_NAMES: Record<number, string> = {
  47: 'Praha', 72: 'Brno', 65: 'Ostrava', 12: 'Plzeň',
  28: 'Hradec Králové', 1: 'České Budějovice', 22: 'Liberec',
  32: 'Pardubice', 42: 'Olomouc', 50: 'Kladno',
};

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PRICE_RATINGS: Array<'very_good' | 'good' | 'fair' | 'high'> = ['very_good', 'good', 'fair', 'high'];

// WMI kódy pro generování VIN dle výrobce
const MANUFACTURER_WMI: Record<number, string[]> = {
  2: ['WAU', 'WUA'], // Audi
  5: ['WBA', 'WBS'], // BMW
  12: ['1FA', 'WF0'], // Ford
  20: ['WDD', 'WDB'], // Mercedes-Benz
  21: ['SAJ', 'SAL'], // Jaguar / Land Rover (fallback)
  23: ['WVW', 'WV2'], // Volkswagen (used for Seat too)
  25: ['TMB', 'TMP'], // Škoda
  31: ['VF1', 'VF7'], // Renault / Peugeot / Citroën
  40: ['TRU', 'TMB'], // Škoda fallback
  42: ['ZFA', 'ZAR'], // Fiat / Alfa Romeo
  47: ['JTD', 'JTE'], // Toyota
  48: ['WVW', 'WV1'], // VW
  49: ['WF0', '1FA'], // Ford
  52: ['VF3', 'VF7'], // Peugeot
  57: ['SAL', 'SAJ'], // Land Rover
  61: ['WDB', 'WDD'], // Mercedes fallback
  62: ['KMH', 'KNA'], // Hyundai / Kia
  63: ['KNA', 'KMH'], // Kia / Hyundai
  64: ['SJN', 'VSS'], // Nissan / Seat
  65: ['WVW', 'WV2'], // VW fallback
};

const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; // no I, O, Q

function generateVIN(manufacturerId: number): string {
  const wmis = MANUFACTURER_WMI[manufacturerId] || ['WBA'];
  const wmi = pick(wmis);
  let vin = wmi;
  for (let i = 3; i < 17; i++) {
    vin += VIN_CHARS[Math.floor(Math.random() * VIN_CHARS.length)];
  }
  return vin;
}

const CZECH_DESCRIPTIONS = [
  'Vůz v perfektním stavu, pravidelně servisovaný u autorizovaného dealera. Nebourané, nekuřácké.',
  'Velmi zachovalý automobil s kompletní historií servisu. Nový set zimních pneumatik v ceně.',
  'Auto po prvním majiteli, garáži garážované. Žádné investice nutné, ihned k převzetí.',
  'Elegantní vůz s bohatou výbavou včetně navigace a vyhřívaných sedadel. STK platná.',
  'Spolehlivý a úsporný automobil ideální do města i na delší cesty. Nízká spotřeba.',
  'Rodinné auto s velkým zavazadlovým prostorem. Klimatizace, tempomat, parkovací senzory.',
  'Sportovní design s dynamickým motorem. Odpočet DPH možný. Původ ČR.',
  'Prémiový automobil v nadstandardní výbavě. Kožené sedačky, panoramatická střecha.',
  'Nízký nájezd, výborný technický stav. Vůz je pravidelně umýván a ošetřován.',
  'Původní lak, bez koroze. Veškerá dokumentace k dispozici včetně servisní knížky.',
  'Jedná se o velmi dobře udržovaný vůz s minimálním opotřebením. Bez nutnosti dalších investic.',
  'Auto je vybaveno moderními asistenčními systémy. Adaptivní tempomat, LED světla.',
];

const NOTES = [
  'Možnost financování na splátky.',
  'Výměna za jiný vůz možná.',
  'Cena k jednání při rychlém odběru.',
  'Drobná kosmetická vada na zadním nárazníku.',
  'Nové brzdy a olej vyměněn.',
  'Možnost prohlídky kdykoliv po domluvě.',
  '',
  '',
  '',
];

function generateSellerEmail(name: string): string {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
  const domains = ['email.cz', 'seznam.cz', 'centrum.cz', 'autobazar.cz', 'gmail.com'];
  return `${normalized}@${pick(domains)}`;
}

function generateCzechPhone(): string {
  const prefix = pick(['601', '602', '603', '604', '605', '606', '607', '608', '702', '720', '721', '723', '724', '725', '730', '731', '732', '733', '734', '736', '737', '770', '771', '772', '773', '774', '775', '776', '777']);
  const rest = String(rand(100000, 999999));
  return `+420 ${prefix} ${rest.slice(0, 3)} ${rest.slice(3)}`;
}

function generateSTKDate(): string {
  const now = new Date();
  const futureMs = now.getTime() + rand(30, 730) * 86400000;
  const d = new Date(futureMs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateVehicle(id: number): Vehicle {
  const mfr = pick(MOCK_MANUFACTURERS);
  const model = pick(mfr.models);
  const year = rand(2010, 2025);
  const month = rand(1, 12);
  const km = year >= 2023 ? rand(0, 30000) : rand(10000, 250000);
  const fuel = pick([1, 1, 2, 2, 2, 3, 4, 5]);
  const gearbox = pick([1, 1, 3, 3]);
  const power = rand(55, 250);
  const price = Math.round((rand(80, 3000) * 1000) / 10000) * 10000;
  const color = rand(1, 17);
  const condition = km < 1000 ? 1 : 2;
  const region = pick(REGIONS);
  const seller = pick(SELLERS);
  const imgIdx = id % MOCK_IMAGES.length;
  const isCrashed = Math.random() < 0.08;

  const colorNames: Record<number, string> = {
    1: 'Bílá', 2: 'Žlutá', 3: 'Oranžová', 4: 'Červená', 5: 'Vínová',
    6: 'Růžová', 7: 'Fialová', 8: 'Modrá', 9: 'Zelená', 10: 'Hnědá',
    11: 'Šedá', 12: 'Černá', 13: 'Béžová', 14: 'Stříbrná', 15: 'Zlatá',
    16: 'Jiná', 17: 'Bronzová',
  };
  const fuelNames: Record<number, string> = {
    1: 'Benzín', 2: 'Nafta', 3: 'LPG + benzín', 4: 'Elektro',
    5: 'Hybridní', 6: 'CNG + benzín', 7: 'Ethanol', 8: 'Jiné', 9: 'Vodík',
  };
  const gearboxNames: Record<number, string> = {
    1: 'Manuální', 2: 'Poloautomatická', 3: 'Automatická',
  };
  const conditionNames: Record<number, string> = {
    1: 'Nové', 2: 'Ojeté', 3: 'Havarované', 4: 'Předváděcí', 5: 'Veterán',
  };

  const note = pick(NOTES);
  const ownerCountId = pick([1, 1, 1, 2, 2, 3, 4]);

  return {
    id,
    sauto_id: 400000 + id,
    title: `${mfr.name} ${model.name}`,
    kind_id: 1,
    manufacturer_id: mfr.id,
    model_id: model.id,
    body_type_id: rand(1, 19),
    condition_id: condition,
    price,
    fuel_type_id: fuel,
    gearbox_id: gearbox,
    gearbox_level_id: gearbox === 1 ? pick([5, 6]) : pick([3, 4, 5, 6, 7, 8]),
    drive_id: pick([1, 2, 9, 10]),
    engine_volume: fuel === 4 ? undefined : rand(1000, 3500),
    engine_power: power,
    engine_power_ps: Math.round(power * 1.36),
    tachometer: km,
    made_year: year,
    made_month: month,
    color_id: color,
    color_tone_id: pick([1, 2]),
    color_type_id: rand(1, 5),
    door_count_id: pick([3, 4, 5]),
    capacity_id: 5,
    aircondition_id: pick([2, 3, 4]),
    euro_id: year >= 2016 ? 6 : year >= 2011 ? 5 : 4,
    region_id: region,
    country_id: pick([1, 1, 1, 1, 1, 1, 1, 1, 2, 3]),
    servicebook_id: pick([1, 1, 2]),
    upholstery_id: rand(1, 9),
    owner_count_id: ownerCountId,
    deal_type_id: pick([1, 1, 1, 1, 2]),
    vin: generateVIN(mfr.id),
    description: pick(CZECH_DESCRIPTIONS),
    note: note || undefined,
    stk_date: generateSTKDate(),
    gas_mileage: fuel === 4 ? undefined : Math.round((rand(40, 120) / 10) * 10) / 10,
    weight: rand(1000, 2500),
    first_owner: ownerCountId === 1 ? 1 : 2,
    crashed: isCrashed,
    seller_name: seller.name,
    seller_phone: generateCzechPhone(),
    seller_email: generateSellerEmail(seller.name),
    seller_type: seller.type,
    seller_rating: seller.rating,
    seller_review_count: seller.reviews,
    images: Array.from({ length: rand(3, 8) }, (_, i) => ({
      url: MOCK_IMAGES[(imgIdx + i) % MOCK_IMAGES.length],
      thumbnail_url: MOCK_IMAGES[(imgIdx + i) % MOCK_IMAGES.length],
      order: i,
    })),
    image_count: rand(3, 8),
    main_image_url: MOCK_IMAGES[imgIdx],
    main_thumbnail_url: MOCK_IMAGES[imgIdx],
    price_rating: pick(PRICE_RATINGS),
    is_top: id % 7 === 0,
    is_promoted: id % 5 === 0,
    is_active: true,
    views_count: rand(10, 5000),
    created_at: new Date(Date.now() - rand(0, 30) * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    manufacturer_name: mfr.name,
    model_name: model.name,
    fuel_name: fuelNames[fuel],
    gearbox_name: gearboxNames[gearbox],
    color_name: colorNames[color],
    condition_name: conditionNames[condition],
    region_name: REGION_NAMES[region],
    vat_deductible: id % 3 === 0,
    first_registration: `${year}-${String(month).padStart(2, '0')}-01`,
  };
}

// Generujeme 100 mocků pro demo
let _cache: Vehicle[] | null = null;

export function getMockVehicles(count = 100): Vehicle[] {
  if (_cache && _cache.length === count) return _cache;
  _cache = Array.from({ length: count }, (_, i) => generateVehicle(i + 1));
  return _cache;
}

export function getMockVehicle(id: number): Vehicle | undefined {
  const vehicles = getMockVehicles();
  return vehicles.find((v) => v.id === id);
}

export function searchMockVehicles(
  filters: Record<string, unknown>,
  page = 1,
  perPage = 20,
  sortBy = 'created_at'
): { vehicles: Vehicle[]; total_count: number } {
  let results = getMockVehicles(200);

  // Filtry
  if (filters.manufacturer_id) {
    results = results.filter((v) => v.manufacturer_id === filters.manufacturer_id);
  }
  if (filters.model_id) {
    results = results.filter((v) => v.model_id === filters.model_id);
  }
  if (filters.fuel_type_id) {
    results = results.filter((v) => v.fuel_type_id === filters.fuel_type_id);
  }
  if (filters.gearbox_id) {
    results = results.filter((v) => v.gearbox_id === filters.gearbox_id);
  }
  if (filters.price_from) {
    results = results.filter((v) => v.price >= (filters.price_from as number));
  }
  if (filters.price_to) {
    results = results.filter((v) => v.price <= (filters.price_to as number));
  }
  if (filters.year_from) {
    results = results.filter((v) => (v.made_year ?? 0) >= (filters.year_from as number));
  }
  if (filters.year_to) {
    results = results.filter((v) => (v.made_year ?? 9999) <= (filters.year_to as number));
  }
  if (filters.km_to) {
    results = results.filter((v) => v.tachometer <= (filters.km_to as number));
  }
  if (filters.color_id) {
    results = results.filter((v) => v.color_id === filters.color_id);
  }
  if (filters.condition_id) {
    results = results.filter((v) => v.condition_id === filters.condition_id);
  }
  if (filters.region_id) {
    results = results.filter((v) => v.region_id === filters.region_id);
  }
  if (filters.query) {
    const q = (filters.query as string).toLowerCase();
    results = results.filter(
      (v) => v.title.toLowerCase().includes(q) || v.manufacturer_name?.toLowerCase().includes(q)
    );
  }

  // Řazení
  results.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'year_desc': return (b.made_year ?? 0) - (a.made_year ?? 0);
      case 'year_asc': return (a.made_year ?? 0) - (b.made_year ?? 0);
      case 'km_asc': return a.tachometer - b.tachometer;
      case 'km_desc': return b.tachometer - a.tachometer;
      case 'power_desc': return (b.engine_power ?? 0) - (a.engine_power ?? 0);
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const total = results.length;
  const offset = (page - 1) * perPage;
  return {
    vehicles: results.slice(offset, offset + perPage),
    total_count: total,
  };
}

// Pro dropdowny ve filtrech a SearchBaru používáme kompletní seznam
export const MOCK_MANUFACTURERS_LIST = MANUFACTURERS;
