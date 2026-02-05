import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useOrgContext } from '@/lib/org';
import { useOrgPages, useOrgProjects } from '@/lib/hooks/useOrgs';
import { orgObjectsApi } from '@/lib/api/orgs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const typeOptions = [
  { value: 'tree', label: 'Tree Дерево' },
  { value: 'plaque', label: 'Plaque Табличка' },
  { value: 'place', label: 'Place Место' },
];

const visibilityOptions = [
  { value: 'public', label: 'Публичный — виден всем' },
  { value: 'unlisted', label: 'По ссылке — только по прямой ссылке' },
  { value: 'private', label: 'Приватный — только вам' },
];

const createObjectSchema = z.object({
  page_id: z.string().min(1, 'Выберите страницу'),
  type: z.enum(['tree', 'plaque', 'place']),
  title: z.string().max(255, 'Максимум 255 символов').optional(),
  description: z.string().optional(),
  lat: z.string().refine(val => !val || !isNaN(parseFloat(val)), 'Введите число'),
  lng: z.string().refine(val => !val || !isNaN(parseFloat(val)), 'Введите число'),
  address: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']),
  org_project_id: z.string().optional(),
});

type CreateObjectFormData = z.infer<typeof createObjectSchema>;

export function OrgObjectCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedOrgId } = useOrgContext();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: pagesData } = useOrgPages(selectedOrgId ?? undefined);
  const { data: projects } = useOrgProjects(selectedOrgId ?? undefined);

  const pages = pagesData?.items ?? [];
  const projectsList = Array.isArray(projects) ? projects : [];

  const createObject = useMutation({
    mutationFn: (data: CreateObjectFormData) => {
      if (!selectedOrgId) throw new Error('Организация не выбрана');
      return orgObjectsApi.createObject(selectedOrgId, {
        page_id: data.page_id,
        type: data.type,
        title: data.title || undefined,
        description: data.description || undefined,
        lat: parseFloat(data.lat) || 0,
        lng: parseFloat(data.lng) || 0,
        address: data.address || undefined,
        visibility: data.visibility,
        org_project_id: data.org_project_id || undefined,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-objects'] });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateObjectFormData>({
    resolver: zodResolver(createObjectSchema),
    defaultValues: {
      type: 'place',
      visibility: 'public',
      lat: '',
      lng: '',
    },
  });

  const onSubmit = async (data: CreateObjectFormData) => {
    if (!selectedOrgId) {
      toast('Организация не выбрана', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createObject.mutateAsync(data);
      toast('Объект создан', 'success');
      navigate('/org/objects');
    } catch (error) {
      toast('Ошибка создания объекта', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/org/objects')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Создать объект</h1>
          <p className="text-zinc-400 mt-1">Добавьте мемориальный объект на карту</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Страница *
              </label>
              <NativeSelect
                options={[
                  { value: '', label: 'Выберите страницу' },
                  ...pages.map(p => ({ value: p.id, label: p.person.full_name })),
                ]}
                {...register('page_id')}
                error={errors.page_id?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Тип объекта *
              </label>
              <NativeSelect
                options={typeOptions}
                {...register('type')}
                error={errors.type?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Название
              </label>
              <Input
                placeholder="Название объекта (необязательно)"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Описание
              </label>
              <Textarea
                placeholder="Описание объекта"
                rows={3}
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Местоположение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Широта *
                </label>
                <Input
                  type="text"
                  placeholder="55.7558"
                  {...register('lat')}
                  error={errors.lat?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Долгота *
                </label>
                <Input
                  type="text"
                  placeholder="37.6173"
                  {...register('lng')}
                  error={errors.lng?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Адрес
              </label>
              <Input
                placeholder="Адрес объекта"
                {...register('address')}
                error={errors.address?.message}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Видимость
              </label>
              <NativeSelect
                options={visibilityOptions}
                {...register('visibility')}
              />
            </div>

            {projectsList.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Проект
                </label>
                <NativeSelect
                  options={[
                    { value: '', label: 'Без проекта' },
                    ...projectsList
                      .filter(p => p.status === 'active')
                      .map(p => ({ value: p.id, label: p.name })),
                  ]}
                  {...register('org_project_id')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/org/objects')}
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Создать объект
          </Button>
        </div>
      </form>
    </div>
  );
}
