// ============================================================
// AUTOVIZOR.CZ - Kompletní číselníky ze Sauto.cz
// Staticky definované pro rychlý přístup bez DB dotazů
// ============================================================

import type { Codebook, CodebookWithCategory, Region } from '../types';

// Typ karoserie (body) - z Sauto.cz carList
export const BODY_TYPES: Codebook[] = [
  { id: 1, name: 'Hatchback' },
  { id: 2, name: 'Sedan' },
  { id: 3, name: 'Kombi' },
  { id: 4, name: 'Liftback' },
  { id: 5, name: 'MPV' },
  { id: 6, name: 'SUV' },
  { id: 7, name: 'Kupé' },
  { id: 8, name: 'Kabriolet' },
  { id: 9, name: 'Roadster' },
  { id: 10, name: 'Pickup' },
  { id: 11, name: 'Van' },
  { id: 12, name: 'Minivan' },
  { id: 13, name: 'Limuzína' },
  { id: 14, name: 'Terénní' },
  { id: 15, name: 'Mikro' },
  { id: 16, name: 'Fastback' },
  { id: 17, name: 'Targa' },
  { id: 18, name: 'Shooting Brake' },
  { id: 19, name: 'Jiné' },
];

// Odstín laku
// Odstín barvy (Sauto: color_tone)
export const COLOR_TONES: Codebook[] = [
  { id: 1, name: 'Světlá' },
  { id: 2, name: 'Tmavá' },
];

// Typ laku (Sauto: color_type) — dříve chybně v COLOR_TONES
export const COLOR_TYPES: Codebook[] = [
  { id: 1, name: 'Základní' },
  { id: 2, name: 'Metalíza' },
  { id: 3, name: 'Fólie' },
  { id: 4, name: 'Pastelová' },
  { id: 5, name: 'Perleťová' },
];

// Počet stupňů převodovky (Sauto: gearbox_level)
export const GEARBOX_LEVELS: Codebook[] = [
  { id: 3, name: '3stupňová a méně' },
  { id: 4, name: '4stupňová' },
  { id: 5, name: '5stupňová' },
  { id: 6, name: '6stupňová' },
  { id: 7, name: '7stupňová' },
  { id: 8, name: '8stupňová a více' },
];

// Kategorie sedadel autobusu (Sauto: seatplace)
export const SEATPLACE_TYPES: Codebook[] = [
  { id: 1, name: 'Do 16 sedadel' },
  { id: 2, name: '17–29 sedadel' },
  { id: 3, name: '30–39 sedadel' },
  { id: 4, name: '40–49 sedadel' },
  { id: 5, name: '50 a více sedadel' },
];

// Operativní leasing – určeno pro (Sauto: operating_lease_intended_for)
export const LEASE_INTENDED_FOR: Codebook[] = [
  { id: 1, name: 'Firma' },
  { id: 2, name: 'OSVČ' },
  { id: 3, name: 'Fyzická osoba' },
];

// Ověřené programy výrobců (Sauto: certified_id)
export const CERTIFIED_PROGRAMS: Codebook[] = [
  { id: 1, name: 'Škoda Plus' },
  { id: 2, name: 'Das WeltAuto' },
  { id: 3, name: 'BMW Premium Selection' },
  { id: 4, name: 'Mercedes-Benz Junge Sterne' },
  { id: 5, name: 'Audi Approved Plus' },
  { id: 6, name: 'Toyota Garantovaná ojetina' },
  { id: 7, name: 'Hyundai Promise' },
  { id: 8, name: 'Volvo Selekt' },
  { id: 9, name: 'Ford Approved' },
  { id: 10, name: 'Peugeot Příslib' },
  { id: 11, name: 'Kia Approved' },
  { id: 12, name: 'Renault Selection' },
];

export const FUEL_TYPES: Codebook[] = [
  { id: 1, name: 'Benzín' },
  { id: 2, name: 'Nafta' },
  { id: 3, name: 'LPG + benzín' },
  { id: 4, name: 'Elektro' },
  { id: 5, name: 'Hybridní' },
  { id: 6, name: 'CNG + benzín' },
  { id: 7, name: 'Ethanol' },
  { id: 8, name: 'Jiné' },
  { id: 9, name: 'Vodík' },
];

export const GEARBOX_TYPES: Codebook[] = [
  { id: 1, name: 'Manuální' },
  { id: 2, name: 'Poloautomatická' },
  { id: 3, name: 'Automatická' },
];

export const COLORS: Codebook[] = [
  { id: 1, name: 'Bílá' },
  { id: 2, name: 'Žlutá' },
  { id: 3, name: 'Oranžová' },
  { id: 4, name: 'Červená' },
  { id: 5, name: 'Vínová' },
  { id: 6, name: 'Růžová' },
  { id: 7, name: 'Fialová' },
  { id: 8, name: 'Modrá' },
  { id: 9, name: 'Zelená' },
  { id: 10, name: 'Hnědá' },
  { id: 11, name: 'Šedá' },
  { id: 12, name: 'Černá' },
  { id: 13, name: 'Béžová' },
  { id: 14, name: 'Stříbrná' },
  { id: 15, name: 'Zlatá' },
  { id: 16, name: 'Jiná' },
  { id: 17, name: 'Bronzová' },
];

export const CONDITIONS: Codebook[] = [
  { id: 1, name: 'Nové' },
  { id: 2, name: 'Ojeté' },
  { id: 3, name: 'Havarované' },
  { id: 4, name: 'Předváděcí' },
  { id: 5, name: 'Veterán' },
];

export const DRIVE_TYPES: Codebook[] = [
  { id: 1, name: '4x2' },
  { id: 2, name: '4x4' },
  { id: 3, name: '6x2' },
  { id: 4, name: '6x4' },
  { id: 5, name: '6x6' },
  { id: 6, name: '8x4' },
  { id: 7, name: '8x6' },
  { id: 8, name: '8x8' },
  { id: 9, name: 'Pohon předních kol' },
  { id: 10, name: 'Pohon zadních kol' },
];

export const AIRCONDITION_TYPES: Codebook[] = [
  { id: 1, name: 'Bez klimatizace' },
  { id: 2, name: 'Manuální' },
  { id: 3, name: 'Automatická' },
  { id: 4, name: 'Dvouzónová automatická' },
  { id: 5, name: 'Třízónová automatická' },
  { id: 6, name: 'Čtyřzónová automatická' },
];

export const EURO_TYPES: Codebook[] = [
  { id: 1, name: 'EURO 1' },
  { id: 2, name: 'EURO 2' },
  { id: 3, name: 'EURO 3' },
  { id: 4, name: 'EURO 4' },
  { id: 5, name: 'EURO 5' },
  { id: 6, name: 'EURO 6' },
];

export const DOOR_COUNTS: Codebook[] = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
  { id: 6, name: '6' },
];

