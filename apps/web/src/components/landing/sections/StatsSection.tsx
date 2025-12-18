import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, MapPin, Heart, Globe } from 'lucide-react';

interface Stat {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: Stat[] = [
  { icon: Users, value: 10000, suffix: '+', label: 'Созданных страниц', color: 'from-phoenix-500 to-phoenix-600' },
  { icon: MapPin, value: 500, suffix: '+', label: 'Мемориальных объектов', color: 'from-blue-500 to-blue-600' },
  { icon: Heart, value: 50000, suffix: '+', label: 'Семейных связей', color: 'from-pink-500 to-rose-600' },
  { icon: Globe, value: 25, suffix: '', label: 'Регионов России', color: 'from-emerald-500 to-teal-600' },
];

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, inView]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toString();
  };

  return (
    <span className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 overflow-hidden">

      <div className="absolute inset-0 bg-section-glow opacity-30" />

      <div className="container-app relative z-10 px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Phoenix в <span className="text-phoenix-400">цифрах</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Платформа, которой доверяют тысячи семей по всей России
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="relative p-6 lg:p-8 rounded-2xl bg-surface-50/50 backdrop-blur-sm border border-white/5 overflow-hidden">

                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />


                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>


                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />
                </div>


                <p className="text-sm lg:text-base text-zinc-400">
                  {stat.label}
                </p>


                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
