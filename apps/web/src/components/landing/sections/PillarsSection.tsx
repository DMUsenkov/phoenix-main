import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, MapPin, GitBranch, Sparkles } from 'lucide-react';

const pillars = [
  {
    icon: FileText,
    title: 'Страница',
    subtitle: 'Мемориальная страница',
    description: 'История человека: фото, видео, тексты, документы. Всё в одном месте с красивым оформлением.',
    badge: 'Публичная',
    gradient: 'from-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: MapPin,
    title: 'Место',
    subtitle: 'Физический объект',
    description: 'Дерево, табличка, памятник — привязка к реальной точке на карте с уникальным QR-кодом.',
    badge: 'Геолокация',
    gradient: 'from-phoenix-500 to-phoenix-600',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    icon: GitBranch,
    title: 'Связи',
    subtitle: 'Генеалогия',
    description: 'Древо поколений как интерактивный граф. Подтверждённые родственные отношения.',
    badge: 'Верификация',
    gradient: 'from-blue-500 to-indigo-500',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
];

export function PillarsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-phoenix-500/5 blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-app relative z-10 px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/10 border border-phoenix-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-phoenix-400" />
            <span className="text-sm text-phoenix-400">Основа платформы</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Три столпа <span className="text-phoenix-400">Phoenix</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Единая экосистема для сохранения памяти и связей между поколениями
          </p>
        </motion.div>


        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="group relative"
            >

              <div className="relative h-full p-8 rounded-3xl bg-surface-50/50 backdrop-blur-sm border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10">

                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${pillar.glowColor} 0%, transparent 70%)`,
                  }}
                />


                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${pillar.gradient} opacity-20`} />
                </div>


                <div className="relative z-10">

                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} p-[1px] mb-6`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full rounded-2xl bg-surface-100 flex items-center justify-center">
                      <pillar.icon className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>


                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-gradient-to-r ${pillar.gradient} text-white shadow-lg`}>
                    {pillar.badge}
                  </div>


                  <h3 className="text-2xl font-bold text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-phoenix-400 mb-4">
                    {pillar.subtitle}
                  </p>


                  <p className="text-zinc-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>


                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${pillar.gradient} opacity-5 blur-2xl`} />
                <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${pillar.gradient} opacity-5 blur-2xl`} />
              </div>


              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-surface-100 border border-white/10 flex items-center justify-center text-lg font-bold text-phoenix-400 shadow-glow-sm">
                {idx + 1}
              </div>
            </motion.div>
          ))}
        </div>


        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-px">
          <motion.div
            className="h-full bg-gradient-to-r from-transparent via-phoenix-500/30 to-transparent"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </section>
  );
}
