import { useQuery } from '@tanstack/react-query';
import {
  getTopVehicles,
  getVehicle,
  getVehiclesByIds,
  getManufacturers,
  getModels,
  getManufacturerCounts,
  getCategoryCounts,
  getFilterFacets,
  getSimilarVehicles,
  getRecentlyViewed,
  getPriceHistory,
  getPriceDrops,
} from '../lib/api';

export function useTopVehicles(limit = 6) {
  return useQuery({
    queryKey: ['topVehicles', limit],
    queryFn: () => getTopVehicles(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVehicle(id: number | undefined) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVehiclesByIds(ids: number[]) {
  return useQuery({
    queryKey: ['vehicles', ids],
    queryFn: () => getVehiclesByIds(ids),
    enabled: ids.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useManufacturers(kindId?: number) {
  return useQuery({
    queryKey: ['manufacturers', kindId],
    queryFn: () => getManufacturers(kindId),
    staleTime: 30 * 60 * 1000,
  });
}

export function useModels(manufacturerId: number | undefined) {
  return useQuery({
    queryKey: ['models', manufacturerId],
    queryFn: () => getModels(manufacturerId!),
    enabled: !!manufacturerId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useManufacturerCounts() {
  return useQuery({
    queryKey: ['manufacturerCounts'],
    queryFn: getManufacturerCounts,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['categoryCounts'],
    queryFn: getCategoryCounts,
    staleTime: 10 * 60 * 1000,
  });
}

// === Live faceted counts (filtered) ===
export function useFilterFacets(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ['filterFacets', filters],
    queryFn: () => getFilterFacets(filters),
    staleTime: 30 * 1000,
  });
}

// === Podobná vozidla na detail page ===
export function useSimilarVehicles(vehicleId: number | undefined, limit = 6) {
  return useQuery({
    queryKey: ['similar', vehicleId, limit],
    queryFn: () => getSimilarVehicles(vehicleId!, limit),
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000,
  });
}

// === Nedávno prohlížené (na homepage / detail) ===
export function useRecentlyViewed(limit = 8, userId?: string) {
  return useQuery({
    queryKey: ['recentlyViewed', limit, userId ?? 'session'],
    queryFn: () => getRecentlyViewed(limit, userId),
    staleTime: 30 * 1000,
  });
}

// === Cenová historie pro detail page ===
export function usePriceHistory(vehicleId: number | undefined) {
  return useQuery({
    queryKey: ['priceHistory', vehicleId],
    queryFn: () => getPriceHistory(vehicleId!),
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000,
  });
}

// === Klesly ceny (homepage sekce) ===
export function usePriceDrops(limit = 12) {
  return useQuery({
    queryKey: ['priceDrops', limit],
    queryFn: () => getPriceDrops(limit),
    staleTime: 5 * 60 * 1000,
  });
}
