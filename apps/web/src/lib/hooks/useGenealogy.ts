

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { genealogyApi } from '@/lib/api/genealogy';
import type { ApiClientError } from '@/lib/api';
import type {
  FamilyGraphResponse,
  RelationshipListResponse,
  RelationshipDTO,
  ClaimInviteDTO,
  CreateRelationshipPayload,
  RejectRelationshipPayload,
  CreateClaimInvitePayload,
} from '@/lib/api/genealogy';


export const genealogyKeys = {
  all: ['genealogy'] as const,
  graphs: () => [...genealogyKeys.all, 'graph'] as const,
  graph: (personId: string, depth: number) => [...genealogyKeys.graphs(), personId, depth] as const,
  relationships: () => [...genealogyKeys.all, 'relationships'] as const,
  personRelationships: (personId: string) => [...genealogyKeys.relationships(), personId] as const,
  pendingRequests: () => [...genealogyKeys.all, 'pending-requests'] as const,
  claimInvites: (personId: string) => [...genealogyKeys.all, 'claim-invites', personId] as const,
};


export function useFamilyGraph(personId: string | undefined, depth: number = 3) {
  return useQuery<FamilyGraphResponse, ApiClientError>({
    queryKey: genealogyKeys.graph(personId!, depth),
    queryFn: () => genealogyApi.getFamilyGraph(personId!, depth),
    enabled: !!personId,
    staleTime: 1000 * 60 * 5,
  });
}


export function usePersonRelationships(personId: string | undefined, includePending = false) {
  return useQuery<RelationshipListResponse, ApiClientError>({
    queryKey: genealogyKeys.personRelationships(personId!),
    queryFn: () => genealogyApi.getPersonRelationships(personId!, includePending),
    enabled: !!personId,
  });
}

export function usePendingRequests() {
  return useQuery<RelationshipListResponse, ApiClientError>({
    queryKey: genealogyKeys.pendingRequests(),
    queryFn: () => genealogyApi.getPendingRequests(),
  });
}

export function useCreateRelationship(personId: string) {
  const queryClient = useQueryClient();

  return useMutation<RelationshipDTO, ApiClientError, CreateRelationshipPayload>({
    mutationFn: (data) => genealogyApi.createRelationship(personId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: genealogyKeys.graphs() });
      void queryClient.invalidateQueries({ queryKey: genealogyKeys.personRelationships(personId) });
    },
  });
}

export function useApproveRelationship() {
  const queryClient = useQueryClient();

  return useMutation<RelationshipDTO, ApiClientError, string>({
    mutationFn: (relationshipId) => genealogyApi.approveRelationship(relationshipId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: genealogyKeys.all });
    },
  });
}

export function useRejectRelationship() {
  const queryClient = useQueryClient();

  return useMutation<RelationshipDTO, ApiClientError, { relationshipId: string; data: RejectRelationshipPayload }>({
    mutationFn: ({ relationshipId, data }) => genealogyApi.rejectRelationship(relationshipId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: genealogyKeys.pendingRequests() });
    },
  });
}


export function useClaimInvites(personId: string | undefined) {
  return useQuery({
    queryKey: genealogyKeys.claimInvites(personId!),
    queryFn: () => genealogyApi.getClaimInvites(personId!),
    enabled: !!personId,
  });
}

export function useCreateClaimInvite(personId: string) {
  const queryClient = useQueryClient();

  return useMutation<ClaimInviteDTO, ApiClientError, CreateClaimInvitePayload>({
    mutationFn: (data) => genealogyApi.createClaimInvite(personId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: genealogyKeys.claimInvites(personId) });
    },
  });
}
