'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useEducation,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
} from '@/lib/hooks/usePageContent';
import type { EducationDTO } from '@/lib/api/pageContent';

interface EducationSectionProps {
  pageId: string;
}

interface FormData {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  description: Record<string, unknown> | null;
}

export function EducationSection({ pageId }: EducationSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useEducation(pageId);
  const createMutation = useCreateEducation(pageId);
  const updateMutation = useUpdateEducation(pageId);
  const deleteMutation = useDeleteEducation(pageId);

  const form = useForm<FormData>({
    defaultValues: {
      institution: '',
      degree: '',
      field_of_study: '',
      start_year: '',
      end_year: '',
      description: null,
    },
  });

  const openCreate = () => {
    form.reset({ institution: '', degree: '', field_of_study: '', start_year: '', end_year: '', description: null });
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: EducationDTO) => {
    form.reset({
      institution: item.institution,
      degree: item.degree ?? '',
      field_of_study: item.field_of_study ?? '',
      start_year: item.start_year?.toString() ?? '',
      end_year: item.end_year?.toString() ?? '',
      description: item.description as Record<string, unknown> | null,
    });
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    const payload = {
      institution: data.institution,
      degree: data.degree || null,
      field_of_study: data.field_of_study || null,
      start_year: data.start_year ? parseInt(data.start_year) : null,
      end_year: data.end_year ? parseInt(data.end_year) : null,
      description: data.description,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ educationId: editingItem.id, data: payload });
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
          <CardTitle>Образование</CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Учебные заведения и полученные степени</p>
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
              label="Учебное заведение"
              placeholder="МГУ им. М.В. Ломоносова"
              {...form.register('institution', { required: true })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Степень/Квалификация" placeholder="Бакалавр" {...form.register('degree')} />
              <Input label="Направление" placeholder="Физика" {...form.register('field_of_study')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Год начала" type="number" placeholder="2015" {...form.register('start_year')} />
              <Input label="Год окончания" type="number" placeholder="2019" {...form.register('end_year')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Описание</label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <RichTextEditor content={field.value} onChange={field.onChange} placeholder="Дополнительная информация..." />
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
          <p className="text-zinc-500 text-center py-8">Нет записей об образовании</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-100 rounded-lg group">
                <GripVertical className="w-4 h-4 text-zinc-500 cursor-grab" />
                <div className="flex-1">
                  <div className="font-medium text-white">{item.institution}</div>
                  <div className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                    {item.degree && <span>{item.degree}</span>}
                    {item.field_of_study && <span>- {item.field_of_study}</span>}
                    {(item.start_year || item.end_year) && (
                      <span>- {item.start_year ?? '?'} – {item.end_year ?? 'н.в.'}</span>
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
        title="Удалить запись об образовании?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}
