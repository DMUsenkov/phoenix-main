import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye } from 'lucide-react';
import { useOrgContext } from '@/lib/org';
import { useOrgProjects, useCreateProject, useUpdateProject, useArchiveProject } from '@/lib/hooks/useOrgs';
import {
  Button,
  Card,
  CardContent,
  Modal,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Badge,
  EmptyState,
  ConfirmDialog,
  useToast,
  Skeleton,
} from '@/components/ui';
import type { ProjectDTO } from '@/lib/api/orgs';

const projectSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255, 'Максимум 255 символов'),
  description: z.string().max(1000, 'Максимум 1000 символов').optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  address: z.string().max(512, 'Максимум 512 символов').optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function OrgProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedOrgId, canEdit } = useOrgContext();
  const { toast } = useToast();

  const { data: projects, isLoading, isError, refetch } = useOrgProjects(selectedOrgId ?? undefined);
  const createProject = useCreateProject(selectedOrgId ?? '');
  const updateProject = useUpdateProject(selectedOrgId ?? '');
  const archiveProject = useArchiveProject(selectedOrgId ?? '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
  const [archivingProject, setArchivingProject] = useState<ProjectDTO | null>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', lat: '', lng: '', address: '' },
  });

  useEffect(() => {
    if (searchParams.get('action') === 'create' && canEdit) {
      setIsModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, canEdit, setSearchParams]);

  useEffect(() => {
    if (editingProject) {
      form.reset({
        name: editingProject.name,
        description: editingProject.description ?? '',
        lat: editingProject.lat?.toString() ?? '',
        lng: editingProject.lng?.toString() ?? '',
        address: editingProject.address ?? '',
      });
    } else {
      form.reset({ name: '', description: '', lat: '', lng: '', address: '' });
    }
  }, [editingProject, form]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: ProjectDTO) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    form.reset({ name: '', description: '', lat: '', lng: '', address: '' });
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const latNum = data.lat ? parseFloat(data.lat) : undefined;
      const lngNum = data.lng ? parseFloat(data.lng) : undefined;
      const payload: { name: string; description?: string; lat?: number; lng?: number; address?: string } = {
        name: data.name,
      };
      if (data.description) payload.description = data.description;
      if (latNum !== undefined && !isNaN(latNum)) payload.lat = latNum;
      if (lngNum !== undefined && !isNaN(lngNum)) payload.lng = lngNum;
      if (data.address) payload.address = data.address;
      if (editingProject) {
        await updateProject.mutateAsync({
          projectId: editingProject.id,
          data: payload,
        });
        toast('Проект обновлён', 'success');
      } else {
        await createProject.mutateAsync(payload);
        toast('Проект создан', 'success');
      }
      handleCloseModal();
    } catch {
      toast('Ошибка сохранения проекта', 'error');
    }
  };

  const handleArchive = async () => {
    if (!archivingProject) return;
    try {
      await archiveProject.mutateAsync(archivingProject.id);
      toast('Проект архивирован', 'success');
      setArchivingProject(null);
    } catch {
      toast('Ошибка архивирования', 'error');
    }
  };

  const projectsList = Array.isArray(projects) ? projects : [];
  const activeProjects = projectsList.filter((p) => p.status === 'active');
  const archivedProjects = projectsList.filter((p) => p.status === 'archived');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Проекты</h1>
          <p className="text-zinc-400 mt-1">Организуйте объекты в логические группы</p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenCreate}>
            <span className="mr-2">+</span>
            Создать проект
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить проекты"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      )}

      {!isLoading && !isError && activeProjects.length === 0 && archivedProjects.length === 0 && (
        <EmptyState
          icon="Project"
          title="Нет проектов"
          description="Создайте первый проект для организации объектов"
          action={
            canEdit ? (
              <Button onClick={handleOpenCreate}>Создать проект</Button>
            ) : undefined
          }
        />
      )}

      {activeProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Активные проекты</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <Card key={project.id} variant="glass" className="hover:bg-surface-100 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <Badge variant="success" size="sm">Активный</Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{project.description}</p>
                  )}
                  {!project.description && (
                    <p className="text-sm text-zinc-500 mb-4 italic">Без описания</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/org/projects/${project.id}/pages`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Страницы
                      </Button>
                    </Link>
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(project)}>
                          Редактировать
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setArchivingProject(project)}>
                          Архивировать
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {archivedProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Архивные проекты</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProjects.map((project) => (
              <Card key={project.id} variant="glass" className="opacity-60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-zinc-300">{project.name}</h3>
                    <Badge variant="default" size="sm">Архив</Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Редактировать проект' : 'Создать проект'}
        size="md"
      >
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Название проекта" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Описание проекта (опционально)" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Input placeholder="Адрес проекта (опционально)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Широта</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="55.7558" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Долгота</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="37.6173" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Отмена
              </Button>
              <Button
                type="submit"
                isLoading={createProject.isPending || updateProject.isPending}
              >
                {editingProject ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      <ConfirmDialog
        isOpen={!!archivingProject}
        onClose={() => setArchivingProject(null)}
        onConfirm={() => void handleArchive()}
        title="Архивировать проект?"
        message={`Проект "${archivingProject?.name}" будет перемещён в архив. Объекты останутся без изменений.`}
        confirmText="Архивировать"
        variant="warning"
        isLoading={archiveProject.isPending}
      />
    </div>
  );
}
