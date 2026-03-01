import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useMyOrgs, useOrgProjects, useOrgMembers } from '../useOrgs';
import * as orgApi from '@/lib/api/orgs';

vi.mock('@/lib/api/orgs', () => ({
  orgApi: {
    listMyOrgs: vi.fn(),
    getOrg: vi.fn(),
    createOrg: vi.fn(),
    updateOrg: vi.fn(),
    deleteOrg: vi.fn(),
  },
  orgMembersApi: {
    listMembers: vi.fn(),
    updateMember: vi.fn(),
    createInvite: vi.fn(),
    listInvites: vi.fn(),
    acceptInvite: vi.fn(),
  },
  orgProjectsApi: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    archiveProject: vi.fn(),
  },
  orgPagesApi: {
    listPages: vi.fn(),
    getPage: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    publishPage: vi.fn(),
  },
  orgObjectsApi: {
    listObjects: vi.fn(),
    getObject: vi.fn(),
    createObject: vi.fn(),
    updateObject: vi.fn(),
    publishObject: vi.fn(),
    assignProject: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useMyOrgs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch organizations list', async () => {
    const mockOrgs = [
      { id: '1', name: 'Org 1', slug: 'org-1', my_role: 'org_admin' },
      { id: '2', name: 'Org 2', slug: 'org-2', my_role: 'org_viewer' },
    ];
    vi.mocked(orgApi.orgApi.listMyOrgs).mockResolvedValue(mockOrgs as never);

    const { result } = renderHook(() => useMyOrgs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOrgs);
    expect(orgApi.orgApi.listMyOrgs).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async () => {
    vi.mocked(orgApi.orgApi.listMyOrgs).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMyOrgs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useOrgProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch projects for org', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', status: 'active' },
      { id: '2', name: 'Project 2', status: 'archived' },
    ];
    vi.mocked(orgApi.orgProjectsApi.listProjects).mockResolvedValue(mockProjects as never);

    const { result } = renderHook(() => useOrgProjects('org-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
    expect(orgApi.orgProjectsApi.listProjects).toHaveBeenCalledWith('org-123', undefined);
  });

  it('should not fetch when orgId is undefined', () => {
    const { result } = renderHook(() => useOrgProjects(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(orgApi.orgProjectsApi.listProjects).not.toHaveBeenCalled();
  });
});

describe('useOrgMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch members for org', async () => {
    const mockMembers = [
      { id: '1', user_email: 'admin@test.com', role: 'org_admin', status: 'active' },
      { id: '2', user_email: 'viewer@test.com', role: 'org_viewer', status: 'active' },
    ];
    vi.mocked(orgApi.orgMembersApi.listMembers).mockResolvedValue(mockMembers as never);

    const { result } = renderHook(() => useOrgMembers('org-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMembers);
    expect(orgApi.orgMembersApi.listMembers).toHaveBeenCalledWith('org-123');
  });
});
