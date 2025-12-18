import { motion } from 'framer-motion';
import { FileText, Users, Shield, AlertTriangle, CheckCircle2, XCircle, Scale, Gavel } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const sections = [
  {
    icon: FileText,
    title: '1. Предмет соглашения',
    content: [
      'Настоящее Пользовательское соглашение регулирует отношения между Phoenix (далее — "Платформа") и пользователем сервиса.',
      'Регистрируясь на Платформе, вы подтверждаете, что ознакомились с условиями настоящего Соглашения и принимаете их в полном объёме.',
      'Если вы не согласны с условиями Соглашения, пожалуйста, не используйте наш сервис.',
      'Платформа предоставляет услуги по созданию и хранению цифровых страниц памяти о близких людях с возможностью привязки к географическим точкам.',
    ],
  },
  {
    icon: Users,
    title: '2. Регистрация и учётная запись',
    content: [
      'Для использования полного функционала Платформы необходимо пройти регистрацию.',
      'При регистрации вы обязуетесь предоставить достоверную и актуальную информацию.',
      'Вы несёте ответственность за сохранность данных своей учётной записи (логин, пароль).',
      'Запрещается передавать доступ к своей учётной записи третьим лицам.',
      'Один пользователь может иметь только одну учётную запись.',
      'Платформа вправе заблокировать учётную запись при нарушении условий Соглашения.',
    ],
  },
  {
    icon: CheckCircle2,
    title: '3. Права пользователя',
    content: [
      'Создавать страницы памяти о близких людях с размещением фотографий, видео, текстовых материалов.',
      'Управлять доступом к созданным страницам (публичный/приватный режим).',
      'Редактировать и удалять созданный контент в любое время.',
      'Экспортировать свои данные в машиночитаемом формате.',
      'Использовать функционал генеалогического древа для визуализации родственных связей.',
      'Размещать QR-коды на физических объектах для доступа к страницам памяти.',
      'Получать техническую поддержку по вопросам использования Платформы.',
    ],
  },
  {
    icon: XCircle,
    title: '4. Обязанности пользователя',
    content: [
      'Не размещать контент, нарушающий законодательство РФ или права третьих лиц.',
      'Не загружать материалы порнографического, экстремистского или оскорбительного характера.',
      'Не использовать Платформу в коммерческих целях без письменного согласия администрации.',
      'Не предпринимать действий, направленных на нарушение работы Платформы.',
      'Не распространять вредоносное программное обеспечение.',
      'Уважать память усопших и не размещать недостоверную информацию.',
      'Соблюдать авторские права при загрузке фотографий и других материалов.',
    ],
  },
  {
    icon: Shield,
    title: '5. Интеллектуальная собственность',
    content: [
      'Все права на дизайн, структуру, программный код Платформы принадлежат Phoenix.',
      'Пользователь сохраняет все права на загружаемый им контент (фото, видео, тексты).',
      'Размещая контент, вы предоставляете Платформе неисключительную лицензию на его использование для обеспечения работы сервиса.',
      'Запрещается копирование, модификация или распространение элементов Платформы без письменного разрешения.',
      'Логотип и название "Phoenix" являются зарегистрированными товарными знаками.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '6. Ответственность сторон',
    content: [
      'Платформа не несёт ответственности за содержание материалов, размещаемых пользователями.',
      'Платформа не гарантирует бесперебойную работу сервиса и может проводить технические работы.',
      'Пользователь самостоятельно несёт ответственность за размещаемый контент.',
      'Платформа не несёт ответственности за убытки, возникшие в результате использования или невозможности использования сервиса.',
      'Максимальная ответственность Платформы ограничена суммой, уплаченной пользователем за услуги.',
      'Пользователь обязуется возместить Платформе убытки, возникшие в результате нарушения им условий Соглашения.',
    ],
  },
  {
    icon: Scale,
    title: '7. Модерация контента',
    content: [
      'Платформа оставляет за собой право модерировать размещаемый контент.',
      'Контент, нарушающий законодательство или условия Соглашения, может быть удалён без предупреждения.',
      'При систематических нарушениях учётная запись пользователя может быть заблокирована.',
      'Пользователь может обжаловать решение о модерации, обратившись в службу поддержки.',
      'Платформа не обязана объяснять причины удаления контента или блокировки аккаунта.',
    ],
  },
  {
    icon: Gavel,
    title: '8. Заключительные положения',
    content: [
      'Настоящее Соглашение вступает в силу с момента регистрации на Платформе.',
      'Платформа вправе вносить изменения в Соглашение, уведомив пользователей за 7 дней.',
      'Все споры разрешаются путём переговоров, а при недостижении согласия — в судебном порядке по законодательству РФ.',
      'Если какое-либо положение Соглашения признано недействительным, остальные положения сохраняют силу.',
      'Соглашение регулируется законодательством Российской Федерации.',
    ],
  },
];

const keyPoints = [
  { icon: CheckCircle2, text: 'Полный контроль над контентом', color: 'from-emerald-500 to-teal-500' },
  { icon: Shield, text: 'Защита авторских прав', color: 'from-blue-500 to-indigo-500' },
  { icon: Users, text: 'Прозрачные правила', color: 'from-phoenix-500 to-phoenix-600' },
  { icon: Scale, text: 'Справедливая модерация', color: 'from-amber-500 to-orange-500' },
];

export function TermsPage() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian via-surface to-obsidian-deep">

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-phoenix-500/10 blur-[120px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">Версия 1.0 от 26 января 2026</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Пользовательское <span className="text-phoenix-400">соглашение</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Правила использования платформы Phoenix. Прозрачные условия для создания
              и хранения страниц памяти о ваших близких
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto"
          >
            {keyPoints.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="relative p-4 rounded-2xl bg-surface-50/50 border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm text-zinc-300 font-medium">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      <section className="relative py-20">
        <div className="container-app relative z-10 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative p-8 rounded-3xl bg-surface-50/50 backdrop-blur-sm border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1">{section.title}</h2>
                  </div>

                  <div className="space-y-4 ml-16">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-zinc-400 leading-relaxed flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mt-2 flex-shrink-0" />
                        <span>{paragraph}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-20">
        <div className="container-app relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-phoenix-500/10 border border-blue-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Gavel className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Принятие условий</h3>
                <p className="text-zinc-400 mb-4">
                  Используя платформу Phoenix, вы автоматически соглашаетесь с условиями
                  настоящего Пользовательского соглашения. Если у вас есть вопросы или
                  предложения по улучшению условий, свяжитесь с нами:
                </p>
                <div className="space-y-2">
                  <p className="text-zinc-300">
                    <span className="text-blue-400 font-medium">Email:</span> legal@phoenix.memorial
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-blue-400 font-medium">Телефон:</span> 8 495 669-27-90
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
