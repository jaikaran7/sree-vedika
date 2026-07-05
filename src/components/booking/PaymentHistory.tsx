import { useState } from 'react';
import { formatCurrency, formatDate } from '../../lib/format';
import { PAYMENT_TYPE_LABELS } from '../../lib/types';
import type { Payment } from '../../lib/types';
import { EditPaymentDialog } from './EditPaymentDialog';

export function PaymentHistory({
  payments,
  pending,
  onEdit,
}: {
  payments: Payment[];
  pending: number;
  onEdit: (id: string, input: { amount: number; payment_type: Payment['payment_type']; notes?: string }) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Payment | null>(null);

  if (payments.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-soft dark:text-ink-dark-soft">No payments recorded yet.</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {payments.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setEditing(p)}
              className="w-full rounded-xl border border-line bg-white p-3.5 text-left transition-colors hover:border-gold-500/50 dark:border-line-dark dark:bg-surface-dark"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink dark:text-ink-dark">
                  {PAYMENT_TYPE_LABELS[p.payment_type]}
                </span>
                <span className="font-display text-base font-semibold text-maroon-500 dark:text-gold-300">
                  {formatCurrency(p.amount)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-ink-soft dark:text-ink-dark-soft">
                <span>{formatDate(p.payment_date)}</span>
                {p.notes && <span className="truncate pl-3 text-right italic">{p.notes}</span>}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <EditPaymentDialog
        payment={editing}
        pendingBeforeThisPayment={editing ? pending + editing.amount : pending}
        onClose={() => setEditing(null)}
        onSave={async (input) => {
          if (!editing) return;
          await onEdit(editing.id, input);
          setEditing(null);
        }}
      />
    </>
  );
}
