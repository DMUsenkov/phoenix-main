import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export function ErrorPage() {
  const error = useRouteError();

  let title = 'Что-то пошло не так';
  let message = 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.';
  let code = '500';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Страница не найдена';
      message = 'Запрашиваемая страница не существует.';
      code = '404';
    } else if (error.status === 403) {
      title = 'Доступ запрещён';
      message = 'У вас недостаточно прав для просмотра этой страницы.';
      code = '403';
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="mb-8">
          <span className="text-8xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {code}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          {title}
        </h1>

        <p className="text-zinc-400 mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            На главную
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    </div>
  );
}
