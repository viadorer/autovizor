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
  kind_ids?: number[]; // 1=Osobní, 3=Motocykl, 4=Užitkové, 5=Nákladní…
}

export interface Model extends Codebook {
  manufacturer_id: number;
  seo_name?: string;
}

export interface Region extends Codebook {
  region_group?: string;
}

export interface Dealer {
  id: number;
  sauto_id?: number;
  name: string;
  slug?: string;
  type_id?: number;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  zip_code?: string;
  region_id?: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  review_count?: number;
  certified_program_id?: number;
  opening_hours?: Record<string, string>;
  description?: string;
  is_verified?: boolean;
  is_active?: boolean;
}

export interface DealerReview {
  id: number;
  dealer_id: number;
  user_id?: string;
  rating: number;
  title?: string;
  body?: string;
  pros?: string;
  cons?: string;
  is_verified_purchase?: boolean;
  created_at: string;
}

export interface PriceHistoryPoint {
  price: number;
  change_pct?: number;
  recorded_at: string;
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
  vat_deductible?: boolean; // možnost odpočtu DPH (B2B)
  price_includes_vat?: boolean; // cena včetně DPH (true) / bez DPH (false)

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
  quad_type_id?: number; // typ čtyřkolky (kind_id=11)
  machine_type_id?: number; // typ pracovního stroje (kind_id=10)
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

  // Sauto specifické
  sign_note?: string; // poznámka na štítek za sklem (max 100 znaků)
  deactivation_reason?: string; // důvod deaktivace
  car_status?: number; // status ze Sauto (1=aktivní)
  priority_ordering?: number; // priorita řazení

  // VIN
  vin?: string;
  owners_count?: number;
  crashed?: boolean;
  first_owner?: 1 | 2; // codebook: 1=Ano, 2=Ne

  // Operativní leasing
  operating_lease?: OperatingLeaseData;

  // Lokace
  region_id?: number;
  address?: string;
  city?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;

  // SEO slug — používá se v URL /vozidlo/{slug}-{id}
  slug?: string;

  // Vlastnictví inzerátu (po migraci 013)
  user_id?: string; // creator (private seller / dealer admin)
  posted_by?: 'import' | 'private_seller' | 'dealer';
  published_status?: 'draft' | 'pending_review' | 'published' | 'rejected' | 'expired' | 'sold';
  expires_at?: string;

  // Prodejce — denormalizované cache (autoritativní zdroj je tabulka dealers)
  dealer_id?: number;
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
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
  equipment_ids?: number[]; // denormalizované pole pro rychlý GIN filter
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
  manufacturer_ids?: number[]; // multi-select (mobile.de standard)
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
  quad_type_id?: number;
  machine_type_id?: number;
  seatplace_id?: number;
  gearbox_level_id?: number;
  color_type_id?: number;
  certified_id?: number;

  equipment_ids?: number[];

  // Geo radius search (best practice u Mobile.de / AutoScout24)
  user_lat?: number;
  user_lng?: number;
  radius_km?: number;

  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  query?: string;
}

// Faceted counts pro live UI counters
export interface FilterFacets {
  total: number;
  manufacturer_id: Record<string, number>;
  fuel_type_id: Record<string, number>;
  gearbox_id: Record<string, number>;
  body_type_id: Record<string, number>;
  drive_id: Record<string, number>;
  color_id: Record<string, number>;
  condition_id: Record<string, number>;
  region_id: Record<string, number>;
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
export type UserRole = 'buyer' | 'private_seller' | 'dealer_admin' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  is_dealer?: boolean; // legacy, použij role
  role?: UserRole;
  email_verified_at?: string;
  phone_verified_at?: string;
  dealer_id?: number;
}

// Lead-gen / messaging
export type InquiryType = 'message' | 'phone_call' | 'test_drive' | 'offer';
export type InquiryStatus = 'new' | 'contacted' | 'closed' | 'spam';

export interface VehicleInquiry {
  id: number;
  vehicle_id: number;
  dealer_id?: number;
  buyer_user_id?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_message: string;
  inquiry_type?: InquiryType;
  offer_amount?: number;
  status?: InquiryStatus;
  contacted_at?: string;
  is_spam?: boolean;
  created_at: string;
}

export interface VehicleMessage {
  id: number;
  inquiry_id: number;
  sender_user_id?: string;
  sender_role: 'buyer' | 'seller';
  body: string;
  read_at?: string;
  created_at: string;
}

export interface SellerDashboard {
  role: UserRole;
  dealer_id?: number;
  active_listings: number;
  new_inquiries: number;
  total_views_30d: number;
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
