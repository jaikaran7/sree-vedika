import { useCallback, useState } from 'react';
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
import { FinancialSummary } from '../components/booking/FinancialSummary';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { QuotationTemplate } from '../components/documents/QuotationTemplate';
import { InvoiceTemplate } from '../components/documents/InvoiceTemplate';
import { getOrCreateInvoiceNumber } from '../lib/api/invoices';
import { getOrCreateQuotation } from '../lib/api/quotations';
import { toErrorMessage } from '../lib/api';
import { formatCurrency, formatDateLong, formatPhone, normalizePhoneForLink } from '../lib/format';
import { DECORATION_TYPE_LABELS } from '../lib/types';

type DocumentPreview = 'quotation' | 'invoice';

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, loading, error, refetch, cancelBooking } = useBooking(id);
  const { payments, loading: paymentsLoading, error: paymentsError, addPayment, editPayment } = usePayments(id);
  const [addingPayment, setAddingPayment] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [quotationMeta, setQuotationMeta] = useState<{ quotationNumber: string; validUntil: string } | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  const loadQuotationPreview = useCallback(async () => {
    if (!booking) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await getOrCreateQuotation(booking.id);
      setQuotationMeta(data);
    } catch (err) {
      setPreviewError(toErrorMessage(err, 'Could not load quotation'));
    } finally {
      setPreviewLoading(false);
    }
  }, [booking]);

  const loadInvoicePreview = useCallback(async () => {
    if (!booking) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const number = await getOrCreateInvoiceNumber(booking.id);
      setInvoiceNumber(number);
    } catch (err) {
      setPreviewError(toErrorMessage(err, 'Could not load invoice'));
    } finally {
      setPreviewLoading(false);
    }
  }, [booking]);

  const openQuotationPreview = () => {
    setPreview('quotation');
    setQuotationMeta(null);
    void loadQuotationPreview();
  };

  const openInvoicePreview = () => {
    setPreview('invoice');
    setInvoiceNumber(null);
    void loadInvoicePreview();
  };

  const closePreview = () => {
    setPreview(null);
    setPreviewLoading(false);
    setPreviewError(null);
  };

  if (loading) return <LoadingState message="Loading booking…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!booking) return <ErrorState message="Booking not found" onRetry={() => navigate('/')} />;

  const waLink = `https://wa.me/${normalizePhoneForLink(booking.phone)}`;
  const kitchenAmount = booking.kitchen_required ? booking.kitchen_amount : 0;
  const decorationAmount = booking.decoration_type === 'in_house' ? booking.decoration_amount : 0;
  const royaltyFee = booking.decoration_type === 'outside' ? booking.royalty_fee : 0;
  const advanceReceived = payments
    .filter((p) => p.payment_type === 'advance')
    .reduce((sum, p) => sum + p.amount, 0);

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
          Kitchen
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Required</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{booking.kitchen_required ? 'Yes' : 'No'}</p>
          </div>
          {booking.kitchen_required && (
            <div>
              <p className="text-ink-soft dark:text-ink-dark-soft">Kitchen Amount</p>
              <p className="font-semibold text-ink dark:text-ink-dark">{formatCurrency(booking.kitchen_amount)}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
          Decoration
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Type</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{DECORATION_TYPE_LABELS[booking.decoration_type]}</p>
          </div>
          {booking.decoration_type === 'in_house' && (
            <>
              <div>
                <p className="text-ink-soft dark:text-ink-dark-soft">Vendor Name</p>
                <p className="font-semibold text-ink dark:text-ink-dark">{booking.decorator_vendor ?? '—'}</p>
              </div>
              <div>
                <p className="text-ink-soft dark:text-ink-dark-soft">Decoration Amount</p>
                <p className="font-semibold text-ink dark:text-ink-dark">{formatCurrency(booking.decoration_amount)}</p>
              </div>
            </>
          )}
          {booking.decoration_type === 'outside' && (
            <div>
              <p className="text-ink-soft dark:text-ink-dark-soft">Royalty Fee</p>
              <p className="font-semibold text-ink dark:text-ink-dark">{formatCurrency(booking.royalty_fee)}</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
          Financial Summary
        </h2>
        <FinancialSummary
          hallAmount={booking.budget}
          kitchenAmount={kitchenAmount}
          decorationAmount={decorationAmount}
          royaltyFee={royaltyFee}
          advanceReceived={advanceReceived}
          collected={booking.collected}
        />
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={openQuotationPreview}>
          View Quotation
        </Button>
        <Button variant="secondary" onClick={openInvoicePreview}>
          View Invoice
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

      <DocumentPreviewModal
        open={preview === 'quotation'}
        onClose={closePreview}
        title="Quotation"
        docType="quotation"
        customerName={booking.customer_name}
        phone={booking.phone}
        filename={quotationMeta ? `Quotation-${quotationMeta.quotationNumber}.pdf` : 'Quotation.pdf'}
        loading={previewLoading}
        error={previewError}
        onRetry={loadQuotationPreview}
      >
        {quotationMeta && (
          <QuotationTemplate
            booking={booking}
            quotationNumber={quotationMeta.quotationNumber}
            validUntil={quotationMeta.validUntil}
          />
        )}
      </DocumentPreviewModal>

      <DocumentPreviewModal
        open={preview === 'invoice'}
        onClose={closePreview}
        title="Invoice"
        docType="invoice"
        customerName={booking.customer_name}
        phone={booking.phone}
        filename={invoiceNumber ? `Invoice-${invoiceNumber}.pdf` : 'Invoice.pdf'}
        loading={previewLoading}
        error={previewError}
        onRetry={loadInvoicePreview}
      >
        {invoiceNumber && (
          <InvoiceTemplate booking={booking} payments={payments} invoiceNumber={invoiceNumber} />
        )}
      </DocumentPreviewModal>
    </div>
  );
}
