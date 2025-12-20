

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pagesApi, publicPagesApi } from '@/lib/api';
import type { ApiClientError } from '@/lib/api';
import type {
  MemorialPageDTO,
  PagesListResponse,
  PageCreatePayload,
  PageUpdatePayload,
  ListPagesParams,
  PublicMemorialPageDTO,
} from '@/lib/api';

export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  list: (params?: ListPagesParams) => [...pageKeys.lists(), params] as const,
  details: () => [...pageKeys.all, 'detail'] as const,
  detail: (id: string) => [...pageKeys.details(), id] as const,
};

export function useMyPages(params?: ListPagesParams) {
  return useQuery<PagesListResponse, ApiClientError>({
    queryKey: pageKeys.list(params),
    queryFn: () => pagesApi.listMyPages(params),
  });
}

export function usePageDetail(id: string | undefined) {
  return useQuery<MemorialPageDTO, ApiClientError>({
    queryKey: pageKeys.detail(id!),
    queryFn: () => pagesApi.getPage(id!),
    enabled: !!id,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation<MemorialPageDTO, ApiClientError, PageCreatePayload>({
    mutationFn: (data) => pagesApi.createPage(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
    },
  });
}

export function useUpdatePage(id: string) {
  const queryClient = useQueryClient();

  return useMutation<MemorialPageDTO, ApiClientError, PageUpdatePayload>({
    mutationFn: (data) => pagesApi.updatePage(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
    },
  });
}

export function usePublishPage(id: string) {
  const queryClient = useQueryClient();

  return useMutation<MemorialPageDTO, ApiClientError, void>({
    mutationFn: () => pagesApi.publishPage(id),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiClientError, string>({
    mutationFn: (id) => pagesApi.deletePage(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: pageKeys.detail(id) });
    },
  });
}

export const publicPageKeys = {
  all: ['publicPages'] as const,
  detail: (slug: string) => [...publicPageKeys.all, slug] as const,
  media: (slug: string) => [...publicPageKeys.all, slug, 'media'] as const,
  content: (slug: string) => [...publicPageKeys.all, slug, 'content'] as const,
};

export function usePublicPage(slug: string | undefined) {
  return useQuery<PublicMemorialPageDTO, ApiClientError>({
    queryKey: publicPageKeys.detail(slug!),
    queryFn: () => publicPagesApi.getPageBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });
}

export function usePublicPageMedia(slug: string | undefined) {
  return useQuery({
    queryKey: publicPageKeys.media(slug!),
    queryFn: () => publicPagesApi.getPageMedia(slug!),
    enabled: !!slug,
    retry: false,
  });
}

export function usePublicPageContent(slug: string | undefined) {
  return useQuery({
    queryKey: publicPageKeys.content(slug!),
    queryFn: () => publicPagesApi.getPageContent(slug!),
    enabled: !!slug,
    retry: false,
  });
}
