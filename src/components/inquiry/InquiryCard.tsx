import { useNavigate } from 'react-router-dom';
import {
  EVENT_TYPE_LABELS,
  INQUIRY_SOURCE_LABELS,
  type Inquiry,
} from '../../lib/types';
import { InquiryStatusBadge, PriorityBadge } from './InquiryBadges';
import { formatCurrency, formatDate, formatPhone } from '../../lib/format';

export function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/inquiry/${inquiry.id}`)}
      className="surface-card surface-interactive w-full rounded-2xl p-4 text-left dark:border-line-dark dark:bg-surface-dark"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-ink dark:text-ink-dark">{inquiry.customer_name}</p>
          <p className="mt-0.5 text-sm text-ink-soft dark:text-ink-dark-soft">{formatPhone(inquiry.phone)}</p>
        </div>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
        <span>{EVENT_TYPE_LABELS[inquiry.event_type]}</span>
        <span className="text-line dark:text-line-dark">•</span>
        <span>{formatDate(inquiry.expected_event_date)}</span>
        <span className="text-line dark:text-line-dark">•</span>
        <span>{INQUIRY_SOURCE_LABELS[inquiry.source]}</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 dark:border-line-dark">
        <PriorityBadge priority={inquiry.priority} />
        <div className="text-right text-sm">
          {inquiry.expected_budget != null && inquiry.expected_budget > 0 ? (
            <p className="font-semibold text-ink dark:text-ink-dark">{formatCurrency(inquiry.expected_budget)}</p>
          ) : (
            <p className="text-ink-soft dark:text-ink-dark-soft">Budget TBD</p>
          )}
          {inquiry.next_followup_date && (
            <p className="mt-0.5 text-xs text-ink-soft dark:text-ink-dark-soft">
              Follow-up: {formatDate(inquiry.next_followup_date)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
