import { DashboardLayout } from './DashboardLayout';
import { getNavForRole } from '@/lib/navigation';
import { useAuth } from '@/lib/auth';

export function AppLayout() {
  const { user } = useAuth();
  const navSections = getNavForRole(user?.role ?? null);

  return <DashboardLayout navSections={navSections} />;
}
