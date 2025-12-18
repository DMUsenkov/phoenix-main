import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Plus, Image, MapPin, QrCode, Share2, ChevronRight, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Plus,
    title: 'Создайте страницу',
    description: 'Заполните информацию о человеке — имя, даты, биографию',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Image,
    title: 'Добавьте медиа',
    description: 'Загрузите фото, видео, документы и памятные истории',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: MapPin,
    title: 'Привяжите место',
    description: 'Укажите точку на карте — памятник, дерево или особое место',
    color: 'from-phoenix-500 to-phoenix-600',
  },
  {
    icon: QrCode,
    title: 'Получите QR-код',
    description: 'Система автоматически создаст уникальный код доступа',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Share2,
    title: 'Поделитесь',
    description: 'Разместите код на объекте или отправьте ссылку близким',
    color: 'from-rose-500 to-pink-500',
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-phoenix-500/5 blur-[200px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

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
            <span className="text-sm text-phoenix-400">Простой процесс</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Как это <span className="text-phoenix-400">работает</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            От создания страницы до QR-кода за несколько минут
          </p>
        </motion.div>


        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'bg-surface-50 border border-phoenix-500/30 shadow-glow-sm'
                      : 'bg-surface-50/30 border border-transparent hover:bg-surface-50/50'
                  }`}
                  onClick={() => setActiveStep(idx)}
                >
                  <div className="flex items-start gap-4">

                    <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} p-[1px]`}>
                      <div className={`w-full h-full rounded-xl flex items-center justify-center ${isActive ? 'bg-transparent' : 'bg-surface-100'}`}>
                        <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-white/80'}`}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>


                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className={`w-4 h-4 ${isActive ? 'text-phoenix-400' : 'text-zinc-500'}`} />
                        <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {step.title}
                        </h3>
                      </div>
                      <p className={`text-sm ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {step.description}
                      </p>
                    </div>


                    <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-all ${
                      isActive ? 'text-phoenix-400 translate-x-1' : 'text-zinc-600'
                    }`} />
                  </div>


                  {isActive && (
                    <motion.div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${step.color}`}
                      layoutId="stepIndicator"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">

              <motion.div
                className="absolute inset-0 rounded-full border border-phoenix-500/10"
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border border-phoenix-500/20"
                animate={{ scale: [1.05, 1, 1.05], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <motion.div
                className="absolute inset-16 rounded-full border border-phoenix-500/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />


              <div className="absolute inset-24 rounded-3xl bg-surface-50/80 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden">
                {steps[activeStep] && (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center p-6"
                  >
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center mb-4 shadow-glow-md`}>
                      {(() => {
                        const IconComponent = steps[activeStep].icon;
                        return <IconComponent className="w-8 h-8 text-white" />;
                      })()}
                    </div>
                    <p className="text-white font-semibold">{steps[activeStep].title}</p>
                  </motion.div>
                )}


                <div className={`absolute inset-0 bg-gradient-to-br ${steps[activeStep]?.color ?? 'from-phoenix-500 to-phoenix-600'} opacity-10 blur-xl`} />
              </div>


              {steps.map((step, idx) => {
                const angle = (idx / steps.length) * 360 - 90;
                const radius = 45;
                return (
                  <motion.div
                    key={step.title}
                    className="absolute"
                    style={{
                      top: `${50 + radius * Math.sin((angle * Math.PI) / 180)}%`,
                      left: `${50 + radius * Math.cos((angle * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      scale: activeStep === idx ? 1.2 : 1,
                      opacity: activeStep === idx ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg cursor-pointer`}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setActiveStep(idx)}
                    >
                      <step.icon className="w-5 h-5 text-white" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
