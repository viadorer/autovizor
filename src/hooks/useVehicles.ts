import { useQuery } from '@tanstack/react-query';
import {
  getTopVehicles,
  getVehicle,
  getVehiclesByIds,
  getManufacturers,
  getModels,
  getManufacturerCounts,
  getCategoryCounts,
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
