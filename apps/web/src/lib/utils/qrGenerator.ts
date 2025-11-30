

import { toString as qrcodeToString, toDataURL as qrcodeToDataURL, toCanvas as qrcodeToCanvas } from 'qrcode';


export const QR_COLORS = {

  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryLight: '#a855f7',

  background: '#ffffff',

  darkBackground: '#18181b',
};

export interface QRGeneratorOptions {
  url: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}


export async function generateQRSvg(options: QRGeneratorOptions): Promise<string> {
  const {
    url,
    size = 512,
    color = QR_COLORS.primary,
    backgroundColor = QR_COLORS.background,
    margin = 2,
    errorCorrectionLevel = 'M',
  } = options;

  return new Promise((resolve, reject) => {
    qrcodeToString(
      url,
      {
        type: 'svg',
        width: size,
        margin,
        color: {
          dark: color,
          light: backgroundColor,
        },
        errorCorrectionLevel,
      } as any,
      (error: Error | null | undefined, svg: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(svg);
        }
      }
    );
  });
}


export async function generateQRDataUrl(options: QRGeneratorOptions): Promise<string> {
  const {
    url,
    size = 512,
    color = QR_COLORS.primary,
    backgroundColor = QR_COLORS.background,
    margin = 2,
    errorCorrectionLevel = 'M',
  } = options;

  const dataUrl = await qrcodeToDataURL(url, {
    width: size,
    margin,
    color: {
      dark: color,
      light: backgroundColor,
    },
    errorCorrectionLevel,
  });

  return dataUrl;
}


export async function generateQRCanvas(
  canvas: HTMLCanvasElement,
  options: QRGeneratorOptions
): Promise<void> {
  const {
    url,
    size = 512,
    color = QR_COLORS.primary,
    backgroundColor = QR_COLORS.background,
    margin = 2,
    errorCorrectionLevel = 'M',
  } = options;

  await qrcodeToCanvas(canvas, url, {
    width: size,
    margin,
    color: {
      dark: color,
      light: backgroundColor,
    },
    errorCorrectionLevel,
  });
}


export async function downloadQRSvg(
  options: QRGeneratorOptions,
  filename: string
): Promise<void> {
  const svg = await generateQRSvg(options);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  downloadBlob(blob, `${filename}.svg`);
}


export async function downloadQRPng(
  options: QRGeneratorOptions,
  filename: string
): Promise<void> {
  const dataUrl = await generateQRDataUrl(options);


  const response = await fetch(dataUrl);
  const blob = await response.blob();
  downloadBlob(blob, `${filename}.png`);
}


function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


export async function getQRSvgBlob(options: QRGeneratorOptions): Promise<Blob> {
  const svg = await generateQRSvg(options);
  return new Blob([svg], { type: 'image/svg+xml' });
}


export async function getQRPngBlob(options: QRGeneratorOptions): Promise<Blob> {
  const dataUrl = await generateQRDataUrl(options);
  const response = await fetch(dataUrl);
  return response.blob();
}
