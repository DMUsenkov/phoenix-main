import { Link, useLocation } from 'react-router-dom';
import { Flame, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/app', label: 'Кабинет' },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between">

          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <Flame className="h-7 w-7 text-phoenix-500" />
            <span className="text-xl">Phoenix</span>
          </Link>


          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  location.pathname === link.href
                    ? 'text-phoenix-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>


          <div className="hidden md:block">
            <Link to="/auth" className="btn btn-primary">
              Войти
            </Link>
          </div>


          <button
            type="button"
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>


        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-phoenix-50 text-phoenix-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary mt-2"
              >
                Войти
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
