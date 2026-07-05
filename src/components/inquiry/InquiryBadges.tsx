import type { InquiryPriority, InquiryStatus } from '../../lib/types';
import { INQUIRY_PRIORITY_LABELS, INQUIRY_STATUS_LABELS } from '../../lib/types';

const statusStyles: Record<InquiryStatus, string> = {
  new_inquiry: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  contacted: 'bg-gold-300/30 text-gold-600 dark:bg-gold-400/15 dark:text-gold-300',
  hall_visit_scheduled: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  hall_visited: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  negotiation: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  waiting_for_confirmation: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  converted_to_booking: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  lost: 'bg-ink/8 text-ink-soft line-through dark:bg-white/10 dark:text-ink-dark-soft',
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span className={`inline-flex max-w-[10rem] items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-tight ${statusStyles[status]}`}>
      {INQUIRY_STATUS_LABELS[status]}
    </span>
  );
}

const priorityStyles: Record<InquiryPriority, string> = {
  low: 'bg-ink/8 text-ink-soft dark:bg-white/10 dark:text-ink-dark-soft',
  medium: 'bg-gold-300/25 text-gold-600 dark:bg-gold-400/10 dark:text-gold-300',
  high: 'bg-maroon-500/15 text-maroon-600 dark:text-maroon-400',
};

export function PriorityBadge({ priority }: { priority: InquiryPriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
      {INQUIRY_PRIORITY_LABELS[priority]}
    </span>
  );
}
