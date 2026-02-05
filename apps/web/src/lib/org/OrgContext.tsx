

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMyOrgs } from '@/lib/hooks/useOrgs';
import type { OrganizationWithRoleDTO, OrgRole } from '@/lib/api/orgs';

const SELECTED_ORG_KEY = 'phoenix_selected_org_id';

interface OrgContextType {
  orgs: OrganizationWithRoleDTO[];
  selectedOrg: OrganizationWithRoleDTO | null;
  selectedOrgId: string | null;
  myRole: OrgRole | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  selectOrg: (orgId: string) => void;
  refetch: () => void;
  canEdit: boolean;
  canManageMembers: boolean;
  isViewer: boolean;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function useOrgContext() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrgContext must be used within OrgProvider');
  }
  return context;
}

interface OrgProviderProps {
  children: ReactNode;
}

export function OrgProvider({ children }: OrgProviderProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useMyOrgs();
  const orgs = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_ORG_KEY);
  });

  const selectedOrg = useMemo(() => orgs.find((org) => org.id === selectedOrgId) ?? null, [orgs, selectedOrgId]);
  const myRole = selectedOrg?.my_role || null;

  useEffect(() => {
    if (!isLoading && orgs.length > 0 && !selectedOrg) {
      const savedId = localStorage.getItem(SELECTED_ORG_KEY);
      const savedOrg = orgs.find((org) => org.id === savedId);
      const firstOrg = orgs[0];
      if (savedOrg) {
        setSelectedOrgId(savedOrg.id);
      } else if (firstOrg) {
        setSelectedOrgId(firstOrg.id);
        localStorage.setItem(SELECTED_ORG_KEY, firstOrg.id);
      }
    }
  }, [isLoading, orgs, selectedOrg]);

  const selectOrg = useCallback((orgId: string) => {
    setSelectedOrgId(orgId);
    localStorage.setItem(SELECTED_ORG_KEY, orgId);

    void queryClient.invalidateQueries({ queryKey: ['orgs', orgId] });
  }, [queryClient]);

  const canEdit = myRole === 'org_admin' || myRole === 'org_editor';
  const canManageMembers = myRole === 'org_admin';
  const isViewer = myRole === 'org_viewer';

  const value: OrgContextType = {
    orgs,
    selectedOrg,
    selectedOrgId,
    myRole,
    isLoading,
    isError,
    error: error as Error | null,
    selectOrg,
    refetch: () => void refetch(),
    canEdit,
    canManageMembers,
    isViewer,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}
