import { ArrowRight, Mail } from 'lucide-react';
import { GlowButton } from '../GlowButton';

export function FinalCTASection() {
  return (
    <section className="relative py-32 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-phoenix-950/20 to-phoenix-950/40" />
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface to-transparent" />


      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-phoenix-500/10 blur-[150px]" />

      <div className="container-app relative z-10 px-4 text-center">

        <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Начните сохранять
          <br />
          <span className="bg-gradient-to-r from-phoenix-400 via-phoenix-300 to-phoenix-500 bg-clip-text text-transparent">
            память сегодня
          </span>
        </h2>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Создайте первую страницу бесплатно.
          Для организаций — свяжитесь с нами для обсуждения проекта.
        </p>


        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GlowButton as="link" to="/auth/register" size="lg">
            Создать страницу
            <ArrowRight className="w-5 h-5" />
          </GlowButton>
          <GlowButton as="link" to="/contact" variant="secondary" size="lg">
            <Mail className="w-5 h-5" />
            Для организаций
          </GlowButton>
        </div>


        <p className="mt-8 text-sm text-zinc-500">
          Бесплатно для личного использования - Без рекламы - Ваши данные защищены
        </p>
      </div>
    </section>
  );
}