export const AIRBAG_COUNTS: Codebook[] = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '4' },
  { id: 4, name: '6' },
  { id: 5, name: '7' },
  { id: 6, name: '8' },
  { id: 7, name: '9' },
  { id: 8, name: '10' },
  { id: 9, name: '12' },
  { id: 10, name: '14' },
];

export const CAPACITY_TYPES: Codebook[] = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
  { id: 6, name: '6' },
  { id: 7, name: '7' },
  { id: 8, name: '8' },
  { id: 9, name: '9' },
];

export const BED_COUNTS: Codebook[] = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
  { id: 6, name: '6' },
  { id: 7, name: '7' },
  { id: 8, name: '8 a více' },
];

export const AVAILABILITY_TYPES: Codebook[] = [
  { id: 1, name: 'Datum' },
  { id: 2, name: 'Skladem' },
  { id: 3, name: 'Na objednávku' },
];

export const SERVICEBOOK_TYPES: Codebook[] = [
  { id: 1, name: 'Ano' },
  { id: 2, name: 'Ne' },
];

export const TACHOMETER_UNITS: Codebook[] = [
  { id: 1, name: 'km' },
  { id: 2, name: 'míle' },
];

export const COUNTRIES: Codebook[] = [
  { id: 1, name: 'Česká republika' },
  { id: 2, name: 'Slovenská republika' },
  { id: 3, name: 'Francie' },
  { id: 4, name: 'Itálie' },
  { id: 5, name: 'Německo' },
  { id: 6, name: 'Rakousko' },
  { id: 7, name: 'Švýcarsko' },
  { id: 8, name: 'Holandsko' },
  { id: 9, name: 'Lucembursko' },
  { id: 10, name: 'Jiná' },
  { id: 11, name: 'Belgie' },
  { id: 12, name: 'Španělsko' },
  { id: 13, name: 'Dánsko' },
  { id: 14, name: 'Nedohledatelný původ' },
  { id: 15, name: 'USA' },
  { id: 16, name: 'Švédsko' },
  { id: 17, name: 'Polsko' },
];

export const VEHICLE_KINDS: Codebook[] = [
  { id: 1, name: 'Osobní' },
  { id: 3, name: 'Motocykl' },
  { id: 4, name: 'Užitkové' },
  { id: 5, name: 'Nákladní' },
  { id: 6, name: 'Autobus' },
  { id: 7, name: 'Přívěs/Návěs' },
  { id: 9, name: 'Obytné' },
  { id: 10, name: 'Pracovní stroj' },
  { id: 11, name: 'Čtyřkolka' },
  { id: 12, name: 'Náhradní díly' },
];

export const REGIONS: Region[] = [
  { id: 47, name: 'Hlavní město Praha', region_group: 'Praha' },
  { id: 1, name: 'České Budějovice', region_group: 'Jihočeský kraj' },
  { id: 2, name: 'Český Krumlov', region_group: 'Jihočeský kraj' },
  { id: 3, name: 'Jindřichův Hradec', region_group: 'Jihočeský kraj' },
  { id: 4, name: 'Písek', region_group: 'Jihočeský kraj' },
  { id: 5, name: 'Prachatice', region_group: 'Jihočeský kraj' },
  { id: 6, name: 'Strakonice', region_group: 'Jihočeský kraj' },
  { id: 7, name: 'Tábor', region_group: 'Jihočeský kraj' },
  { id: 8, name: 'Domažlice', region_group: 'Plzeňský kraj' },
  { id: 9, name: 'Cheb', region_group: 'Karlovarský kraj' },
  { id: 10, name: 'Karlovy Vary', region_group: 'Karlovarský kraj' },
  { id: 11, name: 'Klatovy', region_group: 'Plzeňský kraj' },
  { id: 12, name: 'Plzeň-město', region_group: 'Plzeňský kraj' },
  { id: 13, name: 'Plzeň-jih', region_group: 'Plzeňský kraj' },
  { id: 14, name: 'Plzeň-sever', region_group: 'Plzeňský kraj' },
  { id: 15, name: 'Rokycany', region_group: 'Plzeňský kraj' },
  { id: 16, name: 'Sokolov', region_group: 'Karlovarský kraj' },
  { id: 17, name: 'Tachov', region_group: 'Plzeňský kraj' },
  { id: 18, name: 'Česká Lípa', region_group: 'Liberecký kraj' },
  { id: 19, name: 'Děčín', region_group: 'Ústecký kraj' },
  { id: 20, name: 'Chomutov', region_group: 'Ústecký kraj' },
  { id: 21, name: 'Jablonec nad Nisou', region_group: 'Liberecký kraj' },
  { id: 22, name: 'Liberec', region_group: 'Liberecký kraj' },
  { id: 23, name: 'Litoměřice', region_group: 'Ústecký kraj' },
  { id: 24, name: 'Louny', region_group: 'Ústecký kraj' },
  { id: 25, name: 'Most', region_group: 'Ústecký kraj' },
  { id: 26, name: 'Teplice', region_group: 'Ústecký kraj' },
  { id: 27, name: 'Ústí nad Labem', region_group: 'Ústecký kraj' },
  { id: 28, name: 'Hradec Králové', region_group: 'Královéhradecký kraj' },
  { id: 29, name: 'Chrudim', region_group: 'Pardubický kraj' },
  { id: 30, name: 'Jičín', region_group: 'Královéhradecký kraj' },
  { id: 31, name: 'Náchod', region_group: 'Královéhradecký kraj' },
  { id: 32, name: 'Pardubice', region_group: 'Pardubický kraj' },
  { id: 33, name: 'Rychnov nad Kněžnou', region_group: 'Královéhradecký kraj' },
  { id: 34, name: 'Semily', region_group: 'Liberecký kraj' },
  { id: 35, name: 'Svitavy', region_group: 'Pardubický kraj' },
  { id: 36, name: 'Trutnov', region_group: 'Královéhradecký kraj' },
  { id: 37, name: 'Ústí nad Orlicí', region_group: 'Pardubický kraj' },
  { id: 38, name: 'Zlín', region_group: 'Zlínský kraj' },
  { id: 39, name: 'Kroměříž', region_group: 'Zlínský kraj' },
  { id: 40, name: 'Prostějov', region_group: 'Olomoucký kraj' },
  { id: 41, name: 'Uherské Hradiště', region_group: 'Zlínský kraj' },
  { id: 42, name: 'Olomouc', region_group: 'Olomoucký kraj' },
  { id: 43, name: 'Přerov', region_group: 'Olomoucký kraj' },
  { id: 44, name: 'Šumperk', region_group: 'Olomoucký kraj' },
  { id: 45, name: 'Vsetín', region_group: 'Zlínský kraj' },
  { id: 46, name: 'Jeseník', region_group: 'Olomoucký kraj' },
  { id: 48, name: 'Benešov', region_group: 'Středočeský kraj' },
  { id: 49, name: 'Beroun', region_group: 'Středočeský kraj' },
  { id: 50, name: 'Kladno', region_group: 'Středočeský kraj' },
  { id: 51, name: 'Kolín', region_group: 'Středočeský kraj' },
  { id: 52, name: 'Kutná Hora', region_group: 'Středočeský kraj' },
  { id: 53, name: 'Mladá Boleslav', region_group: 'Středočeský kraj' },
  { id: 54, name: 'Mělník', region_group: 'Středočeský kraj' },
  { id: 55, name: 'Nymburk', region_group: 'Středočeský kraj' },
  { id: 56, name: 'Praha-východ', region_group: 'Středočeský kraj' },
  { id: 57, name: 'Praha-západ', region_group: 'Středočeský kraj' },
  { id: 58, name: 'Příbram', region_group: 'Středočeský kraj' },
  { id: 59, name: 'Rakovník', region_group: 'Středočeský kraj' },
  { id: 60, name: 'Bruntál', region_group: 'Moravskoslezský kraj' },
  { id: 61, name: 'Frýdek-Místek', region_group: 'Moravskoslezský kraj' },
  { id: 62, name: 'Karviná', region_group: 'Moravskoslezský kraj' },
  { id: 63, name: 'Nový Jičín', region_group: 'Moravskoslezský kraj' },
  { id: 64, name: 'Opava', region_group: 'Moravskoslezský kraj' },
  { id: 65, name: 'Ostrava-město', region_group: 'Moravskoslezský kraj' },
  { id: 66, name: 'Havlíčkův Brod', region_group: 'Kraj Vysočina' },
  { id: 67, name: 'Jihlava', region_group: 'Kraj Vysočina' },
  { id: 68, name: 'Pelhřimov', region_group: 'Kraj Vysočina' },
  { id: 69, name: 'Třebíč', region_group: 'Kraj Vysočina' },
  { id: 70, name: 'Žďár nad Sázavou', region_group: 'Kraj Vysočina' },
  { id: 71, name: 'Blansko', region_group: 'Jihomoravský kraj' },
  { id: 72, name: 'Brno-město', region_group: 'Jihomoravský kraj' },
  { id: 73, name: 'Brno-venkov', region_group: 'Jihomoravský kraj' },
  { id: 74, name: 'Břeclav', region_group: 'Jihomoravský kraj' },
  { id: 75, name: 'Hodonín', region_group: 'Jihomoravský kraj' },
  { id: 76, name: 'Vyškov', region_group: 'Jihomoravský kraj' },
  { id: 77, name: 'Znojmo', region_group: 'Jihomoravský kraj' },
];

