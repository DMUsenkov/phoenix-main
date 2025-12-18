import { Shield, FileCheck, Gauge, Users } from 'lucide-react';

const trustItems = [
  { icon: Shield, label: 'Готово к модерации' },
  { icon: FileCheck, label: 'Журнал аудита' },
  { icon: Gauge, label: 'Защита от превышения лимитов' },
  { icon: Users, label: 'Контроль доступа в организациях' },
];

export function TrustStripSection() {
  return (
    <section className="relative py-16 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-phoenix-500/5 to-transparent" />


      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-phoenix-500/30 to-transparent" />


      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-phoenix-500/30 to-transparent" />

      <div className="container-app relative z-10 px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-phoenix-500/20 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-phoenix-400 group-hover:text-phoenix-300 transition-colors" />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
