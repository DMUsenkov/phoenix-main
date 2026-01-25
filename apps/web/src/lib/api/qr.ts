

import { apiClient } from './client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface QRCodeDTO {
  id: string;
  page_id: string;
  code: string;
  is_active: boolean;
  short_url: string;
  target_url: string;
  created_at: string;
  updated_at: string;
}

export type QRImageFormat = 'svg' | 'png';

export const qrApi = {
  async getPageQR(pageId: string): Promise<QRCodeDTO> {
    return apiClient.get<QRCodeDTO>(`/api/pages/${pageId}/qr`);
  },

  async createPageQR(pageId: string): Promise<QRCodeDTO> {
    return apiClient.post<QRCodeDTO>(`/api/pages/${pageId}/qr`);
  },

  async regeneratePageQR(pageId: string): Promise<QRCodeDTO> {
    return apiClient.post<QRCodeDTO>(`/api/pages/${pageId}/qr/regenerate`);
  },
};

export function buildQRImageUrl(
  code: string,
  format: QRImageFormat = 'svg',
  size: number = 512
): string {
  return `${API_BASE_URL}/api/qr/${code}/image?format=${format}&size=${size}`;
}

export async function downloadQRImage(
  code: string,
  format: QRImageFormat,
  size: number,
  accessToken: string
): Promise<Blob> {
  const url = buildQRImageUrl(code, format, size);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download QR image');
  }

  return response.blob();
}
