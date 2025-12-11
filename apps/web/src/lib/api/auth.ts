

import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string | undefined;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'org_user' | 'org_admin' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface MessageResponse {
  message: string;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/auth/register', data, { skipAuth: true });
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/auth/login', data, { skipAuth: true });
  },

  async me(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/api/auth/me');
  },

  async refresh(data: RefreshRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/auth/refresh', data, { skipAuth: true });
  },

  async logout(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/api/auth/logout');
  },
};
