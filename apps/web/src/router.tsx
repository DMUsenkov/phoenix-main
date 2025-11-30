
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout, AuthLayout, AppLayout, OrgLayout, AdminLayout } from '@/components/layouts';
import { RequireAuth, RequireRole, RequireGuest } from '@/lib/auth';
import { ErrorPage, NotFoundPage, ForbiddenPage } from '@/pages/errors';

import { LandingPage, MapPage, MemorialPage, QRRedirectPage, ForOrganizationsPage, PrivacyPage, TermsPage, DataProcessingPage, SearchPage } from '@/pages/public';
import { LoginPage, RegisterPage } from '@/pages/auth';
import { DashboardPage, PagesListPage, PageCreatePage, PageEditPage, ProfilePage, QRPrintPage, FamilyTreePage } from '@/pages/app';
import { OrgDashboardPage, OrgProjectsPage, OrgProjectPagesPage, OrgPagesPage, OrgPageCreatePage, OrgPageEditPage, OrgObjectsPage, OrgObjectCreatePage, OrgMembersPage, OrgAnalyticsPage, OrgManagePage, OrgModerationPage } from '@/pages/org';
import { AdminDashboardPage, ModerationPage, ModerationTaskPage, UsersPage, OrgsPage, OrgDetailPage } from '@/pages/admin';
import { UIShowcasePage } from '@/pages/ui';

const isDev = import.meta.env.DEV;

function DevOnly({ children }: { children: React.ReactNode }) {
  if (!isDev) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <PublicLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'map', element: <MapPage /> },
          { path: 'for-organizations', element: <ForOrganizationsPage /> },
          { path: 'privacy', element: <PrivacyPage /> },
          { path: 'terms', element: <TermsPage /> },
          { path: 'data-processing', element: <DataProcessingPage /> },
          { path: 'p/:slug', element: <MemorialPage /> },
          { path: 'search', element: <SearchPage /> },
        ],
      },

      {
        path: '/q/:code',
        element: <QRRedirectPage />,
      },

      {
        path: '/auth',
        element: (
          <RequireGuest>
            <AuthLayout />
          </RequireGuest>
        ),
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },

      {
        path: '/app',
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'pages', element: <PagesListPage /> },
          { path: 'pages/new', element: <PageCreatePage /> },
          { path: 'pages/:id/edit', element: <PageEditPage /> },
          { path: 'pages/:id/family', element: <FamilyTreePage /> },
          { path: 'pages/:id/qr/print', element: <QRPrintPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },

      {
        path: '/org',
        element: (
          <RequireAuth>
            <OrgLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <OrgDashboardPage /> },
          { path: 'projects', element: <OrgProjectsPage /> },
          { path: 'projects/:projectId/pages', element: <OrgProjectPagesPage /> },
          { path: 'pages', element: <OrgPagesPage /> },
          { path: 'pages/new', element: <OrgPageCreatePage /> },
          { path: 'pages/:pageId/edit', element: <OrgPageEditPage /> },
          { path: 'objects', element: <OrgObjectsPage /> },
          { path: 'objects/new', element: <OrgObjectCreatePage /> },
          { path: 'members', element: <OrgMembersPage /> },
          { path: 'analytics', element: <OrgAnalyticsPage /> },
          { path: 'moderation', element: <OrgModerationPage /> },
          { path: 'manage', element: <OrgManagePage /> },
        ],
      },

      {
        path: '/admin',
        element: (
          <RequireRole roles={['admin']}>
            <AdminLayout />
          </RequireRole>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'moderation', element: <ModerationPage /> },
          { path: 'moderation/:taskId', element: <ModerationTaskPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'orgs', element: <OrgsPage /> },
          { path: 'orgs/:orgId', element: <OrgDetailPage /> },
        ],
      },

      {
        path: '/ui',
        element: (
          <DevOnly>
            <UIShowcasePage />
          </DevOnly>
        ),
      },

      { path: '/403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
