import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Image, Video, Heart, MapPin, QrCode, Sparkles, User, Calendar, BookOpen } from 'lucide-react';

const features = [
  {
    id: 'profile',
    icon: User,
    title: 'Цифровой профиль',
    description: 'Полная биография человека — даты, места, достижения. Вся история жизни в одном месте.',
    color: 'phoenix',
  },
  {
    id: 'media',
    icon: Image,
    title: 'Фото и видео',
    description: 'Галерея воспоминаний с хронологией. Загружайте фото, видео, аудиозаписи.',
    color: 'blue',
  },
  {
    id: 'stories',
    icon: BookOpen,
    title: 'Истории и память',
    description: 'Текстовые воспоминания от близких. Каждый может добавить свою историю.',
    color: 'emerald',
  },
  {
    id: 'location',
    icon: MapPin,
    title: 'Привязка к месту',
    description: 'Страница связана с точкой на карте — памятником, деревом или особым местом.',
    color: 'amber',
  },
];

const colorClasses = {
  phoenix: {
    bg: 'bg-phoenix-500/20',
    text: 'text-phoenix-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    border: 'border-phoenix-500/30',
    gradient: 'from-phoenix-500 to-phoenix-600',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500 to-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-500',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500 to-orange-500',
  },
};

export function TechShowcaseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeFeature, setActiveFeature] = useState(features[0]?.id ?? 'profile');

  const activeColors = colorClasses[features.find(f => f.id === activeFeature)?.color as keyof typeof colorClasses] ?? colorClasses.phoenix;

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-phoenix-500/5 blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-app relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/10 border border-phoenix-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-phoenix-400" />
            <span className="text-sm text-phoenix-400">Страницы памяти</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Вечные <span className="text-phoenix-400">истории</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Создавайте красивые страницы памяти о близких — с фото, видео, историями и воспоминаниями
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative w-full max-w-[400px]">

              <div className="relative rounded-3xl bg-surface-50/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">

                <div className={`h-32 bg-gradient-to-br ${activeColors.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                </div>


                <div className="relative -mt-16 px-6">
                  <motion.div
                    className="w-28 h-28 rounded-2xl bg-surface-100 border-4 border-surface-50 overflow-hidden shadow-xl"
                    animate={{
                      boxShadow: [
                        '0 10px 40px rgba(0,0,0,0.3)',
                        '0 10px 60px rgba(168,85,247,0.3)',
                        '0 10px 40px rgba(0,0,0,0.3)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-phoenix-500/30 to-phoenix-600/20 flex items-center justify-center">
                      <User className="w-12 h-12 text-phoenix-400/60" />
                    </div>
                  </motion.div>
                </div>


                <div className="p-6 pt-4">

                  <div className="mb-4">
                    <div className="h-6 w-48 bg-white/10 rounded-lg mb-2" />
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Calendar className="w-4 h-4" />
                      <span>1945 — 2020</span>
                    </div>
                  </div>


                  <div className="space-y-2 mb-6">
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                    <div className="h-3 w-4/6 bg-white/5 rounded" />
                  </div>


                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: Image, label: 'Фото', value: '24' },
                      { icon: Video, label: 'Видео', value: '5' },
                      { icon: Heart, label: 'Истории', value: '12' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                        className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5"
                      >
                        <stat.icon className="w-5 h-5 mx-auto mb-1 text-phoenix-400" />
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>


                  <div className="flex items-center gap-3 p-3 rounded-xl bg-phoenix-500/10 border border-phoenix-500/20">
                    <QrCode className="w-8 h-8 text-phoenix-400" />
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">QR-код доступа</p>
                      <p className="text-xs text-zinc-500">Сканируйте для просмотра</p>
                    </div>
                  </div>
                </div>
              </div>


              <div className={`absolute inset-0 -z-10 blur-3xl bg-gradient-to-br ${activeColors.gradient} opacity-20 rounded-full scale-75`} />
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4 order-1 lg:order-2"
          >
            {features.map((feature, i) => {
              const colors = colorClasses[feature.color as keyof typeof colorClasses];
              const isActive = activeFeature === feature.id;

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? `bg-surface-50 ${colors.border} ${colors.glow}`
                      : 'bg-surface-50/50 border-white/5 hover:bg-surface-50 hover:border-white/10'
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>


                  {isActive && (
                    <motion.div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${colors.gradient}`}
                      layoutId="techActiveIndicator"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