// Služby operativního leasingu
// Sauto API: operating_lease_services (aktuální hodnoty)
export const OPERATING_LEASE_SERVICES: Codebook[] = [
  { id: 1, name: 'Servis' },
  { id: 2, name: 'Zimní pneumatiky' },
  { id: 3, name: 'GAP' },
];

// Typ motocyklu
export const MOTORCYCLE_TYPES: Codebook[] = [
  { id: 1, name: 'Naked' },
  { id: 2, name: 'Sportovní' },
  { id: 3, name: 'Touring' },
  { id: 4, name: 'Chopper/Cruiser' },
  { id: 5, name: 'Enduro' },
  { id: 6, name: 'Cross/Motokros' },
  { id: 7, name: 'Supermoto' },
  { id: 8, name: 'Skútr' },
  { id: 9, name: 'Trial' },
  { id: 10, name: 'Cestovní enduro' },
  { id: 11, name: 'Café racer' },
  { id: 12, name: 'Bobber' },
  { id: 13, name: 'Scrambler' },
  { id: 14, name: 'Minibike' },
  { id: 15, name: 'Elektrický' },
  { id: 16, name: 'Tříkolka' },
  { id: 17, name: 'Sidecar' },
  { id: 18, name: 'Jiný' },
];

// Typ nákladního vozidla
export const TRUCK_TYPES: Codebook[] = [
  { id: 1, name: 'Tahač návěsů' },
  { id: 2, name: 'Valník' },
  { id: 3, name: 'Sklápěč' },
  { id: 4, name: 'Skříňový' },
  { id: 5, name: 'Plachtový' },
  { id: 6, name: 'Cisternový' },
  { id: 7, name: 'Nosič kontejnerů' },
  { id: 8, name: 'Chladírenský/Mrazírenský' },
  { id: 9, name: 'Míchač' },
  { id: 10, name: 'Podvozek' },
  { id: 11, name: 'Odtahový' },
  { id: 12, name: 'Přeprava vozidel' },
  { id: 13, name: 'Hasiči/Speciální' },
  { id: 14, name: 'Komunální' },
  { id: 15, name: 'Hydraulická ruka' },
  { id: 16, name: 'Jiný' },
];

// Typ autobusu
export const BUS_TYPES: Codebook[] = [
  { id: 1, name: 'Městský' },
  { id: 2, name: 'Meziměstský' },
  { id: 3, name: 'Dálkový/Zájezdový' },
  { id: 4, name: 'Minibus' },
  { id: 5, name: 'Školní' },
  { id: 6, name: 'Kloubový' },
  { id: 7, name: 'Patrový' },
  { id: 8, name: 'Trolejbus' },
  { id: 9, name: 'Jiný' },
];

// Typ přívěsu/návěsu
export const TRAILER_TYPES: Codebook[] = [
  { id: 1, name: 'Skříňový' },
  { id: 2, name: 'Plachtový/Curtainsider' },
  { id: 3, name: 'Valníkový' },
  { id: 4, name: 'Podvalník/Nízkoložný' },
  { id: 5, name: 'Sklápěcí' },
  { id: 6, name: 'Chladírenský' },
  { id: 7, name: 'Cisternový' },
  { id: 8, name: 'Přeprava vozidel' },
  { id: 9, name: 'Přeprava kontejnerů' },
  { id: 10, name: 'Přívěs za osobní' },
  { id: 11, name: 'Přívěs pro přepravu člunů' },
  { id: 12, name: 'Přívěs pro přepravu koní' },
  { id: 13, name: 'Obytný přívěs' },
  { id: 14, name: 'Jiný' },
];

// Typ prodejce
export const SELLER_TYPES: Codebook[] = [
  { id: 1, name: 'Soukromý prodejce' },
  { id: 2, name: 'Autobazar' },
  { id: 3, name: 'Autorizovaný dealer' },
  { id: 4, name: 'Leasingová společnost' },
  { id: 5, name: 'Autoservis' },
];

// Typ obchodu
// Sauto API: deal_type (string hodnoty: "sale", "operating_lease", "sale_or_lease")
// Rozšířeno o další běžné typy obchodu v ČR
export const DEAL_TYPES: Codebook[] = [
  { id: 1, name: 'Prodej' },
  { id: 2, name: 'Operativní leasing' },
  { id: 3, name: 'Prodej nebo leasing' },
];

// Mapování Sauto deal_type string → naše ID
export const DEAL_TYPE_MAP: Record<string, number> = {
  sale: 1,
  operating_lease: 2,
  sale_or_lease: 3,
};

