import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModerationTasks, useApproveTask, useRejectTask } from '@/lib/hooks/useModeration';
import {
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Modal,
  Textarea,
  useToast,
  ConfirmDialog,
} from '@/components/ui';
import type { EntityType, TaskStatus, ModerationTaskDTO } from '@/lib/api/moderation';

const entityTypeLabels: Record<EntityType, string> = {
  page: 'Страница',
  media: 'Медиа',
};

const entityTypeIcons: Record<EntityType, string> = {
  page: 'Page',
  media: 'Media',
};

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Ожидает',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

const statusColors: Record<TaskStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function ModerationPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('pending');
  const [typeFilter, setTypeFilter] = useState<EntityType | ''>('');

  const { data, isLoading, isError, refetch } = useModerationTasks({
    status: statusFilter || undefined,
    entity_type: typeFilter || undefined,
  });

  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();

  const [approvingTask, setApprovingTask] = useState<ModerationTaskDTO | null>(null);
  const [rejectingTask, setRejectingTask] = useState<ModerationTaskDTO | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleApprove = async () => {
    if (!approvingTask) return;
    try {
      await approveTask.mutateAsync(approvingTask.id);
      toast('Задача одобрена', 'success');
      setApprovingTask(null);
    } catch {
      toast('Ошибка одобрения', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectingTask || !rejectReason.trim()) return;
    try {
      await rejectTask.mutateAsync({
        taskId: rejectingTask.id,
        data: { reason: rejectReason.trim() },
      });
      toast('Задача отклонена', 'success');
      setRejectingTask(null);
      setRejectReason('');
    } catch {
      toast('Ошибка отклонения', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Модерация</h1>
          <p className="text-zinc-400 mt-1">
            Проверка контента - {total} {total === 1 ? 'задача' : 'задач'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {(['', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-phoenix-500/20 text-phoenix-400 border border-phoenix-500/30'
                  : 'bg-surface-100 text-zinc-400 hover:text-white'
              }`}
            >
              {status ? statusLabels[status] : 'Все статусы'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['', 'page', 'media'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-phoenix-500/20 text-phoenix-400 border border-phoenix-500/30'
                  : 'bg-surface-100 text-zinc-400 hover:text-white'
              }`}
            >
              {type ? `${entityTypeIcons[type]} ${entityTypeLabels[type]}` : 'Все типы'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить очередь модерации"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          icon="OK"
          title="Очередь пуста"
          description={statusFilter === 'pending' ? 'Нет задач, ожидающих модерации' : 'Нет задач по выбранным фильтрам'}
        />
      )}

      {tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="glass-card p-4 hover:bg-surface-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center text-xl">
                  {entityTypeIcons[task.entity_type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {entityTypeLabels[task.entity_type]}
                    </span>
                    <Badge variant={statusColors[task.status]} size="sm">
                      {statusLabels[task.status]}
                    </Badge>
                    {task.priority > 0 && (
                      <Badge variant="warning" size="sm">
                        Приоритет: {task.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">
                    Создано: {formatDate(task.created_at)}
                    {task.decided_at && ` - Решено: ${formatDate(task.decided_at)}`}
                  </p>
                  {task.reason && (
                    <p className="text-sm text-red-400 mt-1">Причина: {task.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/moderation/${task.id}`}>
                    <Button variant="secondary" size="sm">
                      Подробнее
                    </Button>
                  </Link>
                  {task.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setApprovingTask(task)}
                        disabled={approveTask.isPending}
                      >
                        OK
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRejectingTask(task)}
                        disabled={rejectTask.isPending}
                      >
                        X
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!approvingTask}
        onClose={() => setApprovingTask(null)}
        onConfirm={() => void handleApprove()}
        title="Одобрить контент?"
        message={`${entityTypeLabels[approvingTask?.entity_type ?? 'page']} будет опубликован.`}
        confirmText="Одобрить"
        isLoading={approveTask.isPending}
      />

      <Modal
        isOpen={!!rejectingTask}
        onClose={() => {
          setRejectingTask(null);
          setRejectReason('');
        }}
        title="Отклонить контент"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-zinc-400">
            Укажите причину отклонения для {entityTypeLabels[rejectingTask?.entity_type ?? 'page'].toLowerCase()}
          </p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Причина отклонения..."
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectingTask(null);
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
