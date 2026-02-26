import { apiClient } from './client';


export interface RichTextDocument {
  type: string;
  content: unknown[];
}

export interface LocationData {
  address: string | null;
  lat: number | null;
  lng: number | null;
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

export interface LifeEventCreate {
  title: string;
  description?: Record<string, unknown> | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  sort_order?: number;
}

export interface LifeEventUpdate {
  title?: string;
  description?: Record<string, unknown> | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  sort_order?: number;
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

export interface AchievementCreate {
  title: string;
  description?: Record<string, unknown> | null;
  date?: string | null;
  category?: string | null;
  custom_category?: string | null;
  sort_order?: number;
}

export interface AchievementUpdate {
  title?: string;
  description?: Record<string, unknown> | null;
  date?: string | null;
  category?: string | null;
  custom_category?: string | null;
  sort_order?: number;
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

export interface EducationCreate {
  institution: string;
  degree?: string | null;
  field_of_study?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  description?: Record<string, unknown> | null;
  sort_order?: number;
}

export interface EducationUpdate {
  institution?: string;
  degree?: string | null;
  field_of_study?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  description?: Record<string, unknown> | null;
  sort_order?: number;
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

export interface CareerCreate {
  organization: string;
  role: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: Record<string, unknown> | null;
  sort_order?: number;
}

export interface CareerUpdate {
  organization?: string;
  role?: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: Record<string, unknown> | null;
  sort_order?: number;
}


export type ValueType = 'value' | 'belief' | 'principle';

export interface PersonValueDTO {
  id: string;
  type: ValueType;
  text: string;
  sort_order: number;
  created_at: string;
}

export interface PersonValueCreate {
  type: ValueType;
  text: string;
  sort_order?: number;
}

export interface PersonValueUpdate {
  type?: ValueType;
  text?: string;
  sort_order?: number;
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

export interface QuoteCreate {
  text: string;
  source?: string | null;
  sort_order?: number;
}

export interface QuoteUpdate {
  text?: string;
  source?: string | null;
  sort_order?: number;
}


export interface MemorialMessageDTO {
  id: string;
  author_name: string;
  author_user_id: string | null;
  text: Record<string, unknown>;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
}

export interface MemorialMessageCreate {
  author_name: string;
  text: Record<string, unknown>;
}


export interface PageContentDTO {
  life_events: LifeEventDTO[];
  achievements: AchievementDTO[];
  education: EducationDTO[];
  career: CareerDTO[];
  values: PersonValuesGrouped;
  quotes: QuoteDTO[];
  memorial_messages: MemorialMessageDTO[];
}


export const pageContentApi = {

  getPageContent: (pageId: string) =>
    apiClient.get<PageContentDTO>(`/api/pages/${pageId}/content`),


  listLifeEvents: (pageId: string) =>
    apiClient.get<LifeEventDTO[]>(`/api/pages/${pageId}/life-events`),

  createLifeEvent: (pageId: string, data: LifeEventCreate) =>
    apiClient.post<LifeEventDTO>(`/api/pages/${pageId}/life-events`, data),

  updateLifeEvent: (eventId: string, data: LifeEventUpdate) =>
    apiClient.patch<LifeEventDTO>(`/api/life-events/${eventId}`, data),

  deleteLifeEvent: (eventId: string) =>
    apiClient.delete(`/api/life-events/${eventId}`),

  reorderLifeEvents: (pageId: string, itemIds: string[]) =>
    apiClient.post(`/api/pages/${pageId}/life-events/reorder`, { item_ids: itemIds }),


  listAchievements: (pageId: string) =>
    apiClient.get<AchievementDTO[]>(`/api/pages/${pageId}/achievements`),

  createAchievement: (pageId: string, data: AchievementCreate) =>
    apiClient.post<AchievementDTO>(`/api/pages/${pageId}/achievements`, data),

  updateAchievement: (achievementId: string, data: AchievementUpdate) =>
    apiClient.patch<AchievementDTO>(`/api/achievements/${achievementId}`, data),

  deleteAchievement: (achievementId: string) =>
    apiClient.delete(`/api/achievements/${achievementId}`),

  reorderAchievements: (pageId: string, itemIds: string[]) =>
    apiClient.post(`/api/pages/${pageId}/achievements/reorder`, { item_ids: itemIds }),


  listEducation: (pageId: string) =>
    apiClient.get<EducationDTO[]>(`/api/pages/${pageId}/education`),

  createEducation: (pageId: string, data: EducationCreate) =>
    apiClient.post<EducationDTO>(`/api/pages/${pageId}/education`, data),

  updateEducation: (educationId: string, data: EducationUpdate) =>
    apiClient.patch<EducationDTO>(`/api/education/${educationId}`, data),

  deleteEducation: (educationId: string) =>
    apiClient.delete(`/api/education/${educationId}`),

  reorderEducation: (pageId: string, itemIds: string[]) =>
    apiClient.post(`/api/pages/${pageId}/education/reorder`, { item_ids: itemIds }),


  listCareer: (pageId: string) =>
    apiClient.get<CareerDTO[]>(`/api/pages/${pageId}/career`),

  createCareer: (pageId: string, data: CareerCreate) =>
    apiClient.post<CareerDTO>(`/api/pages/${pageId}/career`, data),

  updateCareer: (careerId: string, data: CareerUpdate) =>
    apiClient.patch<CareerDTO>(`/api/career/${careerId}`, data),

  deleteCareer: (careerId: string) =>
    apiClient.delete(`/api/career/${careerId}`),

  reorderCareer: (pageId: string, itemIds: string[]) =>
    apiClient.post(`/api/pages/${pageId}/career/reorder`, { item_ids: itemIds }),


  listValues: (pageId: string) =>
    apiClient.get<PersonValueDTO[]>(`/api/pages/${pageId}/values`),

  listValuesGrouped: (pageId: string) =>
    apiClient.get<PersonValuesGrouped>(`/api/pages/${pageId}/values/grouped`),

  createValue: (pageId: string, data: PersonValueCreate) =>
    apiClient.post<PersonValueDTO>(`/api/pages/${pageId}/values`, data),

  updateValue: (valueId: string, data: PersonValueUpdate) =>
    apiClient.patch<PersonValueDTO>(`/api/values/${valueId}`, data),

  deleteValue: (valueId: string) =>
    apiClient.delete(`/api/values/${valueId}`),


  listQuotes: (pageId: string) =>
    apiClient.get<QuoteDTO[]>(`/api/pages/${pageId}/quotes`),

  createQuote: (pageId: string, data: QuoteCreate) =>
    apiClient.post<QuoteDTO>(`/api/pages/${pageId}/quotes`, data),

  updateQuote: (quoteId: string, data: QuoteUpdate) =>
    apiClient.patch<QuoteDTO>(`/api/quotes/${quoteId}`, data),

  deleteQuote: (quoteId: string) =>
    apiClient.delete(`/api/quotes/${quoteId}`),

  reorderQuotes: (pageId: string, itemIds: string[]) =>
    apiClient.post(`/api/pages/${pageId}/quotes/reorder`, { item_ids: itemIds }),


  listMessages: (pageId: string, includePending = false) =>
    apiClient.get<MemorialMessageDTO[]>(
      `/api/pages/${pageId}/messages?include_pending=${includePending}`
    ),

  createMessage: (pageId: string, data: MemorialMessageCreate) =>
    apiClient.post<MemorialMessageDTO>(`/api/pages/${pageId}/messages`, data),

  approveMessage: (messageId: string) =>
    apiClient.post<MemorialMessageDTO>(`/api/messages/${messageId}/approve`),

  rejectMessage: (messageId: string) =>
    apiClient.post<MemorialMessageDTO>(`/api/messages/${messageId}/reject`),

  deleteMessage: (messageId: string) =>
    apiClient.delete(`/api/messages/${messageId}`),
};

export default pageContentApi;
