import { apiClient } from './client';

export interface PresignRequest {
  page_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  type: 'image' | 'video';
}

export interface PresignResponse {
  upload_url: string;
  object_key: string;
  expires_in: number;
}

export interface MediaDTO {
  id: string;
  page_id: string;
  type: 'image' | 'video';
  object_key: string;
  original_url: string | null;
  preview_url: string | null;
  mime_type: string;
  size_bytes: number;
  moderation_status: 'pending' | 'approved' | 'rejected';
  is_primary: boolean;
  created_at: string;
}

export interface MediaListResponse {
  items: MediaDTO[];
  total: number;
}

export async function getPresignedUrl(
  pageId: string,
  filename: string,
  mimeType: string,
  sizeBytes: number,
  type: 'image' | 'video' = 'image'
): Promise<PresignResponse> {
  return apiClient.post<PresignResponse>(`/api/media/presign`, {
    page_id: pageId,
    filename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    type,
  });
}

export async function confirmUpload(pageId: string, objectKey: string): Promise<MediaDTO> {
  return apiClient.post<MediaDTO>(`/api/media/confirm`, {
    page_id: pageId,
    object_key: objectKey,
  });
}

export async function uploadFile(pageId: string, file: File): Promise<MediaDTO> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('page_id', pageId);

  const token = localStorage.getItem('phoenix_access_token');
  const response = await fetch('/api/media/upload', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' })) as { detail?: string };
    throw new Error(error.detail ?? 'Upload failed');
  }

  return response.json() as Promise<MediaDTO>;
}

export async function getPageMedia(pageId: string): Promise<MediaListResponse> {
  return apiClient.get<MediaListResponse>(`/api/pages/${pageId}/media`);
}

export async function deleteMedia(mediaId: string): Promise<void> {
  return apiClient.delete(`/api/media/${mediaId}`);
}

export async function setPrimaryMedia(mediaId: string): Promise<MediaDTO> {
  return apiClient.post<MediaDTO>(`/api/media/${mediaId}/set-primary`);
}
