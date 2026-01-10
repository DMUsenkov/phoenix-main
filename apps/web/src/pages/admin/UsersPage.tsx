import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Plus, X } from 'lucide-react';

interface UserDTO {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'org_user' | 'org_admin' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsersListResponse {
  items: UserDTO[];
  total: number;
  limit: number;
  offset: number;
}

interface CreateUserPayload {
  email: string;
  password: string;
  display_name?: string;
  role: 'user' | 'org_user' | 'org_admin' | 'admin';
}

const roleLabels: Record<string, string> = {
  user: 'Пользователь',
  org_user: 'Сотрудник орг.',
  org_admin: 'Админ орг.',
  admin: 'Администратор',
};

const roleColors: Record<string, 'default' | 'primary' | 'warning' | 'danger'> = {
  user: 'default',
  org_user: 'primary',
  org_admin: 'warning',
  admin: 'danger',
};

export function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserPayload>({
    email: '',
    password: '',
    display_name: '',
    role: 'user',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiClient.get<UsersListResponse>('/api/admin/users'),
  });

  const createUser = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiClient.post<UserDTO>('/api/admin/users', payload),
    onSuccess: () => {
      toast('Пользователь создан', 'success');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreateForm(false);
      setFormData({ email: '', password: '', display_name: '', role: 'user' });
    },
    onError: () => {
      toast('Ошибка создания пользователя', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-zinc-400 mt-1">
            Управление пользователями платформы - {data?.total ?? 0} пользователей
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать пользователя
        </Button>
      </div>

      {showCreateForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Новый пользователь</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Пароль"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Имя"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Роль</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'org_user' | 'org_admin' | 'admin' })}
                  className="w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-phoenix-500"
                >
                  <option value="user">Пользователь</option>
                  <option value="org_user">Сотрудник организации</option>
                  <option value="org_admin">Админ организации</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить список пользователей"
        />
      )}

      {!isLoading && !isError && data?.items.length === 0 && (
        <EmptyState
          icon="Users"
          title="Нет пользователей"
          description="Пользователи пока не зарегистрированы"
        />
      )}

      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((user) => (
            <div key={user.id} className="glass-card p-4 hover:bg-surface-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-white font-semibold">
                    {user.display_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-white">
                        {user.display_name || user.email}
                      </span>
                      <Badge variant={roleColors[user.role]} size="sm">
                        {roleLabels[user.role] || user.role}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="danger" size="sm">Неактивен</Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
