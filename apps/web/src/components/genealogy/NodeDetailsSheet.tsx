

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge, Modal, Input, useToast } from '@/components/ui';
import { useCreateClaimInvite } from '@/lib/hooks/useGenealogy';
import type { GraphNode } from '@/lib/api/genealogy';

interface NodeDetailsSheetProps {
  node: GraphNode | null;
  isOpen: boolean;
  onClose: () => void;
  onAddRelative: (node: GraphNode) => void;
  canEdit: boolean;
}

const lifeStatusLabels: Record<string, string> = {
  alive: 'Жив',
  deceased: 'Умер',
  unknown: 'Неизвестно',
};

const genderLabels: Record<string, string> = {
  male: 'Мужчина',
  female: 'Женщина',
  other: 'Другой',
  unknown: 'Неизвестно',
};

export function NodeDetailsSheet({ node, isOpen, onClose, onAddRelative, canEdit }: NodeDetailsSheetProps) {
  const { toast } = useToast();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');

  const createClaimInvite = useCreateClaimInvite(node?.id ?? '');

  if (!node) return null;

  const handleSendClaimInvite = async () => {
    if (!claimEmail.trim()) return;
    try {
      await createClaimInvite.mutateAsync({ email: claimEmail.trim() });
      toast('Приглашение отправлено', 'success');
      setShowClaimModal(false);
      setClaimEmail('');
    } catch {
      toast('Ошибка отправки приглашения', 'error');
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed z-50 bg-surface-100 border-surface-200 shadow-2xl transition-transform duration-300 ease-out
          md:right-0 md:top-0 md:h-full md:w-96 md:border-l
          max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-t-2xl max-md:border-t max-md:max-h-[70vh]
          ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}
        `}
      >
        <div className="max-md:w-12 max-md:h-1.5 max-md:bg-zinc-600 max-md:rounded-full max-md:mx-auto max-md:mt-3" />

        <div className="p-6 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Информация</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              X
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-phoenix-500 to-phoenix-600 flex items-center justify-center text-4xl mx-auto mb-4">
                {node.gender === 'male' ? 'Person' : node.gender === 'female' ? 'Person' : 'Person'}
              </div>
              <h3 className="text-lg font-semibold text-white">{node.full_name}</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant={node.life_status === 'alive' ? 'success' : 'default'} size="sm">
                  {lifeStatusLabels[node.life_status] ?? 'Неизвестно'}
                </Badge>
                <Badge variant="default" size="sm">
                  {genderLabels[node.gender] ?? 'Неизвестно'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-surface-200">
                <span className="text-zinc-400">Страница</span>
                <span className="text-white">
                  {node.page_slug ? (
                    <Link to={`/p/${node.page_slug}`} className="text-phoenix-400 hover:underline">
                      /{node.page_slug}
                    </Link>
                  ) : (
                    <span className="text-zinc-500">Нет</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-surface-200">
                <span className="text-zinc-400">Аккаунт</span>
                <span className="text-white">
                  {node.linked_user_id ? (
                    <Badge variant="success" size="sm">Связан</Badge>
                  ) : (
                    <span className="text-zinc-500">Не связан</span>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {node.page_slug && (
                <Link to={`/p/${node.page_slug}`} className="block">
                  <Button variant="secondary" className="w-full">
                    Открыть страницу
                  </Button>
                </Link>
              )}

              {canEdit && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => onAddRelative(node)}
                  >
                    Добавить родственника
                  </Button>

                  {!node.linked_user_id && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowClaimModal(true)}
                    >
                      Выдать доступ
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setClaimEmail('');
        }}
        title="Выдать доступ"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm">
            Отправьте приглашение на email, чтобы передать управление страницей этому человеку.
          </p>
          <Input
            type="email"
            placeholder="email@example.com"
            value={claimEmail}
            onChange={(e) => setClaimEmail(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowClaimModal(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => void handleSendClaimInvite()}
              disabled={!claimEmail.trim()}
              isLoading={createClaimInvite.isPending}
            >
              Отправить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
