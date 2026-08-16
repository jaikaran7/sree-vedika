import { Modal } from '../ui/Modal';
import { PaymentForm } from './PaymentForm';
import type { UpdatePaymentInput } from '../../lib/api';
import type { Payment } from '../../lib/types';

interface EditPaymentDialogProps {
  payment: Payment | null;
  pendingBeforeThisPayment: number;
  onClose: () => void;
  onSave: (input: UpdatePaymentInput) => Promise<void>;
}

export function EditPaymentDialog({ payment, pendingBeforeThisPayment, onClose, onSave }: EditPaymentDialogProps) {
  if (!payment) return null;
  return (
    <Modal open={!!payment} onClose={onClose} title="Edit Payment">
      <PaymentForm
        key={payment.id}
        pending={pendingBeforeThisPayment}
        submitLabel="Update Payment"
        defaultValues={{
          amount: payment.amount,
          payment_type: payment.payment_type,
          payment_method: payment.payment_method ?? 'cash',
          payment_date: payment.payment_date,
          notes: payment.notes ?? '',
        }}
        onSubmit={onSave}
      />
    </Modal>
  );
}
