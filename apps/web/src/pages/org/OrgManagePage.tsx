import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrgContext } from '@/lib/org';
import { useOrgMembers, useOrgInvites, useCreateInvite, useCreateOrgUser, useUpdateMember, useOrgPages } from '@/lib/hooks/useOrgs';
import {
  Button,
  Card,
  CardContent,
  Modal,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Badge,
  EmptyState,
  ConfirmDialog,
  useToast,
  Skeleton,
} from '@/components/ui';
import { NativeSelect } from '@/components/ui/NativeSelect';
import type { OrgRole, MemberDTO } from '@/lib/api/orgs';

const roleLabels: Record<OrgRole, string> = {
  org_admin: 'Администратор',
  org_editor: 'Редактор',
  org_moderator: 'Модератор',
  org_viewer: 'Наблюдатель',
};

const roleColors: Record<OrgRole, 'primary' | 'success' | 'warning' | 'default'> = {
  org_admin: 'primary',
  org_editor: 'success',
  org_moderator: 'warning',
  org_viewer: 'default',
};

const roleOptions = [
  { value: 'org_admin', label: 'Администратор' },
  { value: 'org_editor', label: 'Редактор' },
  { value: 'org_moderator', label: 'Модератор' },
  { value: 'org_viewer', label: 'Наблюдатель' },
];

const orgTypeLabels: Record<string, string> = {
  government: 'Государственная',
  ngo: 'НКО',
  commercial: 'Коммерческая',
  other: 'Другое',
};

const inviteSchema = z.object({
  email: z.string().email('Введите корректный email'),
  role: z.enum(['org_admin', 'org_editor', 'org_moderator', 'org_viewer']),
});

const createUserSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  display_name: z.string().optional(),
  system_role: z.enum(['org_user', 'org_admin']),
  org_role: z.enum(['org_admin', 'org_editor', 'org_moderator', 'org_viewer']),
});

type InviteFormData = z.infer<typeof inviteSchema>;
type CreateUserFormData = z.infer<typeof createUserSchema>;

