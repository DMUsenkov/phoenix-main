

import { useState, useRef, useEffect } from 'react';
import { useOrgContext } from '@/lib/org';
import { Badge } from '@/components/ui';
import type { OrgRole } from '@/lib/api/orgs';

const roleLabels: Record<OrgRole, string> = {
  org_admin: 'Админ',
  org_editor: 'Редактор',
  org_moderator: 'Модератор',
  org_viewer: 'Наблюдатель',
};

const roleColors: Record<OrgRole, 'primary' | 'success' | 'warning' | 'default'> = {
  org_admin: 'primary',
  org_editor: 'success',
  org_moderator: 'warning',
  org_viewer: 'default',
};

export function OrgSwitcher() {
  const { orgs, selectedOrg, myRole, selectOrg, isLoading } = useOrgContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-12 bg-surface-100 rounded-xl animate-pulse" />
    );
  }

  if (orgs.length === 0) {
    return null;
  }

  if (orgs.length === 1 && selectedOrg) {
    return (
      <div className="glass-card p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white font-semibold text-lg">
            {selectedOrg.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{selectedOrg.name}</p>
            {myRole && (
              <Badge variant={roleColors[myRole]} size="sm" className="mt-0.5">
                {roleLabels[myRole]}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-3 hover:bg-surface-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white font-semibold text-lg">
            {selectedOrg?.name.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">
              {selectedOrg?.name || 'Выберите организацию'}
            </p>
            {myRole && (
              <Badge variant={roleColors[myRole]} size="sm" className="mt-0.5">
                {roleLabels[myRole]}
              </Badge>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-50 border border-surface-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-down">
          <div className="p-2 max-h-64 overflow-y-auto">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  selectOrg(org.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  org.id === selectedOrg?.id
                    ? 'bg-phoenix-500/20 text-white'
                    : 'text-zinc-300 hover:bg-surface-100 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-phoenix-500/50 to-phoenix-600/50 flex items-center justify-center text-white font-medium">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  <p className="text-xs text-zinc-500">{roleLabels[org.my_role]}</p>
                </div>
                {org.id === selectedOrg?.id && (
                  <svg className="w-5 h-5 text-phoenix-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
