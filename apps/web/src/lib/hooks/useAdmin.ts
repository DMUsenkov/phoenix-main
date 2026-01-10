

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import type { ApiClientError } from '@/lib/api';
import type { AdminStatsResponse, UsersListResponse } from '@/lib/api/admin';

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  usersList: (params?: { limit?: number; offset?: number; role?: string }) =>
    [...adminKeys.users(), params] as const,
};

export function useAdminStats() {
  return useQuery<AdminStatsResponse, ApiClientError>({
    queryKey: adminKeys.stats(),
    queryFn: () => adminApi.getStats(),
  });
}

export function useAdminUsers(params?: { limit?: number; offset?: number; role?: string }) {
  return useQuery<UsersListResponse, ApiClientError>({
    queryKey: adminKeys.usersList(params),
    queryFn: () => adminApi.listUsers(params),
  });
}
