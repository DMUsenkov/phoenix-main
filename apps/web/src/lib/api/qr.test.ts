import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildQRImageUrl, downloadQRImage } from './qr';

describe('qr api helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds image urls with format and size', () => {
    expect(buildQRImageUrl('ABC123', 'png', 256)).toBe(
      'http://localhost:8000/api/qr/ABC123/image?format=png&size=256'
    );
  });

  it('downloads QR images with access token', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response('svg', { headers: { 'Content-Type': 'image/svg+xml' } })
    );

    const response = await downloadQRImage('ABC123', 'svg', 512, 'token');

    expect(response.size).toBe(3);
    expect(response.type).toBe('image/svg+xml');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/qr/ABC123/image?format=svg&size=512',
      {
        headers: {
          Authorization: 'Bearer token',
        },
      }
    );
  });

  it('throws when image download fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(downloadQRImage('ABC123', 'png', 512, 'token')).rejects.toThrow(
      'Failed to download QR image'
    );
  });
});
