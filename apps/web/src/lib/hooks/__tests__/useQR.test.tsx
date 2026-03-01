import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { qrKeys, useCreatePageQR, usePageQR, useRegeneratePageQR } from '../useQR';
import { qrApi } from '@/lib/api/qr';

vi.mock('@/lib/api/qr', () => ({
  qrApi: {
    getPageQR: vi.fn(),
    createPageQR: vi.fn(),
    regeneratePageQR: vi.fn(),
  },
}));

function createWrapper(queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function qrDTO(overrides = {}) {
  return {
    id: 'qr-1',
    page_id: 'page-1',
    code: 'ABC12345',
    is_active: true,
    short_url: 'http://localhost:3000/q/ABC12345',
    target_url: '/p/ada-lovelace',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useQR hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches QR for page id', async () => {
    const qr = qrDTO();
    vi.mocked(qrApi.getPageQR).mockResolvedValue(qr);

    const { result } = renderHook(() => usePageQR('page-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(qr);
    expect(qrApi.getPageQR).toHaveBeenCalledWith('page-1');
  });

  it('does not fetch QR without page id', () => {
    const { result } = renderHook(() => usePageQR(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(qrApi.getPageQR).not.toHaveBeenCalled();
  });

  it('stores created QR in cache', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const qr = qrDTO({ code: 'CREATED1' });
    vi.mocked(qrApi.createPageQR).mockResolvedValue(qr);

    const { result } = renderHook(() => useCreatePageQR('page-1'), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(qrKeys.detail('page-1'))).toEqual(qr);
  });

  it('replaces cached QR after regeneration', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(qrKeys.detail('page-1'), qrDTO({ code: 'OLD12345' }));
    const regenerated = qrDTO({ code: 'NEW12345' });
    vi.mocked(qrApi.regeneratePageQR).mockResolvedValue(regenerated);

    const { result } = renderHook(() => useRegeneratePageQR('page-1'), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(qrKeys.detail('page-1'))).toEqual(regenerated);
  });
});
