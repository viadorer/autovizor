// ============================================================
// VIN Decoder - dekódování vlastností vozidla z VIN kódu
// Kombinace offline WMI tabulky + NHTSA vPIC API (zdarma)
// ============================================================

// WMI (World Manufacturer Identifier) - první 3 znaky VIN
// Mapování na výrobce (nejběžnější v Evropě/ČR)
const WMI_MAP: Record<string, string> = {
  // Alfa Romeo
  ZAR: 'Alfa Romeo',
  // Audi
  WAU: 'Audi', WUA: 'Audi', TRU: 'Audi',
  // BMW
  WBA: 'BMW', WBS: 'BMW M', WBY: 'BMW i', '4US': 'BMW',
  // BYD
  LGB: 'BYD',
  // Citroën
  VF7: 'Citroën', VR7: 'Citroën',
  // Cupra
  VSS: 'SEAT/Cupra',
  // Dacia
  UU1: 'Dacia',
  // DS
  VR1: 'DS',
  // Ferrari
  ZFF: 'Ferrari',
  // Fiat
  ZFA: 'Fiat', ZFC: 'Fiat',
  // Ford
  WF0: 'Ford', '1FA': 'Ford', '1FT': 'Ford', '3FA': 'Ford',
  // Genesis
  KMT: 'Genesis',
  // Honda
  SHH: 'Honda', '1HG': 'Honda', '2HG': 'Honda',
  // Hyundai
  KMH: 'Hyundai', TMA: 'Hyundai', '5NP': 'Hyundai',
  // Jaguar
  SAJ: 'Jaguar',
  // Jeep
  '1C4': 'Jeep', '1J4': 'Jeep', '1J8': 'Jeep',
  // Kia
  KNA: 'Kia', KNB: 'Kia', KNC: 'Kia', KND: 'Kia', '5XY': 'Kia',
  // Lamborghini
  ZHW: 'Lamborghini',
  // Land Rover
  SAL: 'Land Rover',
  // Lexus
  JTH: 'Lexus', '2T2': 'Lexus',
  // Maserati
  ZAM: 'Maserati',
  // Mazda
  JM1: 'Mazda', JMZ: 'Mazda', '1YV': 'Mazda',
  // McLaren
  SBM: 'McLaren',
  // Mercedes-Benz
  WDB: 'Mercedes-Benz', WDC: 'Mercedes-Benz', WDD: 'Mercedes-Benz',
  WDF: 'Mercedes-Benz', W1K: 'Mercedes-Benz', W1N: 'Mercedes-Benz',
  W1V: 'Mercedes-Benz', '4JG': 'Mercedes-Benz',
  // MG
  LSD: 'MG', SAR: 'MG',
  // MINI
  WMW: 'MINI',
  // Mitsubishi
  JMB: 'Mitsubishi', JMY: 'Mitsubishi', JA3: 'Mitsubishi',
  // Nissan
  JN1: 'Nissan', VSK: 'Nissan', '1N4': 'Nissan', '5N1': 'Nissan',
  // Opel
  W0L: 'Opel', W0V: 'Opel',
  // Peugeot
  VF3: 'Peugeot', VR3: 'Peugeot',
  // Polestar
  LPS: 'Polestar',
  // Porsche
  WP0: 'Porsche', WP1: 'Porsche',
  // Renault
  VF1: 'Renault', VF6: 'Renault',
  // Rolls-Royce
  SCA: 'Rolls-Royce',
  // SEAT
  VSE: 'SEAT',
  // Škoda
  TMB: 'Škoda', TMP: 'Škoda', TMT: 'Škoda',
  // Smart
  WME: 'Smart',
  // SsangYong
  KPT: 'SsangYong',
  // Subaru
  JF1: 'Subaru', JF2: 'Subaru', '4S3': 'Subaru', '4S4': 'Subaru',
  // Suzuki
  JSA: 'Suzuki', TSM: 'Suzuki', JS1: 'Suzuki',
  // Tesla
  '5YJ': 'Tesla', '7SA': 'Tesla', 'LRW': 'Tesla',
  // Toyota
  JTD: 'Toyota', JTE: 'Toyota', JTN: 'Toyota',
  SB1: 'Toyota', '1NX': 'Toyota', '2T1': 'Toyota', '4T1': 'Toyota',
  // Volkswagen
  WVW: 'Volkswagen', WVG: 'Volkswagen', WV1: 'Volkswagen',
  WV2: 'Volkswagen', '1VW': 'Volkswagen', '3VW': 'Volkswagen',
  // Volvo
  YV1: 'Volvo', YV4: 'Volvo', YV2: 'Volvo',
};

