import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { LandingPage } from '@/pages/public';
import { NotFoundPage } from '@/pages/errors';
import { PublicLayout } from '@/components/layouts';

function renderWithRouter(initialEntries: string[]) {
  const routes = [
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        { index: true, element: <LandingPage /> },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ];

  const router = createMemoryRouter(routes, { initialEntries });

  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

describe('App', () => {
  it('renders landing page by default', () => {
    renderWithRouter(['/']);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders 404 page for unknown routes', () => {
    renderWithRouter(['/unknown-route']);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
  });
});
