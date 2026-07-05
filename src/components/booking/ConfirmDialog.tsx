import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-6 text-sm leading-relaxed text-ink-soft dark:text-ink-dark-soft">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={destructive ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
