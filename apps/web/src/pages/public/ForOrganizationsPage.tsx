import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  BarChart3,
  QrCode,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TreePine,
  Award,
  Clock,
  HeadphonesIcon,
  Zap,
  Lock,
  Database,
  Send
} from 'lucide-react';

const benefits = [
  {
    icon: QrCode,
    title: 'QR/NFC интеграция',
    description: 'Мгновенный доступ к страницам памяти через сканирование кода на памятниках и мемориалах. Поддержка массовой генерации и печати кодов.',
    gradient: 'from-phoenix-500 to-phoenix-600',
    stats: '10K+ кодов',
  },
  {
    icon: BarChart3,
    title: 'Аналитика и отчёты',
    description: 'Детальная статистика посещений, географии пользователей, популярных страниц. Экспорт данных в Excel, PDF. Дашборды в реальном времени.',
    gradient: 'from-blue-500 to-indigo-500',
    stats: '50+ метрик',
  },
  {
    icon: Users,
    title: 'Массовое управление',
    description: 'Создание и редактирование тысяч страниц через удобную админ-панель. Импорт из Excel, CSV. Шаблоны и автозаполнение.',
    gradient: 'from-emerald-500 to-teal-500',
    stats: 'До 10K страниц',
  },
  {
    icon: Shield,
    title: 'Модерация контента',
    description: 'Полный контроль над публикуемым контентом и комментариями. Система ролей и прав доступа. Автоматическая фильтрация.',
    gradient: 'from-amber-500 to-orange-500',
    stats: '99.9% защита',
  },
  {
    icon: Globe,
    title: 'Брендирование',
    description: 'Кастомизация под фирменный стиль организации — логотипы, цвета, домены. Персональные поддомены и SSL-сертификаты.',
    gradient: 'from-rose-500 to-pink-500',
    stats: 'Полная настройка',
  },
  {
    icon: Database,
    title: 'Интеграция с реестрами',
    description: 'Импорт данных из существующих баз и синхронизация с государственными системами. API для внешних сервисов.',
    gradient: 'from-violet-500 to-purple-500',
    stats: 'REST API',
  },
  {
    icon: Zap,
    title: 'Высокая производительность',
    description: 'Молниеносная загрузка страниц, CDN по всему миру, оптимизация изображений. Работает даже при медленном интернете.',
    gradient: 'from-cyan-500 to-blue-500',
    stats: '<1s загрузка',
  },
  {
    icon: Lock,
    title: 'Безопасность данных',
    description: 'Соответствие 152-ФЗ, шифрование данных, регулярные бэкапы, защита от DDoS. Сертификация по ГОСТ.',
    gradient: 'from-red-500 to-orange-500',
    stats: 'ГОСТ сертификат',
  },
  {
    icon: HeadphonesIcon,
    title: 'Премиум поддержка',
    description: 'Выделенный менеджер проекта, техподдержка 24/7, обучение сотрудников, консультации по развитию проекта.',
    gradient: 'from-purple-500 to-pink-500',
    stats: '24/7 онлайн',
  },
];

const useCases = [
  {
    icon: TreePine,
    title: 'Парки памяти',
    description: 'Цифровая инфраструктура для мемориальных парков и кладбищ',
    features: ['QR-коды на памятниках', 'Карта территории', 'Навигация для посетителей'],
  },
  {
    icon: Building2,
    title: 'Муниципалитеты',
    description: 'Городские проекты сохранения памяти о выдающихся жителях',
    features: ['Интеграция с порталами', 'Публичный доступ', 'Образовательные программы'],
  },
  {
    icon: Award,
    title: 'Ведомства',
    description: 'Мемориалы ветеранов, героев и выдающихся деятелей',
    features: ['Верификация данных', 'Массовый импорт', 'Связь с архивами'],
  },
];

const stats = [
  { value: '500+', label: 'Организаций', description: 'Доверяют нам' },
  { value: '50K+', label: 'Страниц памяти', description: 'Создано' },
  { value: '1M+', label: 'Посещений', description: 'Ежемесячно' },
  { value: '99.9%', label: 'Uptime', description: 'Гарантия' },
];

const pricingFeatures = [
  { text: 'Неограниченное количество страниц', included: true },
  { text: 'Брендирование и кастомизация', included: true },
  { text: 'Аналитика и отчёты', included: true },
  { text: 'Приоритетная поддержка', included: true },
  { text: 'Интеграция с внешними системами', included: true },
  { text: 'Выделенный менеджер', included: true },
];

