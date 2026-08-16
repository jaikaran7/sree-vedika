import { z } from 'zod';
import { calcTotalBookingValue } from './bookingTotals';
import type { DecorationType } from './types';

const phoneRegex = /^[6-9]\d{9}$/;

export const bookingSchema = z
  .object({
    customer_name: z.string().trim().min(2, 'Enter the customer name'),
    phone: z
      .string()
      .trim()
      .transform((v) => v.replace(/\D/g, '').slice(-10))
      .refine((v) => phoneRegex.test(v), 'Enter a valid 10-digit mobile number'),
    booking_date: z.string().min(1, 'Pick a date'),
    booking_slot: z.enum(['morning', 'evening']),
    kitchen_required: z.enum(['yes', 'no']).default('no'),
    kitchen_amount: z.coerce.number().min(0, 'Kitchen amount cannot be negative').default(0),
    decoration_type: z.enum(['in_house', 'outside', 'not_required']).default('not_required'),
    decorator_vendor: z.string().trim().optional(),
    decoration_amount: z.coerce.number().min(0, 'Decoration amount cannot be negative').default(0),
    royalty_fee: z.coerce.number().min(0, 'Royalty fee cannot be negative').default(0),
    budget: z.coerce.number().min(0, 'Hall booking amount cannot be negative'),
    advance: z.coerce.number().min(0, 'Advance cannot be negative').default(0),
    payment_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kitchen_required === 'yes' && data.kitchen_amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter the kitchen amount',
        path: ['kitchen_amount'],
      });
    }

    if (data.decoration_type === 'outside' && data.royalty_fee <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter the royalty fee',
        path: ['royalty_fee'],
      });
    }

    if (data.decoration_type === 'in_house') {
      if (!data.decorator_vendor || data.decorator_vendor.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter the decorator vendor name',
          path: ['decorator_vendor'],
        });
      }
    }

    if (data.advance > 0 && !data.payment_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pick the payment collection date',
        path: ['payment_date'],
      });
    }

    const total = calcTotalBookingValue({
      budget: data.budget,
      kitchen_required: data.kitchen_required === 'yes',
      kitchen_amount: data.kitchen_amount,
      decoration_type: data.decoration_type as DecorationType,
      decoration_amount: data.decoration_amount,
      royalty_fee: data.royalty_fee,
    });

    if (data.advance > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Advance cannot exceed total booking value',
        path: ['advance'],
      });
    }
  });

export type BookingFormValues = z.input<typeof bookingSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  payment_type: z.enum(['advance', 'second_payment', 'final_payment', 'adjustment', 'other']),
  payment_date: z.string().min(1, 'Pick the payment collection date'),
  notes: z.string().trim().optional(),
});

export type PaymentFormValues = z.input<typeof paymentSchema>;

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/\D/g, '').slice(-10) : ''))
  .refine((v) => !v || phoneRegex.test(v), 'Enter a valid 10-digit mobile number');

export const inquirySchema = z.object({
  customer_name: z.string().trim().min(2, 'Enter the customer name'),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, '').slice(-10))
    .refine((v) => phoneRegex.test(v), 'Enter a valid 10-digit mobile number'),
  alternate_phone: optionalPhone,
  event_type: z.enum([
    'wedding', 'reception', 'engagement', 'birthday', 'half_saree',
    'baby_shower', 'corporate_event', 'anniversary', 'naming_ceremony', 'other',
  ]),
  expected_event_date: z.string().min(1, 'Pick the expected event date'),
  preferred_slot: z.enum(['morning', 'evening', 'flexible']).default('flexible'),
  expected_guests: z.union([z.literal(''), z.coerce.number().positive('Enter expected guests')]).optional(),
  source: z.enum([
    'walk_in', 'phone_call', 'whatsapp', 'google', 'instagram', 'facebook',
    'reference', 'existing_customer', 'website', 'other',
  ]),
  expected_budget: z.union([z.literal(''), z.coerce.number().min(0, 'Budget cannot be negative')]).optional(),
  next_followup_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum([
    'new_inquiry', 'contacted', 'hall_visit_scheduled', 'hall_visited',
    'negotiation', 'waiting_for_confirmation', 'converted_to_booking', 'lost',
  ]).default('new_inquiry'),
  notes: z.string().trim().optional(),
});

export type InquiryFormValues = z.input<typeof inquirySchema>;

export const followUpSchema = z.object({
  remarks: z.string().trim().min(1, 'Enter follow-up remarks'),
  followup_date: z.string().min(1, 'Pick a date'),
  followup_time: z.string().min(1, 'Pick a time'),
  next_followup_date: z.string().optional(),
  status: z.enum([
    'new_inquiry', 'contacted', 'hall_visit_scheduled', 'hall_visited',
    'negotiation', 'waiting_for_confirmation', 'converted_to_booking', 'lost',
  ]),
});

export type FollowUpFormValues = z.input<typeof followUpSchema>;
