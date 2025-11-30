import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
}

function generateParticles(count: number): FloatingParticle[] {
  const colors = [
    'rgba(168, 85, 247, 0.6)',
    'rgba(139, 92, 246, 0.5)',
    'rgba(59, 130, 246, 0.4)',
    'rgba(236, 72, 153, 0.5)',
    'rgba(255, 255, 255, 0.3)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 10 + Math.random() * 15,
    delay: Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)] as string,
  }));
}

function generateShootingStars(count: number): ShootingStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 120 - 10,
    startY: Math.random() * 60 - 10,
    duration: 1.5 + Math.random() * 1.5,
    delay: Math.random() * 8 + i * 1.5,
  }));
}

export function AuthLayout() {
  const particles = useMemo(() => generateParticles(120), []);
  const shootingStars = useMemo(() => generateShootingStars(15), []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col safe-top safe-bottom overflow-hidden">

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />


        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 70% 70%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />


        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23a855f7' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />


        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0,100 Q 150,50 300,100 T 600,100 L 600,0 L 0,0 Z"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 0,300 Q 200,250 400,300 T 800,300"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 4, delay: 1, ease: 'easeInOut' }}
          />
        </svg>


        <motion.div
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[20%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -25, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />


        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}


        {shootingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute"
            style={{
              left: `${star.startX}%`,
              top: `${star.startY}%`,
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              x: [0, 250],
              y: [0, 150],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              repeatDelay: 6,
              ease: 'easeOut',
            }}
          >
            <div
              className="w-0.5 h-0.5 rounded-full bg-white"
              style={{
                boxShadow: '0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(168,85,247,0.6)',
              }}
            />
            <div
              className="absolute top-0 left-0 w-20 h-[1px] origin-left"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(168,85,247,0.5), transparent)',
                transform: 'rotate(33deg)',
              }}
            />
          </motion.div>
        ))}


        <motion.div
          className="absolute top-[25%] right-[10%] w-32 h-32 border border-phoenix-500/10 rotate-45"
          animate={{
            y: [0, -20, 0],
            rotate: [45, 55, 45],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[8%] w-24 h-24 border border-blue-500/10 rounded-full"
          animate={{
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute top-[60%] right-[25%]"
          animate={{
            rotate: [0, 360],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon points="40,10 60,30 60,50 40,70 20,50 20,30" fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="1" />
          </svg>
        </motion.div>


        <motion.div
          className="absolute left-[5%] top-[20%] opacity-[0.08]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.18, x: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >

          <svg width="200" height="150" viewBox="0 0 200 150">
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {[40, 70, 55, 90, 65, 80].map((height, i) => (
              <motion.rect
                key={i}
                x={i * 30 + 10}
                y={150 - height}
                width="20"
                height={height}
                fill="url(#barGradient)"
                initial={{ height: 0, y: 150 }}
                animate={{ height, y: 150 - height }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
              />
            ))}
            <text x="10" y="15" fill="#a855f7" fontSize="12" opacity="0.6">Статистика</text>
          </svg>
        </motion.div>


        <motion.div
          className="absolute right-[8%] top-[35%] opacity-[0.08]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="circleGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="8" />
            <circle cx="90" cy="90" r="50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="6" />
            <circle cx="90" cy="90" r="30" fill="none" stroke="rgba(236, 72, 153, 0.1)" strokeWidth="4" />


            <motion.circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="url(#circleGradient1)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="440"
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 110 }}
              transition={{ duration: 2, delay: 1, ease: 'easeOut' }}
            />
            <motion.circle
              cx="90"
              cy="90"
              r="50"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="314"
              initial={{ strokeDashoffset: 314 }}
              animate={{ strokeDashoffset: 78 }}
              transition={{ duration: 2, delay: 1.3, ease: 'easeOut' }}
            />
            <text x="90" y="95" textAnchor="middle" fill="#a855f7" fontSize="16" opacity="1.9">75%</text>
          </svg>
        </motion.div>


        <motion.div
          className="absolute left-[10%] bottom-[15%] opacity-[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.16 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <svg width="250" height="200" viewBox="0 0 250 200">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {[
              [50, 50, 150, 100],
              [150, 100, 200, 50],
              [50, 50, 100, 150],
              [100, 150, 200, 150],
              [150, 100, 100, 150],
            ].map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#lineGrad)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.5 + i * 0.2 }}
              />
            ))}

            {[
              [50, 50],
              [150, 100],
              [200, 50],
              [100, 150],
              [200, 150],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="6"
                fill="#a855f7"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
              />
            ))}
          </svg>
        </motion.div>


        <motion.div
          className="absolute right-[5%] top-[15%] opacity-[0.05]"
          animate={{ opacity: [0.13, 0.17, 0.13] }}
          transition={{ duration: 2, repeat: 1 }}
        >
          <svg width="150" height="120" viewBox="0 0 150 120">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.rect
                key={i}
                x={i * 30}
                y={20 + Math.random() * 40}
                width="4"
                height={Math.random() * 60 + 20}
                fill="#a855f7"
                animate={{
                  height: [
                    Math.random() * 60 + 20,
                    Math.random() * 60 + 20,
                    Math.random() * 60 + 20,
                  ],
                  y: [
                    20 + Math.random() * 40,
                    20 + Math.random() * 40,
                    20 + Math.random() * 40,
                  ],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </svg>
        </motion.div>


        <motion.div
          className="absolute right-[12%] bottom-[25%] opacity-[0.04] font-mono text-[10px] text-phoenix-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.24 }}
          transition={{ duration: 2, delay: 2 }}
        >
          <div className="space-y-1">
            <div>{'{ "status": "active" }'}</div>
            <div>{'{ "users": 50000+ }'}</div>
            <div>{'{ "pages": 100000+ }'}</div>
            <div>{'{ "uptime": "99.9%" }'}</div>
          </div>
        </motion.div>


        <motion.div
          className="absolute left-[15%] bottom-[35%] opacity-[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.16 }}
          transition={{ duration: 2, delay: 1.5 }}
        >
          <svg width="200" height="80" viewBox="0 0 200 80">
            <motion.path
              d="M 0,40 Q 25,20 50,40 T 100,40 T 150,40 T 200,40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 2, ease: 'easeInOut' }}
            />
            <motion.path
              d="M 0,40 Q 25,60 50,40 T 100,40 T 150,40 T 200,40"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 2.3, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>


        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />


        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />
      </div>


      <header className="relative z-10 p-6">
        <Link to="/" className="inline-block group">
          <motion.img
            src="/logo-gorisont-white.svg"
            alt="Phoenix"
            className="h-10 w-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </Link>
      </header>


      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>


      <footer className="relative z-10 p-6 text-center">
        <p className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} Phoenix — Платформа цифровой памяти
        </p>
      </footer>
    </div>
  );
}