// Rok výroby - pozice 10 VIN
// VIN year codes repeat every 30 years — we resolve ambiguity using position 7
// (model year indicator in some manufacturers) or default to the newer cycle
const YEAR_CODES_NEW: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014,
  F: 2015, G: 2016, H: 2017, J: 2018, K: 2019,
  L: 2020, M: 2021, N: 2022, P: 2023, R: 2024,
  S: 2025, T: 2026, V: 2027, W: 2028, X: 2029,
  Y: 2030,
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

const YEAR_CODES_OLD: Record<string, number> = {
  A: 1980, B: 1981, C: 1982, D: 1983, E: 1984,
  F: 1985, G: 1986, H: 1987, J: 1988, K: 1989,
  L: 1990, M: 1991, N: 1992, P: 1993, R: 1994,
  S: 1995, T: 1996, V: 1997, W: 1998, X: 1999,
  Y: 2000,
};

function decodeYear(vin: string): number | undefined {
  const yearChar = vin[9];
  // Prefer newer cycle by default (more likely to be searching for recent cars)
  return YEAR_CODES_NEW[yearChar] ?? YEAR_CODES_OLD[yearChar];
}

// Položka výbavy z VIN
export interface VinEquipmentItem {
  name: string;
  category?: string;
  code?: string; // OEM kód (např. PR kód u VW Group)
}

// Výsledek dekódování
export interface VinDecodeResult {
  valid: boolean;
  vin: string;
  source?: 'offline' | 'nhtsa' | 'vindecoder';
  // Offline dekódování (WMI)
  manufacturer?: string;
  year?: number;
  country?: string;
  // Z API
  model?: string;
  model_variant?: string;
  body_type?: string;
  fuel_type?: string;
  engine_volume?: string;
  engine_power?: string;
  drive_type?: string;
  gearbox?: string;
  door_count?: string;
  // Rozšířené údaje (vindecoder.eu)
  color?: string;
  capacity?: string;
  weight?: string;
  top_speed?: string;
  acceleration?: string;
  co2_emissions?: string;
  fuel_consumption?: string;
  // Výbava z VIN
  equipment?: VinEquipmentItem[];
  // Surová data z API
  raw?: Record<string, string>;
  error?: string;
}

// Země původu podle prvního znaku VIN
function getCountryFromVin(vin: string): string | undefined {
  const c = vin[0];
  if ('ABCDEFGH'.includes(c)) return 'Afrika';
  if (c === 'J') return 'Japonsko';
  if (c === 'K') return 'Jižní Korea';
  if (c === 'L') return 'Čína';
  if ('MNP'.includes(c)) return 'Asie';
  if ('ST'.includes(c)) return 'Velká Británie';
  if (c === 'U') return 'Rumunsko';
  if (c === 'V') return 'Francie/Španělsko';
  if (c === 'W') return 'Německo';
  if (c === 'X') return 'Rusko';
  if (c === 'Y') return 'Švédsko/Finsko';
  if (c === 'Z') return 'Itálie';
  if ('12345'.includes(c)) return 'USA';
  if (c === '3') return 'Mexiko';
  if (c === '6' || c === '7') return 'Austrálie';
  if (c === '8') return 'Argentina/Brazílie';
  if (c === '9') return 'Brazílie';
  return undefined;
}

