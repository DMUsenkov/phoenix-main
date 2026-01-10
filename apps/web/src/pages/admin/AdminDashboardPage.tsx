import { Link } from 'react-router-dom';
import { Users, Building2, BookOpen, Clock, Shield, Eye } from 'lucide-react';
import { useAdminStats } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminStats();

  const stats = [
    {
      label: 'Пользователи',
      value: data?.users_count ?? 0,
      icon: Users,
      color: 'text-blue-400',
      link: '/admin/users'
    },
    {
      label: 'Организации',
      value: data?.orgs_count ?? 0,
      icon: Building2,
      color: 'text-purple-400',
      link: '/admin/organizations'
    },
    {
      label: 'Страницы',
      value: data?.pages_count ?? 0,
      icon: BookOpen,
      color: 'text-green-400',
      link: '/admin/moderation'
    },
    {
      label: 'На модерации',
      value: data?.pages_on_moderation ?? 0,
      icon: Clock,
      color: 'text-orange-400',
      link: '/admin/moderation'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Панель администратора</h1>
        <p className="text-zinc-400 mt-1">Управление платформой Phoenix</p>
      </div>


      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5">
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-full glass-card p-8 text-center">
            <div className="text-5xl mb-4">Warning</div>
            <h2 className="text-xl font-semibold text-white mb-2">Ошибка загрузки</h2>
            <p className="text-zinc-400">{error.detail || 'Не удалось загрузить статистику'}</p>
          </div>
        ) : (
          stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link
                key={idx}
                to={stat.link}
                className="glass-card p-5 hover:border-white/15 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-surface-100 to-surface-50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>


      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Административные функции</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link to="/admin/users">
            <Button variant="secondary" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Управление пользователями
            </Button>
          </Link>
          <Link to="/admin/orgs">
            <Button variant="secondary" className="w-full justify-start">
              <Building2 className="w-4 h-4 mr-2" />
              Управление организациями
            </Button>
          </Link>
          <Link to="/admin/moderation">
            <Button variant="secondary" className="w-full justify-start">
              <Eye className="w-4 h-4 mr-2" />
              Модерация контента
            </Button>
          </Link>
        </div>
      </div>


      {!isLoading && data && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-phoenix-500/20 to-phoenix-600/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-phoenix-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Статус системы</h2>
              <p className="text-sm text-zinc-400">Все системы работают нормально</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">Всего пользователей</p>
              <p className="text-white font-medium">{data.users_count}</p>
            </div>
            <div>
              <p className="text-zinc-500">Активных организаций</p>
              <p className="text-white font-medium">{data.orgs_count}</p>
            </div>
            <div>
              <p className="text-zinc-500">Всего страниц</p>
              <p className="text-white font-medium">{data.pages_count}</p>
            </div>
            <div>
              <p className="text-zinc-500">Ожидают модерации</p>
              <p className="text-white font-medium">{data.pages_on_moderation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
