import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Plus, X, ChevronRight } from 'lucide-react';

interface OrgDTO {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface OrgsListResponse {
  items: OrgDTO[];
  total: number;
}

interface CreateOrgPayload {
  name: string;
  type: 'government' | 'ngo' | 'commercial' | 'other';
  description?: string;
  admin_user_id?: string;
}

const orgTypeLabels: Record<string, string> = {
  government: 'Государственная',
  ngo: 'НКО',
  commercial: 'Коммерческая',
  other: 'Другое',
};

export function OrgsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateOrgPayload>({
    name: '',
    type: 'other',
    description: '',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'orgs'],
    queryFn: () => apiClient.get<OrgsListResponse>('/api/admin/orgs'),
  });

  const createOrg = useMutation({
    mutationFn: (payload: CreateOrgPayload) =>
      apiClient.post<OrgDTO>('/api/admin/orgs', payload),
    onSuccess: () => {
      toast('Организация создана', 'success');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
      setShowCreateForm(false);
      setFormData({ name: '', type: 'other', description: '' });
    },
    onError: () => {
      toast('Ошибка создания организации', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrg.mutate(formData);
  };

  const orgs = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Организации</h1>
          <p className="text-zinc-400 mt-1">Управление организациями платформы - {data?.total ?? 0} организаций</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать организацию
        </Button>
      </div>

      {showCreateForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Новая организация</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Название"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Тип</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CreateOrgPayload['type'] })}
                  className="w-full px-4 py-2.5 bg-surface-100 border border-surface-200 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-phoenix-500"
                >
                  <option value="government">Государственная</option>
                  <option value="ngo">НКО</option>
                  <option value="commercial">Коммерческая</option>
                  <option value="other">Другое</option>
                </select>
              </div>
            </div>
            <Input
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={createOrg.isPending}>
                {createOrg.isPending ? 'Создание...' : 'Создать'}
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
          description="Не удалось загрузить список организаций"
        />
      )}

      {!isLoading && !isError && orgs?.length === 0 && (
        <EmptyState
          icon="Org"
          title="Нет организаций"
          description="Организации пока не созданы"
        />
      )}

      {orgs && orgs.length > 0 && (
        <div className="space-y-3">
          {orgs.map((org: OrgDTO) => (
            <Link
              key={org.id}
              to={`/admin/orgs/${org.id}`}
              className="glass-card p-4 hover:bg-surface-100 transition-colors block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{org.name}</span>
                    <Badge variant={org.is_active ? 'success' : 'danger'} size="sm">
                      {org.is_active ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {orgTypeLabels[org.type] || org.type} - {org.slug}
                  </p>
                  {org.description && (
                    <p className="text-sm text-zinc-500 mt-1">{org.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">
                    {new Date(org.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
