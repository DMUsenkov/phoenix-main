import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-phoenix-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold gradient-text">404</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Страница не найдена
        </h1>

        <p className="text-zinc-400 mb-8">
          Запрашиваемая страница не существует или была перемещена.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            На главную
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
