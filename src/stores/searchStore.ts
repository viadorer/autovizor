import { create } from 'zustand';
import type { SearchFilters, Vehicle } from '../types';
import { searchVehicles } from '../lib/api';

interface SearchState {
  filters: SearchFilters;
  results: Vehicle[];
  totalCount: number;
  isLoading: boolean;
  page: number;
  perPage: number;

  setFilter: (key: keyof SearchFilters, value: unknown) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSortBy: (sortBy: string) => void;
  search: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  kind_id: 1,
  sort_by: 'created_at',
  page: 1,
  per_page: 20,
};

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  results: [],
  totalCount: 0,
  isLoading: false,
  page: 1,
  perPage: 20,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value || undefined },
      page: 1,
    }));
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS }, page: 1, results: [], totalCount: 0 });
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

    searchVehicles(
      filters as Record<string, unknown>,
      page,
      perPage,
      filters.sort_by
    )
      .then((result) => {
        set({
          results: result.vehicles,
          totalCount: result.total_count,
          isLoading: false,
        });
      })
      .catch(() => {
        set({ isLoading: false });
      });
  },
}));
