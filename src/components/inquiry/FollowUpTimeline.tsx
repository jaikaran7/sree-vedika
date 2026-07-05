import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { followUpSchema, type FollowUpFormValues } from '../../lib/validators';
import { INQUIRY_STATUS_LABELS, type FollowUp, type InquiryStatus } from '../../lib/types';
import { TextInput, SelectInput, TextArea } from '../ui/Field';
import { Button } from '../ui/Button';
import { InquiryStatusBadge } from './InquiryBadges';
import { formatDate } from '../../lib/format';
import { todayISO } from '../../lib/format';

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = Number(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function FollowUpTimeline({ followUps }: { followUps: FollowUp[] }) {
  if (followUps.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-soft dark:text-ink-dark-soft">
        No follow-ups yet. Add the first follow-up to start the timeline.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {followUps.map((f, index) => (
        <div key={f.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < followUps.length - 1 && (
            <div className="absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-0.5 bg-line dark:bg-line-dark" />
          )}
          <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-maroon-500 bg-white dark:border-gold-400 dark:bg-surface-dark" />
          <div className="min-w-0 flex-1 rounded-xl border border-line bg-white p-4 dark:border-line-dark dark:bg-surface-dark">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink dark:text-ink-dark">
                {formatDate(f.followup_date)} · {formatTime(f.followup_time)}
              </p>
              <InquiryStatusBadge status={f.status} />
            </div>
            <p className="mt-2 text-sm text-ink dark:text-ink-dark">{f.remarks}</p>
            {f.next_followup_date && (
              <p className="mt-2 text-xs text-ink-soft dark:text-ink-dark-soft">
                Next follow-up: {formatDate(f.next_followup_date)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface AddFollowUpFormProps {
  currentStatus: InquiryStatus;
  onSubmit: (values: FollowUpFormValues) => Promise<void>;
  onCancel: () => void;
}

export function AddFollowUpForm({ currentStatus, onSubmit, onCancel }: AddFollowUpFormProps) {
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      followup_date: todayISO(),
      followup_time: defaultTime,
      status: currentStatus,
      remarks: '',
      next_followup_date: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextArea label="Remarks" placeholder="What was discussed?" error={errors.remarks?.message} {...register('remarks')} />
      <TextInput label="Follow-up Date" type="date" error={errors.followup_date?.message} {...register('followup_date')} />
      <TextInput label="Time" type="time" error={errors.followup_time?.message} {...register('followup_time')} />
      <TextInput label="Next Follow-up Date" type="date" error={errors.next_followup_date?.message} {...register('next_followup_date')} />
      <SelectInput label="Status" error={errors.status?.message} {...register('status')}>
        {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
          <option key={s} value={s}>{INQUIRY_STATUS_LABELS[s]}</option>
        ))}
      </SelectInput>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          Save Follow-up
        </Button>
      </div>
    </form>
  );
}
