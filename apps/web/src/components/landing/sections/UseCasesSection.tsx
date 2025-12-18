import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Users, Building2, TreePine, Heart, ChevronRight } from 'lucide-react';

interface UseCase {
  id: string;
  icon: typeof Users;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: string;
  image: string;
}

const useCases: UseCase[] = [
  {
    id: 'family',
    icon: Heart,
    title: 'Семейная память',
    subtitle: 'Для семей и близких',
    description: 'Сохраните историю родных в интерактивном формате. Фото, видео, голос и воспоминания — всё в одном месте.',
    features: ['Генеалогическое древо', 'Голосовые послания', 'Семейный архив', 'Приватный доступ'],
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    image: '/family-memory.jpg',
  },
  {
    id: 'park',
    icon: TreePine,
    title: 'Парки памяти',
    subtitle: 'Для муниципалитетов',
    description: 'Создайте цифровую инфраструктуру для мемориальных пространств. QR-коды, статистика и аналитика посещений.',
    features: ['Интеграция QR/NFC', 'Массовое управление', 'Аналитика', 'Модерация контента'],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    image: '/park-memory.jpg',
  },
  {
    id: 'org',
    icon: Building2,
    title: 'Корпоративная память',
    subtitle: 'Для организаций',
    description: 'Увековечьте историю компании и её основателей. Интерактивные профили для музеев и выставок.',
    features: ['Брендирование', 'Интеграция', 'Техподдержка', 'Настройка под заказчика'],
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    image: '/corporate-memory.jpg',
  },
  {
    id: 'veteran',
    icon: Users,
    title: 'Память героев',
    subtitle: 'Для ведомств',
    description: 'Создайте цифровые мемориалы для ветеранов и героев. Связь поколений через технологии.',
    features: ['Верификация данных', 'Массовый импорт', 'Интеграция с реестрами', 'Публичный доступ'],
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    image: '/veteran-memory.jpg',
  },
];

export function UseCasesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeCase, setActiveCase] = useState(useCases[0]?.id ?? 'family');

  const activeUseCase = useCases.find((uc) => uc.id === activeCase) ?? useCases[0];

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <div className="absolute inset-0 bg-section-glow opacity-30" />

      <div className="container-app relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Для кого <span className="text-phoenix-400">Phoenix</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            От семейных архивов до масштабных городских проектов
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 space-y-3"
          >
            {useCases.map((useCase, i) => {
              const isActive = activeCase === useCase.id;
              return (
                <motion.button
                  key={useCase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  onClick={() => setActiveCase(useCase.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'bg-surface-50 border-phoenix-500/30 shadow-glow-sm'
                      : 'bg-surface-50/30 border-white/5 hover:bg-surface-50/50 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? 'bg-phoenix-500/20' : 'bg-white/5'
                      }`}
                    >
                      <useCase.icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-phoenix-400' : 'text-zinc-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold transition-colors ${
                          isActive ? 'text-white' : 'text-zinc-300'
                        }`}
                      >
                        {useCase.title}
                      </h3>
                      <p className="text-sm text-zinc-500">{useCase.subtitle}</p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-all ${
                        isActive ? 'text-phoenix-400 translate-x-0' : 'text-zinc-600 -translate-x-1'
                      }`}
                    />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-8"
          >
            {activeUseCase && (
              <motion.div
                key={activeUseCase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl bg-surface-50/50 border border-white/5 overflow-hidden"
              >

                <div className={`absolute inset-0 bg-gradient-to-br ${activeUseCase.gradient}`} />

                <div className="relative p-8 lg:p-10">

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-phoenix-500/20 flex items-center justify-center">
                      <activeUseCase.icon className="w-7 h-7 text-phoenix-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{activeUseCase.title}</h3>
                      <p className="text-phoenix-400">{activeUseCase.subtitle}</p>
                    </div>
                  </div>


                  <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                    {activeUseCase.description}
                  </p>


                  <div className="grid grid-cols-2 gap-4">
                    {activeUseCase.features.map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                      >
                        <div className="w-2 h-2 rounded-full bg-phoenix-500" />
                        <span className="text-zinc-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>


                  <motion.div className="mt-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-phoenix-500/20 border border-phoenix-500/30 text-phoenix-400 font-medium hover:bg-phoenix-500/30 transition-colors"
                    >
                      Узнать подробнее
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                </div>


                <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-phoenix-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
