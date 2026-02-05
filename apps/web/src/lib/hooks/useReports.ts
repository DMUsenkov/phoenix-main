

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import type { OrgReportSummary, ReportParams } from '@/lib/api/reports';
import type { ApiClientError } from '@/lib/api';

export const reportKeys = {
  all: ['reports'] as const,
  org: (orgId: string) => [...reportKeys.all, 'org', orgId] as const,
  summary: (orgId: string, params?: ReportParams) => [...reportKeys.org(orgId), 'summary', params] as const,
};

export function useOrgReportSummary(orgId: string | undefined, params?: ReportParams) {
  return useQuery<OrgReportSummary, ApiClientError>({
    queryKey: reportKeys.summary(orgId!, params),
    queryFn: () => reportsApi.getOrgSummary(orgId!, params),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  });
}
