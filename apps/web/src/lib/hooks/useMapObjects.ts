

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { fetchMapObjects, type MapQueryParams, type ObjectType } from '@/lib/api';

export interface BBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

interface UseMapObjectsOptions {
  types?: ObjectType[];
  limit?: number;
  debounceMs?: number;
}

export function useMapObjects(bbox: BBox | null, options: UseMapObjectsOptions = {}) {
  const { types = [], limit = 300, debounceMs = 300 } = options;
  const [debouncedBBox, setDebouncedBBox] = useState<BBox | null>(bbox);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedBBox(bbox);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [bbox, debounceMs]);

  const queryParams: MapQueryParams | null = debouncedBBox
    ? {
        minLat: debouncedBBox.minLat,
        minLng: debouncedBBox.minLng,
        maxLat: debouncedBBox.maxLat,
        maxLng: debouncedBBox.maxLng,
        types: types.length > 0 ? types : [],
        limit,
      }
    : null;

  const query = useQuery({
    queryKey: ['mapObjects', queryParams],
    queryFn: () => fetchMapObjects(queryParams!),
    enabled: !!queryParams,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return {
    objects: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
