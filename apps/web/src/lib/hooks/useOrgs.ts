

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  orgApi,
  orgMembersApi,
  orgProjectsApi,
  orgPagesApi,
  orgObjectsApi,
} from '@/lib/api/orgs';
import type { ApiClientError } from '@/lib/api';
import type {
  OrganizationWithRoleDTO,
  OrganizationDTO,
  MemberDTO,
  InviteDTO,
  ProjectDTO,
  OrgPageDTO,
  OrgObjectDTO,
  OrgPagesListResponse,
  OrgObjectsListResponse,
  CreateOrgPayload,
  UpdateOrgPayload,
  CreateInvitePayload,
  UpdateMemberPayload,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateOrgPagePayload,
  UpdateOrgPagePayload,
  CreateOrgObjectPayload,
  UpdateOrgObjectPayload,
  CreateOrgUserPayload,
  ListParams,
} from '@/lib/api/orgs';


export const orgKeys = {
  all: ['orgs'] as const,
  lists: () => [...orgKeys.all, 'list'] as const,
  list: () => [...orgKeys.lists()] as const,
  details: () => [...orgKeys.all, 'detail'] as const,
  detail: (id: string) => [...orgKeys.details(), id] as const,
};

export const orgMemberKeys = {
  all: (orgId: string) => ['orgs', orgId, 'members'] as const,
  list: (orgId: string) => [...orgMemberKeys.all(orgId), 'list'] as const,
};

export const orgInviteKeys = {
  all: (orgId: string) => ['orgs', orgId, 'invites'] as const,
  list: (orgId: string) => [...orgInviteKeys.all(orgId), 'list'] as const,
};

export const orgProjectKeys = {
  all: (orgId: string) => ['orgs', orgId, 'projects'] as const,
  lists: (orgId: string) => [...orgProjectKeys.all(orgId), 'list'] as const,
  list: (orgId: string, params?: ListParams) => [...orgProjectKeys.lists(orgId), params] as const,
};

export const orgPageKeys = {
  all: (orgId: string) => ['orgs', orgId, 'pages'] as const,
  lists: (orgId: string) => [...orgPageKeys.all(orgId), 'list'] as const,
  list: (orgId: string, params?: ListParams) => [...orgPageKeys.lists(orgId), params] as const,
  details: (orgId: string) => [...orgPageKeys.all(orgId), 'detail'] as const,
  detail: (orgId: string, pageId: string) => [...orgPageKeys.details(orgId), pageId] as const,
};

export const orgObjectKeys = {
  all: (orgId: string) => ['orgs', orgId, 'objects'] as const,
  lists: (orgId: string) => [...orgObjectKeys.all(orgId), 'list'] as const,
  list: (orgId: string, params?: ListParams & { type?: string; project_id?: string }) => [...orgObjectKeys.lists(orgId), params] as const,
  details: (orgId: string) => [...orgObjectKeys.all(orgId), 'detail'] as const,
  detail: (orgId: string, objectId: string) => [...orgObjectKeys.details(orgId), objectId] as const,
};


export function useMyOrgs() {
  return useQuery<OrganizationWithRoleDTO[], ApiClientError>({
    queryKey: orgKeys.list(),
    queryFn: () => orgApi.listMyOrgs(),
  });
}

export function useOrg(orgId: string | undefined) {
  return useQuery<OrganizationWithRoleDTO, ApiClientError>({
    queryKey: orgKeys.detail(orgId!),
    queryFn: () => orgApi.getOrg(orgId!),
    enabled: !!orgId,
  });
}

export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation<OrganizationDTO, ApiClientError, CreateOrgPayload>({
    mutationFn: (data) => orgApi.createOrg(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}

export function useUpdateOrg(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrganizationDTO, ApiClientError, UpdateOrgPayload>({
    mutationFn: (data) => orgApi.updateOrg(orgId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgKeys.detail(orgId) });
      void queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}


export function useOrgMembers(orgId: string | undefined) {
  return useQuery<MemberDTO[], ApiClientError>({
    queryKey: orgMemberKeys.list(orgId!),
    queryFn: () => orgMembersApi.listMembers(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<MemberDTO, ApiClientError, { memberId: string; data: UpdateMemberPayload }>({
    mutationFn: ({ memberId, data }) => orgMembersApi.updateMember(orgId, memberId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgMemberKeys.list(orgId) });
    },
  });
}

export function useOrgInvites(orgId: string | undefined) {
  return useQuery<InviteDTO[], ApiClientError>({
    queryKey: orgInviteKeys.list(orgId!),
    queryFn: () => orgMembersApi.listInvites(orgId!),
    enabled: !!orgId,
  });
}

export function useCreateOrgUser(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<MemberDTO, ApiClientError, CreateOrgUserPayload>({
    mutationFn: (data) => orgMembersApi.createUser(orgId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgMemberKeys.list(orgId) });
    },
  });
}

export function useCreateInvite(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<InviteDTO, ApiClientError, CreateInvitePayload>({
    mutationFn: (data) => orgMembersApi.createInvite(orgId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgInviteKeys.list(orgId) });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; org_id: string }, ApiClientError, string>({
    mutationFn: (token) => orgMembersApi.acceptInvite(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}


export function useOrgProjects(orgId: string | undefined, params?: ListParams) {
  return useQuery<ProjectDTO[], ApiClientError>({
    queryKey: orgProjectKeys.list(orgId!, params),
    queryFn: () => orgProjectsApi.listProjects(orgId!, params),
    enabled: !!orgId,
  });
}

export function useCreateProject(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDTO, ApiClientError, CreateProjectPayload>({
    mutationFn: (data) => orgProjectsApi.createProject(orgId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgProjectKeys.lists(orgId) });
    },
  });
}

export function useUpdateProject(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDTO, ApiClientError, { projectId: string; data: UpdateProjectPayload }>({
    mutationFn: ({ projectId, data }) => orgProjectsApi.updateProject(orgId, projectId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgProjectKeys.lists(orgId) });
    },
  });
}

export function useArchiveProject(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiClientError, string>({
    mutationFn: (projectId) => orgProjectsApi.archiveProject(orgId, projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgProjectKeys.lists(orgId) });
    },
  });
}


