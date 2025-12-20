import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield, LogOut, Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';

const roleLabels: Record<string, string> = {
  user: 'Пользователь',
  org: 'Организация',
  admin: 'Администратор',
};

const roleBadgeVariants: Record<string, 'default' | 'primary' | 'success'> = {
  user: 'default',
  org: 'primary',
  admin: 'success',
};

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Никогда';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast('Вы вышли из аккаунта', 'info');
      navigate('/auth/login', { replace: true });
    } catch {
      toast('Ошибка при выходе', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Профиль"
        subtitle="Управление вашим аккаунтом"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1" variant="glass">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar
                  fallback={user.displayName || user.email}
                  size="xl"
                  className="ring-4 ring-phoenix-500/20"
                />
                <button
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Изменить аватар (скоро)"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-white">
                {user.displayName || 'Без имени'}
              </h2>
              <p className="text-zinc-400 text-sm">{user.email}</p>

              <div className="mt-3">
                <Badge variant={roleBadgeVariants[user.role]}>
                  {roleLabels[user.role]}
                </Badge>
              </div>

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => void handleLogout()}
                isLoading={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" variant="glass">
          <CardHeader>
            <CardTitle>Информация об аккаунте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                icon={<User className="w-5 h-5" />}
                label="Имя"
                value={user.displayName || 'Не указано'}
              />
              <InfoItem
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                value={user.email}
              />
              <InfoItem
                icon={<Shield className="w-5 h-5" />}
                label="Роль"
                value={roleLabels[user.role] ?? user.role}
              />
              <InfoItem
                icon={<Calendar className="w-5 h-5" />}
                label="Дата регистрации"
                value={formatDate(user.createdAt)}
              />
            </div>

            <div className="pt-4 border-t border-surface-300">
              <InfoItem
                icon={<Calendar className="w-5 h-5" />}
                label="Последний вход"
                value={formatDate(user.lastLoginAt)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Настройки безопасности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-100 border border-surface-300">
            <div>
              <h3 className="font-medium text-white">Изменить пароль</h3>
              <p className="text-sm text-zinc-400">
                Обновите пароль для защиты аккаунта
              </p>
            </div>
            <Button variant="outline" disabled>
              Скоро
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-100 border border-surface-300">
      <div className="p-2 rounded-lg bg-phoenix-500/10 text-phoenix-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="font-medium text-white">{value}</p>
      </div>
    </div>
  );
}
