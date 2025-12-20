import { useState } from 'react';
import { Plus, GripVertical, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card, Modal, ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ContentSectionProps<T> {
  title: string;
  description?: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderForm: (item: T | null, onClose: () => void) => React.ReactNode;
  onDelete?: (item: T) => void;
  onReorder?: (items: T[]) => void;
  emptyMessage?: string;
  addButtonText?: string;
  isLoading?: boolean;
  className?: string;
  getItemId: (item: T) => string;
}

export function ContentSection<T>({
  title,
  description,
  items,
  renderItem,
  renderForm,
  onDelete,
  onReorder,
  emptyMessage = 'Нет элементов',
  addButtonText = 'Добавить',
  isLoading = false,
  className,
  getItemId,
}: ContentSectionProps<T>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (deletingItem && onDelete) {
      onDelete(deletingItem);
    }
    setDeletingItem(null);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {title}
            {items.length > 0 && (
              <span className="text-sm font-normal text-white/50">
                ({items.length})
              </span>
            )}
          </h3>
          {description && (
            <p className="text-sm text-white/50 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
          >
            <Plus size={16} className="mr-1" />
            {addButtonText}
          </Button>
          {isExpanded ? (
            <ChevronUp size={20} className="text-white/50" />
          ) : (
            <ChevronDown size={20} className="text-white/50" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/10">
          {isLoading ? (
            <div className="p-8 text-center text-white/50">Загрузка...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-white/50">{emptyMessage}</div>
          ) : (
            <div className="divide-y divide-white/10">
              {items.map((item, index) => (
                <div
                  key={getItemId(item)}
                  className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors group"
                >
                  {onReorder && (
                    <button
                      type="button"
                      className="mt-1 cursor-grab text-white/30 hover:text-white/60 transition-colors"
                      title="Перетащите для изменения порядка"
                    >
                      <GripVertical size={18} />
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    {renderItem(item, index)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="p-2"
                    >
                      <Pencil size={16} />
                    </Button>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingItem(item)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingItem ? 'Редактировать' : 'Добавить'}
        size="lg"
      >
        {renderForm(editingItem, handleCloseForm)}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Удалить элемент?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
      />
    </Card>
  );
}

export default ContentSection;
