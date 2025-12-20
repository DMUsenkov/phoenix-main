'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
} from '@/lib/hooks/usePageContent';
import type { AchievementDTO } from '@/lib/api/pageContent';

interface AchievementsSectionProps {
  pageId: string;
}

const categoryOptions = [
  { value: '', label: 'Выберите категорию' },
  { value: 'military', label: 'Военное' },
  { value: 'scientific', label: 'Научное' },
  { value: 'sports', label: 'Спортивное' },
  { value: 'cultural', label: 'Культурное' },
  { value: 'professional', label: 'Профессиональное' },
  { value: 'personal', label: 'Личное' },
  { value: 'other', label: 'Другое' },
];

interface FormData {
  title: string;
  description: Record<string, unknown> | null;
  date: string;
  category: string;
  custom_category: string;
}

export function AchievementsSection({ pageId }: AchievementsSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useAchievements(pageId);
  const createMutation = useCreateAchievement(pageId);
  const updateMutation = useUpdateAchievement(pageId);
  const deleteMutation = useDeleteAchievement(pageId);

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: null,
      date: '',
      category: '',
      custom_category: '',
    },
  });

  const selectedCategory = form.watch('category');

  const openCreate = () => {
    form.reset({ title: '', description: null, date: '', category: '', custom_category: '' });
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: AchievementDTO) => {
    form.reset({
      title: item.title,
      description: item.description,
      date: item.date ?? '',
      category: item.category ?? '',
      custom_category: item.custom_category ?? '',
    });
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      date: data.date || null,
      category: data.category || null,
      custom_category: data.category === 'other' ? data.custom_category : null,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ achievementId: editingItem.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Достижения</CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Награды, звания и другие достижения</p>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(handleSubmit)(e); }} className="space-y-4 mb-6 p-4 bg-surface-100 rounded-lg">
            <Input
              label="Название достижения"
              placeholder="Государственная премия"
              {...form.register('title', { required: true })}
            />
            <Input label="Дата" type="date" {...form.register('date')} />
            <NativeSelect label="Категория" options={categoryOptions} {...form.register('category')} />
            {selectedCategory === 'other' && (
              <Input label="Своя категория" placeholder="Введите название" {...form.register('custom_category')} />
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Описание</label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <RichTextEditor content={field.value} onChange={field.onChange} placeholder="Опишите достижение..." />
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Отмена</Button>
            </div>
          </form>
        )}

        {items.length === 0 && !isFormOpen ? (
          <p className="text-zinc-500 text-center py-8">Нет достижений</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-100 rounded-lg group">
                <GripVertical className="w-4 h-4 text-zinc-500 cursor-grab" />
                <div className="flex-1">
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                    {item.date && <span>Date {new Date(item.date).toLocaleDateString('ru-RU')}</span>}
                    {item.category && (
                      <span className="px-2 py-0.5 bg-surface-200 rounded text-xs">
                        {item.category === 'other' ? item.custom_category : categoryOptions.find(o => o.value === item.category)?.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeletingId(item.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => void handleDelete()}
        title="Удалить достижение?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}
