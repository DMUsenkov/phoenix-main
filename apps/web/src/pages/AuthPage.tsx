import { Link } from 'react-router-dom';
import { Flame, Mail, Lock, ArrowLeft } from 'lucide-react';

export function AuthPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-phoenix-50">
              <Flame className="h-7 w-7 text-phoenix-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Вход в Phoenix</h1>
            <p className="mt-2 text-gray-600">Войдите, чтобы управлять страницами памяти</p>
          </div>


          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-500 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  placeholder="--------"
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-500 placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled
              className="btn btn-primary w-full py-2.5 opacity-50 cursor-not-allowed"
            >
              Войти
            </button>
          </form>


          <div className="mt-6 rounded-lg bg-amber-50 p-4 text-center">
            <p className="text-sm text-amber-800">
              In progress Раздел авторизации в процессе настройки
            </p>
          </div>


          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-phoenix-600"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
