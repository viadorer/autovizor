// ============================================================
// AUTOVIZOR.CZ - Data service layer
// Supabase-first s automatickým fallbackem na mock data
// ============================================================

import { supabase } from './supabase';
import { getMockVehicles, getMockVehicle, searchMockVehicles } from './mock-data';
import { MANUFACTURERS } from './manufacturers';
import type { Vehicle, SearchResult, ManufacturerCount } from '../types';
import type { ManufacturerWithModels } from './manufacturers';

// ============================================================
// Helper: normalize vehicle images (JSONB may be string)
// ============================================================
function normalizeVehicle(v: Record<string, unknown>): Vehicle {
  const vehicle = v as unknown as Vehicle;

  // Parse JSONB string → array
  if (typeof vehicle.images === 'string') {
    try { vehicle.images = JSON.parse(vehicle.images as string); } catch { vehicle.images = []; }
  }
  if (!Array.isArray(vehicle.images)) vehicle.images = [];

  // Normalize: plain string URLs → VehicleImage objects {url, order}
  vehicle.images = vehicle.images.map((img: unknown, i: number) => {
    if (typeof img === 'string') return { url: img, order: i };
    if (img && typeof img === 'object' && 'url' in img) return img as { url: string; order: number };
    return null;
  }).filter((x): x is { url: string; order: number } => x !== null);

  return vehicle;
}

// ============================================================
// Helper: je Supabase nakonfigurovaný?
// ============================================================
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return !!url && url !== 'https://your-project.supabase.co';
};

