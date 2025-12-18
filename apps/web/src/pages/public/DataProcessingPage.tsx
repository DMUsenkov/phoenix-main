import { motion } from 'framer-motion';
import { Database, Server, Lock, RefreshCw, HardDrive, Cloud, Shield, FileCheck, Trash2, Download } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const sections = [
  {
    icon: Database,
    title: '1. Основания для обработки данных',
    content: [
      'Обработка персональных данных осуществляется на основании Федерального закона № 152-ФЗ "О персональных данных".',
      'Основанием для обработки является согласие пользователя, выраженное при регистрации на Платформе.',
      'Обработка необходима для исполнения договора, стороной которого является пользователь.',
      'Обработка необходима для защиты жизни, здоровья или иных жизненно важных интересов субъекта персональных данных.',
    ],
  },
  {
    icon: Server,
    title: '2. Способы обработки данных',
    content: [
      'Сбор данных: получение информации от пользователя при регистрации и использовании сервиса.',
      'Запись и систематизация: внесение данных в базы данных с последующей структуризацией.',
      'Накопление и хранение: размещение данных на защищённых серверах с резервным копированием.',
      'Уточнение и обновление: актуализация данных по запросу пользователя или автоматически.',
      'Использование: применение данных для предоставления услуг и улучшения сервиса.',
      'Передача: предоставление данных третьим лицам только с согласия пользователя или по требованию закона.',
      'Обезличивание: преобразование данных в форму, не позволяющую идентифицировать пользователя.',
      'Блокирование: временное прекращение обработки (кроме хранения) по запросу пользователя.',
      'Удаление: уничтожение данных по истечении срока хранения или по запросу пользователя.',
    ],
  },
  {
    icon: HardDrive,
    title: '3. Сроки обработки и хранения',
    content: [
      'Персональные данные хранятся в течение всего периода использования сервиса.',
      'После удаления учётной записи данные хранятся в течение 90 дней для возможности восстановления.',
      'По истечении 90 дней данные удаляются безвозвратно из всех систем и резервных копий.',
      'Обезличенные статистические данные могут храниться бессрочно для аналитики.',
      'Данные, необходимые для выполнения требований законодательства, хранятся в течение установленных сроков.',
      'Пользователь может запросить досрочное удаление данных, направив соответствующее заявление.',
    ],
  },
  {
    icon: Lock,
    title: '4. Меры защиты данных',
    content: [
      'Шифрование данных при передаче с использованием протоколов SSL/TLS.',
      'Шифрование данных при хранении с использованием современных алгоритмов (AES-256).',
      'Многофакторная аутентификация для доступа к административным функциям.',
      'Регулярный аудит безопасности и тестирование на проникновение.',
      'Ограничение физического доступа к серверам и оборудованию.',
      'Логирование всех операций с персональными данными.',
      'Обучение персонала правилам работы с персональными данными.',
      'Использование межсетевых экранов и систем обнаружения вторжений.',
    ],
  },
  {
    icon: Cloud,
    title: '5. Места обработки данных',
    content: [
      'Основные серверы расположены на территории Российской Федерации.',
      'Резервные копии хранятся в географически распределённых дата-центрах на территории РФ.',
      'Используются сертифицированные дата-центры с уровнем надёжности Tier III и выше.',
      'Для CDN и ускорения загрузки контента могут использоваться серверы за пределами РФ (только для публичного контента).',
      'Персональные данные граждан РФ обрабатываются исключительно на территории РФ в соответствии с законодательством.',
    ],
  },
  {
    icon: RefreshCw,
    title: '6. Автоматизированная обработка',
    content: [
      'Платформа использует автоматизированную обработку данных для персонализации контента.',
      'Алгоритмы машинного обучения применяются для улучшения поиска и рекомендаций.',
      'Автоматическая модерация контента с использованием технологий распознавания изображений.',
      'Пользователь имеет право возразить против автоматизированной обработки.',
      'Решения, основанные исключительно на автоматизированной обработке, не принимаются без участия человека.',
    ],
  },
  {
    icon: FileCheck,
    title: '7. Права субъекта данных',
    content: [
      'Право на получение информации о наличии и содержании персональных данных.',
      'Право на уточнение, блокирование или удаление неполных, устаревших или неточных данных.',
      'Право на отзыв согласия на обработку персональных данных.',
      'Право на получение копии своих персональных данных в структурированном машиночитаемом формате.',
      'Право на ограничение обработки в случаях, предусмотренных законом.',
      'Право на возражение против обработки данных в маркетинговых целях.',
      'Право на обжалование действий или бездействия оператора в уполномоченный орган или суд.',
    ],
  },
  {
    icon: Trash2,
    title: '8. Удаление данных',
    content: [
      'Пользователь может удалить свою учётную запись в любое время через настройки профиля.',
      'При удалении аккаунта все персональные данные помечаются для удаления.',
      'Данные удаляются из продуктивных систем в течение 7 рабочих дней.',
      'Полное удаление из резервных копий происходит в течение 90 дней.',
      'Обезличенные статистические данные сохраняются для аналитики.',
      'Пользователь получает подтверждение об удалении данных на указанный email.',
      'Восстановление данных после полного удаления невозможно.',
    ],
  },
  {
    icon: Download,
    title: '9. Экспорт данных',
    content: [
      'Пользователь может запросить экспорт всех своих данных в любое время.',
      'Данные предоставляются в формате JSON или CSV для удобства переноса.',
      'Экспорт включает профильную информацию, загруженные медиафайлы, текстовый контент.',
      'Запрос на экспорт обрабатывается в течение 30 дней с момента подачи.',
      'Данные предоставляются через защищённую ссылку для скачивания с ограниченным сроком действия.',
      'Экспорт данных предоставляется бесплатно один раз в 6 месяцев.',
    ],
  },
];

const processingTypes = [
  { icon: Database, text: 'Сбор и систематизация', color: 'from-blue-500 to-indigo-500' },
  { icon: Lock, text: 'Шифрование и защита', color: 'from-emerald-500 to-teal-500' },
  { icon: Cloud, text: 'Хранение в РФ', color: 'from-phoenix-500 to-phoenix-600' },
  { icon: Shield, text: 'Соответствие 152-ФЗ', color: 'from-amber-500 to-orange-500' },
];

export function DataProcessingPage() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gradient-to-b from-obsidian via-surface to-obsidian-deep">

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[150px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Актуально на 26 января 2026</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Обработка <span className="text-phoenix-400">данных</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Подробная информация о том, как мы собираем, обрабатываем, храним и защищаем
              ваши персональные данные в соответствии с законодательством РФ
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto"
          >
            {processingTypes.map((item, i) => (
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
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1">{section.title}</h2>
                  </div>

                  <div className="space-y-4 ml-16">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-zinc-400 leading-relaxed flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-2 flex-shrink-0" />
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
            className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Вопросы по обработке данных?</h3>
                <p className="text-zinc-400 mb-4">
                  Если у вас есть вопросы о способах обработки данных, вы хотите запросить
                  экспорт или удаление своих данных, свяжитесь с нашим отделом по защите данных:
                </p>
                <div className="space-y-2">
                  <p className="text-zinc-300">
                    <span className="text-emerald-400 font-medium">Email:</span> dpo@phoenix.memorial
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-emerald-400 font-medium">Телефон:</span> 8 495 669-27-90
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-emerald-400 font-medium">Форма запроса:</span> phoenix.memorial/data-request
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
