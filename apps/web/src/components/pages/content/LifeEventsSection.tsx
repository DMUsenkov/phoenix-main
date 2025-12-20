import { useForm } from 'react-hook-form';
import { Calendar, MapPin } from 'lucide-react';
import { ContentSection } from './ContentSection';
import { Button, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import {
  useLifeEvents,
  useCreateLifeEvent,
  useUpdateLifeEvent,
  useDeleteLifeEvent
} from '@/lib/hooks';
import type { LifeEventDTO, LifeEventCreate } from '@/lib/api';

interface LifeEventsSectionProps {
  pageId: string;
}

interface LifeEventFormData {
  title: string;
  description: unknown;
  start_date: string;
  end_date: string;
  location: string;
}

function LifeEventForm({
  item,
  onClose,
  pageId
}: {
  item: LifeEventDTO | null;
  onClose: () => void;
  pageId: string;
}) {
  const createMutation = useCreateLifeEvent(pageId);
  const updateMutation = useUpdateLifeEvent(pageId);

  const form = useForm<LifeEventFormData>({
    defaultValues: {
      title: item?.title ?? '',
      description: item?.description ?? null as unknown,
      start_date: item?.start_date ?? '',
      end_date: item?.end_date ?? '',
      location: item?.location ?? '',
    },
  });

  const onSubmit = async (data: LifeEventFormData) => {
    const payload: LifeEventCreate = {
      title: data.title,
      description: data.description as Record<string, unknown> | null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      location: data.location || null,
    };

    if (item) {
      await updateMutation.mutateAsync({ eventId: item.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(onSubmit)(e); }} className="space-y-4">
        <FormField
          control={form.control as never}
          name="title"
          rules={{ required: 'Введите название события' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название события *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Например: Переезд в Москву" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as never}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата начала</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as never}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дата окончания</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as never}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Место</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Например: Москва, Россия" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as never}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value as Record<string, unknown> | null}
                  onChange={field.onChange}
                  placeholder="Опишите событие..."
                  minHeight="150px"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {item ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function LifeEventsSection({ pageId }: LifeEventsSectionProps) {
  const { data: events = [], isLoading } = useLifeEvents(pageId);
  const deleteMutation = useDeleteLifeEvent(pageId);

  return (
    <ContentSection
      title="События жизни"
      description="Важные моменты и события в жизни человека"
      items={events}
      getItemId={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="Нет событий"
      addButtonText="Добавить событие"
      onDelete={(item) => deleteMutation.mutate(item.id)}
      renderItem={(item) => (
        <div>
          <h4 className="font-medium text-white">{item.title}</h4>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-white/60">
            {(item.start_date || item.end_date) && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(item.start_date)}
                {item.end_date && ` — ${formatDate(item.end_date)}`}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {item.location}
              </span>
            )}
          </div>
        </div>
      )}
      renderForm={(item, onClose) => (
        <LifeEventForm item={item} onClose={onClose} pageId={pageId} />
      )}
    />
  );
}

export default LifeEventsSection;
