import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { inquirySchema, type InquiryFormValues } from '../../lib/validators';
import { toErrorMessage } from '../../lib/api';
import { useInquiries } from '../../hooks/useInquiries';
import { TextInput, SelectInput, TextArea } from '../ui/Field';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../booking/ConfirmDialog';
import {
  EVENT_TYPE_LABELS,
  INQUIRY_PRIORITY_LABELS,
  INQUIRY_SOURCE_LABELS,
  INQUIRY_STATUS_LABELS,
  type EventType,
  type Inquiry,
  type InquiryPriority,
  type InquirySource,
  type InquiryStatus,
} from '../../lib/types';

export function InquiryForm() {
  const navigate = useNavigate();
  const { createInquiry } = useInquiries();
  const [submitting, setSubmitting] = useState(false);
  const [duplicate, setDuplicate] = useState<{ values: InquiryFormValues; existing: Inquiry } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      event_type: 'wedding',
      preferred_slot: 'flexible',
      source: 'walk_in',
      priority: 'medium',
      status: 'new_inquiry',
      expected_guests: '',
      expected_budget: '',
      notes: '',
      next_followup_date: '',
      alternate_phone: '',
    },
  });

  const save = async (values: InquiryFormValues, skipDuplicateCheck = false) => {
    setSubmitting(true);
    setDuplicate(null);
    try {
      const result = await createInquiry({
        customer_name: values.customer_name,
        phone: values.phone as unknown as string,
        alternate_phone: values.alternate_phone ? (values.alternate_phone as unknown as string) : null,
        event_type: values.event_type as EventType,
        expected_event_date: values.expected_event_date,
        preferred_slot: values.preferred_slot as Inquiry['preferred_slot'],
        expected_guests: values.expected_guests ? Number(values.expected_guests) : null,
        source: values.source as InquirySource,
        expected_budget: values.expected_budget ? Number(values.expected_budget) : null,
        priority: values.priority as InquiryPriority,
        status: values.status as Inquiry['status'],
        notes: values.notes?.trim() || null,
        next_followup_date: values.next_followup_date || null,
        skipDuplicateCheck,
      });

      if (result.ok) {
        toast.success('Inquiry created');
        navigate(`/inquiry/${result.inquiry.id}`);
        return;
      }

      if (result.reason === 'duplicate') {
        setDuplicate({ values, existing: result.existing });
      } else {
        toast.error(result.message ?? 'Could not save inquiry');
      }
    } catch (err) {
      toast.error(toErrorMessage(err, 'Could not save inquiry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit((values) => save(values))} className="space-y-5">
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Customer Information</h2>
          <TextInput label="Customer Name" placeholder="e.g. Ramesh Kumar" error={errors.customer_name?.message} {...register('customer_name')} />
          <TextInput label="Phone Number" type="tel" inputMode="numeric" placeholder="10-digit mobile" error={errors.phone?.message} {...register('phone')} />
          <TextInput label="Alternate Phone" type="tel" inputMode="numeric" placeholder="Optional" error={errors.alternate_phone?.message} {...register('alternate_phone')} />
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Event Details</h2>
          <SelectInput label="Event Type" error={errors.event_type?.message} {...register('event_type')}>
            {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((t) => (
              <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
            ))}
          </SelectInput>
          <TextInput label="Expected Event Date" type="date" error={errors.expected_event_date?.message} {...register('expected_event_date')} />
          <SelectInput label="Preferred Slot" error={errors.preferred_slot?.message} {...register('preferred_slot')}>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </SelectInput>
          <TextInput label="Expected Guests" type="number" inputMode="numeric" min={1} placeholder="Optional" error={errors.expected_guests?.message} {...register('expected_guests')} />
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Source of Inquiry</h2>
          <SelectInput label="Source" error={errors.source?.message} {...register('source')}>
            {(Object.keys(INQUIRY_SOURCE_LABELS) as InquirySource[]).map((s) => (
              <option key={s} value={s}>{INQUIRY_SOURCE_LABELS[s]}</option>
            ))}
          </SelectInput>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Budget Expectation</h2>
          <TextInput label="Expected Budget (₹)" type="number" inputMode="decimal" min={0} placeholder="Optional" error={errors.expected_budget?.message} {...register('expected_budget')} />
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Follow-up Details</h2>
          <TextInput label="Next Follow-up Date" type="date" error={errors.next_followup_date?.message} {...register('next_followup_date')} />
          <SelectInput label="Priority" error={errors.priority?.message} {...register('priority')}>
            {(Object.keys(INQUIRY_PRIORITY_LABELS) as InquiryPriority[]).map((p) => (
              <option key={p} value={p}>{INQUIRY_PRIORITY_LABELS[p]}</option>
            ))}
          </SelectInput>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Status</h2>
          <SelectInput label="Status" error={errors.status?.message} {...register('status')}>
            {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
              <option key={s} value={s}>{INQUIRY_STATUS_LABELS[s]}</option>
            ))}
          </SelectInput>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Notes</h2>
          <TextArea
            label="Notes"
            placeholder="Customer wants evening slot. Need kitchen. Interested in in-house decoration."
            error={errors.notes?.message}
            {...register('notes')}
          />
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          Save Inquiry
        </Button>
      </form>

      <ConfirmDialog
        open={!!duplicate}
        title="Duplicate Inquiry"
        message={
          duplicate
            ? `An inquiry already exists for ${duplicate.existing.customer_name} on ${duplicate.existing.expected_event_date}. Create another anyway?`
            : ''
        }
        confirmLabel="Create Anyway"
        onConfirm={() => duplicate && save(duplicate.values, true)}
        onCancel={() => setDuplicate(null)}
      />
    </>
  );
}
