import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Send, FileText, QrCode, ImageIcon, Loader2, BookOpen } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrgContext } from '@/lib/org';
import { useOrgPage, useUpdateOrgPage, useOrgProjects, usePublishOrgPage } from '@/lib/hooks/useOrgs';
import { ApiClientError } from '@/lib/api';
import type { Gender, LifeStatus, PageVisibility } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { Textarea } from '@/components/ui/Textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QRPanel } from '@/components/qr';
import { MediaUploader, MediaGallery } from '@/components/media';
import { MapLocationPicker } from '@/components/pages/MapLocationPicker';
import { BurialPhotoUploader } from '@/components/pages/BurialPhotoUploader';
import {
  LifeEventsSection,
  AchievementsSection,
  EducationSection,
  CareerSection,
  ValuesSection,
  QuotesSection,
  MemorialMessagesSection,
  FamilyRelationsSection,
} from '@/components/pages/content';

const lifeStatusOptions = [
  { value: 'unknown', label: 'Неизвестно' },
  { value: 'alive', label: 'Жив(а)' },
  { value: 'deceased', label: 'Умер(ла)' },
];

const genderOptions = [
  { value: 'unknown', label: 'Не указан' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'other', label: 'Другой' },
];

const visibilityOptions = [
  { value: 'public', label: 'Публичная — видна всем' },
  { value: 'unlisted', label: 'По ссылке — только по прямой ссылке' },
  { value: 'private', label: 'Приватная — только участникам организации' },
];

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  on_moderation: 'На модерации',
  published: 'Опубликовано',
  rejected: 'Отклонено',
  archived: 'В архиве',
};

const editPageSchema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
  lifeStatus: z.enum(['alive', 'deceased', 'unknown']),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  birthPlace: z.string().optional(),
  deathPlace: z.string().optional(),
  title: z.string().max(255, 'Максимум 255 символов').optional(),
  shortDescription: z.string().max(300, 'Максимум 300 символов').optional(),
  biography: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']),
  projectId: z.string().optional(),
});

type EditPageFormData = z.infer<typeof editPageSchema>;

