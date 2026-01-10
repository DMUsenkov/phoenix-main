

import { apiClient } from './client';


export type EntityType = 'page' | 'media';
export type TaskStatus = 'pending' | 'approved' | 'rejected';

export interface ModerationTaskDTO {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  org_id: string | null;
  status: TaskStatus;
  priority: number;
  reason: string | null;
  created_by_user_id: string | null;
  moderator_user_id: string | null;
  created_at: string;
  decided_at: string | null;
}

export interface EntitySummary {
  entity_type: string;
  entity_id: string;
  name?: string;
  slug?: string;
  title?: string;
  status?: string;
  visibility?: string;
  biography_preview?: string;
  media_type?: string;
  filename?: string;
  url?: string;
  moderation_status?: string;
  object_type?: string;
  description_preview?: string;
  lat?: number;
  lng?: number;
  address?: string;
  page_id?: string;
  created_at?: string;
}

export interface ModerationTaskDetailDTO {
  task: ModerationTaskDTO;
  entity_summary: EntitySummary;
}

export interface ModerationTaskListResponse {
  items: ModerationTaskDTO[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListTasksParams {
  entity_type?: EntityType | undefined;
  status?: TaskStatus | undefined;
  org_id?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface RejectPayload {
  reason: string;
}

export interface ActionResponse {
  message: string;
  task: ModerationTaskDTO;
}


export const adminModerationApi = {
  listTasks: async (params?: ListTasksParams): Promise<ModerationTaskListResponse> => {
    const query = new URLSearchParams();
    if (params?.entity_type) query.set('entity_type', params.entity_type);
    if (params?.status) query.set('status', params.status);
    if (params?.org_id) query.set('org_id', params.org_id);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return apiClient.get<ModerationTaskListResponse>(`/api/admin/moderation/tasks${qs ? `?${qs}` : ''}`);
  },

  getTask: async (taskId: string): Promise<ModerationTaskDetailDTO> => {
    return apiClient.get<ModerationTaskDetailDTO>(`/api/admin/moderation/tasks/${taskId}`);
  },

  approveTask: async (taskId: string): Promise<ActionResponse> => {
    return apiClient.post<ActionResponse>(`/api/admin/moderation/tasks/${taskId}/approve`);
  },

  rejectTask: async (taskId: string, data: RejectPayload): Promise<ActionResponse> => {
    return apiClient.post<ActionResponse>(`/api/admin/moderation/tasks/${taskId}/reject`, data);
  },
};


export const orgModerationApi = {
  listTasks: async (orgId: string, params?: Omit<ListTasksParams, 'org_id'>): Promise<ModerationTaskListResponse> => {
    const query = new URLSearchParams();
    if (params?.entity_type) query.set('entity_type', params.entity_type);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return apiClient.get<ModerationTaskListResponse>(`/api/orgs/${orgId}/moderation/tasks${qs ? `?${qs}` : ''}`);
  },

  getTask: async (orgId: string, taskId: string): Promise<ModerationTaskDetailDTO> => {
    return apiClient.get<ModerationTaskDetailDTO>(`/api/orgs/${orgId}/moderation/tasks/${taskId}`);
  },

  approveTask: async (orgId: string, taskId: string): Promise<ActionResponse> => {
    return apiClient.post<ActionResponse>(`/api/orgs/${orgId}/moderation/tasks/${taskId}/approve`);
  },

  rejectTask: async (orgId: string, taskId: string, data: RejectPayload): Promise<ActionResponse> => {
    return apiClient.post<ActionResponse>(`/api/orgs/${orgId}/moderation/tasks/${taskId}/reject`, data);
  },
};
