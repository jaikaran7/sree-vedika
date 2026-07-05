import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useInquiry } from '../hooks/useInquiry';
import { useFollowUps } from '../hooks/useFollowUps';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { InquiryStatusBadge, PriorityBadge } from '../components/inquiry/InquiryBadges';
import { FollowUpTimeline, AddFollowUpForm } from '../components/inquiry/FollowUpTimeline';
import { toErrorMessage } from '../lib/api';
import { inquiryToBookingPrefill } from '../lib/inquiryBooking';
import {
  EVENT_TYPE_LABELS,
  INQUIRY_SOURCE_LABELS,
  PREFERRED_SLOT_LABELS,
} from '../lib/types';
import { formatCurrency, formatDate, formatDateLong, formatPhone, normalizePhoneForLink } from '../lib/format';
import type { FollowUpFormValues } from '../lib/validators';

export default function InquiryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inquiry, loading, error, refetch } = useInquiry(id);
  const { followUps, loading: followUpsLoading, error: followUpsError, addFollowUp, refetch: refetchFollowUps } = useFollowUps(id);
  const [addingFollowUp, setAddingFollowUp] = useState(false);

  if (loading) return <LoadingState message="Loading inquiry…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!inquiry) return <ErrorState message="Inquiry not found" onRetry={() => navigate('/?section=inquiries')} />;

  const waLink = `https://wa.me/${normalizePhoneForLink(inquiry.phone)}`;
  const canConvert = inquiry.status !== 'converted_to_booking' && inquiry.status !== 'lost';

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
      <header className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/?section=inquiries')}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
        >
          ←
        </button>
        <h1 className="flex-1 truncate font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          {inquiry.customer_name}
        </h1>
        <InquiryStatusBadge status={inquiry.status} />
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <a href={`tel:${inquiry.phone}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-maroon-500 px-4 text-sm font-semibold text-gold-300">
          📞 Call
        </a>
        <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark">
          💬 WhatsApp
        </a>
        {canConvert && (
          <Button
            size="md"
            onClick={() =>
              navigate('/new', {
                state: {
                  fromInquiryId: inquiry.id,
                  prefill: inquiryToBookingPrefill(inquiry),
                  inquiryNotes: inquiry.notes,
                },
              })
            }
          >
            Convert to Booking
          </Button>
        )}
        {inquiry.booking_id && (
          <Link to={`/booking/${inquiry.booking_id}`}>
            <Button variant="secondary" size="md">Open Booking</Button>
          </Link>
        )}
      </div>

      <Card className="p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Customer Information</h2>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-ink dark:text-ink-dark">{inquiry.customer_name}</p>
          <p className="text-ink-soft dark:text-ink-dark-soft">{formatPhone(inquiry.phone)}</p>
          {inquiry.alternate_phone && (
            <p className="text-ink-soft dark:text-ink-dark-soft">Alt: {formatPhone(inquiry.alternate_phone)}</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Event Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Event Type</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{EVENT_TYPE_LABELS[inquiry.event_type]}</p>
          </div>
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Event Date</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{formatDateLong(inquiry.expected_event_date)}</p>
          </div>
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Preferred Slot</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{PREFERRED_SLOT_LABELS[inquiry.preferred_slot]}</p>
          </div>
          <div>
            <p className="text-ink-soft dark:text-ink-dark-soft">Expected Guests</p>
            <p className="font-semibold text-ink dark:text-ink-dark">{inquiry.expected_guests ?? '—'}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Expected Budget</p>
            <p className="mt-1 font-semibold text-ink dark:text-ink-dark">
              {inquiry.expected_budget != null ? formatCurrency(inquiry.expected_budget) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Source</p>
            <p className="mt-1 font-semibold text-ink dark:text-ink-dark">{INQUIRY_SOURCE_LABELS[inquiry.source]}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Priority</p>
            <div className="mt-1"><PriorityBadge priority={inquiry.priority} /></div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Next Follow-up</p>
            <p className="mt-1 font-semibold text-ink dark:text-ink-dark">
              {inquiry.next_followup_date ? formatDate(inquiry.next_followup_date) : '—'}
            </p>
          </div>
        </div>
      </Card>

      {inquiry.notes && (
        <Card className="mt-4 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-ink dark:text-ink-dark">{inquiry.notes}</p>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">Follow-up Timeline</h2>
        <Button size="md" onClick={() => setAddingFollowUp(true)}>+ Add Follow-up</Button>
      </div>
      <div className="mt-3">
        {followUpsLoading ? (
          <LoadingState message="Loading follow-ups…" />
        ) : followUpsError ? (
          <ErrorState message={followUpsError} />
        ) : (
          <FollowUpTimeline followUps={followUps} />
        )}
      </div>

      <Modal open={addingFollowUp} onClose={() => setAddingFollowUp(false)} title="Add Follow-up">
        <AddFollowUpForm
          currentStatus={inquiry.status}
          onCancel={() => setAddingFollowUp(false)}
          onSubmit={async (values: FollowUpFormValues) => {
            try {
              await addFollowUp({
                inquiry_id: inquiry.id,
                remarks: values.remarks,
                followup_date: values.followup_date,
                followup_time: values.followup_time,
                next_followup_date: values.next_followup_date || null,
                status: values.status,
              });
              await refetch();
              await refetchFollowUps();
              setAddingFollowUp(false);
              toast.success('Follow-up added');
            } catch (err) {
              toast.error(toErrorMessage(err, 'Could not add follow-up'));
            }
          }}
        />
      </Modal>
    </div>
  );
}
