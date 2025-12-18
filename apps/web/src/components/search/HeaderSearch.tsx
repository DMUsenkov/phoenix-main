

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, User, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi, type PageSearchItem } from '@/lib/api/search';
import { cn } from '@/lib/utils';

interface HeaderSearchProps {
  className?: string;
  variant?: 'header' | 'mobile';
  onClose?: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function HeaderSearch({ className, variant = 'header', onClose }: HeaderSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PageSearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchApi.searchPages(debouncedQuery, 1, 5);
        setResults(response.items);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.length >= 2) {
      setIsFocused(false);
      onClose?.();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [query, navigate, onClose]);

  const handleResultClick = useCallback((slug: string) => {
    setIsFocused(false);
    setQuery('');
    onClose?.();
    navigate(`/p/${slug}`);
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex].slug);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  }, [results, selectedIndex, handleResultClick, handleSubmit]);

  const formatDates = (birth: string | null, death: string | null): string => {
    const formatYear = (date: string | null) => date ? new Date(date).getFullYear() : '?';
    if (!birth && !death) return '';
    return `${formatYear(birth)} — ${formatYear(death)}`;
  };

  const showDropdown = isFocused && (query.length >= 2 || isLoading);
  const isMobile = variant === 'mobile';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          'relative flex items-center gap-2 rounded-xl overflow-hidden transition-all duration-200',
          'bg-white/[0.04]',
          'border border-white/[0.08]',
          isFocused && 'border-white/[0.15] bg-white/[0.06]'
        )}>
          <div className="flex items-center justify-center pl-3">
            <Search className="w-4 h-4 text-white/40" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск..."
            className={cn(
              'flex-1 bg-transparent py-2 pr-3 text-sm text-white placeholder:text-white/40',
              'focus:outline-none',
              isMobile && 'text-base py-2.5'
            )}
          />

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="flex items-center justify-center w-7 h-7 mr-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute top-full left-0 right-0 mt-3 z-50',
              'bg-surface/95 backdrop-blur-2xl',
              'border border-white/[0.08] rounded-2xl',
              'shadow-2xl shadow-black/40',
              'overflow-hidden'
            )}
          >

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

            <div className="relative">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-6 h-6 text-phoenix-400" />
                  </motion.div>
                  <span className="text-sm text-white/50">Поиск...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((item, index) => (
                    <motion.button
                      key={item.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(item.slug)}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3 text-left',
                        'hover:bg-white/[0.04] transition-all duration-200',
                        'group/item',
                        selectedIndex === index && 'bg-white/[0.06]'
                      )}
                    >

                      <div className="relative">
                        {item.primary_photo_url ? (
                          <img
                            src={item.primary_photo_url}
                            alt={item.person_name}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-phoenix-500/20 to-phoenix-600/10 flex items-center justify-center ring-1 ring-white/10">
                            <User className="w-5 h-5 text-phoenix-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 rounded-xl bg-phoenix-500/20 blur-xl opacity-0 group-hover/item:opacity-100 transition-opacity -z-10" />
                      </div>


                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate group-hover/item:text-phoenix-300 transition-colors">
                          {item.person_name}
                        </div>
                        <div className="text-sm text-white/50">
                          {formatDates(item.birth_date, item.death_date)}
                        </div>
                      </div>


                      <ArrowRight className="w-4 h-4 text-white/20 group-hover/item:text-phoenix-400 group-hover/item:translate-x-1 transition-all" />
                    </motion.button>
                  ))}


                  <div className="border-t border-white/[0.06] mt-2 pt-2 px-4 pb-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSubmit()}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-3 rounded-xl',
                        'bg-gradient-to-r from-phoenix-600/20 to-phoenix-500/20',
                        'border border-phoenix-500/20',
                        'text-phoenix-400 hover:text-phoenix-300',
                        'hover:border-phoenix-500/40 hover:from-phoenix-600/30 hover:to-phoenix-500/30',
                        'transition-all duration-200'
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="font-medium">Показать все результаты</span>
                    </motion.button>
                  </div>
                </div>
              ) : query.length >= 2 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                    <Search className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/50">Ничего не найдено</p>
                  <p className="text-sm text-white/30 mt-1">Попробуйте другой запрос</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeaderSearch;
