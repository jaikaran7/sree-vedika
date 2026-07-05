import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useBooking } from '../hooks/useBooking';
import { usePayments } from '../hooks/usePayments';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PaymentHistory } from '../components/booking/PaymentHistory';
import { AddPaymentDialog } from '../components/booking/AddPaymentDialog';
import { ConfirmDialog } from '../components/booking/ConfirmDialog';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { toErrorMessage } from '../lib/api';
import { formatCurrency, formatDateLong, formatPhone, normalizePhoneForLink } from '../lib/format';

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, loading, error, refetch, cancelBooking } = useBooking(id);
  const { payments, loading: paymentsLoading, error: paymentsError, addPayment, editPayment } = usePayments(id);
  const [addingPayment, setAddingPayment] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [generating, setGenerating] = useState<'quotation' | 'invoice' | null>(null);

  if (loading) return <LoadingState message="Loading booking…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!booking) return <ErrorState message="Booking not found" onRetry={() => navigate('/')} />;

  const waLink = `https://wa.me/${normalizePhoneForLink(booking.phone)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
      <header className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
        >
          ←
        </button>
        <h1 className="flex-1 truncate font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          {booking.customer_name}
        </h1>
        <StatusBadge status={booking.status} />
      </header>

      <Card className="p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
          Customer Information
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink dark:text-ink-dark">{booking.customer_name}</p>
            <p className="text-sm text-ink-soft dark:text-ink-dark-soft">{formatPhone(booking.phone)}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${booking.phone}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-lg dark:bg-white/10"
              aria-label="Call"
            >
              📞
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-lg dark:bg-white/10"
              aria-label="WhatsApp"
            >
              💬
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(booking.phone);
                toast.success('Phone number copied');
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-lg dark:bg-white/10"
              aria-label="Copy phone number"
            >
              📋
            </button>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
          Booking Information
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Date</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{formatDateLong(booking.booking_date)}</p>
          </div>
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Slot</p>
            <p className="font-semibold text-ink dark:text-ink-dark capitalize">{booking.booking_slot}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
          Payment Summary
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">Budget</p>
            <p className="font-display font-semibold text-ink dark:text-ink-dark">{formatCurrency(booking.budget)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">Collected</p>
            <p className="font-display font-semibold text-maroon-500 dark:text-gold-300">{formatCurrency(booking.collected)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">Pending</p>
            <p className="font-display font-semibold text-maroon-600 dark:text-maroon-400">
              {formatCurrency(Math.max(booking.pending, 0))}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          disabled={generating !== null}
          onClick={async () => {
            setGenerating('quotation');
            try {
              const { downloadQuotation } = await import('../components/documents/generatePdf');
              await downloadQuotation(booking);
              toast.success('Quotation downloaded');
            } catch (err) {
              toast.error(toErrorMessage(err, 'Could not generate quotation'));
            } finally {
              setGenerating(null);
            }
          }}
        >
          {generating === 'quotation' ? 'Generating…' : 'Generate Quotation'}
        </Button>
        <Button
          variant="secondary"
          disabled={generating !== null}
          onClick={async () => {
            setGenerating('invoice');
            try {
              const { downloadInvoice } = await import('../components/documents/generatePdf');
              await downloadInvoice(booking, payments);
              toast.success('Invoice downloaded');
            } catch (err) {
              toast.error(toErrorMessage(err, 'Could not generate invoice'));
            } finally {
              setGenerating(null);
            }
          }}
        >
          {generating === 'invoice' ? 'Generating…' : 'Generate Invoice'}
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">Payment History</h2>
        <Button size="md" onClick={() => setAddingPayment(true)}>
          + Add Payment
        </Button>
      </div>
      <div className="mt-3">
        {paymentsLoading ? (
          <LoadingState message="Loading payments…" />
        ) : paymentsError ? (
          <ErrorState message={paymentsError} />
        ) : (
          <PaymentHistory
            payments={payments}
            pending={booking.pending}
            onEdit={async (paymentId, input) => {
              try {
                await editPayment(paymentId, input);
                await refetch();
                toast.success('Payment updated');
              } catch (err) {
                toast.error(toErrorMessage(err, 'Could not update payment'));
              }
            }}
          />
        )}
      </div>

      {booking.status !== 'cancelled' && (
        <div className="mt-8">
          <Button variant="danger" size="lg" className="w-full" onClick={() => setConfirmingCancel(true)}>
            Cancel Booking
          </Button>
        </div>
      )}

      <AddPaymentDialog
        open={addingPayment}
        pending={booking.pending}
        onClose={() => setAddingPayment(false)}
        onSave={async (input) => {
          try {
            await addPayment(input);
            await refetch();
            toast.success('Payment added');
          } catch (err) {
            toast.error(toErrorMessage(err, 'Could not add payment'));
          }
        }}
      />

      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel Booking"
        message="This will free up the date and slot for another booking. This cannot be undone."
        confirmLabel="Cancel Booking"
        destructive
        onConfirm={async () => {
          try {
            await cancelBooking();
            setConfirmingCancel(false);
            toast.success('Booking cancelled');
          } catch (err) {
            toast.error(toErrorMessage(err, 'Could not cancel booking'));
          }
        }}
        onCancel={() => setConfirmingCancel(false)}
      />
    </div>
  );
}