export function useOrgPages(orgId: string | undefined, params?: ListParams & { project_id?: string }) {
  return useQuery<OrgPagesListResponse, ApiClientError>({
    queryKey: orgPageKeys.list(orgId!, params),
    queryFn: () => orgPagesApi.listPages(orgId!, params),
    enabled: !!orgId,
  });
}

export function useOrgPage(orgId: string | undefined, pageId: string | undefined) {
  return useQuery<OrgPageDTO, ApiClientError>({
    queryKey: orgPageKeys.detail(orgId!, pageId!),
    queryFn: () => orgPagesApi.getPage(orgId!, pageId!),
    enabled: !!orgId && !!pageId,
  });
}

export function useCreateOrgPage(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgPageDTO, ApiClientError, CreateOrgPagePayload>({
    mutationFn: (data) => orgPagesApi.createPage(orgId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgPageKeys.lists(orgId) });
    },
  });
}

export function useUpdateOrgPage(orgId: string, pageId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgPageDTO, ApiClientError, UpdateOrgPagePayload>({
    mutationFn: (data) => orgPagesApi.updatePage(orgId, pageId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(orgPageKeys.detail(orgId, pageId), data);
      void queryClient.invalidateQueries({ queryKey: orgPageKeys.lists(orgId) });
    },
  });
}

export function usePublishOrgPage(orgId: string, pageId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgPageDTO, ApiClientError, void>({
    mutationFn: () => orgPagesApi.publishPage(orgId, pageId),
    onSuccess: (data) => {
      queryClient.setQueryData(orgPageKeys.detail(orgId, pageId), data);
      void queryClient.invalidateQueries({ queryKey: orgPageKeys.lists(orgId) });
    },
  });
}


export function useOrgObjects(orgId: string | undefined, params?: ListParams & { type?: string; project_id?: string }) {
  return useQuery<OrgObjectsListResponse, ApiClientError>({
    queryKey: orgObjectKeys.list(orgId!, params),
    queryFn: () => orgObjectsApi.listObjects(orgId!, params),
    enabled: !!orgId,
  });
}

export function useOrgObject(orgId: string | undefined, objectId: string | undefined) {
  return useQuery<OrgObjectDTO, ApiClientError>({
    queryKey: orgObjectKeys.detail(orgId!, objectId!),
    queryFn: () => orgObjectsApi.getObject(orgId!, objectId!),
    enabled: !!orgId && !!objectId,
  });
}

export function useCreateOrgObject(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgObjectDTO, ApiClientError, CreateOrgObjectPayload>({
    mutationFn: (data) => orgObjectsApi.createObject(orgId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orgObjectKeys.lists(orgId) });
    },
  });
}

export function useUpdateOrgObject(orgId: string, objectId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgObjectDTO, ApiClientError, UpdateOrgObjectPayload>({
    mutationFn: (data) => orgObjectsApi.updateObject(orgId, objectId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(orgObjectKeys.detail(orgId, objectId), data);
      void queryClient.invalidateQueries({ queryKey: orgObjectKeys.lists(orgId) });
    },
  });
}

export function usePublishOrgObject(orgId: string, objectId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgObjectDTO, ApiClientError, void>({
    mutationFn: () => orgObjectsApi.publishObject(orgId, objectId),
    onSuccess: (data) => {
      queryClient.setQueryData(orgObjectKeys.detail(orgId, objectId), data);
      void queryClient.invalidateQueries({ queryKey: orgObjectKeys.lists(orgId) });
    },
  });
}

export function useAssignProject(orgId: string, objectId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgObjectDTO, ApiClientError, string | null>({
    mutationFn: (projectId) => orgObjectsApi.assignProject(orgId, objectId, projectId),
    onSuccess: (data) => {
      queryClient.setQueryData(orgObjectKeys.detail(orgId, objectId), data);
      void queryClient.invalidateQueries({ queryKey: orgObjectKeys.lists(orgId) });
    },
  });
}
