import { useState, useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { uploadFile } from '@/lib/api/media';
import type { MediaDTO } from '@/lib/api/media';

interface MediaUploaderProps {
  pageId: string;
  onUploadComplete?: (media: MediaDTO) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function MediaUploader({ pageId, onUploadComplete }: MediaUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast('Поддерживаются только изображения и видео', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast('Максимальный размер файла — 50 МБ', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const media = await uploadFile(pageId, file);
      toast('Файл загружен!', 'success');
      onUploadComplete?.(media);
    } catch (error) {
      console.error('Upload error:', error);
      toast('Ошибка загрузки файла', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [pageId, toast, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      void handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
    e.target.value = '';
  }, [handleUpload]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
        ${dragActive
          ? 'border-phoenix-500 bg-phoenix-500/10'
          : 'border-surface-300 hover:border-surface-400'
        }
        ${isUploading ? 'pointer-events-none opacity-50' : ''}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-3">
        {isUploading ? (
          <Loader2 className="w-10 h-10 text-phoenix-500 animate-spin" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-zinc-400" />
          </div>
        )}

        <div>
          <p className="text-white font-medium">
            {isUploading ? 'Загрузка...' : 'Перетащите фото сюда'}
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            или нажмите для выбора - до 10 МБ
          </p>
        </div>
      </div>
    </div>
  );
}
