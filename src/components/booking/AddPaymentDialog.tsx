import { Modal } from '../ui/Modal';
import { PaymentForm } from './PaymentForm';
import type { UpdatePaymentInput } from '../../lib/api';

interface AddPaymentDialogProps {
  open: boolean;
  pending: number;
  onClose: () => void;
  onSave: (input: UpdatePaymentInput) => Promise<void>;
}

export function AddPaymentDialog({ open, pending, onClose, onSave }: AddPaymentDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Add Payment">
      <PaymentForm
        pending={pending}
        submitLabel="Save Payment"
        onSubmit={async (values) => {
          await onSave(values);
          onClose();
        }}
      />
    </Modal>
  );
}
