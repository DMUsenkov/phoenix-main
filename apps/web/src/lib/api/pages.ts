

import { apiClient } from './client';

export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type LifeStatus = 'alive' | 'deceased' | 'unknown';
export type PageVisibility = 'public' | 'unlisted' | 'private';
export type PageStatus = 'draft' | 'on_moderation' | 'published' | 'rejected' | 'archived';

export interface PersonDTO {
  id: string;
  full_name: string;
  gender: Gender;
  life_status: LifeStatus;
  birth_date: string | null;
  death_date: string | null;

  birth_place: string | null;
  birth_place_lat: number | null;
  birth_place_lng: number | null;
  death_place: string | null;
  death_place_lat: number | null;
  death_place_lng: number | null;
  burial_place: string | null;
  burial_place_lat: number | null;
  burial_place_lng: number | null;
  burial_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RichTextDocument {
  type: string;
  content: unknown[];
}

export interface MemorialPageDTO {
  id: string;
  slug: string;
  title: string | null;
  biography: string | null;
  short_description: string | null;
  biography_json: RichTextDocument | null;
  visibility: PageVisibility;
  status: PageStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  person: PersonDTO;
}

export interface PageListItemDTO {
  id: string;
  slug: string;
  title: string | null;
  status: PageStatus;
  visibility: PageVisibility;
  created_at: string;
  person_name: string;
}

export interface PagesListResponse {
  items: PageListItemDTO[];
  total: number;
  page: number;
  size: number;
}

export interface PersonCreatePayload {
  full_name: string;
  gender?: Gender;
  life_status?: LifeStatus;
  birth_date?: string | null;
  death_date?: string | null;

  birth_place?: string | null;
  birth_place_lat?: number | null;
  birth_place_lng?: number | null;
  death_place?: string | null;
  death_place_lat?: number | null;
  death_place_lng?: number | null;
  burial_place?: string | null;
  burial_place_lat?: number | null;
  burial_place_lng?: number | null;
  burial_photo_url?: string | null;
}

export interface PersonUpdatePayload {
  full_name?: string;
  gender?: Gender;
  life_status?: LifeStatus;
  birth_date?: string | null;
  death_date?: string | null;

  birth_place?: string | null;
  birth_place_lat?: number | null;
  birth_place_lng?: number | null;
  death_place?: string | null;
  death_place_lat?: number | null;
  death_place_lng?: number | null;
  burial_place?: string | null;
  burial_place_lat?: number | null;
  burial_place_lng?: number | null;
  burial_photo_url?: string | null;
}

export interface PageCreatePayload {
  person: PersonCreatePayload;
  title?: string | null;
  biography?: string | null;
  short_description?: string | null;
  biography_json?: RichTextDocument | null;
  visibility?: PageVisibility;
}

export interface PageUpdatePayload {
  person?: PersonUpdatePayload;
  title?: string | null;
  biography?: string | null;
  short_description?: string | null;
  biography_json?: RichTextDocument | null;
  visibility?: PageVisibility;
}

export interface ListPagesParams {
  status?: PageStatus;
  page?: number;
  size?: number;
}

export interface PublicPersonDTO {
  id: string;
  full_name: string;
  gender: Gender;
  life_status: LifeStatus;
  birth_date: string | null;
  death_date: string | null;

  birth_place: string | null;
  birth_place_lat: number | null;
  birth_place_lng: number | null;
  death_place: string | null;
  death_place_lat: number | null;
  death_place_lng: number | null;
  burial_place: string | null;
  burial_place_lat: number | null;
  burial_place_lng: number | null;
  burial_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicMemorialPageDTO {
  slug: string;
  title: string | null;
  biography: string | null;
  short_description: string | null;
  biography_json: RichTextDocument | null;
  person: PublicPersonDTO;
  published_at: string | null;
}

export interface PublicMediaDTO {
  id: string;
  type: 'image' | 'video';
  original_url: string | null;
  preview_url: string | null;
  mime_type: string;
  width: number | null;
  height: number | null;
  is_primary: boolean;
}

export interface PublicMediaListResponse {
  items: PublicMediaDTO[];
  total: number;
  primary_photo: PublicMediaDTO | null;
}

export interface LifeEventDTO {
  id: string;
  title: string;
  description: Record<string, unknown> | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementDTO {
  id: string;
  title: string;
  description: Record<string, unknown> | null;
  date: string | null;
  category: string | null;
  custom_category: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationDTO {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  description: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CareerDTO {
  id: string;
  organization: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PersonValueDTO {
  id: string;
  type: 'value' | 'belief' | 'principle';
  text: string;
  sort_order: number;
  created_at: string;
}

export interface PersonValuesGrouped {
  values: PersonValueDTO[];
  beliefs: PersonValueDTO[];
  principles: PersonValueDTO[];
}

export interface QuoteDTO {
  id: string;
  text: string;
  source: string | null;
  sort_order: number;
  created_at: string;
}

export interface MemorialMessageDTO {
  id: string;
  author_name: string;
  text: Record<string, unknown>;
  created_at: string;
}

export interface PublicPageContentDTO {
  life_events: LifeEventDTO[];
  achievements: AchievementDTO[];
  education: EducationDTO[];
  career: CareerDTO[];
  values: PersonValuesGrouped;
  quotes: QuoteDTO[];
  memorial_messages: MemorialMessageDTO[];
}

export const publicPagesApi = {
  async getPageBySlug(slug: string): Promise<PublicMemorialPageDTO> {
    return apiClient.get<PublicMemorialPageDTO>(`/api/public/pages/${slug}`);
  },

  async getPageMedia(slug: string): Promise<PublicMediaListResponse> {
    return apiClient.get<PublicMediaListResponse>(`/api/public/pages/${slug}/media`);
  },

  async getPageContent(slug: string): Promise<PublicPageContentDTO> {
    return apiClient.get<PublicPageContentDTO>(`/api/public/pages/${slug}/content`);
  },
};

export const pagesApi = {
  async createPage(data: PageCreatePayload): Promise<MemorialPageDTO> {
    return apiClient.post<MemorialPageDTO>('/api/pages', data);
  },

  async listMyPages(params?: ListPagesParams): Promise<PagesListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.size) searchParams.set('size', String(params.size));

    const query = searchParams.toString();
    const url = query ? `/api/pages?${query}` : '/api/pages';
    return apiClient.get<PagesListResponse>(url);
  },

  async getPage(id: string): Promise<MemorialPageDTO> {
    return apiClient.get<MemorialPageDTO>(`/api/pages/${id}`);
  },

  async updatePage(id: string, data: PageUpdatePayload): Promise<MemorialPageDTO> {
    return apiClient.patch<MemorialPageDTO>(`/api/pages/${id}`, data);
  },

  async publishPage(id: string): Promise<MemorialPageDTO> {
    return apiClient.post<MemorialPageDTO>(`/api/pages/${id}/publish`);
  },

  async deletePage(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/pages/${id}`);
  },
};
