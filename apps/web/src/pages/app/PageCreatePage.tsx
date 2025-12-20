import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreatePage } from '@/lib/hooks';
import { ApiClientError } from '@/lib/api';
import { uploadFile } from '@/lib/api/media';
import type { Gender, LifeStatus, PageVisibility } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { Textarea } from '@/components/ui/Textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

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
  { value: 'private', label: 'Приватная — только вам' },
];

const createPageSchema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
  lifeStatus: z.enum(['alive', 'deceased', 'unknown']),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  title: z.string().max(255, 'Максимум 255 символов').optional(),
  biography: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'private']),
}).refine((data) => {
  if (data.deathDate && data.lifeStatus !== 'deceased') {
    return false;
  }
  return true;
}, {
  message: 'Дата смерти может быть указана только для умерших',
  path: ['deathDate'],
});

type CreatePageFormData = z.infer<typeof createPageSchema>;

export function PageCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPage = useCreatePage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryPhoto, setPrimaryPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePageFormData>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      lifeStatus: 'unknown',
      gender: 'unknown',
      visibility: 'public',
    },
  });

  const lifeStatus = watch('lifeStatus');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast('Выберите изображение', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast('Файл слишком большой (макс. 10 МБ)', 'error');
        return;
      }
      setPrimaryPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPrimaryPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPrimaryPhoto = async (pageId: string, file: File) => {
    try {
      await uploadFile(pageId, file);
      return true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: CreatePageFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createPage.mutateAsync({
        person: {
          full_name: data.fullName,
          life_status: data.lifeStatus as LifeStatus,
          gender: data.gender as Gender,
          birth_date: data.birthDate ? data.birthDate : null,
          death_date: data.deathDate ? data.deathDate : null,
        },
        title: data.title ? data.title : null,
        biography: data.biography ? data.biography : null,
        visibility: data.visibility as PageVisibility,
      });

      if (primaryPhoto) {
        const uploaded = await uploadPrimaryPhoto(result.id, primaryPhoto);
        if (uploaded) {
          toast('Страница и фото успешно созданы!', 'success');
        } else {
          toast('Страница создана, но фото не загружено', 'warning');
        }
      } else {
        toast('Страница успешно создана!', 'success');
      }

      navigate(`/app/pages/${result.id}/edit`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast(error.detail, 'error');
      } else {
        toast('Ошибка при создании страницы', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Создание страницы"
        subtitle="Создайте мемориальную страницу для близкого человека"
        actions={
          <Button variant="ghost" onClick={() => navigate('/app/pages')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        }
      />

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Главное фото</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Превью"
                    className="w-32 h-32 object-cover rounded-xl border border-surface-200"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-phoenix-500 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-xs text-zinc-400">Загрузить</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
              <div className="flex-1">
                <p className="text-sm text-zinc-300 mb-2">
                  Загрузите главное фото для страницы памяти
                </p>
                <p className="text-xs text-zinc-500">
                  Рекомендуемый размер: 400×400 пикселей. Максимум 10 МБ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              label="Биография"
              placeholder="Расскажите о жизни этого человека..."
              rows={6}
              error={errors.biography?.message}
              {...register('biography')}
            />

            <NativeSelect
              label="Видимость"
              options={visibilityOptions}
              error={errors.visibility?.message}
              {...register('visibility')}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/app/pages')}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            Создать страницу
          </Button>
        </div>
      </form>
    </div>
  );
}
