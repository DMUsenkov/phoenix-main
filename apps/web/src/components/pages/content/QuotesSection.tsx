'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
} from '@/lib/hooks/usePageContent';
import type { QuoteDTO } from '@/lib/api/pageContent';

interface QuotesSectionProps {
  pageId: string;
}

interface FormData {
  text: string;
  source: string;
}

export function QuotesSection({ pageId }: QuotesSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuoteDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuotes(pageId);
  const createMutation = useCreateQuote(pageId);
  const updateMutation = useUpdateQuote(pageId);
  const deleteMutation = useDeleteQuote(pageId);

  const form = useForm<FormData>({
    defaultValues: {
      text: '',
      source: '',
    },
  });

  const openCreate = () => {
    form.reset({ text: '', source: '' });
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: QuoteDTO) => {
    form.reset({
      text: item.text,
      source: item.source ?? '',
    });
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    const payload = {
      text: data.text,
      source: data.source || null,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ quoteId: editingItem.id, data: payload });
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
          <CardTitle>Цитаты</CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Запоминающиеся высказывания</p>
        </div>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        {isFormOpen && (
          <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(handleSubmit)(e); }} className="space-y-4 mb-6 p-4 bg-surface-100 rounded-lg">
            <Textarea
              label="Текст цитаты"
              placeholder="«Жизнь — это то, что с тобой происходит, пока ты строишь другие планы»"
              rows={3}
              {...form.register('text', { required: true })}
            />
            <Input
              label="Источник"
              placeholder="Из интервью 2010 года"
              {...form.register('source')}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Отмена</Button>
            </div>
          </form>
        )}

        {items.length === 0 && !isFormOpen ? (
          <p className="text-zinc-500 text-center py-8">Нет цитат</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 bg-surface-100 rounded-lg group relative">
                <Quote className="w-6 h-6 text-phoenix-500/30 absolute top-3 left-3" />
                <div className="pl-8">
                  <p className="text-white italic">«{item.text}»</p>
                  {item.source && (
                    <p className="text-sm text-zinc-400 mt-2">— {item.source}</p>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        title="Удалить цитату?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}
