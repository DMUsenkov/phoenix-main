import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { OrgProvider, useOrgContext } from '@/lib/org';
import { OrgSwitcher } from '@/components/org';
import { LoadingScreen, EmptyState, Button } from '@/components/ui';

import type { OrgRole } from '@/lib/api/orgs';

interface OrgNavItem {
  label: string;
  path: string;
  icon: string;
  roles?: OrgRole[];
}

const orgNavItems: OrgNavItem[] = [
  { label: 'Дашборд', path: '/org', icon: 'building' },
  { label: 'Проекты', path: '/org/projects', icon: 'folder' },
  { label: 'Страницы', path: '/org/pages', icon: 'file-text' },
  { label: 'Аналитика', path: '/org/analytics', icon: 'bar-chart' },
  { label: 'Модерация', path: '/org/moderation', icon: 'shield-check', roles: ['org_admin', 'org_moderator'] },
  { label: 'Участники', path: '/org/members', icon: 'users' },
];

const iconMap: Record<string, JSX.Element> = {
  'building': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  'folder': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  'file-text': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'map-pin': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  'users': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  'bar-chart': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  'shield-check': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  'menu': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  'x': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  'logout': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  'arrow-left': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
};

function getIcon(name: string) {
  return iconMap[name] || iconMap['building'];
}

function OrgLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orgs, selectedOrg, isLoading, isError, myRole } = useOrgContext();

  const filteredNavItems = orgNavItems.filter(item => {
    if (!item.roles) return true;
    return myRole && item.roles.includes(myRole);
  });

  const handleLogout = () => {
    void logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/org') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить список организаций"
          action={
            <Button onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          }
        />
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <EmptyState
          icon="Org"
          title="Нет организаций"
          description="Вы пока не состоите ни в одной организации. Создайте свою или примите приглашение."
          action={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate('/app')}>
                В личный кабинет
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface-50 border-r border-surface-200
          flex flex-col transition-transform duration-300 ease-out safe-top safe-bottom
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-surface-200">
          <Link to="/">
            <img
              src="/logo-gorisont-white.svg"
              alt="Phoenix"
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white touch-target"
          >
            {getIcon('x')}
          </button>
        </div>

        <div className="p-3 border-b border-surface-200">
          <OrgSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="mb-4">
            <Link
              to="/app"
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {getIcon('arrow-left')}
              <span>Личный кабинет</span>
            </Link>
          </div>

          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 touch-target group
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-phoenix-500/20 to-phoenix-600/10 text-white shadow-inner-glow'
                    : 'text-zinc-400 hover:text-white hover:bg-surface-100'
                  }`}
              >
                <span className={`transition-colors ${isActive(item.path) ? 'text-phoenix-500' : 'group-hover:text-phoenix-400'}`}>
                  {getIcon(item.icon)}
                </span>
                {item.label}
                {isActive(item.path) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-phoenix-500 shadow-glow-sm" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-surface-200">
          <div className="glass-card p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white font-semibold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.displayName || user?.email}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-zinc-400 hover:text-white hover:bg-surface-100 transition-all duration-200 touch-target"
          >
            {getIcon('logout')}
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-surface-200 safe-top">
          <div className="h-full px-4 lg:px-6 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white touch-target"
            >
              {getIcon('menu')}
            </button>
            {selectedOrg && (
              <h1 className="text-lg font-semibold text-white truncate">{selectedOrg.name}</h1>
            )}
            <div className="flex-1" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-surface-50/95 backdrop-blur-xl border-t border-surface-200 safe-bottom z-30">
        <div className="flex items-center justify-around h-16 px-2">
          {filteredNavItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all touch-target
                ${isActive(item.path)
                  ? 'text-phoenix-500'
                  : 'text-zinc-500 hover:text-white'
                }`}
            >
              {getIcon(item.icon)}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function OrgLayout() {
  return (
    <OrgProvider>
      <OrgLayoutContent />
    </OrgProvider>
  );
}
