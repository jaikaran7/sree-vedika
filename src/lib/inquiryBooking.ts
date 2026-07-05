import type { DecorationType, Inquiry } from './types';
import type { BookingFormValues } from './validators';

export function parseInquiryNotesForBooking(notes: string | null): {
  kitchen_required: 'yes' | 'no';
  decoration_type: DecorationType;
} {
  const lower = (notes ?? '').toLowerCase();
  const noKitchen = /no kitchen|without kitchen|don't need kitchen|dont need kitchen/.test(lower);
  const kitchen_required = !noKitchen && /\bkitchen\b/.test(lower) ? 'yes' : 'no';

  let decoration_type: DecorationType = 'not_required';
  if (/in[- ]?house decoration/.test(lower)) decoration_type = 'in_house';
  else if (/outside decoration/.test(lower)) decoration_type = 'outside';
  else if (/\bdecoration\b/.test(lower) && !/no decoration|without decoration/.test(lower)) {
    decoration_type = 'in_house';
  }

  return { kitchen_required, decoration_type };
}

export function inquiryToBookingPrefill(inquiry: Inquiry): Partial<BookingFormValues> {
  const { kitchen_required, decoration_type } = parseInquiryNotesForBooking(inquiry.notes);
  const slot = inquiry.preferred_slot === 'flexible' ? 'evening' : inquiry.preferred_slot;

  return {
    customer_name: inquiry.customer_name,
    phone: inquiry.phone,
    booking_date: inquiry.expected_event_date,
    booking_slot: slot,
    budget: inquiry.expected_budget ?? 0,
    kitchen_required,
    decoration_type,
    advance: 0,
    kitchen_amount: 0,
    decoration_amount: 0,
    royalty_fee: 0,
    decorator_vendor: '',
  };
}
