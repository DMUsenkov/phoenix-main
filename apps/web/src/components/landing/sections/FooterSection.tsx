import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  legal: [
    { label: 'Политика конфиденциальности', href: '/privacy' },
    { label: 'Пользовательское соглашение', href: '/terms' },
    { label: 'Обработка данных', href: '/data-processing' },
  ],
};


export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-phoenix-500/30 to-transparent" />


      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-50/50 to-surface" />

      <div className="container-app relative z-10 px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">

          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <motion.img
                src="/logo-circle-white.svg"
                alt="Phoenix"
                className="w-10 h-10"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              />
              <span className="text-2xl font-bold text-white group-hover:text-phoenix-400 transition-colors">
                Phoenix
              </span>
            </Link>

            <p className="text-zinc-400 mb-6 max-w-sm leading-relaxed">
              Платформа цифровой памяти. Создаём вечные страницы
              о близких людях, доступные в любой точке мира.
            </p>


            <div className="space-y-3">
              <a
                href="mailto:info@phoenix.memorial"
                className="flex items-center gap-3 text-zinc-400 hover:text-phoenix-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>info@phoenix.memorial</span>
              </a>
              <a
                href="tel:+78001234567"
                className="flex items-center gap-3 text-zinc-400 hover:text-phoenix-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>8 495 669-27-90</span>
              </a>
              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin className="w-4 h-4" />
                <span>Россия</span>
              </div>
            </div>
          </div>


          <div>
            <h4 className="text-white font-semibold mb-4">Правовая информация</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-zinc-400 hover:text-phoenix-400 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-phoenix-500/50 group-hover:bg-phoenix-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h4 className="text-white font-semibold mb-4">Рассылка</h4>
            <p className="text-zinc-400 text-sm mb-4">
              Новости и обновления платформы
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Ваш email"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-phoenix-500/50 focus:ring-1 focus:ring-phoenix-500/50 transition-all"
              />
              <motion.button
                type="submit"
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-phoenix-600 to-phoenix-500 text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Подписаться
              </motion.button>
            </form>
          </div>
        </div>


        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm">
              © {currentYear} Phoenix. Все права защищены.
            </p>


          </div>
        </div>


        <div className="mt-12 flex justify-center">
          <motion.div
            className="text-surface-300/50 text-[120px] lg:text-[200px] font-bold select-none pointer-events-none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            PHOENIX
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
