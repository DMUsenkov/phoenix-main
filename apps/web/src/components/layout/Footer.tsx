import { Flame } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="container-app">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-gray-600">
            <Flame className="h-5 w-5 text-phoenix-500" />
            <span className="font-medium">Phoenix</span>
          </div>

          <p className="text-sm text-gray-500">
            © {currentYear} Phoenix. Платформа мемориальных страниц.
          </p>
        </div>
      </div>
    </footer>
  );
}
