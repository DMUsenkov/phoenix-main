import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface ParticlesBackgroundProps {
  particleCount?: number;
  connectionDistance?: number;
  particleColor?: string;
  lineColor?: string;
  className?: string;
}

export function ParticlesBackground({
  particleCount = 80,
  connectionDistance = 150,
  particleColor = '168, 85, 247',
  lineColor = '124, 58, 237',
  className = '',
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }
    particlesRef.current = particles;
  }, [particleCount]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    particles.forEach((p, i) => {
      p.pulsePhase += p.pulseSpeed;
      const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;

      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse < 200) {
        const force = (200 - distToMouse) / 200;
        p.vx -= (dx / distToMouse) * force * 0.02;
        p.vy -= (dy / distToMouse) * force * 0.02;
      }

      p.x += p.vx;
      p.y += p.vy;

      p.vx *= 0.99;
      p.vy *= 0.99;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${p.opacity * pulse})`;
      ctx.fill();

      const glowRadius = p.radius * 3 * pulse;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
      gradient.addColorStop(0, `rgba(${particleColor}, ${p.opacity * 0.3 * pulse})`);
      gradient.addColorStop(1, `rgba(${particleColor}, 0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        if (!p2) continue;
        const ddx = p.x - p2.x;
        const ddy = p.y - p2.y;
        const distance = Math.sqrt(ddx * ddx + ddy * ddy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [particleColor, lineColor, connectionDistance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
