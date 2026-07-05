import { Modal } from '../ui/Modal';
import { PaymentForm } from './PaymentForm';
import type { Payment, PaymentType } from '../../lib/types';

interface EditPaymentDialogProps {
  payment: Payment | null;
  pendingBeforeThisPayment: number;
  onClose: () => void;
  onSave: (input: { amount: number; payment_type: PaymentType; notes?: string }) => Promise<void>;
}

export function EditPaymentDialog({ payment, pendingBeforeThisPayment, onClose, onSave }: EditPaymentDialogProps) {
  if (!payment) return null;
  return (
    <Modal open={!!payment} onClose={onClose} title="Edit Payment">
      <PaymentForm
        key={payment.id}
        pending={pendingBeforeThisPayment}
        submitLabel="Update Payment"
        defaultValues={{ amount: payment.amount, payment_type: payment.payment_type, notes: payment.notes ?? '' }}
        onSubmit={onSave}
      />
    </Modal>
  );
}
