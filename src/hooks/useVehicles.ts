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
  getDealerBySlug,
  getDealerListings,
  getDealerReviews,
  getSellerDashboard,
  getMyListings,
  getSellerInquiries,
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

// === Dealer profile page ===
export function useDealerBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['dealer', slug],
    queryFn: () => getDealerBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDealerListings(dealerId: number | undefined, limit = 24) {
  return useQuery({
    queryKey: ['dealerListings', dealerId, limit],
    queryFn: () => getDealerListings(dealerId!, limit),
    enabled: !!dealerId,
    staleTime: 60 * 1000,
  });
}

export function useDealerReviews(dealerId: number | undefined, limit = 20) {
  return useQuery({
    queryKey: ['dealerReviews', dealerId, limit],
    queryFn: () => getDealerReviews(dealerId!, limit),
    enabled: !!dealerId,
    staleTime: 5 * 60 * 1000,
  });
}

// === Seller dashboard ===
export function useSellerDashboard(userId: string | undefined) {
  return useQuery({
    queryKey: ['sellerDashboard', userId],
    queryFn: () => getSellerDashboard(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useMyListings(userId: string | undefined, dealerId?: number) {
  return useQuery({
    queryKey: ['myListings', userId, dealerId],
    queryFn: () => getMyListings(userId!, dealerId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useSellerInquiries(filter?: { status?: 'new' | 'contacted' | 'closed' | 'spam'; limit?: number }) {
  return useQuery({
    queryKey: ['sellerInquiries', filter?.status, filter?.limit],
    queryFn: () => getSellerInquiries(filter),
    staleTime: 15 * 1000,
  });
}
