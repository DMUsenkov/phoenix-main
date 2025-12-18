import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Rocket, Shield, Heart } from 'lucide-react';

const benefits = [
  { icon: Heart, text: 'Бесплатно для семей' },
  { icon: Shield, text: 'Полная приватность' },
  { icon: Rocket, text: 'Запуск за 5 минут' },
];

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-phoenix-950/20 to-phoenix-950/40" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>


      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-phoenix-400/30"
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="container-app relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >

          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Начните сохранять
            <br />
            <motion.span
              className="bg-gradient-to-r from-phoenix-400 via-phoenix-300 to-phoenix-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              память сегодня
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Создайте первую страницу бесплатно.
            Для организаций — свяжитесь с нами для обсуждения проекта.
          </motion.p>


          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/auth/register"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-semibold text-white rounded-2xl overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-phoenix-600 via-phoenix-500 to-phoenix-600"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
                <div className="absolute inset-0 shadow-glow-xl" />
                <span className="relative">Создать страницу</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-medium text-white rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
              >
                <Mail className="w-5 h-5 text-phoenix-400" />
                <span>Для организаций</span>
              </Link>
            </motion.div>
          </motion.div>


          <motion.div
            className="flex flex-wrap justify-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.text}
                className="flex items-center gap-2 text-zinc-400"
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <div className="w-8 h-8 rounded-lg bg-phoenix-500/10 flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-phoenix-400" />
                </div>
                <span>{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
