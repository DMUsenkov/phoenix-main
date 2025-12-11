import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { RequireAuth, RequireGuest, RequireRole } from '../guards';
import type { AuthContextType, User } from '../types';

const authMocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('../AuthProvider', () => ({
  useAuth: authMocks.useAuth,
}));

const user: User = {
  id: 'user-1',
  email: 'user@test.dev',
  displayName: 'User',
  role: 'user',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  lastLoginAt: null,
};

function authState(overrides: Partial<AuthContextType>): AuthContextType {
  return {
    status: 'unauthenticated',
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshAuth: vi.fn(),
    ...overrides,
  };
}

function renderRoute(element: ReactNode, initialPath = '/private') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/private" element={element} />
        <Route path="/auth/login" element={<div>login-page</div>} />
        <Route path="/403" element={<div>forbidden-page</div>} />
        <Route path="/app" element={<div>app-page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('auth guards', () => {
  it('renders protected content for authenticated users', () => {
    authMocks.useAuth.mockReturnValue(
      authState({
        status: 'authenticated',
        user,
        isAuthenticated: true,
      })
    );

    renderRoute(
      <RequireAuth>
        <div>private-page</div>
      </RequireAuth>
    );

    expect(screen.getByText('private-page')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    authMocks.useAuth.mockReturnValue(authState({}));

    renderRoute(
      <RequireAuth>
        <div>private-page</div>
      </RequireAuth>
    );

    expect(await screen.findByText('login-page')).toBeInTheDocument();
  });

  it('shows loading screen while auth state is loading', () => {
    authMocks.useAuth.mockReturnValue(
      authState({
        status: 'loading',
        isLoading: true,
      })
    );

    renderRoute(
      <RequireAuth>
        <div>private-page</div>
      </RequireAuth>
    );

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('allows users with matching role', () => {
    authMocks.useAuth.mockReturnValue(
      authState({
        status: 'authenticated',
        user: { ...user, role: 'admin' },
        isAuthenticated: true,
      })
    );

    renderRoute(
      <RequireRole roles={['admin']}>
        <div>admin-page</div>
      </RequireRole>
    );

    expect(screen.getByText('admin-page')).toBeInTheDocument();
  });

  it('redirects users without matching role', async () => {
    authMocks.useAuth.mockReturnValue(
      authState({
        status: 'authenticated',
        user,
        isAuthenticated: true,
      })
    );

    renderRoute(
      <RequireRole roles={['admin']}>
        <div>admin-page</div>
      </RequireRole>
    );

    expect(await screen.findByText('forbidden-page')).toBeInTheDocument();
  });

  it('redirects authenticated guests to app', async () => {
    authMocks.useAuth.mockReturnValue(
      authState({
        status: 'authenticated',
        user,
        isAuthenticated: true,
      })
    );

    renderRoute(
      <RequireGuest>
        <div>guest-page</div>
      </RequireGuest>
    );

    expect(await screen.findByText('app-page')).toBeInTheDocument();
  });
});
