import { Link } from 'react-router-dom';
import { FileText, MapPin, Users, QrCode, Building2, Shield } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: 'Мои страницы',
    description: 'Создание и управление мемориальными страницами',
    status: 'Задача 4.0',
  },
  {
    icon: MapPin,
    title: 'Объекты на карте',
    description: 'Гео-объекты: деревья, таблички, места памяти',
    status: 'Задача 5.0',
  },
  {
    icon: Users,
    title: 'Семейное древо',
    description: 'Генеалогический граф и родственные связи',
    status: 'Задача 6.0',
  },
  {
    icon: QrCode,
    title: 'QR-коды',
    description: 'Генерация и управление QR-кодами',
    status: 'Задача 7.0',
  },
  {
    icon: Building2,
    title: 'Организации',
    description: 'B2B/B2G кабинет для организаций',
    status: 'Задача 9.0',
  },
  {
    icon: Shield,
    title: 'Модерация',
    description: 'Очередь модерации и безопасность',
    status: 'Задача 10.0',
  },
];

export function AppPage() {
  return (
    <div className="py-12">
      <div className="container-app">

        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="mt-2 text-gray-600">
            Управляйте страницами памяти, объектами и семейным древом
          </p>
        </div>


        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">In progress В процессе</h2>
          <p className="mt-1 text-amber-800">
            Это страница-заглушка личного кабинета. Функционал будет реализован в следующих задачах.
          </p>
        </div>


        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-gray-100 p-2.5 text-gray-600">
                <section.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{section.description}</p>
              <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {section.status}
              </span>
            </div>
          ))}
        </div>


        <div className="mt-12 text-center">
          <Link to="/" className="text-phoenix-600 hover:text-phoenix-700 font-medium">
            Назад на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