export function OrgPageEditPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedOrgId, canEdit } = useOrgContext();

  const { data: page, isLoading: pageLoading } = useOrgPage(selectedOrgId ?? undefined, pageId);
  const updatePage = useUpdateOrgPage(selectedOrgId ?? '', pageId ?? '');
  const publishPage = usePublishOrgPage(selectedOrgId ?? '', pageId ?? '');
  const { data: projects = [] } = useOrgProjects(selectedOrgId ?? undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [biographyJson, setBiographyJson] = useState<Record<string, unknown> | null>(null);
  const [burialCoords, setBurialCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [burialPhotoUrl, setBurialPhotoUrl] = useState<string | null>(null);
  const [initialBurialCoords, setInitialBurialCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [initialBurialPhotoUrl, setInitialBurialPhotoUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditPageFormData>({
    resolver: zodResolver(editPageSchema),
    defaultValues: {
      lifeStatus: 'unknown',
      gender: 'unknown',
      visibility: 'public',
      projectId: '',
    },
  });

  const hasBurialChanges =
    burialCoords.lat !== initialBurialCoords.lat ||
    burialCoords.lng !== initialBurialCoords.lng ||
    burialPhotoUrl !== initialBurialPhotoUrl;

  const hasAnyChanges = isDirty || hasBurialChanges;

  useEffect(() => {
    if (page) {
      reset({
        fullName: page.person?.full_name ?? '',
        lifeStatus: (page.person?.life_status as LifeStatus) ?? 'unknown',
        gender: (page.person?.gender as Gender) ?? 'unknown',
        birthDate: page.person?.birth_date ?? '',
        deathDate: page.person?.death_date ?? '',
        birthPlace: page.person?.birth_place ?? '',
        deathPlace: page.person?.death_place ?? '',
        title: page.title ?? '',
        shortDescription: page.short_description ?? '',
        biography: page.biography ?? '',
        visibility: (page.visibility as PageVisibility) ?? 'public',
        projectId: page.org_project_id ?? '',
      });
      setBiographyJson((page as unknown as { biography_json?: Record<string, unknown> })?.biography_json || null);
      const coords = {
        lat: (page.person as unknown as { burial_place_lat?: number })?.burial_place_lat || null,
        lng: (page.person as unknown as { burial_place_lng?: number })?.burial_place_lng || null,
      };
      setBurialCoords(coords);
      setInitialBurialCoords(coords);
      const photoUrl = (page.person as unknown as { burial_photo_url?: string })?.burial_photo_url || null;
      setBurialPhotoUrl(photoUrl);
      setInitialBurialPhotoUrl(photoUrl);
    }
  }, [page, reset]);

  const lifeStatus = watch('lifeStatus');

  const onSubmit = async (data: EditPageFormData) => {
    if (!selectedOrgId || !pageId) return;

    setIsSubmitting(true);
    try {
      const payload: Parameters<typeof updatePage.mutateAsync>[0] = {
        person: {
          full_name: data.fullName,
          life_status: data.lifeStatus as LifeStatus,
          gender: data.gender as Gender,
          birth_date: data.birthDate || null,
          death_date: data.deathDate || null,
          birth_place: data.birthPlace || null,
          death_place: data.deathPlace || null,
          burial_place: null,
          burial_place_lat: burialCoords.lat,
          burial_place_lng: burialCoords.lng,
          burial_photo_url: burialPhotoUrl,
        },
        title: data.title || null,
        short_description: data.shortDescription || null,
        biography: data.biography || null,
        biography_json: biographyJson as { type: string; content: unknown[] } | null,
        visibility: data.visibility as PageVisibility,
        org_project_id: data.projectId || null,
      };

      await updatePage.mutateAsync(payload);
      toast('Изменения сохранены!', 'success');
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast(error.detail, 'error');
      } else {
        toast('Ошибка при обновлении страницы', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishPage.mutateAsync();
      toast('Отправлено на модерацию', 'success');
      setShowPublishDialog(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast(err.detail, 'error');
      } else {
        toast('Ошибка при публикации', 'error');
      }
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-phoenix-500" />
      </div>
    );
  }

  if (!page) {
    return (
      <EmptyState
        icon="File"
        title="Страница не найдена"
        description="Запрашиваемая страница не существует или была удалена"
        action={
          <Button onClick={() => navigate('/org/pages')}>
            Вернуться к списку
          </Button>
        }
      />
    );
  }

  if (!canEdit) {
    return (
      <EmptyState
        icon="Lock"
        title="Доступ запрещён"
        description="У вас нет прав для редактирования страниц в этой организации"
      />
    );
  }

  const projectOptions = [
    { value: '', label: 'Без проекта' },
    ...projects.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name })),
  ];

  const publicUrl = page.slug ? `${window.location.origin}/p/${page.slug}` : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={page.title || page.person?.full_name || 'Страница'}
        subtitle={statusLabels[page.status] ?? 'Черновик'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/org/pages')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            {page.status !== 'published' && page.status !== 'on_moderation' && (
              <Button
                variant="primary"
                onClick={() => setShowPublishDialog(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Опубликовать
              </Button>
            )}
          </div>
        }
      />

      {page.status === 'published' && publicUrl && (
        <Card variant="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Публичная ссылка</p>
                <p className="text-white font-mono text-sm">{publicUrl}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(publicUrl);
                  toast('Ссылка скопирована!', 'success');
                }}
              >
                Копировать
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">
            <FileText className="w-4 h-4 mr-2" />
            Детали
          </TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="w-4 h-4 mr-2" />
            QR-код
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon className="w-4 h-4 mr-2" />
            Медиа
          </TabsTrigger>
          <TabsTrigger value="content">
            <BookOpen className="w-4 h-4 mr-2" />
            Контент
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Информация о человеке</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Полное имя"
                  placeholder="Иван Иванович Петров"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <NativeSelect
                    label="Статус"
                    options={lifeStatusOptions}
                    error={errors.lifeStatus?.message}
                    {...register('lifeStatus')}
                  />

                  <NativeSelect
                    label="Пол"
                    options={genderOptions}
                    error={errors.gender?.message}
                    {...register('gender')}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Дата рождения"
                    type="date"
                    error={errors.birthDate?.message}
                    {...register('birthDate')}
                  />

                  {lifeStatus === 'deceased' && (
                    <Input
                      label="Дата смерти"
                      type="date"
                      error={errors.deathDate?.message}
                      {...register('deathDate')}
                    />
                  )}
                </div>

                <Input
                  label="Место рождения"
                  placeholder="г. Москва, Россия"
                  error={errors.birthPlace?.message}
                  {...register('birthPlace')}
                />

                {lifeStatus === 'deceased' && (
                  <>
                    <Input
                      label="Место смерти"
                      placeholder="г. Санкт-Петербург, Россия"
                      error={errors.deathPlace?.message}
                      {...register('deathPlace')}
                    />
                    <MapLocationPicker
                      label="Место захоронения"
                      lat={burialCoords.lat}
                      lng={burialCoords.lng}
                      onChange={(lat, lng) => {
                        setBurialCoords({ lat, lng });
                      }}
                      hint="Нажмите кнопку, чтобы выбрать точку на карте"
                    />
                    <BurialPhotoUploader
                      pageId={pageId!}
                      currentPhotoUrl={burialPhotoUrl}
                      onPhotoChange={setBurialPhotoUrl}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Страница памяти</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Заголовок страницы"
                  placeholder="Оставьте пустым для использования имени"
                  hint="Необязательно — по умолчанию будет использовано имя"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <Textarea
                  label="Краткое описание"
                  placeholder="Краткое описание человека (160-300 символов)"
                  hint="Отображается в превью и поисковой выдаче"
                  rows={3}
                  error={errors.shortDescription?.message}
                  {...register('shortDescription')}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Биография
                  </label>
                  <RichTextEditor
                    content={biographyJson}
                    onChange={setBiographyJson}
                    placeholder="Расскажите о жизни этого человека..."
                    minHeight="200px"
                  />
                  <p className="text-xs text-zinc-400">
                    Используйте форматирование для создания красивой биографии
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <NativeSelect
                    label="Видимость"
                    options={visibilityOptions}
                    error={errors.visibility?.message}
                    {...register('visibility')}
                  />

                  {projects.length > 0 && (
                    <NativeSelect
                      label="Проект"
                      options={projectOptions}
                      error={errors.projectId?.message}
                      {...register('projectId')}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/org/pages')}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!hasAnyChanges}
              >
                Сохранить изменения
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="qr">
          <QRPanel pageId={pageId!} />
        </TabsContent>

        <TabsContent value="media">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Фотографии и медиа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MediaUploader
                pageId={pageId!}
                onUploadComplete={() => {
                  toast('Отправлено на модерацию', 'success');
                  void queryClient.invalidateQueries({ queryKey: ['media', pageId] });
                }}
              />
              <div className="border-t border-surface-200 pt-6">
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Загруженные медиа</h3>
                <MediaGallery pageId={pageId!} />
              </div>
              <p className="text-sm text-zinc-400">
                Загруженные фото появятся на публичной странице после модерации.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="space-y-6">
            {page?.person?.id && (
              <FamilyRelationsSection personId={page.person.id} />
            )}
            <LifeEventsSection pageId={pageId!} />
            <AchievementsSection pageId={pageId!} />
            <EducationSection pageId={pageId!} />
            <CareerSection pageId={pageId!} />
            <ValuesSection pageId={pageId!} />
            <QuotesSection pageId={pageId!} />
            <MemorialMessagesSection pageId={pageId!} />
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        title="Опубликовать страницу?"
        message="Страница будет отправлена на модерацию организации. После одобрения она станет доступна по публичной ссылке."
        confirmText="Опубликовать"
        onConfirm={() => void handlePublish()}
        isLoading={publishPage.isPending}
      />
    </div>
  );
}
