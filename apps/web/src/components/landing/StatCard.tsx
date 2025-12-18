import { GlassCard } from './GlassCard';

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <GlassCard className="p-6 text-center group" glow>
      {icon && (
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-phoenix-500/10 flex items-center justify-center text-phoenix-400 group-hover:bg-phoenix-500/20 transition-colors">
          {icon}
        </div>
      )}
      <div className="text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-sm text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
    </GlassCard>
  );
}
