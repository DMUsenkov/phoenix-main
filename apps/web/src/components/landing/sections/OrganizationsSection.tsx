import { Building2, Shield, BarChart3, Lock, ArrowRight } from 'lucide-react';
import { GlassCard } from '../GlassCard';

const orgFeatures = [
  {
    icon: Building2,
    title: 'Парки и проекты',
    description: 'Управление мемориальными парками, проектами и коллекциями объектов.',
  },
  {
    icon: Shield,
    title: 'Модерация',
    description: 'Очередь модерации, правила автопроверки, командная работа.',
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    description: 'Статистика посещений, QR-сканов, отчёты и экспорт данных.',
  },
  {
    icon: Lock,
    title: 'Безопасность',
    description: 'Роли и права, audit trail, rate limiting, compliance.',
  },
];

const workflowSteps = ['Create', 'Moderate', 'Publish', 'Report'];

export function OrganizationsSection() {
  return (
    <section className="relative py-32 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-50/50 to-transparent" />

      <div className="container-app relative z-10 px-4">

        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-phoenix-500/10 text-phoenix-400 text-sm font-medium mb-4">
            B2G / B2B
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Для <span className="text-phoenix-400">организаций</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Полный набор инструментов для государственных и коммерческих проектов
          </p>
        </div>


        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {orgFeatures.map((feature) => (
            <GlassCard key={feature.title} className="p-6 group" glow>
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-4 group-hover:bg-phoenix-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-phoenix-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>


        <GlassCard variant="subtle" className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Enterprise Workflow
              </h3>
              <p className="text-sm text-zinc-400">
                Полный цикл от создания до отчётности
              </p>
            </div>


            <div className="flex items-center gap-2 md:gap-4">
              {workflowSteps.map((step, idx) => (
                <div key={step} className="flex items-center gap-2 md:gap-4">
                  <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-surface-100 border border-white/10 text-sm text-zinc-300 hover:border-phoenix-500/30 hover:text-phoenix-400 transition-colors cursor-default">
                    {step}
                  </div>
                  {idx < workflowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-phoenix-500/50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
