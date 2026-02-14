

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Modal,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  useToast,
} from '@/components/ui';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { useCreateRelationship } from '@/lib/hooks/useGenealogy';
import type { GraphNode, RelationType } from '@/lib/api/genealogy';

const relationTypeOptions: { value: RelationType; label: string }[] = [
  { value: 'mother', label: 'Мать' },
  { value: 'father', label: 'Отец' },
  { value: 'brother', label: 'Брат' },
  { value: 'sister', label: 'Сестра' },
  { value: 'spouse', label: 'Супруг(а)' },
  { value: 'son', label: 'Сын' },
  { value: 'daughter', label: 'Дочь' },
];

const lifeStatusOptions = [
  { value: 'alive', label: 'Жив' },
  { value: 'deceased', label: 'Умер' },
  { value: 'unknown', label: 'Неизвестно' },
];

const genderOptions = [
  { value: 'male', label: 'Мужчина' },
  { value: 'female', label: 'Женщина' },
  { value: 'unknown', label: 'Неизвестно' },
];

const createRelativeSchema = z.object({
  full_name: z.string().min(2, 'Минимум 2 символа').max(255),
  life_status: z.enum(['alive', 'deceased', 'unknown']),
  gender: z.enum(['male', 'female', 'unknown']),
  relation_type: z.enum(['mother', 'father', 'brother', 'sister', 'spouse', 'son', 'daughter', 'child', 'parent', 'sibling']),
});

type CreateRelativeForm = z.infer<typeof createRelativeSchema>;

interface AddRelativeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNode: GraphNode | null;
  onCreatePerson: (data: { full_name: string; life_status: string; gender: string }) => Promise<string>;
}

export function AddRelativeDialog({ isOpen, onClose, sourceNode, onCreatePerson }: AddRelativeDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRelationship = useCreateRelationship(sourceNode?.id ?? '');

  const form = useForm<CreateRelativeForm>({
    resolver: zodResolver(createRelativeSchema),
    defaultValues: {
      full_name: '',
      life_status: 'unknown',
      gender: 'unknown',
      relation_type: 'brother',
    },
  });

  const handleSubmit = async (data: CreateRelativeForm) => {
    if (!sourceNode) return;

    setIsSubmitting(true);
    try {
      const newPersonId = await onCreatePerson({
        full_name: data.full_name,
        life_status: data.life_status,
        gender: data.gender,
      });

      await createRelationship.mutateAsync({
        target_person_id: newPersonId,
        relation_type: data.relation_type,
      });

      toast('Родственник добавлен', 'success');
      form.reset();
      onClose();
    } catch (error) {
      toast('Ошибка создания', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить родственника" size="md">
      <Form {...form}>
        <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-4">
          <p className="text-zinc-400 text-sm mb-4">
            Добавить родственника для <span className="text-white font-medium">{sourceNode?.full_name}</span>
          </p>

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Полное имя</FormLabel>
                <FormControl>
                  <Input placeholder="Иван Иванов" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пол</FormLabel>
                  <FormControl>
                    <NativeSelect options={genderOptions} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="life_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <FormControl>
                    <NativeSelect options={lifeStatusOptions} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="relation_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип связи</FormLabel>
                <FormControl>
                  <NativeSelect options={relationTypeOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Создать
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
