

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, Loader2, ChevronLeft, ChevronRight, Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi, type PageSearchResponse } from '@/lib/api/search';
import { cn } from '@/lib/utils';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;

  const [searchQuery, setSearchQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PageSearchResponse | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchApi.searchPages(query, currentPage, pageSize);
        setResults(response);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResults();
  }, [query, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      setSearchParams({ q: searchQuery, page: '1' });
    }
  };

  const goToPage = (page: number) => {
    setSearchParams({ q: query, page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDates = (birth: string | null, death: string | null): string => {
    const formatYear = (date: string | null) => date ? new Date(date).getFullYear() : '?';
    if (!birth && !death) return '';
    return `${formatYear(birth)} — ${formatYear(death)}`;
  };

  const totalPages = results ? Math.ceil(results.total / pageSize) : 0;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="min-h-screen relative">

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-surface to-obsidian-deep" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-phoenix-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 pt-28 pb-16">
        <div className="container-app px-4">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-16 text-center"
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]"
            >
              <Sparkles className="w-4 h-4 text-phoenix-400" />
              <span className="text-sm text-zinc-300">Поиск по базе страниц памяти</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Найдите{' '}
              <span className="bg-gradient-to-r from-phoenix-400 via-phoenix-300 to-phoenix-500 bg-clip-text text-transparent">
                страницу памяти
              </span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
              Введите имя человека, чтобы найти его цифровую страницу памяти
            </p>


            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className={cn(
                'relative flex items-center gap-3 rounded-2xl overflow-hidden transition-all duration-200',
                'bg-white/[0.04]',
                'border border-white/[0.1]',
                isFocused && 'border-white/[0.2] bg-white/[0.06]'
              )}>
                <div className="flex items-center justify-center pl-5">
                  <Search className="w-5 h-5 text-white/40" />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Введите имя человека..."
                  className="flex-1 bg-transparent py-4 text-lg text-white placeholder:text-white/40 focus:outline-none"
                />

                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        inputRef.current?.focus();
                      }}
                      className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 mr-2 rounded-xl font-medium',
                    'bg-phoenix-500 text-white',
                    'hover:bg-phoenix-400',
                    'transition-all duration-200'
                  )}
                >
                  <span>Найти</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </motion.div>


        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-phoenix-400 animate-spin" />
          </div>
        ) : results && results.items.length > 0 ? (
          <>

            <div className="mb-6 text-white/60">
              Найдено {results.total} {results.total === 1 ? 'результат' :
                results.total < 5 ? 'результата' : 'результатов'} по запросу «{results.query}»
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.items.map((item, index) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/p/${item.slug}`}
                    className="block group"
                  >
                    <div className={cn(
                      'bg-white/5 border border-white/10 rounded-2xl overflow-hidden',
                      'hover:border-phoenix-500/30 hover:bg-white/10 transition-all duration-300'
                    )}>

                      <div className="aspect-[4/3] relative overflow-hidden">
                        {item.primary_photo_url ? (
                          <img
                            src={item.primary_photo_url}
                            alt={item.person_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-phoenix-500/20 to-phoenix-600/20 flex items-center justify-center">
                            <User className="w-16 h-16 text-phoenix-400/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>


                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-phoenix-400 transition-colors truncate">
                          {item.person_name}
                        </h3>
                        <p className="text-sm text-white/50 mt-1">
                          {formatDates(item.birth_date, item.death_date)}
                        </p>
                        {item.short_description && (
                          <p className="text-sm text-white/60 mt-2 line-clamp-2">
                            {item.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>


            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    currentPage <= 1
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, arr) => {
                    const prevPage = arr[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-white/30">...</span>
                        )}
                        <button
                          onClick={() => goToPage(page)}
                          className={cn(
                            'w-10 h-10 rounded-lg font-medium transition-colors',
                            page === currentPage
                              ? 'bg-phoenix-500 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          )}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    currentPage >= totalPages
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : query.length >= 2 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">
              Ничего не найдено
            </h2>
            <p className="text-white/50">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">
              Начните поиск
            </h2>
            <p className="text-white/50">
              Введите имя человека для поиска
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
