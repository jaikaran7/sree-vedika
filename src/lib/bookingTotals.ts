import type { DecorationType } from './types';

export function calcTotalBookingValue(parts: {
  budget: number;
  kitchen_required: boolean;
  kitchen_amount: number;
  decoration_type: DecorationType;
  decoration_amount: number;
  royalty_fee: number;
}): number {
  const kitchen = parts.kitchen_required ? parts.kitchen_amount : 0;
  const decoration = parts.decoration_type === 'in_house' ? parts.decoration_amount : 0;
  const royalty = parts.decoration_type === 'outside' ? parts.royalty_fee : 0;
  return parts.budget + kitchen + decoration + royalty;
}

export function calcPending(totalBookingValue: number, collected: number): number {
  return totalBookingValue - collected;
}

export function getEffectiveTotalBookingValue(booking: {
  budget: number;
  kitchen_required: boolean;
  kitchen_amount: number;
  decoration_type: DecorationType;
  decoration_amount: number;
  royalty_fee: number;
  total_booking_value?: number | null;
}): number {
  if (booking.total_booking_value != null && booking.total_booking_value > 0) {
    return Number(booking.total_booking_value);
  }
  return calcTotalBookingValue(booking);
}
