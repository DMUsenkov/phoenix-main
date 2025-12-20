'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, Trash2, Check, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useMemorialMessages,
  useCreateMemorialMessage,
  useApproveMemorialMessage,
  useRejectMemorialMessage,
  useDeleteMemorialMessage,
} from '@/lib/hooks/usePageContent';
import type { MemorialMessageDTO } from '@/lib/api/pageContent';

interface MemorialMessagesSectionProps {
  pageId: string;
  isOwner?: boolean;
}

interface FormData {
  author_name: string;
  text: Record<string, unknown> | null;
}

export function MemorialMessagesSection({ pageId, isOwner = true }: MemorialMessagesSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useMemorialMessages(pageId, isOwner);
  const createMutation = useCreateMemorialMessage(pageId);
  const approveMutation = useApproveMemorialMessage(pageId);
  const rejectMutation = useRejectMemorialMessage(pageId);
  const deleteMutation = useDeleteMemorialMessage(pageId);

  const form = useForm<FormData>({
    defaultValues: {
      author_name: '',
      text: null,
    },
  });

  const openCreate = () => {
    form.reset({ author_name: '', text: null });
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    if (!data.text) return;
    await createMutation.mutateAsync({
      author_name: data.author_name,
      text: data.text,
    });
    setIsFormOpen(false);
    form.reset();
  };

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    await rejectMutation.mutateAsync(id);
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

  const pendingMessages = items.filter((m) => !m.is_approved);
  const approvedMessages = items.filter((m) => m.is_approved);

  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Память / Слова людей</CardTitle>
          <p className="text-sm text-zinc-400 mt-1">Сообщения от близких и друзей</p>
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
              label="Имя автора"
              placeholder="Иван Иванов"
              {...form.register('author_name', { required: true })}
            />
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Сообщение</label>
              <Controller
                name="text"
                control={form.control}
                render={({ field }) => (
                  <RichTextEditor content={field.value} onChange={field.onChange} placeholder="Напишите тёплые слова..." />
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                Добавить
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Отмена</Button>
            </div>
          </form>
        )}

        {isOwner && pendingMessages.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-amber-400 mb-3">Ожидают одобрения ({pendingMessages.length})</h4>
            <div className="space-y-3">
              {pendingMessages.map((item) => (
                <MessageCard
                  key={item.id}
                  item={item}
                  onApprove={() => void handleApprove(item.id)}
                  onReject={() => void handleReject(item.id)}
                  onDelete={() => setDeletingId(item.id)}
                  isPending
                  isApproving={approveMutation.isPending}
                  isRejecting={rejectMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {approvedMessages.length === 0 && pendingMessages.length === 0 && !isFormOpen ? (
          <p className="text-zinc-500 text-center py-8">Нет сообщений</p>
        ) : approvedMessages.length > 0 && (
          <div className="space-y-3">
            {approvedMessages.map((item) => (
              <MessageCard
                key={item.id}
                item={item}
                onDelete={() => setDeletingId(item.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => void handleDelete()}
        title="Удалить сообщение?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}

interface MessageCardProps {
  item: MemorialMessageDTO;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  isPending?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
}

function MessageCard({ item, onApprove, onReject, onDelete, isPending, isApproving, isRejecting }: MessageCardProps) {
  return (
    <div className={`p-4 rounded-lg group relative ${isPending ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-surface-100'}`}>
      <div className="flex items-start gap-3">
        <MessageCircle className="w-5 h-5 text-phoenix-500/50 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-white">{item.author_name}</div>
          <div className="text-sm text-zinc-400 mt-1">
            {new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="mt-2 text-zinc-300 prose prose-invert prose-sm max-w-none">

            <p>Сообщение</p>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-1">
        {isPending && onApprove && onReject && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onApprove}
              isLoading={isApproving ?? false}
              className="text-green-400 hover:text-green-300"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReject}
              isLoading={isRejecting ?? false}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </Button>
      </div>
    </div>
  );
}
