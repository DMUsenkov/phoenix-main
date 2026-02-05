

import { apiClient } from './client';


export type OrgType = 'government' | 'ngo' | 'commercial' | 'other';
export type OrgRole = 'org_admin' | 'org_editor' | 'org_moderator' | 'org_viewer';
export type MemberStatus = 'invited' | 'active' | 'revoked';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';
export type ProjectStatus = 'active' | 'archived';

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  description: string | null;
  is_active: boolean;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationWithRoleDTO extends OrganizationDTO {
  my_role: OrgRole;
}

export interface MemberDTO {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  status: MemberStatus;
  created_at: string;
  user: {
    id: string;
    email: string;
    display_name: string | null;
  };
}

export function getMemberEmail(member: MemberDTO): string {
  return member.user.email;
}

export function getMemberDisplayName(member: MemberDTO): string | null {
  return member.user.display_name;
}

export interface InviteDTO {
  id: string;
  org_id: string;
  email: string;
  role: OrgRole;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
}

export interface ProjectDTO {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface OrgPageDTO {
  id: string;
  person_id: string;
  slug: string;
  title: string | null;
  biography: string | null;
  short_description: string | null;
  visibility: 'public' | 'unlisted' | 'private';
  status: 'draft' | 'on_moderation' | 'published' | 'rejected' | 'archived';
  owner_org_id: string;
  org_project_id: string | null;
  created_by_user_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  person: {
    id: string;
    full_name: string;
    gender: 'male' | 'female' | 'other' | 'unknown' | null;
    life_status: 'alive' | 'deceased' | 'unknown';
    birth_date: string | null;
    death_date: string | null;
    birth_place: string | null;
    death_place: string | null;
    burial_place: string | null;
  };
}

export interface OrgObjectDTO {
  id: string;
  page_id: string;
  type: 'tree' | 'plaque' | 'place';
  title: string | null;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  status: 'draft' | 'on_moderation' | 'published' | 'rejected' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  owner_org_id: string;
  org_project_id: string | null;
  created_at: string;
  updated_at: string;
  page_slug?: string;
  person_name?: string;
}


export interface CreateOrgPayload {
  name: string;
  type?: OrgType;
  description?: string;
}

export interface UpdateOrgPayload {
  name?: string;
  description?: string;
}

export interface CreateInvitePayload {
  email: string;
  role: OrgRole;
}

export interface UpdateMemberPayload {
  role?: OrgRole;
  revoke?: boolean;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  lat?: number;
  lng?: number;
  address?: string;
  status?: ProjectStatus;
}

export interface CreateOrgPagePayload {
  person: {
    full_name: string;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    life_status?: 'alive' | 'deceased' | 'unknown';
    birth_date?: string;
    death_date?: string;
  };
  title?: string;
  biography?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  project_id?: string;
}

export interface UpdateOrgPagePayload {
  person?: {
    full_name?: string;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    life_status?: 'alive' | 'deceased' | 'unknown';
    birth_date?: string | null;
    death_date?: string | null;
    birth_place?: string | null;
    death_place?: string | null;
    burial_place?: string | null;
    burial_place_lat?: number | null;
    burial_place_lng?: number | null;
    burial_photo_url?: string | null;
  };
  title?: string | null;
  short_description?: string | null;
  biography?: string | null;
  biography_json?: { type: string; content: unknown[] } | null;
  visibility?: 'public' | 'unlisted' | 'private';
  org_project_id?: string | null;
}

export interface CreateOrgObjectPayload {
  page_id: string;
  type: 'tree' | 'plaque' | 'place';
  title?: string | undefined;
  description?: string | undefined;
  lat: number;
  lng: number;
  address?: string | undefined;
  visibility?: 'public' | 'unlisted' | 'private' | undefined;
  org_project_id?: string | undefined;
}

export interface UpdateOrgObjectPayload {
  type?: 'tree' | 'plaque' | 'place';
  title?: string;
  description?: string;
  lat?: number;
  lng?: number;
  address?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  org_project_id?: string | null;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export interface OrgPagesListResponse {
  items: OrgPageDTO[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrgObjectsListResponse {
  items: OrgObjectDTO[];
  total: number;
  limit: number;
  offset: number;
}


export const orgApi = {
  listMyOrgs: async (): Promise<OrganizationWithRoleDTO[]> => {
    const response = await apiClient.get<{ items: OrganizationWithRoleDTO[]; total: number }>('/api/orgs');
    return response.items;
  },

  getOrg: async (orgId: string): Promise<OrganizationWithRoleDTO> => {
    return apiClient.get<OrganizationWithRoleDTO>(`/api/orgs/${orgId}`);
  },

  createOrg: async (data: CreateOrgPayload): Promise<OrganizationDTO> => {
    return apiClient.post<OrganizationDTO>('/api/orgs', data);
  },

  updateOrg: async (orgId: string, data: UpdateOrgPayload): Promise<OrganizationDTO> => {
    return apiClient.patch<OrganizationDTO>(`/api/orgs/${orgId}`, data);
  },

  deleteOrg: async (orgId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/orgs/${orgId}`);
  },
};


export interface CreateOrgUserPayload {
  email: string;
  password: string;
  display_name?: string | undefined;
  system_role: 'org_user' | 'org_admin';
  org_role: OrgRole;
}

export const orgMembersApi = {
  listMembers: async (orgId: string): Promise<MemberDTO[]> => {
    return apiClient.get<MemberDTO[]>(`/api/orgs/${orgId}/members`);
  },

  updateMember: async (orgId: string, memberId: string, data: UpdateMemberPayload): Promise<MemberDTO> => {
    return apiClient.patch<MemberDTO>(`/api/orgs/${orgId}/members/${memberId}`, data);
  },

  createUser: async (orgId: string, data: CreateOrgUserPayload): Promise<MemberDTO> => {
    return apiClient.post<MemberDTO>(`/api/orgs/${orgId}/users`, data);
  },

  createInvite: async (orgId: string, data: CreateInvitePayload): Promise<InviteDTO> => {
    return apiClient.post<InviteDTO>(`/api/orgs/${orgId}/invites`, data);
  },

  listInvites: async (orgId: string): Promise<InviteDTO[]> => {
    return apiClient.get<InviteDTO[]>(`/api/orgs/${orgId}/invites`);
  },

  acceptInvite: async (token: string): Promise<{ message: string; org_id: string }> => {
    return apiClient.post<{ message: string; org_id: string }>(`/api/orgs/invites/${token}/accept`);
  },
};


export const orgProjectsApi = {
  listProjects: async (orgId: string, params?: ListParams): Promise<ProjectDTO[]> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    const response = await apiClient.get<{ items: ProjectDTO[]; total: number }>(`/api/orgs/${orgId}/projects${qs ? `?${qs}` : ''}`);
    return response.items;
  },

  createProject: async (orgId: string, data: CreateProjectPayload): Promise<ProjectDTO> => {
    return apiClient.post<ProjectDTO>(`/api/orgs/${orgId}/projects`, data);
  },

  updateProject: async (orgId: string, projectId: string, data: UpdateProjectPayload): Promise<ProjectDTO> => {
    return apiClient.patch<ProjectDTO>(`/api/orgs/${orgId}/projects/${projectId}`, data);
  },

  archiveProject: async (orgId: string, projectId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/api/orgs/${orgId}/projects/${projectId}`);
  },
};


export const orgPagesApi = {
  listPages: async (orgId: string, params?: ListParams & { project_id?: string }): Promise<OrgPagesListResponse> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.project_id) query.set('project_id', params.project_id);
    const qs = query.toString();
    return apiClient.get<OrgPagesListResponse>(`/api/orgs/${orgId}/pages${qs ? `?${qs}` : ''}`);
  },