// ============================================================
// searchVehicles - hlavní vyhledávání vozidel
// ============================================================
export async function searchVehicles(
  filters: Record<string, unknown>,
  page = 1,
  perPage = 20,
  sortBy = 'created_at'
): Promise<SearchResult> {
  if (!isSupabaseConfigured()) {
    const mock = searchMockVehicles(filters, page, perPage, sortBy);
    return {
      vehicles: mock.vehicles,
      total_count: mock.total_count,
      page,
      per_page: perPage,
      total_pages: Math.ceil(mock.total_count / perPage),
    };
  }

  try {
    let query = supabase
      .from('vehicles')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // ID filtry
    if (filters.manufacturer_id) query = query.eq('manufacturer_id', filters.manufacturer_id);
    if (filters.model_id) query = query.eq('model_id', filters.model_id);
    if (filters.fuel_type_id) query = query.eq('fuel_type_id', filters.fuel_type_id);
    if (filters.gearbox_id) query = query.eq('gearbox_id', filters.gearbox_id);
    if (filters.color_id) query = query.eq('color_id', filters.color_id);
    if (filters.condition_id) query = query.eq('condition_id', filters.condition_id);
    if (filters.region_id) query = query.eq('region_id', filters.region_id);
    if (filters.kind_id) query = query.eq('kind_id', filters.kind_id);
    if (filters.body_type_id) query = query.eq('body_type_id', filters.body_type_id);
    if (filters.drive_id) query = query.eq('drive_id', filters.drive_id);
    if (filters.aircondition_id) query = query.eq('aircondition_id', filters.aircondition_id);
    if (filters.euro_id) query = query.eq('euro_id', filters.euro_id);
    if (filters.door_count_id) query = query.eq('door_count_id', filters.door_count_id);
    if (filters.capacity_id) query = query.eq('capacity_id', filters.capacity_id);
    if (filters.country_id) query = query.eq('country_id', filters.country_id);
    if (filters.servicebook_id) query = query.eq('servicebook_id', filters.servicebook_id);
    if (filters.upholstery_id) query = query.eq('upholstery_id', filters.upholstery_id);
    if (filters.owner_count_id) query = query.eq('owner_count_id', filters.owner_count_id);
    if (filters.deal_type_id) query = query.eq('deal_type_id', filters.deal_type_id);
    if (filters.seller_type_id) query = query.eq('seller_type_id', filters.seller_type_id);
    if (filters.gearbox_level_id) query = query.eq('gearbox_level_id', filters.gearbox_level_id);
    if (filters.color_type_id) query = query.eq('color_type_id', filters.color_type_id);
    if (filters.color_tone_id) query = query.eq('color_tone_id', filters.color_tone_id);
    if (filters.certified_id) query = query.eq('certified_id', filters.certified_id);
    if (filters.availability_id) query = query.eq('availability_id', filters.availability_id);
    if (filters.airbag_count_id) query = query.eq('airbag_count_id', filters.airbag_count_id);
    if (filters.bed_count_id) query = query.eq('bed_count_id', filters.bed_count_id);
    if (filters.motorcycle_type_id) query = query.eq('motorcycle_type_id', filters.motorcycle_type_id);
    if (filters.truck_type_id) query = query.eq('truck_type_id', filters.truck_type_id);
    if (filters.bus_type_id) query = query.eq('bus_type_id', filters.bus_type_id);
    if (filters.trailer_type_id) query = query.eq('trailer_type_id', filters.trailer_type_id);
    if (filters.seatplace_id) query = query.eq('seatplace_id', filters.seatplace_id);

    // Range filtry
    if (filters.price_from) query = query.gte('price', filters.price_from);
    if (filters.price_to) query = query.lte('price', filters.price_to);
    if (filters.year_from) query = query.gte('made_year', filters.year_from);
    if (filters.year_to) query = query.lte('made_year', filters.year_to);
    if (filters.km_from) query = query.gte('tachometer', filters.km_from);
    if (filters.km_to) query = query.lte('tachometer', filters.km_to);
    if (filters.power_from) query = query.gte('engine_power', filters.power_from);
    if (filters.power_to) query = query.lte('engine_power', filters.power_to);
    if (filters.volume_from) query = query.gte('engine_volume', filters.volume_from);
    if (filters.volume_to) query = query.lte('engine_volume', filters.volume_to);

    // Boolean filtry
    if (filters.vat_deductible) query = query.eq('vat_deductible', true);
    if (filters.first_owner) query = query.eq('first_owner', 1);
    if (filters.crashed === true) query = query.eq('crashed', true);
    if (filters.crashed === false) query = query.eq('crashed', false);

    // Text search
    if (filters.query) {
      query = query.ilike('title', `%${filters.query}%`);
    }

    // Řazení
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'year_desc':
        query = query.order('made_year', { ascending: false });
        break;
      case 'year_asc':
        query = query.order('made_year', { ascending: true });
        break;
      case 'km_asc':
        query = query.order('tachometer', { ascending: true });
        break;
      case 'km_desc':
        query = query.order('tachometer', { ascending: false });
        break;
      case 'power_desc':
        query = query.order('engine_power', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Paginace
    const from = (page - 1) * perPage;
    const to = page * perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalCount = count ?? 0;
    return {
      vehicles: (data ?? []).map(v => normalizeVehicle(v as Record<string, unknown>)),
      total_count: totalCount,
      page,
      per_page: perPage,
      total_pages: Math.ceil(totalCount / perPage),
    };
  } catch (err) {
    console.error('Supabase searchVehicles error, falling back to mock:', err);
    const mock = searchMockVehicles(filters, page, perPage, sortBy);
    return {
      vehicles: mock.vehicles,
      total_count: mock.total_count,
      page,
      per_page: perPage,
      total_pages: Math.ceil(mock.total_count / perPage),
    };
  }
}

// ============================================================
// getVehicle - detail jednoho vozidla
// ============================================================
export async function getVehicle(id: number): Promise<Vehicle | undefined> {
  if (!isSupabaseConfigured()) {
    return getMockVehicle(id);
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch equipment separately
    const { data: equipData } = await supabase
      .from('vehicle_equipment')
      .select('equipment_id, equipment:equipment(id, name, category)')
      .eq('vehicle_id', id);

    const vehicle = normalizeVehicle(data as Record<string, unknown>);
    if (equipData && equipData.length > 0) {
      vehicle.equipment = equipData.map((e: Record<string, unknown>) => {
        const eq = e.equipment as Record<string, unknown>;
        return {
          id: eq.id as number,
          name: eq.name as string,
          category: (eq.category as string) ?? undefined,
        };
      });
    }

    return vehicle;
  } catch (err) {
    console.error('Supabase getVehicle error, falling back to mock:', err);
    return getMockVehicle(id);
  }
}

// ============================================================
// getTopVehicles - top/promoted vozidla pro homepage
// ============================================================
export async function getTopVehicles(limit = 6): Promise<Vehicle[]> {
  if (!isSupabaseConfigured()) {
    const vehicles = getMockVehicles(200);
    return vehicles.filter((v) => v.is_top || v.is_promoted).slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .eq('is_top', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(v => normalizeVehicle(v as Record<string, unknown>));
  } catch (err) {
    console.error('Supabase getTopVehicles error, falling back to mock:', err);
    const vehicles = getMockVehicles(200);
    return vehicles.filter((v) => v.is_top || v.is_promoted).slice(0, limit);
  }
}

// ============================================================
// getVehiclesByIds - pro oblíbené
// ============================================================
export async function getVehiclesByIds(ids: number[]): Promise<Vehicle[]> {
  if (ids.length === 0) return [];

  if (!isSupabaseConfigured()) {
    const vehicles = getMockVehicles(200);
    return vehicles.filter((v) => ids.includes(v.id));
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    return (data ?? []).map(v => normalizeVehicle(v as Record<string, unknown>));
  } catch (err) {
    console.error('Supabase getVehiclesByIds error, falling back to mock:', err);
    const vehicles = getMockVehicles(200);
    return vehicles.filter((v) => ids.includes(v.id));
  }
}

// ============================================================
// getManufacturers - seznam výrobců
// ============================================================
export async function getManufacturers(kindId?: number): Promise<ManufacturerWithModels[]> {
  if (!isSupabaseConfigured()) {
    return kindId ? MANUFACTURERS.filter(m => !m.kind_ids || m.kind_ids.includes(kindId)) : MANUFACTURERS;
  }

  try {
    let query = supabase.from('manufacturers').select('*').order('name');
    if (kindId) {
      query = query.eq('kind_id', kindId);
    }
    const { data, error } = await query;

    if (error) throw error;

    // Fetch models for matched manufacturers
    const mfrIds = (data ?? []).map((m: Record<string, unknown>) => m.id as number);
    const { data: modelsData, error: modelsError } = await supabase
      .from('models')
      .select('*')
      .in('manufacturer_id', mfrIds)
      .order('name');

    if (modelsError) throw modelsError;

    const modelsByMfr = (modelsData ?? []).reduce<Record<number, { id: number; name: string }[]>>((acc, m: Record<string, unknown>) => {
      const mfrId = m.manufacturer_id as number;
      if (!acc[mfrId]) acc[mfrId] = [];
      acc[mfrId].push({ id: m.id as number, name: m.name as string });
      return acc;
    }, {});

    return (data ?? []).map((m: Record<string, unknown>) => ({
      id: m.id as number,
      name: m.name as string,
      seo_name: (m.seo_name as string) ?? '',
      models: (modelsByMfr[m.id as number] ?? []).map(mod => ({
        ...mod,
        seo_name: '',
      })),
    }));
  } catch (err) {
    console.error('Supabase getManufacturers error, falling back to static:', err);
    return MANUFACTURERS;
  }
}

// ============================================================
// getModels - modely pro daného výrobce
// ============================================================
export async function getModels(manufacturerId: number): Promise<{ id: number; name: string }[]> {
  if (!isSupabaseConfigured()) {
    const mfr = MANUFACTURERS.find((m) => m.id === manufacturerId);
    return mfr?.models ?? [];
  }

  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('manufacturer_id', manufacturerId)
      .order('name');

    if (error) throw error;
    return (data ?? []).map((m: Record<string, unknown>) => ({
      id: m.id as number,
      name: m.name as string,
    }));
  } catch (err) {
    console.error('Supabase getModels error, falling back to static:', err);
    const mfr = MANUFACTURERS.find((m) => m.id === manufacturerId);
    return mfr?.models ?? [];
  }
}

// ============================================================
// getCategoryCounts - počty vozidel dle kategorie (kind_id)
// ============================================================
export async function getCategoryCounts(): Promise<{ kind_id: number; count: number }[]> {
  if (!isSupabaseConfigured()) {
    // Mock: stabilní realistické počty dle kategorií
    return [
      { kind_id: 1, count: 245832 },  // Osobní
      { kind_id: 3, count: 15621 },   // Motocykly
      { kind_id: 4, count: 27234 },   // Užitkové
      { kind_id: 5, count: 8912 },    // Nákladní
      { kind_id: 6, count: 1245 },    // Autobusy
      { kind_id: 7, count: 6789 },    // Přívěsy
      { kind_id: 9, count: 4456 },    // Obytné
    ];
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('kind_id')
      .eq('is_active', true);

    if (error) throw error;

    const counts: Record<number, number> = {};
    for (const row of data ?? []) {
      const k = (row as Record<string, unknown>).kind_id as number;
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return Object.entries(counts).map(([kind_id, count]) => ({
      kind_id: Number(kind_id),
      count,
    }));
  } catch (err) {
    console.error('Supabase getCategoryCounts error, falling back to mock:', err);
    return [
      { kind_id: 1, count: 245832 },
      { kind_id: 3, count: 15621 },
      { kind_id: 4, count: 27234 },
      { kind_id: 5, count: 8912 },
      { kind_id: 6, count: 1245 },
      { kind_id: 7, count: 6789 },
      { kind_id: 9, count: 4456 },
    ];
  }
}

// ============================================================
// getManufacturerCounts - počty vozidel dle výrobce
// ============================================================
export async function getManufacturerCounts(): Promise<ManufacturerCount[]> {
  if (!isSupabaseConfigured()) {
    // Mock: stabilní počty pro nejpopulárnější značky v ČR
    const popularBrands: { name: string; count: number }[] = [
      { name: 'Škoda', count: 48523 },
      { name: 'Volkswagen', count: 31247 },
      { name: 'BMW', count: 24891 },
      { name: 'Mercedes-Benz', count: 22156 },
      { name: 'Audi', count: 19834 },
      { name: 'Ford', count: 17562 },
      { name: 'Toyota', count: 14389 },
      { name: 'Hyundai', count: 12745 },
      { name: 'Peugeot', count: 11203 },
      { name: 'Renault', count: 10891 },
      { name: 'Kia', count: 9876 },
      { name: 'Opel', count: 9234 },
      { name: 'Citroën', count: 7891 },
      { name: 'Mazda', count: 6543 },
      { name: 'Honda', count: 5678 },
      { name: 'Volvo', count: 5432 },
      { name: 'Nissan', count: 4987 },
      { name: 'SEAT', count: 4756 },
      { name: 'Fiat', count: 4523 },
      { name: 'Dacia', count: 4312 },
    ];
    return popularBrands.map((b, i) => {
      const mfr = MANUFACTURERS.find((m) => m.name === b.name);
      return { id: mfr?.id ?? i + 1, name: b.name, vehicle_count: b.count };
    });
  }

  try {
    // Fetch vehicle counts grouped by manufacturer
    const { data: vehicleData, error: vError } = await supabase
      .from('vehicles')
      .select('manufacturer_id')
      .eq('is_active', true);

    if (vError) throw vError;

    const counts: Record<number, number> = {};
    for (const row of vehicleData ?? []) {
      const mid = (row as Record<string, unknown>).manufacturer_id as number;
      counts[mid] = (counts[mid] ?? 0) + 1;
    }

    // Fetch manufacturer names from DB
    const mfrIds = Object.keys(counts).map(Number);
    const { data: mfrData, error: mError } = await supabase
      .from('manufacturers')
      .select('id, name')
      .in('id', mfrIds);

    if (mError) throw mError;

    const mfrMap = new Map((mfrData ?? []).map((m: Record<string, unknown>) => [m.id as number, m.name as string]));

    return Object.entries(counts)
      .map(([id, count]) => ({
        id: Number(id),
        name: mfrMap.get(Number(id)) ?? `Výrobce ${id}`,
        vehicle_count: count,
      }))
      .sort((a, b) => b.vehicle_count - a.vehicle_count);
  } catch (err) {
    console.error('Supabase getManufacturerCounts error, falling back to mock:', err);
    const popularNames = ['Škoda','Volkswagen','BMW','Mercedes-Benz','Audi','Ford','Toyota','Hyundai'];
    const popularCounts = [48523, 31247, 24891, 22156, 19834, 17562, 14389, 12745];
    return popularNames.map((name, i) => {
      const mfr = MANUFACTURERS.find((m) => m.name === name);
      return { id: mfr?.id ?? i + 1, name, vehicle_count: popularCounts[i] };
    });
  }
}
