import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Users, Lock, Download, GitBranch, Sparkles, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: GitBranch, text: 'Визуальное древо с навигацией', color: 'text-phoenix-400' },
  { icon: Users, text: 'Подтверждение связей через приглашения', color: 'text-blue-400' },
  { icon: Lock, text: 'Приватность: только подтверждённые видят данные', color: 'text-emerald-400' },
  { icon: Download, text: 'Экспорт данных в стандартных форматах', color: 'text-amber-400' },
];

const treeNodes = [
  { id: 'root', x: 150, y: 50, size: 24, level: 0 },
  { id: 'l1-1', x: 80, y: 120, size: 18, level: 1 },
  { id: 'l1-2', x: 220, y: 120, size: 18, level: 1 },
  { id: 'l2-1', x: 40, y: 190, size: 14, level: 2 },
  { id: 'l2-2', x: 100, y: 190, size: 14, level: 2 },
  { id: 'l2-3', x: 180, y: 190, size: 14, level: 2 },
  { id: 'l2-4', x: 240, y: 190, size: 14, level: 2 },
  { id: 'l3-1', x: 25, y: 250, size: 10, level: 3 },
  { id: 'l3-2', x: 55, y: 250, size: 10, level: 3 },
  { id: 'l3-3', x: 225, y: 250, size: 10, level: 3 },
  { id: 'l3-4', x: 255, y: 250, size: 10, level: 3 },
];

const treeEdges = [
  { from: 'root', to: 'l1-1' },
  { from: 'root', to: 'l1-2' },
  { from: 'l1-1', to: 'l2-1' },
  { from: 'l1-1', to: 'l2-2' },
  { from: 'l1-2', to: 'l2-3' },
  { from: 'l1-2', to: 'l2-4' },
  { from: 'l2-1', to: 'l3-1' },
  { from: 'l2-1', to: 'l3-2' },
  { from: 'l2-4', to: 'l3-3' },
  { from: 'l2-4', to: 'l3-4' },
];

export function GenealogySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const getNode = (id: string) => treeNodes.find(n => n.id === id);

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>

      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-phoenix-600/5 blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-app relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/10 border border-phoenix-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-phoenix-400" />
              <span className="text-sm text-phoenix-400">Семейные связи</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Связи <span className="text-phoenix-400">поколений</span>
            </h2>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
              История семьи как интерактивный граф. Визуализация родственных связей,
              подтверждённые отношения, приглашения для родственников.
            </p>


            <div className="space-y-4 mb-10">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-50/30 border border-white/5 hover:bg-surface-50/50 hover:border-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <span className="text-zinc-300 flex-1">{feature.text}</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500/50" />
                </motion.div>
              ))}
            </div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Верифицированные связи</p>
                <p className="text-sm text-emerald-400">Каждое родство требует подтверждения</p>
              </div>
            </motion.div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">

              <motion.div
                className="absolute inset-0 rounded-full border border-phoenix-500/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
              />


              <div className="absolute inset-8 rounded-3xl bg-surface-50/80 backdrop-blur-xl border border-white/10 overflow-hidden">

                <svg className="w-full h-full" viewBox="0 0 300 300">
                  <defs>
                    <radialGradient id="nodeGlowNew" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                    </radialGradient>
                    <linearGradient id="edgeGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                      <stop offset="100%" stopColor="rgba(124, 58, 237, 0.2)" />
                    </linearGradient>
                  </defs>


                  {treeEdges.map((edge, idx) => {
                    const from = getNode(edge.from);
                    const to = getNode(edge.to);
                    if (!from || !to) return null;
                    return (
                      <motion.line
                        key={`${edge.from}-${edge.to}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="url(#edgeGradNew)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
                        transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                      />
                    );
                  })}


                  {treeNodes.map((node, idx) => (
                    <motion.g key={node.id}>

                      {node.level === 0 && (
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r={node.size + 15}
                          fill="url(#nodeGlowNew)"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={isInView ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                          transition={{ duration: 3, repeat: Infinity, delay: idx * 0.1 }}
                        />
                      )}

                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size}
                        fill={`rgba(168, 85, 247, ${0.5 - node.level * 0.1})`}
                        stroke={`rgba(168, 85, 247, ${0.8 - node.level * 0.15})`}
                        strokeWidth="2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                      />

                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size * 0.5}
                        fill={`rgba(168, 85, 247, ${0.7 - node.level * 0.15})`}
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                      />
                    </motion.g>
                  ))}
                </svg>


                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-surface/80 backdrop-blur-sm text-xs text-zinc-400 border border-white/10">
                  Семейное древо
                </div>
                <motion.div
                  className="absolute bottom-4 right-4"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm text-xs text-emerald-400 border border-emerald-500/30 font-medium">
                    OK 11 подтверждено
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
