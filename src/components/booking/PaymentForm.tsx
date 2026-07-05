import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, type PaymentFormValues } from '../../lib/validators';
import { TextInput, SelectInput, TextArea } from '../ui/Field';
import { Button } from '../ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { formatCurrency } from '../../lib/format';
import type { PaymentType } from '../../lib/types';

interface PaymentFormProps {
  pending: number;
  defaultValues?: Partial<PaymentFormValues>;
  submitLabel: string;
  onSubmit: (values: { amount: number; payment_type: PaymentType; notes?: string }) => Promise<void>;
}

export function PaymentForm({ pending, defaultValues, submitLabel, onSubmit }: PaymentFormProps) {
  const [pendingSubmit, setPendingSubmit] = useState<PaymentFormValues | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_type: 'other', ...defaultValues },
  });

  const run = async (values: PaymentFormValues) => {
    setSaving(true);
    setPendingSubmit(null);
    try {
      await onSubmit({
        amount: Number(values.amount),
        payment_type: values.payment_type,
        notes: values.notes,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleValid = (values: PaymentFormValues) => {
    if (Number(values.amount) > pending) {
      setPendingSubmit(values);
      return;
    }
    run(values);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleValid)} className="space-y-4">
        <TextInput
          label="Amount"
          type="number"
          inputMode="decimal"
          min={0}
          error={errors.amount?.message}
          {...register('amount')}
        />
        <SelectInput label="Payment Type" error={errors.payment_type?.message} {...register('payment_type')}>
          <option value="advance">Advance</option>
          <option value="second_payment">Second Payment</option>
          <option value="final_payment">Final Payment</option>
          <option value="adjustment">Adjustment</option>
          <option value="other">Other</option>
        </SelectInput>
        <TextArea label="Notes (optional)" placeholder="Optional note" {...register('notes')} />
        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {submitLabel}
        </Button>
      </form>

      <ConfirmDialog
        open={!!pendingSubmit}
        title="Amount exceeds pending"
        message={`This payment of ${pendingSubmit ? formatCurrency(Number(pendingSubmit.amount)) : ''} is more than the pending amount of ${formatCurrency(Math.max(pending, 0))}. Save anyway?`}
        confirmLabel="Save Anyway"
        onConfirm={() => pendingSubmit && run(pendingSubmit)}
        onCancel={() => setPendingSubmit(null)}
      />
    </>
  );
}
