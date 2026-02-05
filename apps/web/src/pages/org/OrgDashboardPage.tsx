import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrgContext } from '@/lib/org';
import { useOrgPages, useOrgObjects, useOrgProjects, useOrgMembers, useCreateOrgUser } from '@/lib/hooks/useOrgs';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
  Modal,
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
import type { OrgRole } from '@/lib/api/orgs';

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

const createUserSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  display_name: z.string().optional(),
  system_role: z.enum(['org_user', 'org_admin']),
  org_role: z.enum(['org_admin', 'org_editor', 'org_moderator', 'org_viewer']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  isLoading?: boolean;
  href?: string;
}

function StatCard({ label, value, icon, isLoading, href }: StatCardProps) {
  const content = (
    <Card variant="glass" className={href ? 'hover:bg-surface-100 transition-colors cursor-pointer' : ''}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm">{label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
            )}
          </div>
          <span className="text-3xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

interface QuickActionProps {
  label: string;
  description: string;
  icon: string;
  href: string;
  disabled?: boolean;
}

function QuickAction({ label, description, icon, href, disabled }: QuickActionProps) {
  if (disabled) {
    return (
      <div className="glass-card p-4 opacity-50 cursor-not-allowed">
        <div className="flex items-start gap-4">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-medium text-zinc-400">{label}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={href}
      className="glass-card p-4 hover:bg-surface-100 transition-colors block group"
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        <div>
          <p className="font-medium text-white group-hover:text-phoenix-400 transition-colors">{label}</p>
          <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export function OrgDashboardPage() {
  const { selectedOrg, selectedOrgId, myRole, canEdit, canManageMembers } = useOrgContext();
  const { toast } = useToast();
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  const { data: pagesData, isLoading: pagesLoading } = useOrgPages(selectedOrgId ?? undefined);
  const { data: objectsData, isLoading: objectsLoading } = useOrgObjects(selectedOrgId ?? undefined);
  const { data: projects, isLoading: projectsLoading } = useOrgProjects(selectedOrgId ?? undefined);
  const { data: members, isLoading: membersLoading } = useOrgMembers(selectedOrgId ?? undefined);
  const createOrgUser = useCreateOrgUser(selectedOrgId ?? '');

  const pagesCount = pagesData?.total ?? 0;
  const objectsCount = objectsData?.total ?? 0;
  const projectsCount = projects?.length ?? 0;
  const membersCount = members?.filter(m => m.status === 'active').length ?? 0;

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
    } catch {
      toast('Ошибка создания пользователя', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          {selectedOrg && myRole && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-zinc-400">{selectedOrg.name}</span>
              <Badge variant={roleColors[myRole]} size="sm">
                {roleLabels[myRole]}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Страницы"
          value={pagesCount}
          icon="Page"
          isLoading={pagesLoading}
          href="/org/pages"
        />
        <StatCard
          label="Объекты"
          value={objectsCount}
          icon="Place"
          isLoading={objectsLoading}
          href="/org/objects"
        />
        <StatCard
          label="Проекты"
          value={projectsCount}
          icon="Project"
          isLoading={projectsLoading}
          href="/org/projects"
        />
        <div className="relative">
          <StatCard
            label="Участники"
            value={membersCount}
            icon="Users"
            isLoading={membersLoading}
            href="/org/members"
          />
          {canManageMembers && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsCreateUserModalOpen(true);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-phoenix-500 hover:bg-phoenix-600 text-white flex items-center justify-center transition-colors z-10"
              title="Создать пользователя"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
          <div className="grid gap-3">
            <QuickAction
              label="Создать страницу"
              description="Добавить новую мемориальную страницу"
              icon="+"
              href="/org/pages/new"
              disabled={!canEdit}
            />

            <QuickAction
              label="Создать проект"
              description="Организовать объекты в проект"
              icon="Project"
              href="/org/projects?action=create"
              disabled={!canEdit}
            />
            <QuickAction
              label="Пригласить участника"
              description="Добавить нового члена команды"
              icon="Invite"
              href="/org/members?action=invite"
              disabled={!canManageMembers}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Информация об организации</h2>
          <Card variant="glass">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Название</p>
                <p className="text-white font-medium">{selectedOrg?.name}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Тип</p>
                <p className="text-white font-medium">
                  {selectedOrg?.type === 'government' && 'Государственная'}
                  {selectedOrg?.type === 'ngo' && 'НКО'}
                  {selectedOrg?.type === 'commercial' && 'Коммерческая'}
                  {selectedOrg?.type === 'other' && 'Другое'}
                </p>
              </div>
              {selectedOrg?.description && (
                <div>
                  <p className="text-sm text-zinc-400">Описание</p>
                  <p className="text-white">{selectedOrg.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-400">Ваша роль</p>
                <div className="mt-1">
                  {myRole && (
                    <Badge variant={roleColors[myRole]}>
                      {roleLabels[myRole]}
                    </Badge>
                  )}
                </div>
              </div>
              {canManageMembers && (
                <div className="pt-2">
                  <Link to="/org/manage">
                    <Button variant="secondary" size="sm">
                      Настройки организации
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
