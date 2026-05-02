import { create } from 'zustand';
import type { SearchFilters, Vehicle, FilterFacets } from '../types';
import { searchVehicles, getFilterFacets } from '../lib/api';

interface SearchState {
  filters: SearchFilters;
  results: Vehicle[];
  totalCount: number;
  isLoading: boolean;
  page: number;
  perPage: number;
  facets: FilterFacets | null;

  setFilter: (key: keyof SearchFilters, value: unknown) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSortBy: (sortBy: string) => void;
  search: () => void;
  hydrateFromUrl: (params: URLSearchParams) => void;
  toUrlSearchParams: () => URLSearchParams;
}

const DEFAULT_FILTERS: SearchFilters = {
  kind_id: 1,
  sort_by: 'created_at',
  page: 1,
  per_page: 20,
};

// Mapování filtru → typ pro URL parsing
const NUMERIC_KEYS = new Set([
  'manufacturer_id', 'model_id', 'kind_id', 'condition_id', 'body_type_id',
  'fuel_type_id', 'gearbox_id', 'drive_id', 'color_id', 'region_id',
  'aircondition_id', 'euro_id', 'price_from', 'price_to', 'year_from',
  'year_to', 'km_from', 'km_to', 'power_from', 'power_to', 'volume_from',
  'volume_to', 'capacity_id', 'door_count_id', 'airbag_count_id',
  'bed_count_id', 'availability_id', 'color_tone_id', 'servicebook_id',
  'country_id', 'upholstery_id', 'owner_count_id', 'deal_type_id',
  'seller_type_id', 'motorcycle_type_id', 'truck_type_id', 'bus_type_id',
  'trailer_type_id', 'quad_type_id', 'machine_type_id', 'seatplace_id',
  'gearbox_level_id', 'color_type_id', 'certified_id', 'page', 'per_page',
  'user_lat', 'user_lng', 'radius_km',
]);

const BOOLEAN_KEYS = new Set([
  'vat_deductible', 'first_owner', 'crashed', 'tunning', 'handicapped',
]);

const ARRAY_NUMERIC_KEYS = new Set([
  'equipment_ids', 'manufacturer_ids',
]);

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  results: [],
  totalCount: 0,
  isLoading: false,
  page: 1,
  perPage: 20,
  facets: null,

  setFilter: (key, value) => {
    set((state) => {
      const newFilters = { ...state.filters, [key]: value || undefined };
      // Reset category-specific filters when changing vehicle kind
      if (key === 'kind_id') {
        newFilters.manufacturer_id = undefined;
        newFilters.manufacturer_ids = undefined;
        newFilters.model_id = undefined;
        newFilters.body_type_id = undefined;
        newFilters.motorcycle_type_id = undefined;
        newFilters.truck_type_id = undefined;
        newFilters.bus_type_id = undefined;
        newFilters.trailer_type_id = undefined;
        newFilters.quad_type_id = undefined;
        newFilters.machine_type_id = undefined;
        newFilters.seatplace_id = undefined;
        newFilters.gearbox_id = undefined;
        newFilters.gearbox_level_id = undefined;
        newFilters.door_count_id = undefined;
        newFilters.bed_count_id = undefined;
        newFilters.airbag_count_id = undefined;
        newFilters.volume_from = undefined;
        newFilters.volume_to = undefined;
        newFilters.power_from = undefined;
        newFilters.power_to = undefined;
      }
      return { filters: newFilters, page: 1 };
    });
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS }, page: 1, results: [], totalCount: 0, facets: null });
  },

  setPage: (page) => {
    set({ page });
    get().search();
  },

  setSortBy: (sortBy) => {
    set((state) => ({
      filters: { ...state.filters, sort_by: sortBy },
      page: 1,
    }));
    get().search();
  },

  search: () => {
    const { filters, page, perPage } = get();
    set({ isLoading: true });

    // Paralelně: search + facets
    Promise.allSettled([
      searchVehicles(filters as Record<string, unknown>, page, perPage, filters.sort_by),
      getFilterFacets(filters as Record<string, unknown>),
    ]).then(([searchRes, facetsRes]) => {
      if (searchRes.status === 'fulfilled') {
        set({
          results: searchRes.value.vehicles,
          totalCount: searchRes.value.total_count,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
      if (facetsRes.status === 'fulfilled' && facetsRes.value) {
        set({ facets: facetsRes.value });
      }
    });
  },

  // === URL state synchronizace ===
  // Volá se z SearchPage při mount + při změně URL (navigace)
  hydrateFromUrl: (params) => {
    const filters: Record<string, unknown> = {};

    params.forEach((rawValue, key) => {
      if (rawValue === '' || rawValue == null) return;
      if (NUMERIC_KEYS.has(key)) {
        const n = Number(rawValue);
        if (!Number.isNaN(n)) filters[key] = n;
      } else if (BOOLEAN_KEYS.has(key)) {
        filters[key] = rawValue === 'true' || rawValue === '1';
      } else if (ARRAY_NUMERIC_KEYS.has(key)) {
        filters[key] = rawValue.split(',').map(Number).filter((n) => !Number.isNaN(n));
      } else {
        filters[key] = rawValue;
      }
    });

    set({
      filters: { ...DEFAULT_FILTERS, ...filters } as SearchFilters,
      page: typeof filters.page === 'number' ? filters.page : 1,
    });
  },

  toUrlSearchParams: () => {
    const { filters, page } = get();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      // Skip default values to keep URLs clean
      if (key === 'kind_id' && value === DEFAULT_FILTERS.kind_id) return;
      if (key === 'sort_by' && value === DEFAULT_FILTERS.sort_by) return;
      if (key === 'per_page' && value === DEFAULT_FILTERS.per_page) return;
      if (Array.isArray(value)) {
        if (value.length === 0) return;
        params.set(key, value.join(','));
      } else if (typeof value === 'boolean') {
        if (value) params.set(key, '1');
      } else {
        params.set(key, String(value));
      }
    });
    if (page > 1) params.set('page', String(page));
    return params;
  },
}));
