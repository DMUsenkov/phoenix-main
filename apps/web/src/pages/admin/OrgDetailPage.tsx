import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, Modal, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input, useToast } from '@/components/ui';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { useCreateOrgUser } from '@/lib/hooks/useOrgs';

interface OrgDTO {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  is_active: boolean;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

interface OrgMemberDTO {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    display_name: string | null;
  };
}

const orgTypeLabels: Record<string, string> = {
  government: 'Государственная',
  ngo: 'НКО',
  commercial: 'Коммерческая',
  other: 'Другое',
};

const roleLabels: Record<string, string> = {
  org_admin: 'Администратор',
  org_editor: 'Редактор',
  org_moderator: 'Модератор',
  org_viewer: 'Наблюдатель',
};

const roleOptions = [
  { value: 'org_admin', label: 'Администратор' },
  { value: 'org_editor', label: 'Редактор' },
  { value: 'org_moderator', label: 'Модератор' },
  { value: 'org_viewer', label: 'Наблюдатель' },
];

const createUserSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  display_name: z.string().optional(),
  system_role: z.enum(['org_user', 'org_admin']),
  org_role: z.enum(['org_admin', 'org_editor', 'org_moderator', 'org_viewer']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export function OrgDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { toast } = useToast();
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const { data: org, isLoading, isError } = useQuery({
    queryKey: ['admin', 'org', orgId],
    queryFn: () => apiClient.get<OrgDTO>(`/api/admin/orgs/${orgId}`),
    enabled: !!orgId,
  });

  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['admin', 'org', orgId, 'members'],
    queryFn: () => apiClient.get<{ items: OrgMemberDTO[] }>(`/api/admin/orgs/${orgId}/members`),
    enabled: !!orgId,
  });

  const createOrgUser = useCreateOrgUser(orgId ?? '');

  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      display_name: '',
      system_role: 'org_user',
      org_role: 'org_viewer'
    },
  });

  const handleCloseCreateUserModal = () => {
    setIsCreateUserModalOpen(false);
    createUserForm.reset({
      email: '',
      password: '',
      display_name: '',
      system_role: 'org_user',
      org_role: 'org_viewer'
    });
  };

  const onSubmitCreateUser = async (data: CreateUserFormData) => {
    try {
      await createOrgUser.mutateAsync({
        email: data.email,
        password: data.password,
        ...(data.display_name ? { display_name: data.display_name } : {}),
        system_role: data.system_role,
        org_role: data.org_role,
      });
      toast('Пользователь создан', 'success');
      handleCloseCreateUserModal();
      void refetchMembers();
    } catch {
      toast('Ошибка создания пользователя', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card variant="glass">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !org) {
    return (
      <EmptyState
        icon="Warning"
        title="Организация не найдена"
        description="Возможно, она была удалена"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orgs" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{org.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={org.is_active ? 'success' : 'danger'} size="sm">
              {org.is_active ? 'Активна' : 'Неактивна'}
            </Badge>
            <span className="text-zinc-400 text-sm">{orgTypeLabels[org.type] || org.type}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-400">ID</dt>
                <dd className="text-white font-mono text-sm">{org.id.slice(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Slug</dt>
                <dd className="text-white font-mono">{org.slug}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Тип</dt>
                <dd className="text-white">{orgTypeLabels[org.type] || org.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Статус</dt>
                <dd>
                  <Badge variant={org.is_active ? 'success' : 'danger'} size="sm">
                    {org.is_active ? 'Активна' : 'Неактивна'}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Создана</dt>
                <dd className="text-white">
                  {new Date(org.created_at).toLocaleDateString('ru-RU')}
                </dd>
              </div>
              {org.description && (
                <div className="pt-3 border-t border-surface-200">
                  <dt className="text-zinc-400 mb-1">Описание</dt>
                  <dd className="text-white">{org.description}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Участники</CardTitle>
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="w-8 h-8 rounded-lg bg-phoenix-500 hover:bg-phoenix-600 text-white flex items-center justify-center transition-colors"
              title="Создать пользователя"
            >
              +
            </button>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : members?.items && members.items.length > 0 ? (
              <div className="space-y-2">
                {members.items.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-surface-100 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {member.user.display_name || member.user.email}
                      </p>
                      <p className="text-sm text-zinc-400">{member.user.email}</p>
                    </div>
                    <Badge variant="default" size="sm">
                      {roleLabels[member.role] || member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-center py-4">Нет участников</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={handleCloseCreateUserModal}
        title="Создать пользователя"
        size="md"
      >
        <Form {...createUserForm}>
          <form onSubmit={(e) => void createUserForm.handleSubmit(onSubmitCreateUser)(e)} className="space-y-4">
            <FormField
              control={createUserForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createUserForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Минимум 8 символов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createUserForm.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя (опционально)</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createUserForm.control}
              name="system_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Системная роль</FormLabel>
                  <FormControl>
                    <NativeSelect
                      options={[
                        { value: 'org_user', label: 'Сотрудник организации' },
                        { value: 'org_admin', label: 'Админ организации' },
                      ]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createUserForm.control}
              name="org_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Роль в организации</FormLabel>
                  <FormControl>
                    <NativeSelect options={roleOptions} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleCloseCreateUserModal}>
                Отмена
              </Button>
              <Button type="submit" isLoading={createOrgUser.isPending}>
                Создать
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </div>
  );
}
