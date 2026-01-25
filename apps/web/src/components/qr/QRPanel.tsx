

import { QrCode, Download, Printer, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { usePageQR, useCreatePageQR, useRegeneratePageQR } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useQRCodeActions } from './useQRCodeActions';

interface QRPanelProps {
  pageId: string;
}

export function QRPanel({ pageId }: QRPanelProps) {
  const { toast } = useToast();
  const { data: qr, isLoading, error, refetch } = usePageQR(pageId);
  const createQR = useCreatePageQR(pageId);
  const regenerateQR = useRegeneratePageQR(pageId);
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const targetUrl = qr ? qr.short_url : '';

  const { isDownloading, downloadSvg, downloadPng } = useQRCodeActions({
    url: targetUrl,
    code: qr?.code || '',
    onError: (error) => toast(error, 'error'),
  });

  const handleCreateQR = async () => {
    try {
      await createQR.mutateAsync();
      toast('QR-код создан!', 'success');
    } catch {
      toast('Ошибка при создании QR-кода', 'error');
    }
  };

  const handleRegenerateQR = async () => {
    try {
      await regenerateQR.mutateAsync();
      toast('QR-код перегенерирован! Старая ссылка больше не работает.', 'success');
      setShowRegenerateConfirm(false);
    } catch {
      toast('Ошибка при перегенерации QR-кода', 'error');
    }
  };

  const handleCopyLink = async () => {
    if (!qr) return;
    try {
      await navigator.clipboard.writeText(qr.short_url);
      setCopied(true);
      toast('Ссылка скопирована!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Не удалось скопировать ссылку', 'error');
    }
  };

  const handlePrint = () => {
    window.open(`/app/pages/${pageId}/qr/print`, '_blank');
  };

  const handleDownloadSvg = (size: number) => {
    void downloadSvg(size);
    toast(`QR-код скачан (SVG, ${size}px)`, 'success');
  };

  const handleDownloadPng = (size: number) => {
    void downloadPng(size);
    toast(`QR-код скачан (PNG, ${size}px)`, 'success');
  };

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-phoenix-500" />
            QR-код
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="w-48 h-48 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && error.status === 404) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-phoenix-500" />
            QR-код
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-phoenix-500/20 to-phoenix-700/20 flex items-center justify-center border border-phoenix-500/30">
              <QrCode className="w-10 h-10 text-phoenix-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              QR-код ещё не создан
            </h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
              Создайте QR-код, чтобы разместить его на табличке, стенде или памятном месте.
              При сканировании откроется страница памяти.
            </p>
            <Button
              variant="primary"
              onClick={() => void handleCreateQR()}
              isLoading={createQR.isPending}
              className="shadow-glow-sm"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Создать QR-код
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-phoenix-500" />
            QR-код
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">Warning</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-zinc-400 text-sm mb-4">{error.detail}</p>
            <Button variant="secondary" onClick={() => void refetch()}>
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qr) return null;

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-phoenix-500" />
          QR-код
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="flex justify-center">
          <div className="relative group">
            <QRCodeDisplay
              url={qr.short_url}
              size={192}
              className="transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                aria-label="Открыть для печати"
                className="shadow-lg"
              >
                <Printer className="w-4 h-4 mr-2" />
                Печать
              </Button>
            </div>
          </div>
        </div>


        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Короткая ссылка</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-surface-100 border border-surface-300 rounded-lg px-3 py-2.5 font-mono text-sm text-white truncate">
              {qr.short_url}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopyLink()}
              className="shrink-0"
              aria-label="Копировать ссылку"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>


        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-300">Скачать</p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadSvg(512)}
              disabled={isDownloading}
              aria-label="Скачать SVG 512px"
            >
              <Download className="w-4 h-4 mr-2" />
              SVG 512
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadSvg(1024)}
              disabled={isDownloading}
              aria-label="Скачать SVG 1024px"
            >
              <Download className="w-4 h-4 mr-2" />
              SVG 1024
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadPng(512)}
              disabled={isDownloading}
              aria-label="Скачать PNG 512px"
            >
              <Download className="w-4 h-4 mr-2" />
              PNG 512
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadPng(1024)}
              disabled={isDownloading}
              aria-label="Скачать PNG 1024px"
            >
              <Download className="w-4 h-4 mr-2" />
              PNG 1024
            </Button>
          </div>

          <p className="text-xs text-zinc-500">
            Info SVG — для печати (векторный). PNG — для соцсетей и веба.
          </p>
        </div>


        <div className="pt-4 border-t border-surface-300 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Открыть для печати
          </Button>


          {!showRegenerateConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-zinc-400 hover:text-zinc-300"
              onClick={() => setShowRegenerateConfirm(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Перегенерировать QR-код
            </Button>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-3">
              <p className="text-xs text-amber-200">
                Warning Внимание! При перегенерации старая ссылка перестанет работать.
                Все ранее напечатанные QR-коды станут недействительными.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowRegenerateConfirm(false)}
                >
                  Отмена
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => void handleRegenerateQR()}
                  isLoading={regenerateQR.isPending}
                >
                  Перегенерировать
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
