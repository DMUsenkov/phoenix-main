

import { apiClient } from './client';

export interface AdminStatsResponse {
  users_count: number;
  orgs_count: number;
  pages_count: number;
  pages_on_moderation: number;
}

export interface UserDTO {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  items: UserDTO[];
  total: number;
  limit: number;
  offset: number;
}

export const adminApi = {
  async getStats(): Promise<AdminStatsResponse> {
    return apiClient.get<AdminStatsResponse>('/api/admin/stats');
  },

  async listUsers(params?: { limit?: number; offset?: number; role?: string }): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.role) searchParams.set('role', params.role);

    const query = searchParams.toString();
    return apiClient.get<UsersListResponse>(`/api/admin/users${query ? `?${query}` : ''}`);
  },
};
