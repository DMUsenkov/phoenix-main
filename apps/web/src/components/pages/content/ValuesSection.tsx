'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  usePersonValues,
  useCreatePersonValue,
  useDeletePersonValue,
} from '@/lib/hooks/usePageContent';
import type { PersonValueDTO } from '@/lib/api/pageContent';

interface ValuesSectionProps {
  pageId: string;
}

const typeOptions = [
  { value: 'value', label: 'Ценность' },
  { value: 'belief', label: 'Убеждение' },
  { value: 'principle', label: 'Принцип' },
];

const typeLabels: Record<string, string> = {
  value: 'Ценности',
  belief: 'Убеждения',
  principle: 'Принципы',
};

interface FormData {
  type: 'value' | 'belief' | 'principle';
  text: string;
}

export function ValuesSection({ pageId }: ValuesSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: groupedValues, isLoading } = usePersonValues(pageId);
  const createMutation = useCreatePersonValue(pageId);
  const deleteMutation = useDeletePersonValue(pageId);

  const form = useForm<FormData>({
    defaultValues: {
      type: 'value',
      text: '',
    },
  });

  const openCreate = () => {
    form.reset({ type: 'value', text: '' });
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({
      type: data.type,
      text: data.text,
    });
    setIsFormOpen(false);
    form.reset();
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

  const allItems: PersonValueDTO[] = [
    ...(groupedValues?.values ?? []),
    ...(groupedValues?.beliefs ?? []),
    ...(groupedValues?.principles ?? []),
  ];

  const groupedByType = {
    value: groupedValues?.values ?? [],
    belief: groupedValues?.beliefs ?? [],
    principle: groupedValues?.principles ?? [],
  };

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ценности, взгляды, принципы</CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Жизненные ценности и убеждения</p>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(handleSubmit)(e); }} className="space-y-4 mb-6 p-4 bg-surface-100 rounded-lg">
            <NativeSelect
              label="Тип"
              options={typeOptions}
              {...form.register('type')}
            />
            <Input
              label="Текст"
              placeholder="Честность и порядочность"
              {...form.register('text', { required: true })}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                Добавить
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Отмена</Button>
            </div>
          </form>
        )}

        {allItems.length === 0 && !isFormOpen ? (
          <p className="text-zinc-500 text-center py-8">Нет ценностей и принципов</p>
        ) : (
          <div className="space-y-6">
            {(['value', 'belief', 'principle'] as const).map((type) => {
              const items = groupedByType[type];
              if (items.length === 0) return null;
              return (
                <div key={type}>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">{typeLabels[type]}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 rounded-full group"
                      >
                        <span className="text-white text-sm">{item.text}</span>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => void handleDelete()}
        title="Удалить?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}
