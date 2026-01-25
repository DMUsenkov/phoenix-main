

import { useState, useCallback } from 'react';
import {
  downloadQRSvg,
  downloadQRPng,
  QR_COLORS,
} from '@/lib/utils/qrGenerator';

interface UseQRCodeActionsProps {
  url: string;
  code: string;
  onDownloadStart?: () => void;
  onDownloadEnd?: () => void;
  onError?: (error: string) => void;
}

export function useQRCodeActions({
  url,
  code,
  onDownloadStart,
  onDownloadEnd,
  onError
}: UseQRCodeActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSvg = useCallback(async (size: number) => {
    setIsDownloading(true);
    onDownloadStart?.();
    try {
      await downloadQRSvg(
        {
          url,
          size,
          color: QR_COLORS.primary,
          backgroundColor: QR_COLORS.background,
          margin: 2,
          errorCorrectionLevel: 'M',
        },
        `phoenix-qr-${code}-${size}`
      );
    } catch (err) {
      console.error('Failed to download SVG:', err);
      onError?.('Ошибка при скачивании SVG');
    } finally {
      setIsDownloading(false);
      onDownloadEnd?.();
    }
  }, [url, code, onDownloadStart, onDownloadEnd, onError]);

  const downloadPng = useCallback(async (size: number) => {
    setIsDownloading(true);
    onDownloadStart?.();
    try {
      await downloadQRPng(
        {
          url,
          size,
          color: QR_COLORS.primary,
          backgroundColor: QR_COLORS.background,
          margin: 2,
          errorCorrectionLevel: 'M',
        },
        `phoenix-qr-${code}-${size}`
      );
    } catch (err) {
      console.error('Failed to download PNG:', err);
      onError?.('Ошибка при скачивании PNG');
    } finally {
      setIsDownloading(false);
      onDownloadEnd?.();
    }
  }, [url, code, onDownloadStart, onDownloadEnd, onError]);

  return {
    isDownloading,
    downloadSvg,
    downloadPng,
  };
}
