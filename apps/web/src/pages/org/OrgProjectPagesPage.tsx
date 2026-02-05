import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { useOrgContext } from '@/lib/org';
import { useOrgPages, useOrgProjects } from '@/lib/hooks/useOrgs';
import { Button, Card, CardContent, Badge, EmptyState, Skeleton } from '@/components/ui';

export function OrgProjectPagesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { selectedOrgId } = useOrgContext();

  const { data: projects } = useOrgProjects(selectedOrgId ?? undefined);
  const project = projects?.find((p) => p.id === projectId);

  const { data: pagesData, isLoading } = useOrgPages(
    selectedOrgId ?? undefined,
    projectId ? { project_id: projectId } : undefined
  );

  const pages = pagesData?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/org/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к проектам
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Страницы проекта {project?.name ? `«${project.name}»` : ''}
          </h1>
          <p className="text-zinc-400 mt-1">
            {pages.length} {pages.length === 1 ? 'страница' : pages.length < 5 ? 'страницы' : 'страниц'}
          </p>
        </div>
        <Link to="/org/pages/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Создать страницу
          </Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          icon="File"
          title="Нет страниц"
          description="К этому проекту пока не привязано страниц. Создайте новую страницу и привяжите её к проекту."
          action={
            <Link to="/org/pages/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать страницу
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Link key={page.id} to={`/org/pages/${page.id}/edit`}>
              <Card variant="glass" className="hover:bg-surface-100 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-phoenix-500/10">
                      <FileText className="w-6 h-6 text-phoenix-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {page.title || page.person?.full_name || 'Без названия'}
                      </h3>
                      {page.person?.full_name && page.title && (
                        <p className="text-sm text-zinc-400 truncate">{page.person.full_name}</p>
                      )}
                      <p className="text-xs text-zinc-500 mt-1">
                        Создано: {new Date(page.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        page.status === 'published'
                          ? 'success'
                          : page.status === 'draft'
                            ? 'default'
                            : 'warning'
                      }
                    >
                      {page.status === 'published'
                        ? 'Опубликовано'
                        : page.status === 'draft'
                          ? 'Черновик'
                          : 'На модерации'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
