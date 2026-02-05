import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrgContext } from '@/lib/org';
import { useOrgObjects, useOrgProjects, usePublishOrgObject } from '@/lib/hooks/useOrgs';
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
import type { OrgObjectDTO } from '@/lib/api/orgs';

const typeLabels: Record<string, string> = {
  tree: 'Дерево',
  plaque: 'Табличка',
  place: 'Место',
};

const typeIcons: Record<string, string> = {
  tree: 'Tree',
  plaque: 'Plaque',
  place: 'Place',
};

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

export function OrgObjectsPage() {
  const navigate = useNavigate();
  const { selectedOrgId, canEdit } = useOrgContext();
  const { toast } = useToast();

  const [typeFilter, setTypeFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const { data, isLoading, isError, refetch } = useOrgObjects(selectedOrgId ?? undefined, {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(projectFilter ? { project_id: projectFilter } : {}),
  });
  const { data: projects } = useOrgProjects(selectedOrgId ?? undefined);
  const objects = data?.items ?? [];

  const [publishingObject, setPublishingObject] = useState<OrgObjectDTO | null>(null);
  const publishObject = usePublishOrgObject(selectedOrgId ?? '', publishingObject?.id ?? '');

  const handlePublish = async () => {
    if (!publishingObject) return;
    try {
      await publishObject.mutateAsync();
      toast('Объект опубликован', 'success');
      setPublishingObject(null);
    } catch {
      toast('Ошибка публикации', 'error');
    }
  };

  const clearFilters = () => {
    setTypeFilter('');
    setProjectFilter('');
  };

  const hasFilters = typeFilter || projectFilter;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Объекты</h1>
          <p className="text-zinc-400 mt-1">Мемориальные объекты на карте</p>
        </div>
        {canEdit && (
          <Button onClick={() => navigate('/org/objects/new')}>
            <span className="mr-2">+</span>
            Создать объект
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {['', 'tree', 'plaque', 'place'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-phoenix-500/20 text-phoenix-400 border border-phoenix-500/30'
                  : 'bg-surface-100 text-zinc-400 hover:text-white'
              }`}
            >
              {type ? `${typeIcons[type]} ${typeLabels[type]}` : 'Все типы'}
            </button>
          ))}
        </div>
        {projects && projects.length > 0 && (
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm bg-surface-100 text-zinc-300 border border-surface-200"
          >
            <option value="">Все проекты</option>
            {projects.filter(p => p.status === 'active').map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
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
          description="Не удалось загрузить объекты"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      )}

      {!isLoading && !isError && objects.length === 0 && (
        <EmptyState
          icon="Place"
          title={hasFilters ? 'Нет объектов по фильтру' : 'Нет объектов'}
          description={hasFilters ? 'Попробуйте изменить фильтры' : 'Создайте первый мемориальный объект'}
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}>Сбросить фильтры</Button>
            ) : canEdit ? (
              <Button onClick={() => navigate('/org/objects/new')}>Создать объект</Button>
            ) : undefined
          }
        />
      )}

      {objects.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {objects.map((obj) => (
            <Card key={obj.id} variant="glass" className="hover:bg-surface-100 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[obj.type]}</span>
                    <h3 className="font-semibold text-white truncate">
                      {obj.title || typeLabels[obj.type]}
                    </h3>
                  </div>
                </div>
                {obj.person_name && (
                  <p className="text-sm text-zinc-300 mb-1 truncate">{obj.person_name}</p>
                )}
                {obj.address && (
                  <p className="text-xs text-zinc-500 mb-3 truncate">{obj.address}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={statusColors[obj.status]} size="sm">
                    {statusLabels[obj.status]}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {typeLabels[obj.type]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link to={`/org/objects/${obj.id}/edit`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      {canEdit ? 'Редактировать' : 'Просмотр'}
                    </Button>
                  </Link>
                  {canEdit && obj.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPublishingObject(obj)}
                    >
                      Опубликовать
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!publishingObject}
        onClose={() => setPublishingObject(null)}
        onConfirm={() => void handlePublish()}
        title="Опубликовать объект?"
        message={`Объект "${publishingObject?.title || typeLabels[publishingObject?.type ?? 'place']}" станет виден на публичной карте.`}
        confirmText="Опубликовать"
        isLoading={publishObject.isPending}
      />
    </div>
  );
}
