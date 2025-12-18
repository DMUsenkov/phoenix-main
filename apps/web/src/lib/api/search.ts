

import { apiClient } from './client';

export interface PageSearchItem {
  slug: string;
  title: string | null;
  short_description: string | null;
  person_name: string;
  birth_date: string | null;
  death_date: string | null;
  life_status: string;
  primary_photo_url: string | null;
}

export interface PageSearchResponse {
  items: PageSearchItem[];
  total: number;
  page: number;
  size: number;
  query: string;
}

export const searchApi = {
  searchPages: async (
    query: string,
    page: number = 1,
    size: number = 10
  ): Promise<PageSearchResponse> => {
    return apiClient.get<PageSearchResponse>(
      `/api/public/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
    );
  },
};
