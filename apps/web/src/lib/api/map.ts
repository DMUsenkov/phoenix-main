

import { apiClient } from './client';

export type ObjectType = 'tree' | 'plaque' | 'place';
export type LifeStatus = 'alive' | 'deceased';

export interface MapObject {
  id: string;
  type: ObjectType;
  lat: number;
  lng: number;
  title: string | null;
  page_slug: string;
  life_status: LifeStatus | null;
}

export interface MapObjectsResponse {
  items: MapObject[];
  total: number;
  limit: number;
}

export interface MapQueryParams {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  types?: ObjectType[];
  limit?: number;
}

export async function fetchMapObjects(params: MapQueryParams): Promise<MapObjectsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('minLat', params.minLat.toString());
  searchParams.set('minLng', params.minLng.toString());
  searchParams.set('maxLat', params.maxLat.toString());
  searchParams.set('maxLng', params.maxLng.toString());

  if (params.types && params.types.length > 0) {
    searchParams.set('types', params.types.join(','));
  }

  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  return apiClient.get<MapObjectsResponse>(
    `/api/public/map/objects?${searchParams.toString()}`,
    { skipAuth: true }
  );
}

export interface BurialPoint {
  page_slug: string;
  full_name: string;
  lat: number;
  lng: number;
  burial_place: string | null;
  photo_url: string | null;
  birth_date: string | null;
  death_date: string | null;
}

export interface BurialPointsResponse {
  items: BurialPoint[];
  total: number;
}

export async function fetchBurialPoints(limit: number = 1000): Promise<BurialPointsResponse> {
  return apiClient.get<BurialPointsResponse>(
    `/api/public/map/burials?limit=${limit}`,
    { skipAuth: true }
  );
}
