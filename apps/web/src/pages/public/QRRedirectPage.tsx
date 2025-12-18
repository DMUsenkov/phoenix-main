import { useParams } from 'react-router-dom';

export function QRRedirectPage() {
  const { code } = useParams();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="glass-card p-8 text-center max-w-md">
        <div className="text-6xl mb-4">Mobile</div>
        <h1 className="text-2xl font-bold text-white mb-3">QR Redirect</h1>
        <p className="text-zinc-400 mb-4">
          Код: <code className="px-2 py-1 rounded bg-surface-100 text-phoenix-400">{code}</code>
        </p>
        <p className="text-zinc-500 text-sm">
          QR-редиректы будут работать после реализации системы QR-кодов.
        </p>
      </div>
    </div>
  );
}
