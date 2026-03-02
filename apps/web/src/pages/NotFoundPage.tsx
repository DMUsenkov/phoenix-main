import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="text-center px-4">
        <p className="text-8xl font-bold text-phoenix-500">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">Страница не найдена</h1>
        <p className="mt-2 text-gray-600">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/" className="btn btn-primary">
            <Home className="mr-2 h-4 w-4" />
            На главную
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
