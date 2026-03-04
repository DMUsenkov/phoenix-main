import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useModerationTask, useApproveTask, useRejectTask } from '@/lib/hooks/useModeration';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Modal,
  Textarea,
  useToast,
  Skeleton,
  ConfirmDialog,
} from '@/components/ui';
import type { EntityType, TaskStatus } from '@/lib/api/moderation';

const entityTypeLabels: Record<EntityType, string> = {
  page: 'Страница',
  media: 'Медиа',
};

const entityTypeIcons: Record<EntityType, string> = {
  page: 'Page',
  media: 'Media',
};

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Ожидает модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

const statusColors: Record<TaskStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function ModerationTaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading, isError } = useModerationTask(taskId);
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const task = data?.task;
  const summary = data?.entity_summary;

  const handleApprove = async () => {
    if (!taskId) return;
    try {
      await approveTask.mutateAsync(taskId);
      toast('Контент одобрен', 'success');
      setShowApproveConfirm(false);
      navigate('/admin/moderation');
    } catch {
      toast('Ошибка одобрения', 'error');
    }
  };

  const handleReject = async () => {
    if (!taskId || !rejectReason.trim()) return;
    try {
      await rejectTask.mutateAsync({
        taskId,
        data: { reason: rejectReason.trim() },
      });
      toast('Контент отклонён', 'success');
      setShowRejectModal(false);
      navigate('/admin/moderation');
    } catch {
      toast('Ошибка отклонения', 'error');
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <Card variant="glass">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">Warning</div>
          <h2 className="text-xl font-semibold text-white mb-2">Задача не найдена</h2>
          <p className="text-zinc-400 mb-6">Возможно, она была удалена или у вас нет доступа.</p>
          <Link to="/admin/moderation">
            <Button>Вернуться к очереди</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/admin/moderation" className="text-zinc-400 hover:text-white transition-colors">
          Назад
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center text-2xl">
            {entityTypeIcons[task.entity_type]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {entityTypeLabels[task.entity_type]}
            </h1>
            <Badge variant={statusColors[task.status]} size="sm">
              {statusLabels[task.status]}
            </Badge>
          </div>
        </div>
        {task.status === 'pending' && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowRejectModal(true)}>
              Отклонить
            </Button>
            <Button onClick={() => setShowApproveConfirm(true)}>
              Одобрить
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="glass">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Информация о задаче</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-zinc-400">ID задачи</dt>
                <dd className="text-white font-mono text-sm">{task.id.slice(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Тип сущности</dt>
                <dd className="text-white">{entityTypeLabels[task.entity_type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-400">Статус</dt>
                <dd>
                  <Badge variant={statusColors[task.status]} size="sm">
                    {statusLabels[task.status]}
                  </Badge>
                </dd>
              </div>
              {task.priority > 0 && (
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Приоритет</dt>
                  <dd className="text-white">{task.priority}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-400">Создано</dt>
                <dd className="text-white">{formatDate(task.created_at)}</dd>
              </div>
              {task.decided_at && (
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Решено</dt>
                  <dd className="text-white">{formatDate(task.decided_at)}</dd>
                </div>
              )}
              {task.reason && (
                <div className="pt-3 border-t border-surface-200">
                  <dt className="text-zinc-400 mb-1">Причина отклонения</dt>
                  <dd className="text-red-400">{task.reason}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Превью контента</h2>
            {summary && (
              <dl className="space-y-3">
                {summary.name && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Имя</dt>
                    <dd className="text-white font-medium">{summary.name}</dd>
                  </div>
                )}
                {summary.title && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Заголовок</dt>
                    <dd className="text-white">{summary.title}</dd>
                  </div>
                )}
                {summary.slug && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Slug</dt>
                    <dd className="text-white font-mono text-sm">{summary.slug}</dd>
                  </div>
                )}
                {summary.object_type && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Тип объекта</dt>
                    <dd className="text-white capitalize">{summary.object_type}</dd>
                  </div>
                )}
                {summary.lat !== undefined && summary.lng !== undefined && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Координаты</dt>
                    <dd className="text-white font-mono text-sm">
                      {summary.lat.toFixed(6)}, {summary.lng.toFixed(6)}
                    </dd>
                  </div>
                )}
                {summary.address && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Адрес</dt>
                    <dd className="text-white">{summary.address}</dd>
                  </div>
                )}
                {summary.media_type && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Тип медиа</dt>
                    <dd className="text-white capitalize">{summary.media_type}</dd>
                  </div>
                )}
                {summary.url && summary.media_type === 'image' && (
                  <div>
                    <dt className="text-zinc-400 text-sm mb-2">Превью изображения</dt>
                    <dd>
                      <img
                        src={summary.url}
                        alt="Превью"
                        className="max-w-full max-h-64 rounded-lg border border-surface-200 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </dd>
                  </div>
                )}
                {summary.url && (
                  <div>
                    <dt className="text-zinc-400 text-sm">URL</dt>
                    <dd>
                      <a
                        href={summary.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-phoenix-400 hover:underline text-sm break-all"
                      >
                        {summary.url}
                      </a>
                    </dd>
                  </div>
                )}
                {summary.biography_preview && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Биография</dt>
                    <dd className="text-zinc-300 text-sm">{summary.biography_preview}</dd>
                  </div>
                )}
                {summary.description_preview && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Описание</dt>
                    <dd className="text-zinc-300 text-sm">{summary.description_preview}</dd>
                  </div>
                )}
                {summary.status && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Статус сущности</dt>
                    <dd className="text-white capitalize">{summary.status}</dd>
                  </div>
                )}
                {summary.visibility && (
                  <div>
                    <dt className="text-zinc-400 text-sm">Видимость</dt>
                    <dd className="text-white capitalize">{summary.visibility}</dd>
                  </div>
                )}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => void handleApprove()}
        title="Одобрить контент?"
        message={`${entityTypeLabels[task.entity_type]} будет опубликован и станет доступен публично.`}
        confirmText="Одобрить"
        isLoading={approveTask.isPending}
      />

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Отклонить контент"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-zinc-400">
            Укажите причину отклонения. Автор получит уведомление с этой информацией.
          </p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Причина отклонения..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleReject()}
              disabled={!rejectReason.trim()}
              isLoading={rejectTask.isPending}
            >
              Отклонить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
