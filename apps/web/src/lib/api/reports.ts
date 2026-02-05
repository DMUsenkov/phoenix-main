

import { apiClient } from './client';


export interface TimeseriesPoint {
  date: string;
  views: number;
  qr_scans: number;
}

export interface TopPageItem {
  page_id: string;
  title: string | null;
  slug: string | null;
  views: number;
  qr_scans: number;
}

export interface TopObjectItem {
  object_id: string;
  type: string | null;
  title: string | null;
  opens: number;
}

export interface ReportTotals {
  views: number;
  unique_visitors: number;
  qr_scans: number;
  map_opens: number;
  map_object_opens: number;
  share_clicks: number;
  link_copies: number;
}

export interface OrgReportSummary {
  org_id: string;
  from_date: string;
  to_date: string;
  totals: ReportTotals;
  timeseries: TimeseriesPoint[];
  top_pages: TopPageItem[];
  top_objects: TopObjectItem[];
}

export interface ReportParams {
  from_date?: string;
  to_date?: string;
}

export interface ExportParams extends ReportParams {
  report_type?: 'summary' | 'pages' | 'objects';
}


export const reportsApi = {
  getOrgSummary: async (
    orgId: string,
    params?: ReportParams
  ): Promise<OrgReportSummary> => {
    const searchParams = new URLSearchParams();
    if (params?.from_date) searchParams.set('from_date', params.from_date);
    if (params?.to_date) searchParams.set('to_date', params.to_date);
    const query = searchParams.toString();
    return apiClient.get<OrgReportSummary>(
      `/api/orgs/${orgId}/reports/summary${query ? `?${query}` : ''}`
    );
  },

  exportCsv: async (
    orgId: string,
    params?: ExportParams
  ): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    if (params?.from_date) searchParams.set('from_date', params.from_date);
    if (params?.to_date) searchParams.set('to_date', params.to_date);
    if (params?.report_type) searchParams.set('report_type', params.report_type);
    const query = searchParams.toString();

    const response = await fetch(
      `/api/orgs/${orgId}/reports/export${query ? `?${query}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};


export interface TrackEventPayload {
  event_type: string;
  anon_id?: string;
  session_id?: string;
  page_id?: string;
  object_id?: string;
  properties?: Record<string, unknown>;
}

export const analyticsApi = {
  trackEvent: async (payload: TrackEventPayload): Promise<void> => {
    try {
      await fetch('/api/public/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {

    }
  },
};


export function getAnonId(): string {
  const key = 'phoenix_anon_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(key, id);
  }
  return id;
}


export function getSessionId(): string {
  const key = 'phoenix_session_id';
  const expKey = 'phoenix_session_exp';
  const now = Date.now();
  const exp = parseInt(localStorage.getItem(expKey) ?? '0', 10);

  if (now > exp) {
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(key, id);
    localStorage.setItem(expKey, String(now + 30 * 60 * 1000));
    return id;
  }

  localStorage.setItem(expKey, String(now + 30 * 60 * 1000));
  return localStorage.getItem(key) ?? '';
}
