import { z } from 'zod';

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
    budget: z.coerce.number().min(0, 'Budget cannot be negative'),
    advance: z.coerce.number().min(0, 'Advance cannot be negative').default(0),
  })
  .refine((data) => data.advance <= data.budget, {
    message: 'Advance cannot exceed the budget',
    path: ['advance'],
  });

export type BookingFormValues = z.input<typeof bookingSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  payment_type: z.enum(['advance', 'second_payment', 'final_payment', 'adjustment', 'other']),
  notes: z.string().trim().optional(),
});

export type PaymentFormValues = z.input<typeof paymentSchema>;