// Materiál sedadel / čalounění
export const UPHOLSTERY_TYPES: Codebook[] = [
  { id: 1, name: 'Látka' },
  { id: 2, name: 'Kůže' },
  { id: 3, name: 'Částečná kůže' },
  { id: 4, name: 'Alcantara' },
  { id: 5, name: 'Semišová kůže' },
  { id: 6, name: 'Umělá kůže' },
  { id: 7, name: 'Velur' },
  { id: 8, name: 'Kombinace kůže/látka' },
  { id: 9, name: 'Jiné' },
];

// Hmotnostní kategorie (pro užitková a nákladní)
export const WEIGHT_CATEGORIES: Codebook[] = [
  { id: 1, name: 'do 3,5 t' },
  { id: 2, name: '3,5 – 7,5 t' },
  { id: 3, name: '7,5 – 12 t' },
  { id: 4, name: '12 – 18 t' },
  { id: 5, name: '18 – 26 t' },
  { id: 6, name: '26 – 32 t' },
  { id: 7, name: 'nad 32 t' },
];

// Objem motoru (ccm) - kategorie
export const ENGINE_VOLUME_CATEGORIES: Codebook[] = [
  { id: 1, name: 'do 800 ccm' },
  { id: 2, name: '800 – 1 000 ccm' },
  { id: 3, name: '1 000 – 1 200 ccm' },
  { id: 4, name: '1 200 – 1 400 ccm' },
  { id: 5, name: '1 400 – 1 600 ccm' },
  { id: 6, name: '1 600 – 1 800 ccm' },
  { id: 7, name: '1 800 – 2 000 ccm' },
  { id: 8, name: '2 000 – 2 500 ccm' },
  { id: 9, name: '2 500 – 3 000 ccm' },
  { id: 10, name: '3 000 – 4 000 ccm' },
  { id: 11, name: '4 000 – 5 000 ccm' },
  { id: 12, name: 'nad 5 000 ccm' },
];

// Typ čtyřkolky
export const QUAD_TYPES: Codebook[] = [
  { id: 1, name: 'Sportovní' },
  { id: 2, name: 'Užitková' },
  { id: 3, name: 'Dětská' },
  { id: 4, name: 'Side-by-side (UTV)' },
  { id: 5, name: 'Jiná' },
];

// Počet vlastníků
export const OWNER_COUNTS: Codebook[] = [
  { id: 1, name: '1. majitel' },
  { id: 2, name: '2. majitel' },
  { id: 3, name: '3. majitel' },
  { id: 4, name: '4. a více' },
];

// Typ pracovního stroje
export const MACHINE_TYPES: Codebook[] = [
  { id: 1, name: 'Bagr' },
  { id: 2, name: 'Nakladač' },
  { id: 3, name: 'Buldozer' },
  { id: 4, name: 'Jeřáb' },
  { id: 5, name: 'Vysokozdvižný vozík' },
  { id: 6, name: 'Válec' },
  { id: 7, name: 'Fréza' },
  { id: 8, name: 'Kompresor' },
  { id: 9, name: 'Plošina' },
  { id: 10, name: 'Manipulátor' },
  { id: 11, name: 'Traktor' },
  { id: 12, name: 'Jiný' },
];

// Skupiny výbavy
export const EQUIPMENT_CATEGORIES = [
  'Bezpečnost',
  'Asistenční systémy',
  'Komfort',
  'Interiér',
  'Sedadla',
  'Exteriér',
  'Světla',
  'Multimédia',
  'Konektivita',
  'Parkování',
  'Zabezpečení',
  'Skla a zrcátka',
  'Podvozek a řízení',
  'Motor a výfuk',
  'Motocykly',
  'Nákladní',
  'Obytné vozy',
  'Přívěsy',
  'Ostatní',
] as const;

