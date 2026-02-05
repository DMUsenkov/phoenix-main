import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrgContext } from '@/lib/org';
import { useOrgPages, usePublishOrgPage } from '@/lib/hooks/useOrgs';
import {
  Button,
  Card,
  CardContent,
  Badge,
  EmptyState,
  ConfirmDialog,
  useToast,
  Skeleton,
} from '@/components/ui';
import type { OrgPageDTO } from '@/lib/api/orgs';

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  on_moderation: 'На модерации',
  published: 'Опубликовано',
  rejected: 'Отклонено',
  archived: 'В архиве',
};

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'danger'> = {
  draft: 'default',
  on_moderation: 'warning',
  published: 'success',
  rejected: 'danger',
  archived: 'default',
};

const visibilityLabels: Record<string, string> = {
  public: 'Публичная',
  unlisted: 'По ссылке',
  private: 'Приватная',
};

export function OrgPagesPage() {
  const navigate = useNavigate();
  const { selectedOrgId, canEdit } = useOrgContext();
  const { toast } = useToast();

  const { data, isLoading, isError, refetch } = useOrgPages(selectedOrgId ?? undefined);
  const pages = data?.items ?? [];

  const [publishingPage, setPublishingPage] = useState<OrgPageDTO | null>(null);
  const publishPage = usePublishOrgPage(selectedOrgId ?? '', publishingPage?.id ?? '');

  const handlePublish = async () => {
    if (!publishingPage) return;
    try {
      await publishPage.mutateAsync();
      toast('Страница опубликована', 'success');
      setPublishingPage(null);
    } catch {
      toast('Ошибка публикации', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Страницы</h1>
          <p className="text-zinc-400 mt-1">Мемориальные страницы организации</p>
        </div>
        {canEdit && (
          <Button onClick={() => navigate('/org/pages/new')}>
            <span className="mr-2">+</span>
            Создать страницу
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить страницы"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      )}

      {!isLoading && !isError && pages.length === 0 && (
        <EmptyState
          icon="Page"
          title="Нет страниц"
          description="Создайте первую мемориальную страницу организации"
          action={
            canEdit ? (
              <Button onClick={() => navigate('/org/pages/new')}>Создать страницу</Button>
            ) : undefined
          }
        />
      )}

      {pages.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Card key={page.id} variant="glass" className="hover:bg-surface-100 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white truncate flex-1">
                    {page.person.full_name}
                  </h3>
                </div>
                {page.title && (
                  <p className="text-sm text-zinc-300 mb-1 truncate">{page.title}</p>
                )}
                <p className="text-xs text-zinc-500 mb-3">
                  {page.person.life_status === 'deceased' ? 'Ушёл(а) из жизни' :
                   page.person.life_status === 'alive' ? 'Жив(а)' : 'Статус неизвестен'}
                  {page.person.birth_date && ` - ${new Date(page.person.birth_date).getFullYear()}`}
                  {page.person.death_date && ` — ${new Date(page.person.death_date).getFullYear()}`}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={statusColors[page.status]} size="sm">
                    {statusLabels[page.status]}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {visibilityLabels[page.visibility]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link to={`/org/pages/${page.id}/edit`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      {canEdit ? 'Редактировать' : 'Просмотр'}
                    </Button>
                  </Link>
                  {canEdit && page.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPublishingPage(page)}
                    >
                      Опубликовать
                    </Button>
                  )}
                  {page.status === 'published' && (
                    <Link to={`/p/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        Открыть
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!publishingPage}
        onClose={() => setPublishingPage(null)}
        onConfirm={() => void handlePublish()}
        title="Опубликовать страницу?"
        message={`Страница "${publishingPage?.person.full_name}" станет доступна публично.`}
        confirmText="Опубликовать"
        isLoading={publishPage.isPending}
      />
    </div>
  );
}