  getPage: async (orgId: string, pageId: string): Promise<OrgPageDTO> => {
    return apiClient.get<OrgPageDTO>(`/api/orgs/${orgId}/pages/${pageId}`);
  },

  createPage: async (orgId: string, data: CreateOrgPagePayload): Promise<OrgPageDTO> => {
    return apiClient.post<OrgPageDTO>(`/api/orgs/${orgId}/pages`, data);
  },

  updatePage: async (orgId: string, pageId: string, data: UpdateOrgPagePayload): Promise<OrgPageDTO> => {
    return apiClient.patch<OrgPageDTO>(`/api/orgs/${orgId}/pages/${pageId}`, data);
  },

  publishPage: async (orgId: string, pageId: string): Promise<OrgPageDTO> => {
    return apiClient.post<OrgPageDTO>(`/api/orgs/${orgId}/pages/${pageId}/publish`);
  },
};


export const orgObjectsApi = {
  listObjects: async (orgId: string, params?: ListParams & { type?: string; project_id?: string }): Promise<OrgObjectsListResponse> => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.project_id) query.set('project_id', params.project_id);
    const qs = query.toString();
    return apiClient.get<OrgObjectsListResponse>(`/api/orgs/${orgId}/objects${qs ? `?${qs}` : ''}`);
  },

  getObject: async (orgId: string, objectId: string): Promise<OrgObjectDTO> => {
    return apiClient.get<OrgObjectDTO>(`/api/orgs/${orgId}/objects/${objectId}`);
  },

  createObject: async (orgId: string, data: CreateOrgObjectPayload): Promise<OrgObjectDTO> => {
    return apiClient.post<OrgObjectDTO>(`/api/orgs/${orgId}/objects`, data);
  },

  updateObject: async (orgId: string, objectId: string, data: UpdateOrgObjectPayload): Promise<OrgObjectDTO> => {
    return apiClient.patch<OrgObjectDTO>(`/api/orgs/${orgId}/objects/${objectId}`, data);
  },

  publishObject: async (orgId: string, objectId: string): Promise<OrgObjectDTO> => {
    return apiClient.post<OrgObjectDTO>(`/api/orgs/${orgId}/objects/${objectId}/publish`);
  },

  assignProject: async (orgId: string, objectId: string, projectId: string | null): Promise<OrgObjectDTO> => {
    return apiClient.patch<OrgObjectDTO>(`/api/orgs/${orgId}/objects/${objectId}/project`, { project_id: projectId });
  },
};
