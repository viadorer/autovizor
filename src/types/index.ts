// ============================================================
// AUTOVIZOR.CZ - TypeScript typy
// ============================================================

// Číselníky
export interface Codebook {
  id: number;
  name: string;
}

export interface CodebookWithCategory extends Codebook {
  category?: string;
}

export interface Manufacturer extends Codebook {
  seo_name?: string;
}

export interface Model extends Codebook {
  manufacturer_id: number;
  seo_name?: string;
}

export interface Region extends Codebook {
  region_group?: string;
}

// Hlavní entita vozidla
export interface Vehicle {
  id: number;
  sauto_id?: number;
  custom_id?: string;

  // Základní údaje
  kind_id?: number;
  manufacturer_id?: number;
  model_id?: number;
  body_type_id?: number;
  condition_id?: number;
  title: string;
  model_variant?: string;
  series?: string;

  // Cena
  price: number;
  price_note?: string;
  price_leasing?: number;
  payment?: number;
  payment_count?: number;
  vat_deductible?: boolean;
  dph?: boolean; // cena s/bez DPH
  deal_type?: string; // "sale" | "operating_lease" | "sale_or_lease"

  // Technické údaje
  fuel_type_id?: number;
  gearbox_id?: number;
  gearbox_level_id?: number; // počet stupňů převodovky (3-8+)
  drive_id?: number;
  engine_volume?: number;
  engine_power?: number;
  engine_power_ps?: number;
  tachometer: number;
  tachometer_unit_id?: number;
  gas_mileage?: number; // spotřeba l/100km
  weight?: number; // hmotnost kg
  load_capacity?: number; // nosnost kg
  motohodiny?: number; // motohodiny (stroje)

  // Elektro
  battery_capacity?: number;
  electric_mileage?: number;
  vehicle_range?: number;

  // Datum
  manufacture_date?: string;
  first_registration?: string;
  made_year?: number;
  made_month?: number;
  run_date?: string; // v provozu od
  disused_date?: string; // mimo provoz od
  stk_date?: string; // STK platné do
  guarantee_date?: string; // záruka do
  delivery_date?: string; // dodání (u availability=1)

  // Vzhled
  color_id?: number;
  color_tone_id?: number; // 1=světlá, 2=tmavá
  color_type_id?: number; // 1=základní, 2=metalíza, 3=fólie, 4=pastelová, 5=perleťová

  // Další
  door_count_id?: number;
  capacity_id?: number;
  airbag_count_id?: number;
  aircondition_id?: number;
  euro_id?: number;
  servicebook_id?: number;
  country_id?: number;
  availability_id?: number;
  bed_count_id?: number;
  upholstery_id?: number;
  owner_count_id?: number;
  deal_type_id?: number;
  seller_type_id?: number;
  motorcycle_type_id?: number;
  truck_type_id?: number;
  bus_type_id?: number;
  trailer_type_id?: number;
  seatplace_id?: number; // kategorie sedadel autobusů
  certified_id?: number; // ověřené vozidlo (Škoda Plus, DWA...)
  type_info?: string; // doplňková info o modelu (max 30 znaků)

  // Speciální příznaky
  tunning?: boolean; // tuningové úpravy
  handicapped?: boolean; // úpravy pro hendikepované
  environmental_tax?: boolean; // ekologická daň zaplacena

  // Cebia
  cebia_coupon?: string; // Cebia kupón (10 znaků)
  cebia_smart_code_url?: string; // Cebia Smart Code URL

  // VIN
  vin?: string;
  owners_count?: number;
  crashed?: boolean;
  first_owner?: number; // codebook: 1=Ano, 2=Ne

  // Operativní leasing
  operating_lease?: OperatingLeaseData;

  // Lokace
  region_id?: number;
  address?: string;
  city?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;

  // Prodejce
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  seller_type?: string;
  seller_logo_url?: string;
  seller_rating?: number;
  seller_review_count?: number;

  // Popis
  description?: string;
  note?: string;

  // Média
  images: VehicleImage[];
  image_count: number;
  main_image_url?: string;
  main_thumbnail_url?: string;
  video_url?: string;

  // Hodnocení ceny
  price_rating?: 'very_good' | 'good' | 'fair' | 'high';
  price_rating_value?: number;

  // Meta
  source?: string;
  source_url?: string;
  is_top?: boolean;
  is_promoted?: boolean;
  is_active?: boolean;
  views_count?: number;
  created_at: string;
  updated_at: string;

  // Joiny
  manufacturer_name?: string;
  model_name?: string;
  fuel_name?: string;
  gearbox_name?: string;
  color_name?: string;
  condition_name?: string;
  region_name?: string;
  drive_name?: string;
  body_type_name?: string;
  aircondition_name?: string;
  euro_name?: string;
  country_name?: string;

  // Výbava
  equipment?: CodebookWithCategory[];
}

export interface VehicleImage {
  url: string;
  thumbnail_url?: string;
  order?: number;
}

// Operativní leasing
export interface OperatingLeaseData {
  operating_lease_id?: number;
  annual_distance?: number; // roční nájezd km
  price_without_vat?: number;
  period?: number; // doba pronájmu v měsících
  services?: number[]; // ID služeb z číselníku
  additional_info?: string;
  intended_for_id?: number; // 1=Firma, 2=OSVČ, 3=FO
}

// Vyhledávání
export interface SearchFilters {
  manufacturer_id?: number;
  model_id?: number;
  kind_id?: number;
  condition_id?: number;
  body_type_id?: number;
  fuel_type_id?: number;
  gearbox_id?: number;
  drive_id?: number;
  color_id?: number;
  region_id?: number;
  aircondition_id?: number;
  euro_id?: number;

  price_from?: number;
  price_to?: number;
  year_from?: number;
  year_to?: number;
  km_from?: number;
  km_to?: number;
  power_from?: number;
  power_to?: number;
  volume_from?: number;
  volume_to?: number;

  capacity_id?: number;
  door_count_id?: number;
  airbag_count_id?: number;
  bed_count_id?: number;
  availability_id?: number;
  color_tone_id?: number;

  vat_deductible?: boolean;
  first_owner?: boolean;
  crashed?: boolean;
  tunning?: boolean;
  handicapped?: boolean;
  servicebook_id?: number;
  country_id?: number;
  upholstery_id?: number;
  owner_count_id?: number;
  deal_type_id?: number;
  seller_type_id?: number;
  motorcycle_type_id?: number;
  truck_type_id?: number;
  bus_type_id?: number;
  trailer_type_id?: number;
  seatplace_id?: number;
  gearbox_level_id?: number;
  color_type_id?: number;
  certified_id?: number;

  equipment_ids?: number[];

  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  query?: string;
}

export interface SearchResult {
  vehicles: Vehicle[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Uložené hledání
export interface SavedSearch {
  id: number;
  user_id: string;
  name: string;
  filters: SearchFilters;
  notify_email: boolean;
  notify_frequency: string;
  results_count: number;
  last_checked_at?: string;
  created_at: string;
}

// Uživatel
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  is_dealer?: boolean;
}

// Statistiky
export interface VehicleStats {
  total_vehicles: number;
  personal_vehicles: number;
  electric_vehicles: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  manufacturer_count: number;
  model_count: number;
}

// Počty pro filtry
export interface ManufacturerCount {
  id: number;
  name: string;
  vehicle_count: number;
}
