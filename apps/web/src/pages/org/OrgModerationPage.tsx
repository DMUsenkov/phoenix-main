import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrgContext } from '@/lib/org';
import { orgModerationApi } from '@/lib/api/moderation';
import type { EntityType, TaskStatus, ModerationTaskDTO } from '@/lib/api/moderation';
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

export function OrgModerationPage() {
  const { toast } = useToast();
  const { selectedOrgId, myRole } = useOrgContext();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('pending');
  const [typeFilter, setTypeFilter] = useState<EntityType | ''>('');

  const canModerate = myRole === 'org_admin' || myRole === 'org_moderator';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['org-moderation', selectedOrgId, statusFilter, typeFilter],
    queryFn: () => orgModerationApi.listTasks(selectedOrgId!, {
      status: statusFilter || undefined,
      entity_type: typeFilter || undefined,
    }),
    enabled: !!selectedOrgId && canModerate,
  });

  const approveTask = useMutation({
    mutationFn: (taskId: string) => orgModerationApi.approveTask(selectedOrgId!, taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-moderation'] });
    },
  });

  const rejectTask = useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      orgModerationApi.rejectTask(selectedOrgId!, taskId, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['org-moderation'] });
    },
  });

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
        reason: rejectReason.trim(),
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

  if (!canModerate) {
    return (
      <EmptyState
        icon="Lock"
        title="Доступ запрещён"
        description="Модерация доступна только администраторам и модераторам организации"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Модерация</h1>
          <p className="text-zinc-400 mt-1">Проверка контента организации</p>
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
              {status ? statusLabels[status] : 'Все'}
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
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon="Warning"
          title="Ошибка загрузки"
          description="Не удалось загрузить задачи модерации"
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <EmptyState
          icon="OK"
          title="Нет задач"
          description="Все задачи модерации обработаны"
        />
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Найдено: {total}</p>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-surface-100 border border-surface-200 hover:border-surface-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{entityTypeIcons[task.entity_type]}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {entityTypeLabels[task.entity_type]}
                      </span>
                      <Badge variant={statusColors[task.status]} size="sm">
                        {statusLabels[task.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400">
                      ID: {task.entity_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Создано: {formatDate(task.created_at)}
                    </p>
                    {task.reason && (
                      <p className="text-sm text-red-400 mt-2">
                        Причина: {task.reason}
                      </p>
                    )}
                  </div>
                </div>

                {task.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setApprovingTask(task)}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => setRejectingTask(task)}
                    >
                      Отклонить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!approvingTask}
        onClose={() => setApprovingTask(null)}
        onConfirm={() => void handleApprove()}
        title="Одобрить задачу?"
        message={`Вы уверены, что хотите одобрить ${approvingTask ? entityTypeLabels[approvingTask.entity_type].toLowerCase() : ''}?`}
        confirmText="Одобрить"
        isLoading={approveTask.isPending}
      />

      <Modal
        isOpen={!!rejectingTask}
        onClose={() => {
          setRejectingTask(null);
          setRejectReason('');
        }}
        title="Отклонить задачу"
      >
        <div className="space-y-4">
          <p className="text-zinc-400">
            Укажите причину отклонения {rejectingTask ? entityTypeLabels[rejectingTask.entity_type].toLowerCase() : ''}
          </p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Причина отклонения..."
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setRejectingTask(null);
                setRejectReason('');
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={() => void handleReject()}
              disabled={!rejectReason.trim()}
              isLoading={rejectTask.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              Отклонить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
