import { ArrowRight, Sparkles } from 'lucide-react';
import { GlowButton } from '../GlowButton';

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 pb-32">

      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-hero-gradient-2" />
      <div className="absolute inset-0 bg-hero-gradient-3" />


      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-phoenix-500/10 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-phoenix-600/8 blur-[100px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-phoenix-700/5 blur-[150px] animate-float" />


      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />


      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative">

          <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-gradient-radial from-phoenix-500/20 via-phoenix-600/5 to-transparent animate-pulse-glow" />


          <div className="absolute inset-0 animate-orbit">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-phoenix-400/60 shadow-glow-sm" />
          </div>
          <div className="absolute inset-0 animate-orbit" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-phoenix-300/40" />
          </div>
          <div className="absolute inset-0 animate-orbit" style={{ animationDuration: '30s' }}>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 rounded-full bg-white/30" />
          </div>


          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                <stop offset="100%" stopColor="rgba(124, 58, 237, 0.1)" />
              </linearGradient>
            </defs>
            <line x1="200" y1="200" x2="50" y2="100" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="200" y1="200" x2="350" y2="80" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="200" y1="200" x2="320" y2="300" stroke="url(#lineGrad)" strokeWidth="1" />
            <line x1="200" y1="200" x2="80" y2="320" stroke="url(#lineGrad)" strokeWidth="1" />
            <circle cx="50" cy="100" r="4" fill="rgba(168, 85, 247, 0.6)" />
            <circle cx="350" cy="80" r="3" fill="rgba(168, 85, 247, 0.4)" />
            <circle cx="320" cy="300" r="5" fill="rgba(168, 85, 247, 0.5)" />
            <circle cx="80" cy="320" r="3" fill="rgba(168, 85, 247, 0.3)" />
          </svg>
        </div>
      </div>


      <div className="relative z-10 container-app text-center px-4">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] mb-8 animate-reveal opacity-0">
          <Sparkles className="w-4 h-4 text-phoenix-400" />
          <span className="text-sm text-zinc-400">
            QR {'->'} <span className="text-phoenix-400 font-mono">/p/:slug</span> за 1 скан
          </span>
        </div>


        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1] animate-reveal opacity-0" style={{ animationDelay: '0.1s' }}>
          Цифровая память.
          <br />
          <span className="bg-gradient-to-r from-phoenix-400 via-phoenix-300 to-phoenix-500 bg-clip-text text-transparent">
            Физическое присутствие.
          </span>
        </h1>


        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-reveal opacity-0" style={{ animationDelay: '0.2s' }}>
          Страница человека. Точка на карте. QR-код.
          <br className="hidden sm:block" />
          Связи поколений в едином пространстве.
        </p>


        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-reveal opacity-0" style={{ animationDelay: '0.3s' }}>
          <GlowButton as="link" to="/auth/register" size="lg">
            Создать страницу
            <ArrowRight className="w-5 h-5" />
          </GlowButton>
          <GlowButton as="link" to="/map" variant="secondary" size="lg">
            Открыть карту
          </GlowButton>
        </div>


        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-reveal opacity-0" style={{ animationDelay: '0.5s' }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
