export type BookingSlot = 'morning' | 'evening';

export type DecorationType = 'in_house' | 'outside' | 'not_required';

export type BookingStoredStatus = 'upcoming' | 'today' | 'completed' | 'cancelled';

export type BookingDisplayStatus = 'upcoming' | 'today' | 'completed' | 'cancelled';

export type PaymentType = 'advance' | 'second_payment' | 'final_payment' | 'adjustment' | 'other';

export interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  booking_date: string; // YYYY-MM-DD
  booking_slot: BookingSlot;
  budget: number;
  kitchen_required: boolean;
  kitchen_amount: number;
  decoration_type: DecorationType;
  decorator_vendor: string | null;
  decoration_amount: number;
  royalty_fee: number;
  total_booking_value: number;
  status: BookingStoredStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: PaymentType;
  notes: string | null;
  payment_date: string;
  created_at: string;
}

export interface BookingTotals {
  booking_id: string;
  collected: number;
  pending: number;
}

export interface Invoice {
  id: string;
  booking_id: string;
  invoice_number: string;
  created_at: string;
}

export interface Quotation {
  id: string;
  booking_id: string;
  quotation_number: string;
  valid_until: string;
  created_at: string;
}

export interface BookingWithTotals extends Booking {
  collected: number;
  pending: number;
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  advance: 'Booking Advance',
  second_payment: 'Second Payment',
  final_payment: 'Final Payment',
  adjustment: 'Adjustment',
  other: 'Other',
};

export const DECORATION_TYPE_LABELS: Record<DecorationType, string> = {
  in_house: 'In-house',
  outside: 'Outside',
  not_required: 'Not Required',
};

export type EventType =
  | 'wedding'
  | 'reception'
  | 'engagement'
  | 'birthday'
  | 'half_saree'
  | 'baby_shower'
  | 'corporate_event'
  | 'anniversary'
  | 'naming_ceremony'
  | 'other';

export type PreferredSlot = 'morning' | 'evening' | 'flexible';

export type InquirySource =
  | 'walk_in'
  | 'phone_call'
  | 'whatsapp'
  | 'google'
  | 'instagram'
  | 'facebook'
  | 'reference'
  | 'existing_customer'
  | 'website'
  | 'other';

export type InquiryPriority = 'low' | 'medium' | 'high';

export type InquiryStatus =
  | 'new_inquiry'
  | 'contacted'
  | 'hall_visit_scheduled'
  | 'hall_visited'
  | 'negotiation'
  | 'waiting_for_confirmation'
  | 'converted_to_booking'
  | 'lost';

export interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  alternate_phone: string | null;
  event_type: EventType;
  expected_event_date: string;
  preferred_slot: PreferredSlot;
  expected_guests: number | null;
  source: InquirySource;
  expected_budget: number | null;
  priority: InquiryPriority;
  status: InquiryStatus;
  notes: string | null;
  next_followup_date: string | null;
  booking_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  inquiry_id: string;
  remarks: string;
  followup_date: string;
  followup_time: string;
  next_followup_date: string | null;
  status: InquiryStatus;
  created_at: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding',
  reception: 'Reception',
  engagement: 'Engagement',
  birthday: 'Birthday',
  half_saree: 'Half Saree',
  baby_shower: 'Baby Shower',
  corporate_event: 'Corporate Event',
  anniversary: 'Anniversary',
  naming_ceremony: 'Naming Ceremony',
  other: 'Other',
};

export const PREFERRED_SLOT_LABELS: Record<PreferredSlot, string> = {
  morning: 'Morning',
  evening: 'Evening',
  flexible: 'Flexible',
};

export const INQUIRY_SOURCE_LABELS: Record<InquirySource, string> = {
  walk_in: 'Walk-in',
  phone_call: 'Phone Call',
  whatsapp: 'WhatsApp',
  google: 'Google',
  instagram: 'Instagram',
  facebook: 'Facebook',
  reference: 'Reference',
  existing_customer: 'Existing Customer',
  website: 'Website',
  other: 'Other',
};

export const INQUIRY_PRIORITY_LABELS: Record<InquiryPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new_inquiry: 'New Inquiry',
  contacted: 'Contacted',
  hall_visit_scheduled: 'Hall Visit Scheduled',
  hall_visited: 'Hall Visited',
  negotiation: 'Negotiation',
  waiting_for_confirmation: 'Waiting for Confirmation',
  converted_to_booking: 'Converted to Booking',
  lost: 'Lost',
};
