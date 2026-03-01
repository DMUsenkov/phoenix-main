import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  pageKeys,
  publicPageKeys,
  useCreatePage,
  useMyPages,
  usePageDetail,
  usePublicPage,
  useUpdatePage,
} from '../usePages';
import * as api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  pagesApi: {
    createPage: vi.fn(),
    listMyPages: vi.fn(),
    getPage: vi.fn(),
    updatePage: vi.fn(),
    publishPage: vi.fn(),
    deletePage: vi.fn(),
  },
  publicPagesApi: {
    getPageBySlug: vi.fn(),
    getPageMedia: vi.fn(),
    getPageContent: vi.fn(),
  },
}));

function createWrapper(queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function pageDTO(overrides = {}) {
  return {
    id: 'page-1',
    slug: 'ada-lovelace',
    title: 'Ada Lovelace',
    biography: null,
    short_description: null,
    biography_json: null,
    visibility: 'public',
    status: 'draft',
    published_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    person: {
      id: 'person-1',
      full_name: 'Ada Lovelace',
      gender: 'female',
      life_status: 'deceased',
      birth_date: null,
      death_date: null,
      birth_place: null,
      birth_place_lat: null,
      birth_place_lng: null,
      death_place: null,
      death_place_lat: null,
      death_place_lng: null,
      burial_place: null,
      burial_place_lat: null,
      burial_place_lng: null,
      burial_photo_url: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    ...overrides,
  };
}

describe('usePages hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches paginated pages with params', async () => {
    const response = {
      items: [],
      total: 0,
      page: 2,
      size: 10,
    };
    vi.mocked(api.pagesApi.listMyPages).mockResolvedValue(response);

    const { result } = renderHook(() => useMyPages({ status: 'draft', page: 2, size: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(response);
    expect(api.pagesApi.listMyPages).toHaveBeenCalledWith({ status: 'draft', page: 2, size: 10 });
  });

  it('does not fetch page detail without id', () => {
    const { result } = renderHook(() => usePageDetail(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(api.pagesApi.getPage).not.toHaveBeenCalled();
  });

  it('updates page detail cache after update mutation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const updatedPage = pageDTO({ title: 'Updated title' });
    vi.mocked(api.pagesApi.updatePage).mockResolvedValue(updatedPage as never);

    const { result } = renderHook(() => useUpdatePage('page-1'), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ title: 'Updated title' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.pagesApi.updatePage).toHaveBeenCalledWith('page-1', { title: 'Updated title' });
    expect(queryClient.getQueryData(pageKeys.detail('page-1'))).toEqual(updatedPage);
  });

  it('invalidates list queries after create mutation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    vi.mocked(api.pagesApi.createPage).mockResolvedValue(pageDTO() as never);

    const { result } = renderHook(() => useCreatePage(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ person: { full_name: 'Ada Lovelace' } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: pageKeys.lists() });
  });

  it('fetches public pages by slug and skips empty slug', async () => {
    const publicPage = pageDTO({ id: undefined });
    vi.mocked(api.publicPagesApi.getPageBySlug).mockResolvedValue(publicPage as never);

    const skipped = renderHook(() => usePublicPage(undefined), {
      wrapper: createWrapper(),
    });
    expect(skipped.result.current.isFetching).toBe(false);

    const { result } = renderHook(() => usePublicPage('ada-lovelace'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(publicPage);
    expect(api.publicPagesApi.getPageBySlug).toHaveBeenCalledWith('ada-lovelace');
    expect(publicPageKeys.detail('ada-lovelace')).toEqual(['publicPages', 'ada-lovelace']);
  });
});