// Validace VIN (17 znaků, bez I/O/Q)
export function validateVin(vin: string): { valid: boolean; error?: string } {
  if (!vin) return { valid: false, error: 'VIN je povinný' };

  const cleaned = vin.toUpperCase().replace(/[\s-]/g, '');

  if (cleaned.length !== 17) {
    return { valid: false, error: `VIN musí mít 17 znaků (zadáno ${cleaned.length})` };
  }

  if (/[IOQ]/.test(cleaned)) {
    return { valid: false, error: 'VIN nesmí obsahovat písmena I, O, Q' };
  }

  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
    return { valid: false, error: 'VIN obsahuje neplatné znaky' };
  }

  return { valid: true };
}

// Offline dekódování - WMI + rok
export function decodeVinOffline(vin: string): VinDecodeResult {
  const validation = validateVin(vin);
  if (!validation.valid) {
    return { valid: false, vin, error: validation.error };
  }

  const cleaned = vin.toUpperCase().replace(/[\s-]/g, '');
  const wmi = cleaned.substring(0, 3);

  return {
    valid: true,
    vin: cleaned,
    manufacturer: WMI_MAP[wmi],
    year: decodeYear(cleaned),
    country: getCountryFromVin(cleaned),
  };
}

// NHTSA vPIC API - kompletní dekódování (zdarma, bez API klíče)
export async function decodeVinNHTSA(vin: string): Promise<VinDecodeResult> {
  const offline = decodeVinOffline(vin);
  if (!offline.valid) return offline;

  const cleaned = offline.vin;

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${cleaned}?format=json`
    );

    if (!response.ok) {
      return { ...offline, error: 'Chyba při volání NHTSA API' };
    }

    const data = await response.json();
    const result = data.Results?.[0];

    if (!result) {
      return { ...offline, error: 'Žádná data z API' };
    }

    // Mapování NHTSA hodnot
    const raw: Record<string, string> = {};
    for (const [key, value] of Object.entries(result)) {
      if (value && typeof value === 'string' && value.trim() !== '' && value !== 'Not Applicable') {
        raw[key] = value;
      }
    }

    // Mapování paliva z NHTSA
    const fuelMap: Record<string, string> = {
      Gasoline: 'Benzín',
      Diesel: 'Nafta',
      Electric: 'Elektro',
      'Plug-in Hybrid (PHEV)': 'Hybridní',
      'Hybrid': 'Hybridní',
      'Compressed Natural Gas (CNG)': 'CNG + benzín',
      'Liquefied Petroleum Gas (LPG)': 'LPG + benzín',
      Ethanol: 'Ethanol',
      Hydrogen: 'Vodík',
    };

    // Mapování převodovky
    const gearboxMap: Record<string, string> = {
      Manual: 'Manuální',
      Automatic: 'Automatická',
      'Semi-Automatic': 'Poloautomatická',
      CVT: 'Automatická',
      'Dual-Clutch': 'Automatická',
      'Automated Manual': 'Automatická',
    };

    // Mapování pohonu
    const driveMap: Record<string, string> = {
      FWD: 'Přední',
      'Front-Wheel Drive': 'Přední',
      RWD: 'Zadní',
      'Rear-Wheel Drive': 'Zadní',
      AWD: '4x4',
      'All-Wheel Drive': '4x4',
      '4WD': '4x4',
      '4x2': 'Přední',
      '4x4': '4x4',
    };

    // Mapování karoserie
    const bodyMap: Record<string, string> = {
      Sedan: 'Sedan',
      Hatchback: 'Hatchback',
      'Station Wagon': 'Kombi',
      'Sport Utility Vehicle (SUV)': 'SUV',
      Coupe: 'Kupé',
      Convertible: 'Kabriolet',
      Pickup: 'Pick-up',
      Van: 'Dodávka',
      Minivan: 'MPV',
      Wagon: 'Kombi',
      'Crossover Utility Vehicle (CUV)': 'SUV',
    };

    // Check if NHTSA had significant errors (European VINs with ZZZ fillers)
    const errorCodes = (raw.ErrorCode || '').split(',').map((c: string) => c.trim());
    const hasErrors = errorCodes.includes('1') || errorCodes.includes('5');

    // For year: prefer offline decode if NHTSA has errors (common with EU VINs)
    const nhtsaYear = raw.ModelYear ? Number(raw.ModelYear) : undefined;
    const bestYear = (hasErrors && offline.year) ? offline.year : (nhtsaYear || offline.year);

    return {
      ...offline,
      source: 'nhtsa' as const,
      manufacturer: raw.Make || offline.manufacturer,
      model: raw.Model || undefined,
      year: bestYear,
      body_type: bodyMap[raw.BodyClass] || raw.BodyClass || undefined,
      fuel_type: fuelMap[raw.FuelTypePrimary] || raw.FuelTypePrimary || undefined,
      engine_volume: raw.DisplacementL
        ? `${Math.round(Number(raw.DisplacementL) * 1000)}`
        : undefined,
      engine_power: raw.EngineKW || (raw.EngineHP
        ? `${Math.round(Number(raw.EngineHP) * 0.7457)}`
        : undefined),
      drive_type: driveMap[raw.DriveType] || raw.DriveType || undefined,
      gearbox: gearboxMap[raw.TransmissionStyle] || raw.TransmissionStyle || undefined,
      door_count: raw.Doors || undefined,
      raw,
    };
  } catch {
    return { ...offline, error: 'Nepodařilo se spojit s NHTSA API' };
  }
}

// ============================================================
// vindecoder.eu API - kompletní dekódování + výbava (placené)
// Registrace: https://www.vindecoder.eu/my/api
// Vrací: základní údaje, technické parametry, výbavu, historii
// ============================================================

const VINDECODER_API_KEY = import.meta.env.VITE_VINDECODER_API_KEY as string | undefined;
const VINDECODER_SECRET = import.meta.env.VITE_VINDECODER_SECRET as string | undefined;

// SHA-1 hash pro vindecoder.eu autentizaci
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function isVindecoderAvailable(): boolean {
  return !!(VINDECODER_API_KEY && VINDECODER_SECRET);
}

export async function decodeVinVindecoder(vin: string): Promise<VinDecodeResult> {
  const offline = decodeVinOffline(vin);
  if (!offline.valid) return offline;

  if (!VINDECODER_API_KEY || !VINDECODER_SECRET) {
    return { ...offline, error: 'vindecoder.eu API klíč není nastaven' };
  }

  const cleaned = offline.vin;

  try {
    // vindecoder.eu vyžaduje SHA-1 hash: sha1(vin + "|" + apikey + "|" + secretkey + "|decode")
    const controlSum = await sha1(`${cleaned}|${VINDECODER_API_KEY}|${VINDECODER_SECRET}|decode`);
    const apiUrl = `https://api.vindecoder.eu/3.2/${VINDECODER_API_KEY}/${controlSum}/decode/${cleaned}.json`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      // Fallback na NHTSA pokud vindecoder selže
      console.warn('vindecoder.eu API chyba, fallback na NHTSA');
      return decodeVinNHTSA(vin);
    }

    const data = await response.json();
    const decode = data?.decode ?? [];

    // Pomocná funkce pro hledání hodnoty v decode poli
    const findValue = (label: string): string | undefined => {
      const item = decode.find((d: { label: string; value: string }) =>
        d.label.toLowerCase().includes(label.toLowerCase())
      );
      return item?.value || undefined;
    };

    // Mapování paliva
    const fuelRaw = findValue('Fuel Type') || findValue('fuel');
    const fuelMap: Record<string, string> = {
      Petrol: 'Benzín', Gasoline: 'Benzín', Benzin: 'Benzín',
      Diesel: 'Nafta', Nafta: 'Nafta',
      Electric: 'Elektro', Elektro: 'Elektro',
      Hybrid: 'Hybridní', 'Plug-in Hybrid': 'Hybridní',
      LPG: 'LPG + benzín', CNG: 'CNG + benzín',
      Hydrogen: 'Vodík',
    };

    // Mapování převodovky
    const gearboxRaw = findValue('Transmission') || findValue('Gearbox');
    const gearboxMap: Record<string, string> = {
      Manual: 'Manuální', Automatic: 'Automatická',
      'Semi-automatic': 'Poloautomatická', DSG: 'Automatická',
      CVT: 'Automatická', 'Dual clutch': 'Automatická',
      Tiptronic: 'Automatická', S_tronic: 'Automatická',
    };

    // Mapování pohonu
    const driveRaw = findValue('Drive') || findValue('Wheel Drive');
    const driveMap: Record<string, string> = {
      'Front Wheel Drive': 'Přední', FWD: 'Přední', Front: 'Přední',
      'Rear Wheel Drive': 'Zadní', RWD: 'Zadní', Rear: 'Zadní',
      'All Wheel Drive': '4x4', AWD: '4x4', '4WD': '4x4',
      '4x4': '4x4', '4MOTION': '4x4', 'quattro': '4x4', xDrive: '4x4',
    };

    // Mapování karoserie
    const bodyRaw = findValue('Body Type') || findValue('Body Style') || findValue('body');
    const bodyMap: Record<string, string> = {
      Sedan: 'Sedan', Saloon: 'Sedan', Limousine: 'Sedan',
      Hatchback: 'Hatchback', Liftback: 'Hatchback',
      Estate: 'Kombi', Wagon: 'Kombi', Kombi: 'Kombi', 'Station Wagon': 'Kombi',
      SUV: 'SUV', 'Sport Utility': 'SUV',
      Coupe: 'Kupé', Coupé: 'Kupé',
      Convertible: 'Kabriolet', Cabrio: 'Kabriolet', Cabriolet: 'Kabriolet',
      Van: 'Dodávka', MPV: 'MPV', Minivan: 'MPV',
      Pickup: 'Pick-up', 'Pick-up': 'Pick-up',
    };

    // Objem motoru
    const displacementRaw = findValue('Engine Displacement') || findValue('Displacement') || findValue('Capacity');
    let engineVolume: string | undefined;
    if (displacementRaw) {
      const num = parseFloat(displacementRaw);
      if (num < 20) {
        // Pravděpodobně v litrech, převést na ccm
        engineVolume = String(Math.round(num * 1000));
      } else {
        engineVolume = String(Math.round(num));
      }
    }

    // Výkon
    const powerRaw = findValue('Engine Power') || findValue('Power') || findValue('kW');
    let enginePower: string | undefined;
    if (powerRaw) {
      const kwMatch = powerRaw.match(/(\d+)\s*kW/i);
      const hpMatch = powerRaw.match(/(\d+)\s*(hp|PS|bhp|pk)/i);
      if (kwMatch) {
        enginePower = kwMatch[1];
      } else if (hpMatch) {
        enginePower = String(Math.round(Number(hpMatch[1]) * 0.7457));
      } else {
        const num = parseFloat(powerRaw);
        if (num > 0) enginePower = String(Math.round(num > 500 ? num * 0.7457 : num));
      }
    }

    // Výbava (equipment) - hlavní přidaná hodnota vindecoder.eu
    const equipmentItems: VinEquipmentItem[] = [];
    const equipRaw = data?.equipments ?? data?.equipment ?? [];

    // Kategorie pro výbavu z vindecoder.eu
    const categorizeEquipment = (name: string): string => {
      const lower = name.toLowerCase();
      if (lower.includes('airbag') || lower.includes('abs') || lower.includes('esp') || lower.includes('brake') || lower.includes('safety')) return 'Bezpečnost';
      if (lower.includes('assist') || lower.includes('cruise') || lower.includes('lane') || lower.includes('park') || lower.includes('camera')) return 'Asistenční systémy';
      if (lower.includes('clima') || lower.includes('air con') || lower.includes('heat') || lower.includes('comfort') || lower.includes('seat') || lower.includes('electric')) return 'Komfort';
      if (lower.includes('navi') || lower.includes('radio') || lower.includes('audio') || lower.includes('display') || lower.includes('bluetooth') || lower.includes('usb')) return 'Multimédia';
      if (lower.includes('light') || lower.includes('led') || lower.includes('xenon') || lower.includes('headlight')) return 'Světla';
      if (lower.includes('wheel') || lower.includes('alloy') || lower.includes('rim') || lower.includes('tyre') || lower.includes('tire')) return 'Exteriér';
      if (lower.includes('leather') || lower.includes('upholster') || lower.includes('interior') || lower.includes('trim')) return 'Interiér';
      if (lower.includes('roof') || lower.includes('spoiler') || lower.includes('mirror') || lower.includes('window') || lower.includes('glass')) return 'Skla a zrcátka';
      if (lower.includes('lock') || lower.includes('alarm') || lower.includes('immobil') || lower.includes('key')) return 'Zabezpečení';
      if (lower.includes('suspension') || lower.includes('steering') || lower.includes('differential')) return 'Podvozek a řízení';
      if (lower.includes('engine') || lower.includes('turbo') || lower.includes('exhaust')) return 'Motor a výfuk';
      return 'Ostatní';
    };

    if (Array.isArray(equipRaw)) {
      for (const eq of equipRaw) {
        const name = typeof eq === 'string' ? eq : (eq.name || eq.label || eq.description || '');
        const code = typeof eq === 'object' ? (eq.code || eq.pr_code || '') : '';
        if (name) {
          equipmentItems.push({
            name,
            code: code || undefined,
            category: categorizeEquipment(name),
          });
        }
      }
    }

    // Stavíme výsledek
    const result: VinDecodeResult = {
      valid: true,
      vin: cleaned,
      source: 'vindecoder',
      manufacturer: findValue('Make') || findValue('Manufacturer') || offline.manufacturer,
      model: findValue('Model') || undefined,
      model_variant: findValue('Model Variant') || findValue('Version') || findValue('Trim') || undefined,
      year: (() => {
        const y = findValue('Model Year') || findValue('Year');
        return y ? Number(y) : offline.year;
      })(),
      country: findValue('Plant Country') || findValue('Made In') || offline.country,
      body_type: bodyRaw ? (bodyMap[bodyRaw] || bodyRaw) : undefined,
      fuel_type: fuelRaw ? (fuelMap[fuelRaw] || fuelRaw) : undefined,
      engine_volume: engineVolume,
      engine_power: enginePower,
      drive_type: driveRaw ? (driveMap[driveRaw] || driveRaw) : undefined,
      gearbox: gearboxRaw ? (gearboxMap[gearboxRaw] || gearboxRaw) : undefined,
      door_count: findValue('Number of Doors') || findValue('Doors') || undefined,
      color: findValue('Color') || findValue('Exterior Color') || undefined,
      capacity: findValue('Number of Seats') || findValue('Seats') || undefined,
      weight: findValue('Gross Vehicle Weight') || findValue('Curb Weight') || undefined,
      top_speed: findValue('Top Speed') || undefined,
      acceleration: findValue('Acceleration') || findValue('0-100') || undefined,
      co2_emissions: findValue('CO2') || findValue('Emission') || undefined,
      fuel_consumption: findValue('Fuel Consumption') || findValue('Consumption') || undefined,
      equipment: equipmentItems.length > 0 ? equipmentItems : undefined,
      raw: Object.fromEntries(decode.map((d: { label: string; value: string }) => [d.label, d.value])),
    };

    return result;
  } catch (err) {
    console.warn('vindecoder.eu API chyba:', err);
    // Fallback na NHTSA
    return decodeVinNHTSA(vin);
  }
}

// Hlavní dekódovací funkce - automaticky vybere nejlepší dostupný zdroj
export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  // Pokud máme vindecoder.eu API klíč, použijeme ho (vrací výbavu)
  if (isVindecoderAvailable()) {
    return decodeVinVindecoder(vin);
  }
  // Fallback na NHTSA (zdarma, bez výbavy)
  return decodeVinNHTSA(vin);
}
