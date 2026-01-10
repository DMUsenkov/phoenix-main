

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminModerationApi, orgModerationApi } from '@/lib/api/moderation';
import type { ApiClientError } from '@/lib/api';
import type {
  ModerationTaskDetailDTO,
  ModerationTaskListResponse,
  ListTasksParams,
  RejectPayload,
  ActionResponse,
} from '@/lib/api/moderation';


export const moderationKeys = {
  all: ['moderation'] as const,
  lists: () => [...moderationKeys.all, 'list'] as const,
  list: (params?: ListTasksParams) => [...moderationKeys.lists(), params] as const,
  details: () => [...moderationKeys.all, 'detail'] as const,
  detail: (id: string) => [...moderationKeys.details(), id] as const,
};

export const orgModerationKeys = {
  all: (orgId: string) => ['orgs', orgId, 'moderation'] as const,
  lists: (orgId: string) => [...orgModerationKeys.all(orgId), 'list'] as const,
  list: (orgId: string, params?: Omit<ListTasksParams, 'org_id'>) => [...orgModerationKeys.lists(orgId), params] as const,
  details: (orgId: string) => [...orgModerationKeys.all(orgId), 'detail'] as const,
  detail: (orgId: string, taskId: string) => [...orgModerationKeys.details(orgId), taskId] as const,
};


export function useModerationTasks(params?: ListTasksParams) {
  return useQuery<ModerationTaskListResponse, ApiClientError>({
    queryKey: moderationKeys.list(params),
    queryFn: () => adminModerationApi.listTasks(params),
  });
}

export function useModerationTask(taskId: string | undefined) {
  return useQuery<ModerationTaskDetailDTO, ApiClientError>({
    queryKey: moderationKeys.detail(taskId!),
    queryFn: () => adminModerationApi.getTask(taskId!),
    enabled: !!taskId,
  });
}

export function useApproveTask() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiClientError, string>({
    mutationFn: (taskId) => adminModerationApi.approveTask(taskId),
    onSuccess: (data, taskId) => {
      queryClient.setQueryData(moderationKeys.detail(taskId), (old: ModerationTaskDetailDTO | undefined) => {
        if (!old) return old;
        return { ...old, task: data.task };
      });
      void queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });
    },
  });
}

export function useRejectTask() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiClientError, { taskId: string; data: RejectPayload }>({
    mutationFn: ({ taskId, data }) => adminModerationApi.rejectTask(taskId, data),
    onSuccess: (data, { taskId }) => {
      queryClient.setQueryData(moderationKeys.detail(taskId), (old: ModerationTaskDetailDTO | undefined) => {
        if (!old) return old;
        return { ...old, task: data.task };
      });
      void queryClient.invalidateQueries({ queryKey: moderationKeys.lists() });
    },
  });
}


export function useOrgModerationTasks(orgId: string | undefined, params?: Omit<ListTasksParams, 'org_id'>) {
  return useQuery<ModerationTaskListResponse, ApiClientError>({
    queryKey: orgModerationKeys.list(orgId!, params),
    queryFn: () => orgModerationApi.listTasks(orgId!, params),
    enabled: !!orgId,
  });
}

export function useOrgModerationTask(orgId: string | undefined, taskId: string | undefined) {
  return useQuery<ModerationTaskDetailDTO, ApiClientError>({
    queryKey: orgModerationKeys.detail(orgId!, taskId!),
    queryFn: () => orgModerationApi.getTask(orgId!, taskId!),
    enabled: !!orgId && !!taskId,
  });
}

export function useOrgApproveTask(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiClientError, string>({
    mutationFn: (taskId) => orgModerationApi.approveTask(orgId, taskId),
    onSuccess: (data, taskId) => {
      queryClient.setQueryData(orgModerationKeys.detail(orgId, taskId), (old: ModerationTaskDetailDTO | undefined) => {
        if (!old) return old;
        return { ...old, task: data.task };
      });
      void queryClient.invalidateQueries({ queryKey: orgModerationKeys.lists(orgId) });
    },
  });
}

export function useOrgRejectTask(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiClientError, { taskId: string; data: RejectPayload }>({
    mutationFn: ({ taskId, data }) => orgModerationApi.rejectTask(orgId, taskId, data),
    onSuccess: (data, { taskId }) => {
      queryClient.setQueryData(orgModerationKeys.detail(orgId, taskId), (old: ModerationTaskDetailDTO | undefined) => {
        if (!old) return old;
        return { ...old, task: data.task };
      });
      void queryClient.invalidateQueries({ queryKey: orgModerationKeys.lists(orgId) });
    },
  });
}
