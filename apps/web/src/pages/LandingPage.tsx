import { Link } from 'react-router-dom';
import { MapPin, QrCode, Users, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'QR-коды',
    description: 'Создавайте QR-коды для мемориальных объектов с мгновенным доступом к страницам памяти.',
  },
  {
    icon: MapPin,
    title: 'Карта объектов',
    description: 'Интерактивная карта всех мемориальных объектов с фильтрами и поиском.',
  },
  {
    icon: Users,
    title: 'Генеалогическое древо',
    description: 'Визуализация семейных связей и построение родословного дерева.',
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col">

      <section className="relative overflow-hidden bg-gradient-to-br from-phoenix-50 via-white to-orange-50 py-20 lg:py-32">
        <div className="container-app relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Сохраняем память
              <span className="block text-phoenix-500">о близких людях</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Phoenix — платформа для создания мемориальных страниц, привязанных к реальным объектам
              памяти. QR-коды, карта, генеалогическое древо.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth" className="btn btn-primary px-8 py-3 text-base">
                Начать бесплатно
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/app" className="btn btn-secondary px-8 py-3 text-base">
                Узнать больше
              </Link>
            </div>
          </div>
        </div>


        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-phoenix-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-100 opacity-50 blur-3xl" />
      </section>


      <section className="py-20 lg:py-28">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Всё для сохранения памяти
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Современные инструменты для создания цифровых мемориалов
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-phoenix-200 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-phoenix-50 p-3 text-phoenix-500 transition-colors group-hover:bg-phoenix-100">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="bg-gray-900 py-16">
        <div className="container-app text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Готовы создать страницу памяти?
          </h2>
          <p className="mt-4 text-gray-400">
            Присоединяйтесь к тысячам семей, которые уже используют Phoenix
          </p>
          <Link to="/auth" className="btn btn-primary mt-8 px-8 py-3">
            Создать страницу
          </Link>
        </div>
      </section>
    </div>
  );
}
