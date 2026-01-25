

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qrApi } from '@/lib/api/qr';
import type { ApiClientError } from '@/lib/api';
import type { QRCodeDTO } from '@/lib/api/qr';

export const qrKeys = {
  all: ['qr'] as const,
  detail: (pageId: string) => [...qrKeys.all, 'page', pageId] as const,
};

export function usePageQR(pageId: string | undefined) {
  return useQuery<QRCodeDTO, ApiClientError>({
    queryKey: qrKeys.detail(pageId!),
    queryFn: () => qrApi.getPageQR(pageId!),
    enabled: !!pageId,
    retry: false,
  });
}

export function useCreatePageQR(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation<QRCodeDTO, ApiClientError, void>({
    mutationFn: () => qrApi.createPageQR(pageId),
    onSuccess: (data) => {
      queryClient.setQueryData(qrKeys.detail(pageId), data);
    },
  });
}

export function useRegeneratePageQR(pageId: string) {
  const queryClient = useQueryClient();

  return useMutation<QRCodeDTO, ApiClientError, void>({
    mutationFn: () => qrApi.regeneratePageQR(pageId),
    onSuccess: (data) => {
      queryClient.setQueryData(qrKeys.detail(pageId), data);
    },
  });
}
