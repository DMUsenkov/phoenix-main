import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, Building2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { HeaderSearch } from '@/components/search/HeaderSearch';

const navItems = [
  { path: '/', label: 'Главная' },
  { path: '/map', label: 'Карта' },
  { path: '/for-organizations', label: 'Для организаций' },
];

export function PublicLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 safe-top">
        <div className="relative">

          <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-phoenix-500/30 to-transparent" />

          <div className="container-app relative h-20 flex items-center justify-between px-4">

            <Link to="/" className="flex items-center group">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >

                <div className="absolute inset-0 bg-phoenix-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src="/logo-gorisont-white.svg"
                  alt="Phoenix"
                  className="relative h-10 md:h-12 w-auto"
                />
              </motion.div>
            </Link>


            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 group"
                  >
                    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                      {item.label}
                    </span>

                    <motion.div
                      className={`absolute inset-0 rounded-xl ${isActive ? 'bg-white/[0.08]' : 'bg-transparent group-hover:bg-white/[0.04]'}`}
                      layoutId="navBackground"
                      transition={{ duration: 0.2 }}
                    />

                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-phoenix-400 to-phoenix-600 rounded-full"
                        layoutId="activeIndicator"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>


            <HeaderSearch className="hidden lg:block w-64 xl:w-80" />


            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/app"
                    className="relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-phoenix-600 to-phoenix-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative">Личный кабинет</span>
                    <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
                  >
                    Войти
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/auth/register"
                      className="relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-phoenix-600 to-phoenix-500" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <div className="absolute inset-0 shadow-glow-sm opacity-50" />
                      <span className="relative">Начать</span>
                      <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </motion.div>
                </>
              )}
            </div>


            <motion.button
              className="lg:hidden relative w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white"
              onClick={() => setMobileMenuOpen(true)}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </header>


      <AnimatePresence>
        {mobileMenuOpen && (
          <>

            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />


            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-surface border-l border-white/10 overflow-hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >

              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-phoenix-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
              </div>


              <div className="relative h-full flex flex-col">

                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <img
                    src="/logo-gorisont-white.svg"
                    alt="Phoenix"
                    className="h-8 w-auto"
                  />
                  <motion.button
                    className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white"
                    onClick={() => setMobileMenuOpen(false)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>


                <div className="px-6 pt-6">
                  <HeaderSearch
                    variant="mobile"
                    onClose={() => setMobileMenuOpen(false)}
                  />
                </div>


                <nav className="flex-1 p-6 space-y-2">
                  {navItems.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                            isActive
                              ? 'bg-phoenix-500/20 border border-phoenix-500/30'
                              : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isActive ? 'bg-phoenix-500/30' : 'bg-white/[0.05]'
                          }`}>
                            {item.path === '/for-organizations' ? (
                              <Building2 className={`w-5 h-5 ${isActive ? 'text-phoenix-400' : 'text-zinc-400'}`} />
                            ) : (
                              <Sparkles className={`w-5 h-5 ${isActive ? 'text-phoenix-400' : 'text-zinc-400'}`} />
                            )}
                          </div>
                          <span className={`text-lg font-medium ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <motion.div
                              className="ml-auto w-2 h-2 rounded-full bg-phoenix-500"
                              layoutId="mobileActiveIndicator"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>


                <div className="p-6 space-y-3 border-t border-white/10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {isAuthenticated ? (
                      <Link
                        to="/app"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-gradient-to-r from-phoenix-600 to-phoenix-500 text-white font-semibold"
                      >
                        Личный кабинет
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/auth/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="relative flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-gradient-to-r from-phoenix-600 to-phoenix-500 text-white font-semibold overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                          />
                          <span className="relative">Начать бесплатно</span>
                          <ArrowRight className="relative w-5 h-5" />
                        </Link>
                        <Link
                          to="/auth/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white/[0.05] border border-white/10 text-zinc-300 font-medium hover:bg-white/[0.08] transition-colors"
                        >
                          Войти в аккаунт
                        </Link>
                      </>
                    )}
                  </motion.div>
                </div>


                <div className="p-6 pt-0">
                  <div className="text-center text-xs text-zinc-500">
                    Платформа цифровой памяти
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <div className="h-20" />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
