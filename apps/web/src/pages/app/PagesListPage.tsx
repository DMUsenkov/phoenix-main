import { Link } from 'react-router-dom';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import { useMyPages } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { PageStatus, PageVisibility } from '@/lib/api';

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

const visibilityLabels: Record<PageVisibility, string> = {
  public: 'Публичная',
  unlisted: 'По ссылке',
  private: 'Приватная',
};

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function PagesListPage() {
  const { data, isLoading, error, refetch } = useMyPages();

  const pages = data?.items ?? [];
  const isEmpty = !isLoading && pages.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Мои страницы"
        subtitle="Управление мемориальными страницами"
        actions={
          <Link to="/app/pages/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Создать страницу
            </Button>
          </Link>
        }
      />

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">Warning</div>
          <h2 className="text-xl font-semibold text-white mb-2">Ошибка загрузки</h2>
          <p className="text-zinc-400 mb-6">{error.detail || 'Не удалось загрузить страницы'}</p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Попробовать снова
          </Button>
        </div>
      )}

      {isEmpty && (
        <EmptyState
          icon="Page"
          title="Нет страниц"
          description="Создайте первую мемориальную страницу, чтобы сохранить память о близком человеке."
          action={
            <Link to="/app/pages/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Создать первую страницу
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !error && pages.length > 0 && (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="glass-card p-4 hover:bg-surface-100/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-phoenix-500/20 to-phoenix-600/20 flex items-center justify-center text-2xl">
                  Page
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {page.title || page.person_name}
                    </h3>
                    <Badge variant={statusVariants[page.status]} size="sm">
                      {statusLabels[page.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <span>{page.person_name}</span>
                    <span>-</span>
                    <span>{visibilityLabels[page.visibility]}</span>
                    <span>-</span>
                    <span>{formatDate(page.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {page.status === 'published' && (
                    <a
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors"
                      title="Открыть публичную страницу"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  <Link
                    to={`/app/pages/${page.id}/edit`}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.total > data.size && (
        <div className="text-center text-zinc-400 text-sm">
          Показано {pages.length} из {data.total} страниц
        </div>
      )}
    </div>
  );
}