// KOMPLETNÍ VÝBAVA - všech 331 položek ze Sauto.cz
export const EQUIPMENT: CodebookWithCategory[] = [
  // Bezpečnost
  { id: 8, name: 'ABS', category: 'Bezpečnost' },
  { id: 15, name: 'ESP', category: 'Bezpečnost' },
  { id: 142, name: 'Protiprokluzový systém kol (ASR)', category: 'Bezpečnost' },
  { id: 106, name: 'Elektronická uzávěrka diferenciálu (EDS)', category: 'Bezpečnost' },
  { id: 226, name: 'Deaktivace airbagu spolujezdce', category: 'Bezpečnost' },
  { id: 268, name: 'Aktivní kapota', category: 'Bezpečnost' },
  { id: 307, name: 'Ochrana proti odcizení a vloupání', category: 'Bezpečnost' },
  // Asistenční systémy
  { id: 252, name: 'Nouzové brždění', category: 'Asistenční systémy' },
  { id: 250, name: 'Hlídání mrtvého úhlu', category: 'Asistenční systémy' },
  { id: 251, name: 'Sledování jízdního pruhu', category: 'Asistenční systémy' },
  { id: 255, name: 'Sledování únavy řidiče', category: 'Asistenční systémy' },
  { id: 261, name: 'Rozpoznávání dopravních značek', category: 'Asistenční systémy' },
  { id: 262, name: 'Upozornění na přijíždějící vozidla při couvání (RCTA)', category: 'Asistenční systémy' },
  { id: 263, name: 'Asistent stability přívěsu (TSA)', category: 'Asistenční systémy' },
  { id: 299, name: 'Systém nouzového zastavení', category: 'Asistenční systémy' },
  { id: 303, name: 'Aktivní asistent řízení', category: 'Asistenční systémy' },
  { id: 305, name: 'Asistent pro odbočování', category: 'Asistenční systémy' },
  { id: 306, name: 'Asistent udržování odstupu', category: 'Asistenční systémy' },
  { id: 311, name: 'Asistent změny jízdního pruhu', category: 'Asistenční systémy' },
  { id: 324, name: 'Front Assist', category: 'Asistenční systémy' },
  { id: 325, name: 'Lane Assist', category: 'Asistenční systémy' },
  { id: 279, name: 'Asistent pro jízdu v koloně', category: 'Asistenční systémy' },
  { id: 280, name: 'Asistent pro vedení vozu v jízdních pruzích', category: 'Asistenční systémy' },
  { id: 213, name: 'Asistent rozjezdu do kopce', category: 'Asistenční systémy' },
  { id: 222, name: 'Asistent při jízdě ze svahu', category: 'Asistenční systémy' },
  { id: 312, name: 'Automatické přepínání dálkových světel', category: 'Asistenční systémy' },
  // Komfort
  { id: 17, name: 'Tempomat', category: 'Komfort' },
  { id: 232, name: 'Adaptivní tempomat', category: 'Komfort' },
  { id: 308, name: 'Prediktivní tempomat', category: 'Komfort' },
  { id: 7, name: 'Centrální zamykání', category: 'Komfort' },
  { id: 24, name: 'Dálkové centrální zamykání', category: 'Komfort' },
  { id: 218, name: 'Bezklíčkové ovládání', category: 'Komfort' },
  { id: 32, name: 'Posilovač řízení', category: 'Komfort' },
  { id: 51, name: 'El. ovládání oken', category: 'Komfort' },
  { id: 13, name: 'El. ovládání zrcátek', category: 'Komfort' },
  { id: 245, name: 'El. sklopná zrcátka', category: 'Komfort' },
  { id: 246, name: 'El. ovládaný kufr', category: 'Komfort' },
  { id: 93, name: 'El. seřiditelná sedadla', category: 'Komfort' },
  { id: 313, name: 'El. seřiditelné sedadlo řidiče', category: 'Komfort' },
  { id: 315, name: 'El. nastavitelná zadní sedadla', category: 'Komfort' },
  { id: 287, name: 'El. parkovací brzda', category: 'Komfort' },
  { id: 314, name: 'Elektrické dovírání zavazadlového prostoru', category: 'Komfort' },
  { id: 330, name: 'Elektrické dovírání dveří', category: 'Komfort' },
  { id: 288, name: 'Funkce plynulého dovírání dveří', category: 'Komfort' },
  { id: 212, name: 'Start/Stop systém', category: 'Komfort' },
  { id: 300, name: 'Volba jízdního režimu', category: 'Komfort' },
  { id: 296, name: 'Pádla řazení na volantu', category: 'Komfort' },
  { id: 30, name: 'Palubní počítač', category: 'Komfort' },
  { id: 27, name: 'Multifunkční volant', category: 'Komfort' },
  { id: 36, name: 'Nastavitelná sedadla', category: 'Komfort' },
  { id: 37, name: 'Nastavitelný volant', category: 'Komfort' },
  { id: 94, name: 'Výškově nastavitelná sedadla', category: 'Komfort' },
  { id: 224, name: 'Výškově nastavitelné sedadlo řidiče', category: 'Komfort' },
  { id: 95, name: 'Podélný posuv sedadel', category: 'Komfort' },
  { id: 297, name: 'Paměť nastavení sedadla řidiče', category: 'Komfort' },
  { id: 146, name: 'Venkovní teploměr', category: 'Komfort' },
  { id: 147, name: 'Vnitřní teploměr', category: 'Komfort' },
  { id: 316, name: 'Elektrické tažné zařízení', category: 'Komfort' },
  { id: 87, name: 'Nezávislé topení', category: 'Komfort' },
  { id: 88, name: 'Nezávislé topení s čas. předehřívačem', category: 'Komfort' },
  { id: 139, name: 'Dálkový start', category: 'Komfort' },
  // Sedadla
  { id: 3, name: 'Kožené čalounění', category: 'Sedadla' },
  { id: 98, name: 'Kožené potahy', category: 'Sedadla' },
  { id: 227, name: 'Kožená sedadla', category: 'Sedadla' },
  { id: 328, name: 'Sedadla Alcantara', category: 'Sedadla' },
  { id: 258, name: 'Malý kožený paket', category: 'Sedadla' },
  { id: 92, name: 'Sportovní sedadla', category: 'Sedadla' },
  { id: 329, name: 'Sportovní paket', category: 'Sedadla' },
  { id: 42, name: 'Vyhřívaná sedadla', category: 'Sedadla' },
  { id: 320, name: 'Vyhřívaná zadní sedadla', category: 'Sedadla' },
  { id: 241, name: 'Vyhřívaný volant', category: 'Sedadla' },
  { id: 274, name: 'Odvětrávání sedadel', category: 'Sedadla' },
  { id: 318, name: 'Ventilovaná zadní sedadla', category: 'Sedadla' },
  { id: 242, name: 'Masážní sedadla', category: 'Sedadla' },
  { id: 221, name: 'Dělená zadní sedadla', category: 'Sedadla' },
  { id: 321, name: 'Třetí řada sedadel', category: 'Sedadla' },
  { id: 89, name: 'Vyjímatelná zadní sedadla', category: 'Sedadla' },
  { id: 96, name: 'Sedadla výsuvná do uličky', category: 'Sedadla' },
  { id: 97, name: 'Výsuvné opěrky hlav', category: 'Sedadla' },
  { id: 302, name: 'Zadní loketní opěrka', category: 'Sedadla' },
  { id: 99, name: 'Dřevěné obložení', category: 'Sedadla' },
  // Interiér
  { id: 276, name: 'Ambientní LED osvětlení interiéru', category: 'Interiér' },
  { id: 223, name: 'Klimatizovaná přihrádka', category: 'Interiér' },
  { id: 267, name: 'Roletky na zadní okna', category: 'Interiér' },
  { id: 91, name: 'Síťka mezistěny zavazadlového prostoru', category: 'Interiér' },
  { id: 90, name: 'Příprava pro isofix', category: 'Interiér' },
  { id: 215, name: 'Isofix', category: 'Interiér' },
  { id: 309, name: 'Zásuvka pro přídavné spotřebiče', category: 'Interiér' },
  { id: 86, name: 'Zásuvka na 220 V', category: 'Interiér' },
  // Exteriér
  { id: 16, name: 'Litá kola', category: 'Exteriér' },
  { id: 6, name: 'Střešní okno', category: 'Exteriér' },
  { id: 217, name: 'Panoramatická střecha', category: 'Exteriér' },
  { id: 72, name: 'Otevíratelná střecha', category: 'Exteriér' },
  { id: 38, name: 'Střešní nosič', category: 'Exteriér' },
  { id: 77, name: 'Střešní spoiler', category: 'Exteriér' },
  { id: 39, name: 'Tónovaná skla', category: 'Exteriér' },
  { id: 265, name: 'Zatmavená zadní skla', category: 'Exteriér' },
  { id: 326, name: 'Akustická skla', category: 'Exteriér' },
  { id: 191, name: 'Boční nášlapy', category: 'Exteriér' },
  { id: 76, name: 'Ochranné rámy', category: 'Exteriér' },
  { id: 45, name: 'Závěsné zařízení v TP', category: 'Exteriér' },
  { id: 105, name: 'Tažné zařízení', category: 'Exteriér' },
  { id: 74, name: 'Ski box', category: 'Exteriér' },
  { id: 192, name: 'Šnorchl', category: 'Exteriér' },
  // Světla
  { id: 43, name: 'Xenony', category: 'Světla' },
  { id: 240, name: 'Bi-xenony', category: 'Světla' },
  { id: 238, name: 'LED světlomety plnohodnotné', category: 'Světla' },
  { id: 228, name: 'LED denní svícení', category: 'Světla' },
  { id: 275, name: 'Denní svícení', category: 'Světla' },
  { id: 291, name: 'Laserová světla', category: 'Světla' },
  { id: 292, name: 'LED adaptivní světlomety', category: 'Světla' },
  { id: 293, name: 'LED matrixové světlomety', category: 'Světla' },
  { id: 247, name: 'Natáčecí světlomety', category: 'Světla' },
  { id: 248, name: 'Automatické svícení', category: 'Světla' },
  { id: 187, name: 'Mlhovky', category: 'Světla' },
  { id: 188, name: 'Zadní mlhovka', category: 'Světla' },
  { id: 33, name: 'Přídavná světla', category: 'Světla' },
  { id: 75, name: 'Ostřikovače světlometů', category: 'Světla' },
  { id: 193, name: 'S couvacím světlem', category: 'Světla' },
  // Multimédia
  { id: 5, name: 'Navigační systém', category: 'Multimédia' },
  { id: 103, name: 'Satelitní navigace', category: 'Multimédia' },
  { id: 323, name: 'Multimediální systém bez navigace', category: 'Multimédia' },
  { id: 28, name: 'Autorádio', category: 'Multimédia' },
  { id: 220, name: 'Originální autorádio', category: 'Multimédia' },
  { id: 219, name: 'Rádio', category: 'Multimédia' },
  { id: 54, name: 'Příprava pro autorádio', category: 'Multimédia' },
  { id: 283, name: 'Digitální příjem rádia (DAB)', category: 'Multimédia' },
  { id: 56, name: 'CD přehrávač', category: 'Multimédia' },
  { id: 57, name: 'CD měnič', category: 'Multimédia' },
  { id: 254, name: 'DVD přehrávač', category: 'Multimédia' },
  { id: 58, name: 'Televize', category: 'Multimédia' },
  { id: 59, name: 'Přehrávač videa', category: 'Multimédia' },
  { id: 60, name: '1 monitor', category: 'Multimédia' },
  { id: 61, name: '2 monitory', category: 'Multimédia' },
  { id: 62, name: '3 monitory', category: 'Multimédia' },
  { id: 63, name: '4 monitory', category: 'Multimédia' },
  { id: 243, name: 'USB', category: 'Multimédia' },
  { id: 331, name: 'AUX', category: 'Multimédia' },
  { id: 253, name: 'Vstup paměťové karty', category: 'Multimédia' },
  { id: 277, name: 'Android Auto', category: 'Multimédia' },
  { id: 278, name: 'Apple Car Play', category: 'Multimédia' },
  { id: 271, name: 'Premiový audiosystém', category: 'Multimédia' },
  { id: 327, name: 'Příplatkový audiosystém', category: 'Multimédia' },
  { id: 270, name: 'Přístrojová deska s barevným displejem', category: 'Multimédia' },
  { id: 284, name: 'Digitální přístrojový štít', category: 'Multimédia' },
  { id: 317, name: 'Digitální přístrojová deska', category: 'Multimédia' },
  { id: 286, name: 'Dotykové ovládání palubního počítače', category: 'Multimédia' },
  { id: 290, name: 'Hlasové ovládání palubního počítače', category: 'Multimédia' },
  { id: 295, name: 'Ovládání vybraných funkcí vozu gesty', category: 'Multimédia' },
  { id: 289, name: 'Head-up display', category: 'Multimédia' },
  // Konektivita
  { id: 244, name: 'Bluetooth', category: 'Konektivita' },
  { id: 64, name: 'Telefon', category: 'Konektivita' },
  { id: 65, name: 'Příprava pro telefon', category: 'Konektivita' },
  { id: 66, name: 'CB vysílačka', category: 'Konektivita' },
  { id: 67, name: 'Mikrofon', category: 'Konektivita' },
  { id: 294, name: 'Mobilní připojení', category: 'Konektivita' },
  { id: 319, name: 'Wifi hotspot', category: 'Konektivita' },
  { id: 266, name: 'Bezdrátová nabíječka mobilních telefonů (Qi)', category: 'Konektivita' },
  // Parkování
  { id: 31, name: 'Parkovací asistent', category: 'Parkování' },
  { id: 214, name: 'Parkovací senzory', category: 'Parkování' },
  { id: 281, name: 'Parkovací senzory přední', category: 'Parkování' },
  { id: 282, name: 'Parkovací senzory zadní', category: 'Parkování' },
  { id: 231, name: 'Parkovací kamera', category: 'Parkování' },
  { id: 259, name: '360° monitorovací systém (AVM)', category: 'Parkování' },
  { id: 304, name: 'Akustická výstraha při couvání', category: 'Parkování' },
  // Zabezpečení
  { id: 4, name: 'Imobilizér', category: 'Zabezpečení' },
  { id: 22, name: 'Alarm', category: 'Zabezpečení' },
  { id: 23, name: 'Alarm s dálkovým ovládáním', category: 'Zabezpečení' },
  { id: 25, name: 'Bezpečnostní pískování oken', category: 'Zabezpečení' },
  { id: 44, name: 'Zámek řadící páky', category: 'Zabezpečení' },
  { id: 68, name: 'Zaslepení zámků', category: 'Zabezpečení' },
  // Skla a zrcátka
  { id: 40, name: 'Vyhřívaná zrcátka', category: 'Skla a zrcátka' },
  { id: 41, name: 'Vyhřívané čelní sklo', category: 'Skla a zrcátka' },
  { id: 264, name: 'Elektrochromatické vnitřní zpětné zrcátko', category: 'Skla a zrcátka' },
  { id: 108, name: 'Senzor stěračů', category: 'Skla a zrcátka' },
  { id: 79, name: 'Zadní stěrač', category: 'Skla a zrcátka' },
  { id: 301, name: 'Vyhřívané trysky ostřikovačů skla', category: 'Skla a zrcátka' },
  // Podvozek a řízení
  { id: 119, name: 'Sportovní podvozek', category: 'Podvozek a řízení' },
  { id: 310, name: 'Adaptivní regulace podvozku', category: 'Podvozek a řízení' },
  { id: 153, name: 'Regulace výšky podvozku', category: 'Podvozek a řízení' },
  { id: 154, name: 'Regulace tuhosti podvozku', category: 'Podvozek a řízení' },
  { id: 156, name: 'Konvenční odpružení', category: 'Podvozek a řízení' },
  { id: 158, name: 'Vzduchové odpružení', category: 'Podvozek a řízení' },
  { id: 155, name: 'Tlumič řízení', category: 'Podvozek a řízení' },
  { id: 225, name: 'Automatická uzávěrka diferenciálu', category: 'Podvozek a řízení' },
  { id: 189, name: 'Uzávěrka zadního diferenciálu', category: 'Podvozek a řízení' },
  { id: 190, name: 'Uzávěrka předního diferenciálu', category: 'Podvozek a řízení' },
  { id: 145, name: 'Uzávěrka mezinápravového diferenciálu', category: 'Podvozek a řízení' },
  // Motor a výfuk
  { id: 49, name: 'Katalyzátor', category: 'Motor a výfuk' },
  { id: 120, name: 'Laděný výfuk', category: 'Motor a výfuk' },
  { id: 273, name: 'Motorová brzda', category: 'Motor a výfuk' },
  { id: 322, name: 'Tepelné čerpadlo', category: 'Motor a výfuk' },
  // Ostatní
  { id: 18, name: 'Záruka', category: 'Ostatní' },
  { id: 26, name: 'LPG v TP', category: 'Ostatní' },
  { id: 118, name: 'Otáčkoměr', category: 'Ostatní' },
  { id: 201, name: 'Rezervní kolo', category: 'Ostatní' },
  { id: 285, name: 'Dojezdové rezervní kolo', category: 'Ostatní' },
  { id: 298, name: 'Plnohodnotné rezervní kolo', category: 'Ostatní' },
  { id: 257, name: 'Senzor tlaku v pneumatikách', category: 'Ostatní' },
  { id: 249, name: 'Senzor opotřebení brzd. destiček', category: 'Ostatní' },
  { id: 161, name: 'Naviják', category: 'Ostatní' },
  { id: 216, name: 'Přední ochranný rám', category: 'Ostatní' },
  { id: 229, name: 'Sada na opravu pneumatik', category: 'Ostatní' },
  { id: 230, name: 'Kompresory na huštění kol', category: 'Ostatní' },
  { id: 233, name: 'Sklápěč', category: 'Ostatní' },
  { id: 234, name: 'Hasicí přístroj', category: 'Ostatní' },
  { id: 235, name: 'Výstražný trojúhelník', category: 'Ostatní' },
  { id: 236, name: 'Reflexní vesta', category: 'Ostatní' },
  { id: 237, name: 'Lékárnička', category: 'Ostatní' },
  { id: 239, name: 'Druhá sada kol', category: 'Ostatní' },
  { id: 256, name: 'Zimní paket', category: 'Ostatní' },
  { id: 260, name: 'Servisní paket', category: 'Ostatní' },
  { id: 269, name: 'Sériová výbava', category: 'Ostatní' },
  { id: 272, name: 'Záruka výrobce', category: 'Ostatní' },
  // Další bezpečnost a komfort
  { id: 10, name: 'Airbag řidiče', category: 'Bezpečnost' },
  { id: 11, name: 'Airbag spolujezdce', category: 'Bezpečnost' },
  { id: 12, name: 'Boční airbagy', category: 'Bezpečnost' },
  { id: 14, name: 'Hlavové airbagy', category: 'Bezpečnost' },
  { id: 19, name: 'Kolenní airbag', category: 'Bezpečnost' },
  { id: 20, name: 'Isofix přední sedadlo', category: 'Bezpečnost' },
  { id: 21, name: 'Upevňovací body TOP Tether', category: 'Bezpečnost' },
  { id: 29, name: 'Přední hlavová opěrka', category: 'Komfort' },
  { id: 34, name: 'Loketní opěrka vpředu', category: 'Komfort' },
  { id: 35, name: 'Loketní opěrka vzadu', category: 'Komfort' },
  { id: 52, name: 'El. ovládání oken - přední', category: 'Komfort' },
  { id: 53, name: 'El. ovládání oken - zadní', category: 'Komfort' },
  { id: 55, name: 'Přihrádka v palubní desce', category: 'Interiér' },
  { id: 69, name: 'Automatické stahování oken', category: 'Komfort' },
  { id: 70, name: 'Dešťový senzor', category: 'Komfort' },
  { id: 71, name: 'Senzor světla', category: 'Komfort' },
  { id: 73, name: 'Sklopná zadní sedadla', category: 'Sedadla' },
  { id: 78, name: 'Oddělená zadní klimatizace', category: 'Komfort' },
  // Motocykly
  { id: 46, name: 'Nožní startér', category: 'Motocykly' },
  { id: 47, name: 'El. startér', category: 'Motocykly' },
  { id: 48, name: 'Variátor', category: 'Motocykly' },
  { id: 50, name: 'Plexi štít', category: 'Motocykly' },
  { id: 100, name: 'Vyhřívané rukojeti', category: 'Motocykly' },
  { id: 101, name: 'Kombinovaný brzdový systém (CBS)', category: 'Motocykly' },
  { id: 102, name: 'Quickshifter', category: 'Motocykly' },
  { id: 104, name: 'Trakční kontrola', category: 'Motocykly' },
  { id: 107, name: 'Výfuk s homologací', category: 'Motocykly' },
  { id: 109, name: 'Ochranné rámy motocyklu', category: 'Motocykly' },
  { id: 110, name: 'Sedlo pro spolujezdce', category: 'Motocykly' },
  { id: 111, name: 'Centrální stojan', category: 'Motocykly' },
  { id: 112, name: 'Boční stojan', category: 'Motocykly' },
  { id: 113, name: 'Řetěz', category: 'Motocykly' },
  { id: 114, name: 'Kardanový převod', category: 'Motocykly' },
  { id: 115, name: 'Řemenový převod', category: 'Motocykly' },
  { id: 116, name: 'Regulovatelné páčky', category: 'Motocykly' },
  { id: 117, name: 'Nastavitelné odpružení', category: 'Motocykly' },
  { id: 149, name: 'Padáky', category: 'Motocykly' },
  { id: 150, name: 'Kufry', category: 'Motocykly' },
  { id: 151, name: 'Brašny', category: 'Motocykly' },
  // Nákladní
  { id: 121, name: 'Hydraulické čelo', category: 'Nákladní' },
  { id: 122, name: 'Jeřáb', category: 'Nákladní' },
  { id: 123, name: 'Plošina', category: 'Nákladní' },
  { id: 124, name: 'Hydraulika pro sklápění', category: 'Nákladní' },
  { id: 125, name: 'Chladírenská nástavba', category: 'Nákladní' },
  { id: 126, name: 'Mrazírenská nástavba', category: 'Nákladní' },
  { id: 127, name: 'Jednoduchá nádrž do 400 l nafty', category: 'Nákladní' },
  { id: 128, name: 'Dvojitá nádrž do 800 l nafty', category: 'Nákladní' },
  { id: 129, name: 'Valníková nástavba', category: 'Nákladní' },
  { id: 130, name: 'Skříňová nástavba', category: 'Nákladní' },
  { id: 131, name: 'Plachtová nástavba', category: 'Nákladní' },
  { id: 132, name: 'Cisternová nástavba', category: 'Nákladní' },
  { id: 133, name: 'Kontejnerový nosič', category: 'Nákladní' },
  { id: 134, name: 'Odtahový podvozek', category: 'Nákladní' },
  { id: 135, name: 'Přeprava vozidel', category: 'Nákladní' },
  { id: 136, name: 'Míchačka na beton', category: 'Nákladní' },
  { id: 137, name: 'Intardér', category: 'Nákladní' },
  { id: 138, name: 'Retardér', category: 'Nákladní' },
  { id: 140, name: 'Pneumatické sedadlo řidiče', category: 'Nákladní' },
  { id: 141, name: 'Lůžko v kabině', category: 'Nákladní' },
  { id: 143, name: 'Výbava ADR', category: 'Nákladní' },
  { id: 144, name: 'Třístranný sklápěč', category: 'Nákladní' },
  { id: 148, name: 'Posuvný podlaha', category: 'Nákladní' },
  { id: 152, name: 'Vzduchové ovládání dveří', category: 'Nákladní' },
  { id: 157, name: 'Vzduchové sedadlo spolujezdce', category: 'Nákladní' },
  { id: 159, name: 'Tachograf', category: 'Nákladní' },
  { id: 174, name: 'Dvojité zadní kola', category: 'Nákladní' },
  { id: 175, name: 'Elektronický tachograf', category: 'Nákladní' },
  { id: 176, name: 'Horský program', category: 'Nákladní' },
  { id: 177, name: 'Klanicová nástavba', category: 'Nákladní' },
  { id: 178, name: 'Korba', category: 'Nákladní' },
  { id: 179, name: 'Měchové odpružení zadní nápravy', category: 'Nákladní' },
  { id: 180, name: 'Mezinápravový diferenciál', category: 'Nákladní' },
  { id: 181, name: 'Odmontovatelné bočnice', category: 'Nákladní' },
  { id: 182, name: 'Přepravní box', category: 'Nákladní' },
  { id: 183, name: 'Kabina trambusová', category: 'Nákladní' },
  { id: 184, name: 'Kabina kapotovaná', category: 'Nákladní' },
  { id: 185, name: 'Spací kabina', category: 'Nákladní' },
  { id: 186, name: 'Denní kabina', category: 'Nákladní' },
  // Obytné vozy
  { id: 80, name: 'Chladnička', category: 'Obytné vozy' },
  { id: 81, name: 'Kávovar', category: 'Obytné vozy' },
  { id: 82, name: 'Vařič', category: 'Obytné vozy' },
  { id: 83, name: 'Mikrovlná trouba', category: 'Obytné vozy' },
  { id: 84, name: 'WC', category: 'Obytné vozy' },
  { id: 85, name: 'Ohřívač vody', category: 'Obytné vozy' },
  { id: 160, name: 'Sprcha', category: 'Obytné vozy' },
  { id: 162, name: 'Markýza', category: 'Obytné vozy' },
  { id: 163, name: 'Solární panel', category: 'Obytné vozy' },
  { id: 164, name: 'Satelitní TV', category: 'Obytné vozy' },
  { id: 165, name: 'Plynová láhev', category: 'Obytné vozy' },
  { id: 166, name: 'Zásobník na vodu', category: 'Obytné vozy' },
  { id: 167, name: 'Klimatizace obytné části', category: 'Obytné vozy' },
  { id: 168, name: 'Topení obytné části', category: 'Obytné vozy' },
  { id: 169, name: 'Elektrická přípojka 230V', category: 'Obytné vozy' },
  { id: 170, name: 'Druhá baterie', category: 'Obytné vozy' },
  { id: 171, name: 'Generátor', category: 'Obytné vozy' },
  { id: 172, name: 'Nájezdová rampa', category: 'Obytné vozy' },
  { id: 173, name: 'Jízdní kolo / nosič', category: 'Obytné vozy' },
  // Přívěsy
  { id: 194, name: 'Vidlice 7-pol', category: 'Přívěsy' },
  { id: 195, name: 'Vidlice 13-pol', category: 'Přívěsy' },
  { id: 196, name: 'Opěrné kolečko', category: 'Přívěsy' },
  { id: 197, name: 'Opěrné nohy', category: 'Přívěsy' },
  { id: 198, name: 'Plachta', category: 'Přívěsy' },
  { id: 199, name: 'Laminátové víko', category: 'Přívěsy' },
  { id: 200, name: 'Kotvící oka', category: 'Přívěsy' },
  { id: 202, name: 'Zakládací klíny', category: 'Přívěsy' },
  { id: 203, name: 'Nebrzděný', category: 'Přívěsy' },
  { id: 204, name: 'Brzděný', category: 'Přívěsy' },
  { id: 205, name: 'Trubková/jeklová oj', category: 'Přívěsy' },
  { id: 206, name: 'V oj', category: 'Přívěsy' },
  { id: 207, name: 'Výškově stavitelná oj', category: 'Přívěsy' },
  { id: 208, name: 'Překližkové bočnice', category: 'Přívěsy' },
  { id: 209, name: 'Plechové bočnice', category: 'Přívěsy' },
  { id: 210, name: 'Hliníkové bočnice', category: 'Přívěsy' },
  { id: 211, name: 'Bez bočnic', category: 'Přívěsy' },
];

