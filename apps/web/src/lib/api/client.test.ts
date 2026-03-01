import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiClient', () => {
  beforeEach(() => {
    apiClient.setAccessToken(null);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('adds bearer token to authenticated requests', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    apiClient.setAccessToken('access-token');

    const response = await apiClient.get<{ ok: boolean }>('/api/private');

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/private',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('omits bearer token when skipAuth is set', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));
    apiClient.setAccessToken('access-token');

    await apiClient.post('/api/auth/login', { email: 'a@test.dev' }, { skipAuth: true });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.headers).not.toHaveProperty('Authorization');
    expect(request.body).toBe(JSON.stringify({ email: 'a@test.dev' }));
  });

  it('throws ApiClientError with response detail', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: 'Forbidden' }, 403));

    await expect(apiClient.get('/api/private')).rejects.toMatchObject({
      status: 403,
      detail: 'Forbidden',
    });
  });

  it('returns empty object for 204 responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(apiClient.delete('/api/resource')).resolves.toEqual({});
  });
});
