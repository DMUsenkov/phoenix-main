import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { ArrowRight, Sparkles, Map, Heart, Shield } from 'lucide-react';
import { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  size: number;
  angle: number;
}

function generateShootingStars(count: number): ShootingStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 120 - 10,
    startY: Math.random() * 50 - 10,
    duration: 1.5 + Math.random() * 2,
    delay: Math.random() * 8,
    size: 1 + Math.random() * 2,
    angle: 30 + Math.random() * 30,
  }));
}

function ShootingStarComponent({ star }: { star: ShootingStar }) {
  const distance = 300 + Math.random() * 200;
  const endX = star.startX + Math.cos((star.angle * Math.PI) / 180) * distance;
  const endY = star.startY + Math.sin((star.angle * Math.PI) / 180) * distance;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${star.startX}%`,
        top: `${star.startY}%`,
        width: star.size,
        height: star.size,
      }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [0, (endX - star.startX) * 5],
        y: [0, (endY - star.startY) * 5],
      }}
      transition={{
        duration: star.duration,
        delay: star.delay,
        repeat: Infinity,
        repeatDelay: 5 + Math.random() * 10,
        ease: 'easeOut',
      }}
    >
      <div
        className="relative"
        style={{
          width: star.size * 40,
          height: star.size,
          transform: `rotate(${star.angle}deg)`,
          transformOrigin: 'left center',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, rgba(255,255,255,0.9), rgba(168,85,247,0.6), transparent)`,
            boxShadow: `0 0 ${star.size * 4}px rgba(168,85,247,0.5), 0 0 ${star.size * 8}px rgba(255,255,255,0.3)`,
          }}
        />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            width: star.size * 2,
            height: star.size * 2,
            boxShadow: `0 0 ${star.size * 6}px rgba(255,255,255,0.8), 0 0 ${star.size * 12}px rgba(168,85,247,0.6)`,
          }}
        />
      </div>
    </motion.div>
  );
}

interface StaticStar {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
  delay: number;
}

function generateStaticStars(count: number): StaticStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.7,
    twinkleDuration: 2 + Math.random() * 4,
    delay: Math.random() * 3,
  }));
}

export function HeroSectionNew() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const shootingStars = useMemo(() => generateShootingStars(12), []);
  const staticStars = useMemo(() => generateStaticStars(80), []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-surface to-obsidian-deep" />
        <motion.div
          className="absolute inset-0 bg-hero-gradient"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-hero-gradient-2"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {staticStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.twinkleDuration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {shootingStars.map((star) => (
          <ShootingStarComponent key={star.id} star={star} />
        ))}
      </div>


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>


      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />


      <motion.div
        className="relative z-10 container-app text-center px-4"
        style={{ y, opacity, scale }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >

          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]"
              whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.3)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-phoenix-400" />
              </motion.div>
              <span className="text-sm text-zinc-300">
                Платформа цифровой памяти
              </span>
              <Sparkles className="w-3 h-3 text-phoenix-500" />
            </motion.div>
          </motion.div>


          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 tracking-tight leading-[1.05]"
          >
            <span className="block">Память жива</span>
            <motion.span
              className="block bg-gradient-to-r from-phoenix-400 via-phoenix-300 to-phoenix-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              В каждом месте
            </motion.span>
          </motion.h1>


          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Создавайте{' '}
            <span className="text-phoenix-400 font-medium">цифровые страницы памяти</span>
            {' '}— вечные истории о близких, доступные в любой точке мира
          </motion.p>


          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/auth/register"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden"
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
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />

                <div className="absolute inset-0 shadow-glow-lg opacity-50" />
                <span className="relative">Создать страницу</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/map"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-medium text-white rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
              >
                <Map className="w-5 h-5 text-phoenix-400" />
                <span>Открыть карту</span>
              </Link>
            </motion.div>
          </motion.div>


          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-zinc-500"
          >
            {[
              { icon: Heart, text: 'Бесплатно для семей' },
              { icon: Shield, text: 'Приватность данных' },
              { icon: Sparkles, text: 'Без рекламы' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
              >
                <item.icon className="w-4 h-4 text-phoenix-500" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>


      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          animate={{ borderColor: ['rgba(255,255,255,0.2)', 'rgba(168,85,247,0.4)', 'rgba(255,255,255,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-3 rounded-full bg-phoenix-400"
            animate={{ y: [0, 8, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