// Cenové rozsahy pro rychlý výběr
export const PRICE_RANGES = [
  { label: 'Do 100 000 Kč', from: 0, to: 100000 },
  { label: '100 000 – 250 000 Kč', from: 100000, to: 250000 },
  { label: '250 000 – 500 000 Kč', from: 250000, to: 500000 },
  { label: '500 000 – 1 000 000 Kč', from: 500000, to: 1000000 },
  { label: '1 000 000 – 2 000 000 Kč', from: 1000000, to: 2000000 },
  { label: 'Nad 2 000 000 Kč', from: 2000000, to: undefined },
];

// Rozsahy km
export const KM_RANGES = [
  { label: 'Do 10 000 km', from: 0, to: 10000 },
  { label: 'Do 50 000 km', from: 0, to: 50000 },
  { label: 'Do 100 000 km', from: 0, to: 100000 },
  { label: 'Do 150 000 km', from: 0, to: 150000 },
  { label: 'Do 200 000 km', from: 0, to: 200000 },
];

// Roky pro výběr
export const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => new Date().getFullYear() - i
);

// Řazení
export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Nejnovější inzeráty' },
  { value: 'price_asc', label: 'Nejlevnější' },
  { value: 'price_desc', label: 'Nejdražší' },
  { value: 'year_desc', label: 'Nejnovější ročník' },
  { value: 'year_asc', label: 'Nejstarší ročník' },
  { value: 'km_asc', label: 'Nejméně najeté' },
  { value: 'km_desc', label: 'Nejvíce najeté' },
  { value: 'power_desc', label: 'Nejvýkonnější' },
];

// Pomocné funkce
export function getCodebookName(items: Codebook[], id: number | undefined): string {
  if (!id) return '';
  return items.find((item) => item.id === id)?.name ?? '';
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('cs-CZ').format(price) + ' Kč';
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat('cs-CZ').format(km) + ' km';
}

export function formatPower(kw: number): string {
  const ps = Math.round(kw * 1.36);
  return `${kw} kW (${ps} PS)`;
}

export function formatVolume(ccm: number): string {
  return (ccm / 1000).toFixed(1) + ' l';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('cs-CZ');
}

export function formatRegistration(month?: number, year?: number): string {
  if (!year) return '';
  if (month) return `${String(month).padStart(2, '0')}/${year}`;
  return String(year);
}