export function ForOrganizationsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: '-100px' });
  const useCasesInView = useInView(useCasesRef, { once: true, margin: '-100px' });
  const pricingInView = useInView(pricingRef, { once: true, margin: '-100px' });

  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-surface to-obsidian-deep" />
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
      </div>


      <section ref={heroRef} className="relative pt-32 pb-24 overflow-hidden">

        <motion.div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-phoenix-500/10 blur-[150px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />


        <motion.div
          className="absolute top-1/3 right-1/4 w-32 h-32 border border-phoenix-500/20 rotate-45"
          animate={{
            y: [0, -30, 0],
            rotate: [45, 65, 45],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-24 h-24 border border-blue-500/20 rounded-full"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-phoenix-500/10 border border-phoenix-500/20 mb-8"
            >
              <Building2 className="w-5 h-5 text-phoenix-400" />
              <span className="text-phoenix-400 font-medium">Для организаций</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 tracking-tight">
              Цифровая память{' '}
              <span className="bg-gradient-to-r from-phoenix-400 to-phoenix-600 bg-clip-text text-transparent">
                в масштабе
              </span>
            </h1>

            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Создавайте мемориальные проекты любого масштаба — от городских парков памяти
              до федеральных программ сохранения истории
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#contact"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                <span className="relative">Связаться с нами</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                href="#benefits"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-medium text-white rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.06] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5 text-phoenix-400" />
                <span>Узнать больше</span>
              </motion.a>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-zinc-400">{stat.label}</div>
                <div className="text-xs text-zinc-600">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      <section ref={benefitsRef} id="benefits" className="relative py-24">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-phoenix-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Возможности <span className="text-phoenix-400">платформы</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Всё необходимое для создания и управления мемориальными проектами любого масштаба
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-surface-50/50 border border-white/5 hover:border-white/10 transition-all overflow-hidden cursor-pointer"
              >

                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 blur-xl`}
                  animate={{ opacity: [0, 0.05, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />


                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-5 shadow-lg relative`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.gradient} blur-md`}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <benefit.icon className="w-7 h-7 text-white relative z-10" />
                </motion.div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-phoenix-300 transition-colors">{benefit.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-4">{benefit.description}</p>
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 group-hover:border-phoenix-500/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-phoenix-400" />
                  <span className="text-xs font-medium text-zinc-300">{benefit.stats}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section ref={useCasesRef} className="relative py-24">
        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={useCasesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Сценарии <span className="text-phoenix-400">использования</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Phoenix адаптируется под задачи любой организации
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                animate={useCasesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative p-8 rounded-3xl bg-surface-50/50 border border-white/5 overflow-hidden group"
              >

                <div className="absolute top-0 right-0 w-32 h-32 bg-phoenix-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-phoenix-500/20 flex items-center justify-center mb-6">
                    <useCase.icon className="w-8 h-8 text-phoenix-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
                  <p className="text-zinc-400 mb-6">{useCase.description}</p>

                  <ul className="space-y-3">
                    {useCase.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-24">
        <div className="container-app relative z-10 px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Почему <span className="text-phoenix-400">Phoenix</span>?
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Мы создаём не просто платформу, а экосистему для сохранения памяти поколений.
                Наша команда понимает специфику работы с государственными и муниципальными организациями.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Zap, text: 'Быстрый запуск — от идеи до реализации за 2 недели' },
                  { icon: Lock, text: 'Соответствие требованиям 152-ФЗ о персональных данных' },
                  { icon: HeadphonesIcon, text: 'Выделенная команда поддержки для каждого клиента' },
                  { icon: Clock, text: 'SLA 99.9% — гарантия доступности сервиса' },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-phoenix-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-phoenix-400" />
                    </div>
                    <span className="text-zinc-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>


            <motion.div
              ref={pricingRef}
              initial={{ opacity: 0, x: 50 }}
              animate={pricingInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-surface-50/80 backdrop-blur-xl border border-white/10 overflow-hidden">

                <div className="absolute top-0 right-0 w-64 h-64 bg-phoenix-500/20 rounded-full blur-[100px]" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/20 border border-phoenix-500/30 mb-6">
                    <Sparkles className="w-4 h-4 text-phoenix-400" />
                    <span className="text-sm text-phoenix-400 font-medium">Корпоративный тариф</span>
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-2">Индивидуально</div>
                    <p className="text-zinc-400">Стоимость зависит от масштаба проекта</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {pricingFeatures.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-zinc-300">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.a
                    href="#contact"
                    className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-gradient-to-r from-phoenix-600 to-phoenix-500 text-white font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Получить предложение
                    <ArrowRight className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-phoenix-500/5 to-transparent" />

        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Технологии и <span className="text-phoenix-400">интеграции</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Современный стек технологий для надёжной и масштабируемой работы
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'React & TypeScript', desc: 'Современный фронтенд', icon: 'React' },
              { name: 'PostgreSQL', desc: 'Надёжная база данных', icon: 'DB' },
              { name: 'AWS Cloud', desc: 'Облачная инфраструктура', icon: 'Cloud' },
              { name: 'REST API', desc: 'Открытый API', icon: 'API' },
              { name: 'Яндекс.Карты', desc: 'Геолокация', icon: 'Map' },
              { name: 'Госуслуги', desc: 'Интеграция ЕСИА', icon: 'Gov' },
              { name: 'Excel/CSV', desc: 'Импорт/экспорт', icon: 'CSV' },
              { name: 'Telegram Bot', desc: 'Уведомления', icon: 'Mobile' },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-surface-50/30 border border-white/5 hover:border-phoenix-500/30 transition-all text-center"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{tech.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-1">{tech.name}</h3>
                <p className="text-sm text-zinc-500">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-24">
        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Масштабируемость без <span className="text-phoenix-400">ограничений</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Phoenix справляется с проектами любого размера — от локальных до федеральных
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Локальные проекты',
                icon: 'Local',
                capabilities: [
                  'Кладбища и парки памяти',
                  'Местные мемориалы',
                  'Районные архивы',
                  'Школьные музеи',
                  'Библиотечные проекты',
                ],
                scale: 'До 10K страниц',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'Региональные проекты',
                icon: 'Gov',
                capabilities: [
                  'Областные архивы',
                  'Региональные мемориалы',
                  'Музейные сети',
                  'Культурные центры',
                  'Государственные реестры',
                ],
                scale: 'До 100K страниц',
                color: 'from-blue-500 to-indigo-500',
              },
              {
                title: 'Федеральные проекты',
                icon: 'Global',
                capabilities: [
                  'Национальные архивы',
                  'Федеральные мемориалы',
                  'Государственные программы',
                  'Интеграция с Госуслугами',
                  'Многорегиональные системы',
                ],
                scale: 'Неограниченно',
                color: 'from-red-500 to-orange-500',
              },
            ].map((capability, i) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="group relative p-8 rounded-3xl bg-surface-50/50 border border-white/5 hover:border-white/10 transition-all overflow-hidden"
              >

                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${capability.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`}
                  animate={{ opacity: [0, 0.05, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{capability.icon}</div>

                  <h3 className="text-2xl font-bold text-white mb-4">{capability.title}</h3>

                  <ul className="space-y-3 mb-6">
                    {capability.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-phoenix-400 flex-shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{cap}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-white/10">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${capability.color} bg-opacity-20 border border-white/10`}>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">{capability.scale}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section id="contact" className="relative py-24">
        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Свяжитесь <span className="text-phoenix-400">с нами</span>
              </h2>
              <p className="text-lg text-zinc-400">
                Расскажите о вашем проекте, и мы подготовим индивидуальное предложение
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Ваше имя</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-phoenix-500/50 focus:ring-1 focus:ring-phoenix-500/50 transition-all"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Организация</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-phoenix-500/50 focus:ring-1 focus:ring-phoenix-500/50 transition-all"
                    placeholder="Название организации"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-phoenix-500/50 focus:ring-1 focus:ring-phoenix-500/50 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-phoenix-500/50 focus:ring-1 focus:ring-phoenix-500/50 transition-all"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Сообщение</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-phoenix-500/50 focus:ring-1 focus:ring-phoenix-500/50 transition-all resize-none"
                  placeholder="Расскажите о вашем проекте..."
                />
              </div>

              <motion.button
                type="submit"
                className="relative w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
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
                <span className="relative">Отправить заявку</span>
                <Send className="relative w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
