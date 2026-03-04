import { Link } from 'react-router-dom';
import { Plus, BookOpen, QrCode, Edit, ExternalLink, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMyPages } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PageStatus } from '@/lib/api';

const statusLabels: Record<PageStatus, string> = {
  draft: 'Черновик',
  on_moderation: 'На модерации',
  published: 'Опубликовано',
  rejected: 'Отклонено',
  archived: 'В архиве',
};

const statusVariants: Record<PageStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  draft: 'default',
  on_moderation: 'warning',
  published: 'success',
  rejected: 'danger',
  archived: 'default',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useMyPages({ size: 5 });
  const { data: publishedData } = useMyPages({ status: 'published', size: 1 });

  const pages = data?.items ?? [];
  const totalPages = data?.total ?? 0;
  const publishedPages = publishedData?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Добро пожаловать, {user?.displayName || user?.email}!
        </h1>
        <p className="text-zinc-400 mt-1">Ваш личный кабинет Phoenix</p>
      </div>


      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5">
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : (
          [
            { label: 'Мои страницы', value: totalPages.toString(), icon: BookOpen, color: 'text-blue-400' },
            { label: 'Опубликовано', value: publishedPages.toString(), icon: TrendingUp, color: 'text-green-400' },
            { label: 'QR-коды', value: publishedPages.toString(), icon: QrCode, color: 'text-purple-400' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-card p-5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-surface-100 to-surface-50 flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/pages/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Создать страницу
            </Button>
          </Link>
          <Link to="/app/pages">
            <Button variant="secondary">
              <BookOpen className="w-4 h-4 mr-2" />
              Все страницы
            </Button>
          </Link>
        </div>
      </div>


      {!isLoading && pages.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Последние страницы</h2>
            <Link to="/app/pages" className="text-phoenix-400 hover:text-phoenix-300 text-sm transition-colors">
              Смотреть все
            </Link>
          </div>
          <div className="space-y-3">
            {pages.slice(0, 5).map((page) => (
              <div
                key={page.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-surface-50/30 hover:bg-surface-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-phoenix-500/20 to-phoenix-600/20 flex items-center justify-center text-xl shrink-0">
                  Page
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate text-sm">
                      {page.title || page.person_name}
                    </h3>
                    <Badge variant={statusVariants[page.status]} size="sm">
                      {statusLabels[page.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">{formatDate(page.created_at)}</p>
                </div>

                <div className="flex items-center gap-1">
                  {page.status === 'published' && (
                    <a
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors"
                      title="Открыть"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Link
                    to={`/app/pages/${page.id}/edit`}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {!isLoading && pages.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">Page</div>
          <h2 className="text-xl font-semibold text-white mb-2">Создайте первую страницу</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Начните сохранять память о близких людях — создайте мемориальную страницу с фотографиями, историями и важными событиями.
          </p>
          <Link to="/app/pages/new">
            <Button variant="primary" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Создать первую страницу
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
