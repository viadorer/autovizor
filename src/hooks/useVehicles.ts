import { useQuery } from '@tanstack/react-query';
import {
  getTopVehicles,
  getVehicle,
  getVehiclesByIds,
  getManufacturers,
  getModels,
  getManufacturerCounts,
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

export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: getManufacturers,
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
