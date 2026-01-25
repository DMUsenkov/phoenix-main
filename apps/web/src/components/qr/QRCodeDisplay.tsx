

import { useEffect, useState } from 'react';
import {
  generateQRSvg,
  QR_COLORS,
} from '@/lib/utils/qrGenerator';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
  showBranding?: boolean;
}

export function QRCodeDisplay({
  url,
  size = 200,
  className = '',
  showBranding = false,
}: QRCodeDisplayProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      setIsLoading(true);
      setError(null);
      try {

        const qrSize = size - 24;
        const svg = await generateQRSvg({
          url,
          size: qrSize,
          color: QR_COLORS.primary,
          backgroundColor: QR_COLORS.background,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        setSvgContent(svg);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Не удалось сгенерировать QR-код');
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      void generateQR();
    }
  }, [url, size]);

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-xl flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-pulse bg-gray-200 rounded-lg" style={{ width: size - 24, height: size - 24 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-xl flex items-center justify-center text-red-500 text-sm ${className}`}
        style={{ width: size, height: size }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="bg-white rounded-xl p-3 shadow-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
      {showBranding && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-gray-400">
          <PhoenixIcon className="w-3 h-3" />
          <span>Phoenix</span>
        </div>
      )}
    </div>
  );
}

function PhoenixIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
