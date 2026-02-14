

import { apiClient } from './client';


export type RelationType = 'mother' | 'father' | 'brother' | 'sister' | 'spouse' | 'son' | 'daughter' | 'child' | 'parent' | 'sibling';
export type RelationshipStatus = 'pending' | 'active' | 'rejected';
export type ClaimInviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface GraphNode {
  id: string;
  full_name: string;
  life_status: string;
  gender: string;
  page_slug: string | null;
  linked_user_id: string | null;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relation_type: RelationType;
}

export interface FamilyGraphResponse {
  root_person_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  depth: number;
}

export interface RelationshipDTO {
  id: string;
  from_person_id: string;
  to_person_id: string;
  to_person_name: string | null;
  relation_type: RelationType;
  status: RelationshipStatus;
  requested_by_user_id: string | null;
  requested_to_user_id: string | null;
  decided_by_user_id: string | null;
  reason: string | null;
  inverse_relationship_id: string | null;
  created_at: string;
  decided_at: string | null;
}

export interface RelationshipListResponse {
  items: RelationshipDTO[];
}

export interface ClaimInviteDTO {
  id: string;
  person_id: string;
  email: string;
  token: string;
  status: ClaimInviteStatus;
  expires_at: string;
  created_by_user_id: string | null;
  accepted_by_user_id: string | null;
  created_at: string;
  accepted_at: string | null;
}

export interface ClaimInviteListResponse {
  items: ClaimInviteDTO[];
}

export interface CreateRelationshipPayload {
  target_person_id: string;
  relation_type: RelationType;
}

export interface RejectRelationshipPayload {
  reason: string;
}

export interface CreateClaimInvitePayload {
  email: string;
}

export interface PersonSearchResult {
  id: string;
  full_name: string;
  birth_date: string | null;
  death_date: string | null;
  life_status: string;
  page_slug: string | null;
  avatar_url: string | null;
}

export interface PersonSearchResponse {
  items: PersonSearchResult[];
  total: number;
}

export interface MessageResponse {
  message: string;
}


export const genealogyApi = {
  getFamilyGraph: async (
    personId: string,
    depth: number = 3,
    includePending: boolean = false
  ): Promise<FamilyGraphResponse> => {
    const params = new URLSearchParams({
      depth: String(depth),
      include_pending: String(includePending),
    });
    return apiClient.get<FamilyGraphResponse>(
      `/api/persons/${personId}/family-graph?${params.toString()}`
    );
  },

  getPersonRelationships: async (
    personId: string,
    includePending: boolean = false
  ): Promise<RelationshipListResponse> => {
    const params = new URLSearchParams({
      include_pending: String(includePending),
    });
    return apiClient.get<RelationshipListResponse>(
      `/api/persons/${personId}/relationships?${params.toString()}`
    );
  },

  createRelationship: async (
    personId: string,
    data: CreateRelationshipPayload
  ): Promise<RelationshipDTO> => {
    return apiClient.post<RelationshipDTO>(
      `/api/persons/${personId}/relationships`,
      data
    );
  },

  getPendingRequests: async (): Promise<RelationshipListResponse> => {
    return apiClient.get<RelationshipListResponse>(
      `/api/relationships/requests?status=pending`
    );
  },

  approveRelationship: async (relationshipId: string): Promise<RelationshipDTO> => {
    return apiClient.post<RelationshipDTO>(
      `/api/relationships/${relationshipId}/approve`
    );
  },

  rejectRelationship: async (
    relationshipId: string,
    data: RejectRelationshipPayload
  ): Promise<RelationshipDTO> => {
    return apiClient.post<RelationshipDTO>(
      `/api/relationships/${relationshipId}/reject`,
      data
    );
  },

  getClaimInvites: async (personId: string): Promise<ClaimInviteListResponse> => {
    return apiClient.get<ClaimInviteListResponse>(
      `/api/persons/${personId}/claim-invites`
    );
  },

  createClaimInvite: async (
    personId: string,
    data: CreateClaimInvitePayload
  ): Promise<ClaimInviteDTO> => {
    return apiClient.post<ClaimInviteDTO>(
      `/api/persons/${personId}/claim-invites`,
      data
    );
  },

  acceptClaimInvite: async (
    token: string,
    transferOwnership: boolean = true
  ): Promise<MessageResponse> => {
    return apiClient.post<MessageResponse>(
      `/api/persons/claim/${token}/accept`,
      { transfer_ownership: transferOwnership }
    );
  },

  searchPersons: async (
    query: string,
    limit: number = 10
  ): Promise<PersonSearchResponse> => {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return apiClient.get<PersonSearchResponse>(
      `/api/persons/search?${params.toString()}`
    );
  },
};
