import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrgContext } from '@/lib/org';
import { useOrgMembers, useOrgInvites, useCreateInvite, useCreateOrgUser, useUpdateMember } from '@/lib/hooks/useOrgs';
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

export function OrgMembersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedOrgId, canManageMembers } = useOrgContext();
  const { toast } = useToast();

  const { data: members, isLoading: membersLoading, isError, refetch } = useOrgMembers(selectedOrgId ?? undefined);
  const { data: invites, isLoading: invitesLoading } = useOrgInvites(selectedOrgId ?? undefined);
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

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    inviteForm.reset({ email: '', role: 'org_viewer' });
  };

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

  const onSubmitInvite = async (data: InviteFormData) => {
    try {
      await createInvite.mutateAsync({ email: data.email, role: data.role });
      toast('Приглашение отправлено', 'success');
      handleCloseInviteModal();
    } catch {
      toast('Ошибка отправки приглашения', 'error');
    }
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
    } catch {
      toast('Ошибка создания пользователя', 'error');
    }
  };

  const handleChangeRole = async (newRole: OrgRole) => {
    if (!editingMember) return;
    try {
      await updateMember.mutateAsync({
        memberId: editingMember.id,
        data: { role: newRole },
      });
      toast('Роль обновлена', 'success');
      setEditingMember(null);
    } catch {
      toast('Ошибка изменения роли', 'error');
    }
  };

  const handleRevoke = async () => {
    if (!revokingMember) return;
    try {
      await updateMember.mutateAsync({
        memberId: revokingMember.id,
        data: { revoke: true },
      });
      toast('Доступ отозван', 'success');
      setRevokingMember(null);
    } catch {
      toast('Ошибка отзыва доступа', 'error');
    }
  };

  const activeMembers = members?.filter((m) => m.status === 'active') ?? [];
  const pendingInvites = invites?.filter((i) => i.status === 'pending') ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Участники</h1>
          <p className="text-zinc-400 mt-1">Управление командой организации</p>
        </div>
        {canManageMembers && (
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateUserModalOpen(true)}>
              <span className="mr-2">+</span>
              Создать пользователя
            </Button>
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(true)}>
              <span className="mr-2">Invite</span>
              Пригласить
            </Button>
          </div>
        )}
      </div>

      {(membersLoading || invitesLoading) && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить участников"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      )}

      {!membersLoading && !isError && activeMembers.length === 0 && pendingInvites.length === 0 && (
        <EmptyState
          icon="Users"
          title="Нет участников"
          description="Пригласите первого участника в организацию"
          action={
            canManageMembers ? (
              <Button onClick={() => setIsCreateUserModalOpen(true)}>Создать пользователя</Button>
            ) : undefined
          }
        />
      )}

      {activeMembers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Активные участники ({activeMembers.length})
          </h2>
          <div className="space-y-3">
            {activeMembers.map((member) => (
              <Card key={member.id} variant="glass">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white font-semibold">
                      {(member.user?.display_name || member.user?.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {member.user?.display_name || member.user?.email || 'Unknown'}
                      </p>
                      <p className="text-sm text-zinc-400 truncate">{member.user?.email || ''}</p>
                    </div>
                    <Badge variant={roleColors[member.role]} size="sm">
                      {roleLabels[member.role]}
                    </Badge>
                    {canManageMembers && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMember(member)}
                        >
                          Роль
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokingMember(member)}
                        >
                          Отозвать
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Ожидающие приглашения ({pendingInvites.length})
          </h2>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <Card key={invite.id} variant="glass" className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center text-zinc-400">
                      Invite
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-300 truncate">{invite.email}</p>
                      <p className="text-sm text-zinc-500">
                        Истекает: {new Date(invite.expires_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <Badge variant={roleColors[invite.role]} size="sm">
                      {roleLabels[invite.role]}
                    </Badge>
                    <Badge variant="warning" size="sm">Ожидает</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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

      <Modal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        title="Пригласить участника"
        size="md"
      >
        <Form {...inviteForm}>
          <form onSubmit={(e) => void inviteForm.handleSubmit(onSubmitInvite)(e)} className="space-y-4">
            <FormField
              control={inviteForm.control}
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
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleCloseInviteModal}>
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
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Изменить роль"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-400">
            Выберите новую роль для {editingMember?.user?.display_name || editingMember?.user?.email || 'Unknown'}
          </p>
          <div className="grid gap-2">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => void handleChangeRole(option.value as OrgRole)}
                disabled={updateMember.isPending}
                className={`w-full p-3 rounded-xl text-left transition-colors ${
                  editingMember?.role === option.value
                    ? 'bg-phoenix-500/20 border border-phoenix-500/30 text-white'
                    : 'bg-surface-100 hover:bg-surface-200 text-zinc-300'
                }`}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!revokingMember}
        onClose={() => setRevokingMember(null)}
        onConfirm={() => void handleRevoke()}
        title="Отозвать доступ?"
        message={`Пользователь ${revokingMember?.user?.display_name || revokingMember?.user?.email || 'Unknown'} потеряет доступ к организации.`}
        confirmText="Отозвать"
        variant="danger"
        isLoading={updateMember.isPending}
      />
    </div>
  );
}
