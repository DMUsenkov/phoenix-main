import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const sections = [
  {
    icon: Shield,
    title: '1. Общие положения',
    content: [
      'Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей платформы Phoenix.',
      'Используя наш сервис, вы соглашаетесь с условиями обработки персональных данных, изложенными в настоящей Политике.',
      'Мы обязуемся обеспечивать конфиденциальность персональных данных и принимать необходимые меры для их защиты от несанкционированного доступа.',
    ],
  },
  {
    icon: Database,
    title: '2. Какие данные мы собираем',
    content: [
      'Регистрационные данные: имя, фамилия, адрес электронной почты, номер телефона.',
      'Данные профиля: фотографии, биографическая информация, даты жизни близких людей.',
      'Технические данные: IP-адрес, тип браузера, операционная система, данные о посещениях.',
      'Геолокационные данные: координаты мест памяти при создании страниц с привязкой к карте.',
      'Медиафайлы: фотографии, видео, аудиозаписи, загружаемые пользователями.',
    ],
  },
  {
    icon: Eye,
    title: '3. Как мы используем данные',
    content: [
      'Предоставление доступа к функционалу платформы и создание страниц памяти.',
      'Персонализация пользовательского опыта и улучшение качества сервиса.',
      'Отправка уведомлений о важных событиях и обновлениях платформы.',
      'Аналитика использования сервиса для улучшения функциональности.',
      'Обеспечение безопасности и предотвращение мошенничества.',
    ],
  },
  {
    icon: Lock,
    title: '4. Защита данных',
    content: [
      'Мы используем современные методы шифрования для защиты передаваемых данных (SSL/TLS).',
      'Доступ к персональным данным имеют только авторизованные сотрудники.',
      'Регулярное резервное копирование данных для предотвращения их потери.',
      'Многоуровневая система аутентификации и контроля доступа.',
      'Соответствие требованиям Федерального закона № 152-ФЗ "О персональных данных".',
    ],
  },
  {
    icon: UserCheck,
    title: '5. Передача данных третьим лицам',
    content: [
      'Мы не продаём и не передаём ваши персональные данные третьим лицам без вашего согласия.',
      'Исключение составляют случаи, предусмотренные законодательством РФ.',
      'Мы можем использовать сервисы третьих лиц для аналитики и хранения данных (с соблюдением конфиденциальности).',
      'При интеграции с внешними сервисами (карты, платёжные системы) применяются их политики конфиденциальности.',
    ],
  },
  {
    icon: FileText,
    title: '6. Ваши права',
    content: [
      'Право на доступ к своим персональным данным и получение информации об их обработке.',
      'Право на исправление неточных или неполных данных.',
      'Право на удаление персональных данных ("право на забвение").',
      'Право на ограничение обработки данных в определённых случаях.',
      'Право на возражение против обработки данных в маркетинговых целях.',
      'Право на экспорт данных в машиночитаемом формате.',
    ],
  },
  {
    icon: AlertCircle,
    title: '7. Cookies и технологии отслеживания',
    content: [
      'Мы используем cookies для улучшения работы сайта и персонализации контента.',
      'Вы можете управлять cookies через настройки браузера.',
      'Некоторые функции сайта могут быть недоступны при отключении cookies.',
      'Мы используем аналитические сервисы для сбора статистики посещений.',
    ],
  },
  {
    icon: CheckCircle2,
    title: '8. Изменения в Политике',
    content: [
      'Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.',
      'О существенных изменениях мы уведомим вас по электронной почте или через уведомления на сайте.',
      'Дата последнего обновления указана в начале документа.',
      'Продолжение использования сервиса после внесения изменений означает ваше согласие с новой редакцией Политики.',
    ],
  },
];

const highlights = [
  { icon: Shield, text: 'Полное соответствие 152-ФЗ', color: 'from-emerald-500 to-teal-500' },
  { icon: Lock, text: 'Шифрование данных SSL/TLS', color: 'from-blue-500 to-indigo-500' },
  { icon: UserCheck, text: 'Контроль доступа к данным', color: 'from-phoenix-500 to-phoenix-600' },
  { icon: Database, text: 'Регулярное резервирование', color: 'from-amber-500 to-orange-500' },
];

export function PrivacyPage() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian via-surface to-obsidian-deep">

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-phoenix-500/10 blur-[150px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-phoenix-500/10 border border-phoenix-500/20 mb-6"
            >
              <Shield className="w-4 h-4 text-phoenix-400" />
              <span className="text-sm text-phoenix-400">Обновлено: 26 января 2026</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Политика <span className="text-phoenix-400">конфиденциальности</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Мы серьёзно относимся к защите ваших персональных данных и обеспечиваем
              их безопасность на всех этапах обработки
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto"
          >
            {highlights.map((item, i) => (
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
                <div className="absolute inset-0 bg-gradient-to-br from-phoenix-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1">{section.title}</h2>
                  </div>

                  <div className="space-y-4 ml-16">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-zinc-400 leading-relaxed flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-phoenix-500/50 mt-2 flex-shrink-0" />
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
            className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-phoenix-500/10 to-blue-500/10 border border-phoenix-500/20"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-phoenix-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-phoenix-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Вопросы по обработке данных?</h3>
                <p className="text-zinc-400 mb-4">
                  Если у вас есть вопросы о том, как мы обрабатываем ваши персональные данные,
                  или вы хотите воспользоваться своими правами, свяжитесь с нами:
                </p>
                <div className="space-y-2">
                  <p className="text-zinc-300">
                    <span className="text-phoenix-400 font-medium">Email:</span> privacy@phoenix.memorial
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-phoenix-400 font-medium">Телефон:</span> 8 495 669-27-90
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