export function OrgManagePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedOrg, selectedOrgId, canManageMembers, myRole } = useOrgContext();
  const { toast } = useToast();

  const { data: members, isLoading: membersLoading, isError, refetch } = useOrgMembers(selectedOrgId ?? undefined);
  const { data: invites } = useOrgInvites(selectedOrgId ?? undefined);
  const { data: pagesData, isLoading: pagesLoading } = useOrgPages(selectedOrgId ?? undefined);
  const pages = pagesData?.items ?? [];
  const createInvite = useCreateInvite(selectedOrgId ?? '');
  const createOrgUser = useCreateOrgUser(selectedOrgId ?? '');
  const updateMember = useUpdateMember(selectedOrgId ?? '');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberDTO | null>(null);
  const [revokingMember, setRevokingMember] = useState<MemberDTO | null>(null);

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'org_viewer' },
  });

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

  useEffect(() => {
    if (searchParams.get('action') === 'invite' && canManageMembers) {
      setIsInviteModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, canManageMembers, setSearchParams]);

  const handleInvite = async (data: InviteFormData) => {
    try {
      await createInvite.mutateAsync(data);
      toast('Приглашение отправлено');
      setIsInviteModalOpen(false);
      inviteForm.reset();
    } catch {
      toast('Ошибка отправки приглашения');
    }
  };

  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      await createOrgUser.mutateAsync({
        ...data,
        display_name: data.display_name || undefined,
      });
      toast('Пользователь создан');
      setIsCreateUserModalOpen(false);
      createUserForm.reset();
      void refetch();
    } catch {
      toast('Ошибка создания пользователя');
    }
  };

  const handleUpdateRole = async (memberId: string, role: OrgRole) => {
    try {
      await updateMember.mutateAsync({ memberId, data: { role } });
      toast('Роль обновлена');
      setEditingMember(null);
    } catch {
      toast('Ошибка обновления роли');
    }
  };

  const handleRevoke = async () => {
    if (!revokingMember) return;
    try {
      await updateMember.mutateAsync({ memberId: revokingMember.id, data: { revoke: true } });
      toast('Доступ отозван');
      setRevokingMember(null);
    } catch {
      toast('Ошибка отзыва доступа');
    }
  };

  if (!selectedOrg) {
    return (
      <EmptyState
        icon="Org"
        title="Организация не выбрана"
        description="Выберите организацию для управления"
      />
    );
  }

  const activeMembers = members?.filter(m => m.status === 'active') ?? [];
  const pendingInvites = invites?.filter(i => i.status === 'pending') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Моя организация</h1>
          <p className="text-zinc-400 mt-1">Управление организацией и участниками</p>
        </div>
      </div>


      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Информация об организации</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Название</p>
              <p className="text-white font-medium">{selectedOrg.name}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Тип</p>
              <p className="text-white font-medium">{orgTypeLabels[selectedOrg.type] || selectedOrg.type}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Описание</p>
              <p className="text-white">{selectedOrg.description || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Ваша роль</p>
              <Badge variant={roleColors[myRole as OrgRole] || 'default'}>
                {roleLabels[myRole as OrgRole] || myRole}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Участники ({activeMembers.length})
            </h2>
            {canManageMembers && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                  Пригласить
                </Button>
                <Button size="sm" onClick={() => setIsCreateUserModalOpen(true)}>
                  Создать пользователя
                </Button>
              </div>
            )}
          </div>

          {membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon="Warning"
              title="Ошибка загрузки"
              description="Не удалось загрузить список участников"
              action={<Button onClick={() => void refetch()}>Повторить</Button>}
            />
          ) : activeMembers.length === 0 ? (
            <EmptyState
              icon="Users"
              title="Нет участников"
              description="Пригласите участников в организацию"
            />
          ) : (
            <div className="space-y-3">
              {activeMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-100 border border-surface-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white font-semibold">
                      {(member.user?.display_name || member.user?.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {member.user?.display_name || member.user?.email || 'Unknown'}
                      </p>
                      <p className="text-sm text-zinc-400">{member.user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleColors[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>
                    {canManageMembers && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMember(member)}
                        >
                          Изменить
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setRevokingMember(member)}
                        >
                          Отозвать
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {pendingInvites.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Ожидающие приглашения ({pendingInvites.length})
            </h2>
            <div className="space-y-3">
              {pendingInvites.map(invite => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-100 border border-surface-200"
                >
                  <div>
                    <p className="font-medium text-white">{invite.email}</p>
                    <p className="text-sm text-zinc-400">
                      Истекает: {new Date(invite.expires_at).toLocaleDateString('ru')}
                    </p>
                  </div>
                  <Badge variant={roleColors[invite.role]}>
                    {roleLabels[invite.role]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Страницы организации ({pages.length})
          </h2>
          {pagesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pages.length === 0 ? (
            <EmptyState
              icon="Page"
              title="Нет страниц"
              description="Страницы, созданные участниками организации, появятся здесь"
            />
          ) : (
            <div className="space-y-2">
              {pages.map(page => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-surface-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white text-sm font-semibold">
                      {page.person.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{page.person.full_name}</p>
                      <p className="text-xs text-zinc-400">
                        {page.status === 'published' ? 'Опубликовано' :
                         page.status === 'draft' ? 'Черновик' :
                         page.status === 'on_moderation' ? 'На модерации' : page.status}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={page.status === 'published' ? 'success' :
                             page.status === 'draft' ? 'default' :
                             page.status === 'on_moderation' ? 'warning' : 'default'}
                    size="sm"
                  >
                    {page.visibility === 'public' ? 'Публичная' :
                     page.visibility === 'unlisted' ? 'По ссылке' : 'Приватная'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Пригласить участника"
      >
        <Form {...inviteForm}>
          <form onSubmit={(e) => void inviteForm.handleSubmit(handleInvite)(e)} className="space-y-4">
            <FormField
              control={inviteForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={inviteForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Роль</FormLabel>
                  <FormControl>
                    <NativeSelect options={roleOptions} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" isLoading={createInvite.isPending}>
                Отправить
              </Button>
            </div>
          </form>
        </Form>
      </Modal>


      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        title="Создать пользователя"
      >
        <Form {...createUserForm}>
          <form onSubmit={(e) => void createUserForm.handleSubmit(handleCreateUser)(e)} className="space-y-4">
            <FormField
              control={createUserForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsCreateUserModalOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" isLoading={createOrgUser.isPending}>
                Создать
              </Button>
            </div>
          </form>
        </Form>
      </Modal>


      {editingMember && (
        <Modal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          title="Изменить роль"
        >
          <div className="space-y-4">
            <p className="text-zinc-400">
              Изменить роль для {editingMember.user?.display_name || editingMember.user?.email || 'Unknown'}
            </p>
            <NativeSelect
              options={roleOptions}
              value={editingMember.role}
              onChange={(e) => void handleUpdateRole(editingMember.id, e.target.value as OrgRole)}
            />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setEditingMember(null)}>
                Закрыть
              </Button>
            </div>
          </div>
        </Modal>
      )}


      <ConfirmDialog
        isOpen={!!revokingMember}
        onClose={() => setRevokingMember(null)}
        title="Отозвать доступ"
        message={`Вы уверены, что хотите отозвать доступ у ${revokingMember?.user?.display_name || revokingMember?.user?.email || 'Unknown'}?`}
        confirmText="Отозвать"
        variant="danger"
        onConfirm={() => void handleRevoke()}
        isLoading={updateMember.isPending}
      />
    </div>
  );
}
