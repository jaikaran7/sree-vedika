export type BookingSlot = 'morning' | 'evening';

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
