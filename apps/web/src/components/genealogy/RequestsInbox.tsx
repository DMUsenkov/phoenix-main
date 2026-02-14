

import { useState } from 'react';
import { Button, Badge, Modal, Textarea, useToast, Skeleton, EmptyState } from '@/components/ui';
import { usePendingRequests, useApproveRelationship, useRejectRelationship } from '@/lib/hooks/useGenealogy';
import type { RelationshipDTO } from '@/lib/api/genealogy';

const relationTypeLabels: Record<string, string> = {
  mother: 'Мать',
  father: 'Отец',
  brother: 'Брат',
  sister: 'Сестра',
  spouse: 'Супруг(а)',
  son: 'Сын',
  daughter: 'Дочь',
  child: 'Ребёнок',
  parent: 'Родитель',
  sibling: 'Брат/Сестра',
};

interface RequestsInboxProps {
  onClose?: () => void;
}

export function RequestsInbox({ onClose: _onClose }: RequestsInboxProps) {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = usePendingRequests();
  const approveRelationship = useApproveRelationship();
  const rejectRelationship = useRejectRelationship();

  const [rejectingRequest, setRejectingRequest] = useState<RelationshipDTO | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const requests = data?.items ?? [];

  const handleApprove = async (request: RelationshipDTO) => {
    try {
      await approveRelationship.mutateAsync(request.id);
      toast('Связь подтверждена', 'success');
    } catch {
      toast('Ошибка подтверждения', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest || !rejectReason.trim()) return;
    try {
      await rejectRelationship.mutateAsync({
        relationshipId: rejectingRequest.id,
        data: { reason: rejectReason.trim() },
      });
      toast('Связь отклонена', 'success');
      setRejectingRequest(null);
      setRejectReason('');
    } catch {
      toast('Ошибка отклонения', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="Warning"
        title="Ошибка загрузки"
        description="Не удалось загрузить запросы"
        action={<Button onClick={() => void refetch()}>Повторить</Button>}
      />
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon="OK"
        title="Нет запросов"
        description="У вас нет входящих запросов на подтверждение связей"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Запросы на подтверждение
          </h2>
          <Badge variant="warning" size="sm">
            {requests.length}
          </Badge>
        </div>

        {requests.map((request) => (
          <div
            key={request.id}
            className="glass-card p-4 hover:bg-surface-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">
                    {relationTypeLabels[request.relation_type] ?? request.relation_type}
                  </span>
                  <Badge variant="warning" size="sm">
                    Ожидает
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">
                  Запрос от {formatDate(request.created_at)}
                </p>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  {request.from_person_id.slice(0, 8)}... -> {request.to_person_id.slice(0, 8)}...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleApprove(request)}
                  disabled={approveRelationship.isPending}
                >
                  OK
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejectingRequest(request)}
                  disabled={rejectRelationship.isPending}
                >
                  X
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!rejectingRequest}
        onClose={() => {
          setRejectingRequest(null);
          setRejectReason('');
        }}
        title="Отклонить связь"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">
            Укажите причину отклонения связи
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
                setRejectingRequest(null);
                setRejectReason('');
              }}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleReject()}
              disabled={!rejectReason.trim()}
              isLoading={rejectRelationship.isPending}
            >
              Отклонить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
