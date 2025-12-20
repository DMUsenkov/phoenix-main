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
  useCareer,
  useCreateCareer,
  useUpdateCareer,
  useDeleteCareer,
} from '@/lib/hooks/usePageContent';
import type { CareerDTO } from '@/lib/api/pageContent';

interface CareerSectionProps {
  pageId: string;
}

interface FormData {
  organization: string;
  role: string;
  start_date: string;
  end_date: string;
  description: Record<string, unknown> | null;
}

export function CareerSection({ pageId }: CareerSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CareerDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useCareer(pageId);
  const createMutation = useCreateCareer(pageId);
  const updateMutation = useUpdateCareer(pageId);
  const deleteMutation = useDeleteCareer(pageId);

  const form = useForm<FormData>({
    defaultValues: {
      organization: '',
      role: '',
      start_date: '',
      end_date: '',
      description: null,
    },
  });

  const openCreate = () => {
    form.reset({ organization: '', role: '', start_date: '', end_date: '', description: null });
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: CareerDTO) => {
    form.reset({
      organization: item.organization,
      role: item.role,
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      description: item.description,
    });
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    const payload = {
      organization: data.organization,
      role: data.role,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      description: data.description,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ careerId: editingItem.id, data: payload });
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
          <CardTitle>Карьера / Служба / Деятельность</CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Профессиональный путь и места работы</p>
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
              label="Организация"
              placeholder="ООО «Компания»"
              {...form.register('organization', { required: true })}
            />
            <Input
              label="Должность / Роль"
              placeholder="Старший инженер"
              {...form.register('role', { required: true })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Дата начала" type="date" {...form.register('start_date')} />
              <Input label="Дата окончания" type="date" {...form.register('end_date')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Описание</label>
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <RichTextEditor content={field.value} onChange={field.onChange} placeholder="Обязанности, достижения..." />
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
          <p className="text-zinc-500 text-center py-8">Нет записей о карьере</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-100 rounded-lg group">
                <GripVertical className="w-4 h-4 text-zinc-500 cursor-grab" />
                <div className="flex-1">
                  <div className="font-medium text-white">{item.role}</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    {item.organization}
                    {(item.start_date || item.end_date) && (
                      <span className="ml-2">
                        - {item.start_date ? new Date(item.start_date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' }) : '?'}
                        {' – '}
                        {item.end_date ? new Date(item.end_date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' }) : 'н.в.'}
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
        title="Удалить запись о карьере?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}
