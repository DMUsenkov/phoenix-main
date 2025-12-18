import { motion } from 'framer-motion';
import { useMemo } from 'react';

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
    size: 1 + Math.random() * 2.5,
    opacity: 0.4 + Math.random() * 0.6,
    twinkleDuration: 1.5 + Math.random() * 2.5,
    delay: Math.random() * 3,
  }));
}

export function CosmicBackground() {
  const staticStars = useMemo(() => generateStaticStars(80), []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>

      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-surface to-obsidian-deep" />


      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(168,85,247,0.1) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.08) 0%, transparent 50%)',
        }}
      />


      <div className="absolute inset-0 overflow-hidden">
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
              opacity: [0.2, star.opacity, 0.2],
              scale: [0.8, 1.2, 0.8],
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


      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}
