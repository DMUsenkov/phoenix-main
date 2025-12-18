import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { MapPin, QrCode, Eye, Trees, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: 12480, suffix: '', label: 'Объектов', icon: MapPin, color: 'from-phoenix-500 to-phoenix-600' },
  { value: 1.2, suffix: 'М', label: 'Сканирований', icon: QrCode, color: 'from-blue-500 to-indigo-500' },
  { value: 3.8, suffix: 'М', label: 'Просмотров', icon: Eye, color: 'from-emerald-500 to-teal-500' },
  { value: 156, suffix: '', label: 'Парков', icon: Trees, color: 'from-amber-500 to-orange-500' },
];

function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(progress * value);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const displayValue = value >= 1000
    ? count.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
    : count.toFixed(value % 1 !== 0 ? 1 : 0);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

export function MapScaleSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <motion.div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-phoenix-500/5 blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-app relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">

              <motion.div
                className="absolute inset-0 rounded-full border border-phoenix-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              />


              <div className="absolute inset-8 rounded-3xl bg-surface-50/80 backdrop-blur-xl border border-white/10 overflow-hidden">

                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(124, 58, 237, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(124, 58, 237, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px',
                  }}
                />


                {[
                  { top: '20%', left: '30%', size: 4, delay: 0 },
                  { top: '35%', left: '60%', size: 6, delay: 0.5 },
                  { top: '50%', left: '40%', size: 8, delay: 1, main: true },
                  { top: '65%', left: '70%', size: 4, delay: 1.5 },
                  { top: '75%', left: '25%', size: 5, delay: 2 },
                  { top: '30%', left: '80%', size: 3, delay: 2.5 },
                  { top: '80%', left: '55%', size: 4, delay: 3 },
                ].map((point, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ top: point.top, left: point.left }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: point.delay }}
                  >
                    <motion.div
                      className={`rounded-full ${point.main ? 'bg-phoenix-500' : 'bg-phoenix-400/60'}`}
                      style={{ width: point.size * 2, height: point.size * 2 }}
                      animate={point.main ? {
                        boxShadow: ['0 0 10px rgba(168,85,247,0.5)', '0 0 30px rgba(168,85,247,0.8)', '0 0 10px rgba(168,85,247,0.5)']
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {point.main && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-phoenix-500/30"
                        animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}


                <svg className="absolute inset-0 w-full h-full">
                  <motion.line
                    x1="40%" y1="50%" x2="60%" y2="35%"
                    stroke="rgba(168, 85, 247, 0.3)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 1, delay: 1.5 }}
                  />
                  <motion.line
                    x1="40%" y1="50%" x2="30%" y2="20%"
                    stroke="rgba(168, 85, 247, 0.2)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 1, delay: 1.8 }}
                  />
                </svg>


                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2 py-1 rounded-md bg-surface/80 backdrop-blur-sm text-xs text-zinc-400 border border-white/10">
                    Объекты
                  </span>
                  <span className="px-2 py-1 rounded-md bg-emerald-500/20 backdrop-blur-sm text-xs text-emerald-400 border border-emerald-500/20">
                    Парки
                  </span>
                </div>

                <motion.div
                  className="absolute bottom-4 right-4"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="px-3 py-1.5 rounded-lg bg-phoenix-500/20 backdrop-blur-sm text-xs text-phoenix-400 border border-phoenix-500/30 font-medium">
                    - В реальном времени
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/10 border border-phoenix-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-phoenix-400" />
              <span className="text-sm text-phoenix-400">Глобальный охват</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Масштаб <span className="text-phoenix-400">пространства</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
              Тысячи объектов памяти на интерактивной карте.
              Парки, мемориалы, частные точки — всё в едином пространстве
              с фильтрами, поиском и аналитикой.
            </p>


            <div className="grid grid-cols-2 gap-4 mb-10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="relative p-5 rounded-2xl bg-surface-50/50 border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
                >

                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                  <div className="relative flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>


            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/map"
                className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-phoenix-600 to-phoenix-500" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
                <span className="relative">Открыть карту</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
