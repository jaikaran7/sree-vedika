import type { InquiryPriority, InquirySource, InquiryStatus } from '../../lib/types';
import {
  INQUIRY_PRIORITY_LABELS,
  INQUIRY_SOURCE_LABELS,
  INQUIRY_STATUS_LABELS,
} from '../../lib/types';
import { SelectInput, TextInput } from '../ui/Field';

export type InquiryFilters = {
  status: InquiryStatus | '';
  source: InquirySource | '';
  priority: InquiryPriority | '';
  followupDate: string;
  eventDate: string;
};

export const emptyInquiryFilters: InquiryFilters = {
  status: '',
  source: '',
  priority: '',
  followupDate: '',
  eventDate: '',
};

interface InquiryFiltersBarProps {
  filters: InquiryFilters;
  onChange: (filters: InquiryFilters) => void;
}

export function InquiryFiltersBar({ filters, onChange }: InquiryFiltersBarProps) {
  const set = (key: keyof InquiryFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-white p-4 dark:border-line-dark dark:bg-surface-dark">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">Filters</p>
      <div className="grid grid-cols-2 gap-3">
        <SelectInput label="Status" value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {(Object.keys(INQUIRY_STATUS_LABELS) as InquiryStatus[]).map((s) => (
            <option key={s} value={s}>{INQUIRY_STATUS_LABELS[s]}</option>
          ))}
        </SelectInput>
        <SelectInput label="Source" value={filters.source} onChange={(e) => set('source', e.target.value)}>
          <option value="">All sources</option>
          {(Object.keys(INQUIRY_SOURCE_LABELS) as InquirySource[]).map((s) => (
            <option key={s} value={s}>{INQUIRY_SOURCE_LABELS[s]}</option>
          ))}
        </SelectInput>
        <SelectInput label="Priority" value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
          <option value="">All priorities</option>
          {(Object.keys(INQUIRY_PRIORITY_LABELS) as InquiryPriority[]).map((p) => (
            <option key={p} value={p}>{INQUIRY_PRIORITY_LABELS[p]}</option>
          ))}
        </SelectInput>
        <TextInput label="Follow-up Date" type="date" value={filters.followupDate} onChange={(e) => set('followupDate', e.target.value)} />
        <TextInput label="Event Date" type="date" value={filters.eventDate} onChange={(e) => set('eventDate', e.target.value)} />
      </div>
    </div>
  );
}

export function filterInquiries<T extends {
  customer_name: string;
  phone: string;
  expected_event_date: string;
  status: InquiryStatus;
  source: InquirySource;
  priority: InquiryPriority;
  next_followup_date: string | null;
}>(inquiries: T[], query: string, filters: InquiryFilters): T[] {
  const q = query.trim().toLowerCase();

  return inquiries.filter((i) => {
    if (q) {
      const statusLabel = INQUIRY_STATUS_LABELS[i.status].toLowerCase();
      const sourceLabel = INQUIRY_SOURCE_LABELS[i.source].toLowerCase();
      const matches =
        i.customer_name.toLowerCase().includes(q) ||
        i.phone.includes(q) ||
        i.expected_event_date.includes(q) ||
        statusLabel.includes(q) ||
        sourceLabel.includes(q);
      if (!matches) return false;
    }
    if (filters.status && i.status !== filters.status) return false;
    if (filters.source && i.source !== filters.source) return false;
    if (filters.priority && i.priority !== filters.priority) return false;
    if (filters.followupDate && i.next_followup_date !== filters.followupDate) return false;
    if (filters.eventDate && i.expected_event_date !== filters.eventDate) return false;
    return true;
  });
}