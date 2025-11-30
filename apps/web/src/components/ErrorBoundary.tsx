import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative text-center max-w-md">
            <div className="mb-8">
              <span className="text-8xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                500
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              Произошла ошибка
            </h1>

            <p className="text-zinc-400 mb-4">
              Что-то пошло не так. Попробуйте обновить страницу.
            </p>

            {this.state.error && (
              <div className="glass-card p-4 mb-6 text-left">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

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

    return this.props.children;
  }
}
