import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { bookingSchema, type BookingFormValues } from '../../lib/validators';
import { toErrorMessage } from '../../lib/api';
import { useBookings } from '../../hooks/useBookings';
import { TextInput, SelectInput } from '../ui/Field';
import { Button } from '../ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { formatCurrency, todayISO } from '../../lib/format';

export function BookingForm() {
  const navigate = useNavigate();
  const { createBooking } = useBookings();
  const [confirming, setConfirming] = useState<BookingFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { booking_date: todayISO(), booking_slot: 'morning', budget: 0, advance: 0 },
  });

  const budget = Number(watch('budget')) || 0;
  const advance = Number(watch('advance')) || 0;

  const doSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    setConfirming(null);
    try {
      const result = await createBooking({
        customer_name: values.customer_name,
        phone: values.phone as unknown as string,
        booking_date: values.booking_date,
        booking_slot: values.booking_slot,
        budget: Number(values.budget),
        advance: Number(values.advance ?? 0),
      });

      if (result.ok) {
        toast.success('Booking created');
        navigate(`/booking/${result.booking.id}`);
        return;
      }

      if (result.reason === 'slot_taken') {
        setError('booking_date', { message: 'This slot is already booked.' });
        toast.error('This slot is already booked.');
      } else {
        toast.error(result.message ?? 'Could not save booking');
      }
    } catch (err) {
      toast.error(toErrorMessage(err, 'Could not save booking'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit((values) => setConfirming(values))}
        className="space-y-5"
      >
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Customer Details</h2>
          <TextInput label="Customer Name" placeholder="e.g. Ramesh Kumar" error={errors.customer_name?.message} {...register('customer_name')} />
          <TextInput
            label="Phone Number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Booking Details</h2>
          <TextInput label="Booking Date" type="date" error={errors.booking_date?.message} {...register('booking_date')} />
          <SelectInput label="Booking Slot" error={errors.booking_slot?.message} {...register('booking_slot')}>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
          </SelectInput>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Financial Details</h2>
          <TextInput
            label="Budget Finalized"
            type="number"
            inputMode="decimal"
            min={0}
            error={errors.budget?.message}
            {...register('budget')}
          />
          <TextInput
            label="Advance Received"
            type="number"
            inputMode="decimal"
            min={0}
            error={errors.advance?.message}
            {...register('advance')}
          />
          <div className="rounded-xl bg-gold-300/15 px-4 py-3 text-sm font-semibold text-gold-600 dark:bg-gold-400/10 dark:text-gold-300">
            Pending Amount: {formatCurrency(Math.max(budget - advance, 0))}
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          Save Booking
        </Button>
      </form>

      <ConfirmDialog
        open={!!confirming}
        title="Confirm Booking"
        message={
          confirming
            ? `Save booking for ${confirming.customer_name} on ${confirming.booking_date} (${confirming.booking_slot})? Budget ${formatCurrency(Number(confirming.budget))}, advance ${formatCurrency(Number(confirming.advance ?? 0))}.`
            : ''
        }
        confirmLabel="Save Booking"
        onConfirm={() => confirming && doSubmit(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
