import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            403
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Доступ запрещён
        </h1>

        <p className="text-zinc-400 mb-8">
          У вас недостаточно прав для просмотра этой страницы.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            На главную
          </Link>
          <Link to="/app" className="btn btn-secondary">
            В личный кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}
