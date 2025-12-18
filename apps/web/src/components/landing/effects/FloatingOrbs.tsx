import { motion } from 'framer-motion';

interface Orb {
  id: number;
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  color: string;
}

const orbs: Orb[] = [
  { id: 1, size: 600, x: '20%', y: '30%', delay: 0, duration: 20, color: 'rgba(124, 58, 237, 0.15)' },
  { id: 2, size: 400, x: '70%', y: '60%', delay: 2, duration: 25, color: 'rgba(168, 85, 247, 0.1)' },
  { id: 3, size: 300, x: '80%', y: '20%', delay: 4, duration: 18, color: 'rgba(109, 40, 217, 0.12)' },
  { id: 4, size: 500, x: '10%', y: '70%', delay: 1, duration: 22, color: 'rgba(147, 51, 234, 0.08)' },
  { id: 5, size: 350, x: '50%', y: '50%', delay: 3, duration: 30, color: 'rgba(192, 132, 252, 0.06)' },
];

export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-[100px]"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
