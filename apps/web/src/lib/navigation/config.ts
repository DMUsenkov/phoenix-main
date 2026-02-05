import type { UserRole } from '@/lib/auth';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const publicNav: NavItem[] = [
  { label: 'Главная', path: '/', icon: 'home' },
  { label: 'Карта', path: '/map', icon: 'map' },
];

export const authNav: NavItem[] = [
  { label: 'Войти', path: '/auth/login', icon: 'login' },
  { label: 'Регистрация', path: '/auth/register', icon: 'user-plus' },
];

export const appNav: NavSection[] = [
  {
    title: 'Основное',
    items: [
      { label: 'Дашборд', path: '/app', icon: 'layout-dashboard' },
      { label: 'Мои страницы', path: '/app/pages', icon: 'file-text' },
    ],
  },
];

export const orgNav: NavSection[] = [
  {
    title: 'Организация',
    items: [
      { label: 'Дашборд', path: '/org', icon: 'building' },
      { label: 'Страницы', path: '/org/pages', icon: 'file-text' },
      { label: 'Проекты', path: '/org/projects', icon: 'folder' },
      { label: 'Аналитика', path: '/org/analytics', icon: 'bar-chart' },
    ],
  },
];

export const orgManageNav: NavSection[] = [
  {
    title: 'Управление',
    items: [
      { label: 'Моя организация', path: '/org/manage', icon: 'settings' },
    ],
  },
];

export const adminNavForAdmin: NavSection[] = [
  {
    title: 'Администрирование',
    items: [
      { label: 'Дашборд', path: '/admin', icon: 'shield' },
      { label: 'Модерация', path: '/admin/moderation', icon: 'eye' },
      { label: 'Пользователи', path: '/admin/users', icon: 'users' },
      { label: 'Организации', path: '/admin/orgs', icon: 'building-2' },
    ],
  },
];

export function getNavForRole(role: UserRole | null): NavSection[] {
  if (!role) return [];

  switch (role) {
    case 'admin':

      return [...appNav, ...adminNavForAdmin];
    case 'org_admin':

      return [...appNav, ...orgNav, ...orgManageNav];
    case 'org_user':

      return [...appNav, ...orgNav];
    case 'user':
    default:
      return appNav;
  }
}
