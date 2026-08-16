import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { bookingSchema, type BookingFormValues } from '../../lib/validators';
import { calcTotalBookingValue } from '../../lib/bookingTotals';
import { linkInquiryToBooking, toErrorMessage } from '../../lib/api';
import { useBookings } from '../../hooks/useBookings';
import { TextInput, SelectInput } from '../ui/Field';
import { Button } from '../ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { FinancialSummary } from './FinancialSummary';
import { formatCurrency, todayISO } from '../../lib/format';
import type { DecorationType } from '../../lib/types';

type BookingFormProps = {
  prefill?: Partial<BookingFormValues>;
  fromInquiryId?: string;
};

export function BookingForm({ prefill, fromInquiryId }: BookingFormProps) {
  const navigate = useNavigate();
  const { createBooking } = useBookings();
  const [confirming, setConfirming] = useState<BookingFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booking_date: todayISO(),
      booking_slot: 'morning',
      kitchen_required: 'no',
      kitchen_amount: 0,
      decoration_type: 'not_required',
      decorator_vendor: '',
      decoration_amount: 0,
      royalty_fee: 0,
      budget: 0,
      advance: 0,
      payment_date: todayISO(),
      ...prefill,
    },
  });

  const kitchenRequired = watch('kitchen_required');
  const decorationType = watch('decoration_type');
  const decoratorVendor = watch('decorator_vendor');
  const budget = Number(watch('budget')) || 0;
  const kitchenAmount = kitchenRequired === 'yes' ? Number(watch('kitchen_amount')) || 0 : 0;
  const decorationAmount = decorationType === 'in_house' ? Number(watch('decoration_amount')) || 0 : 0;
  const royaltyFee = decorationType === 'outside' ? Number(watch('royalty_fee')) || 0 : 0;
  const advance = Number(watch('advance')) || 0;

  // ponytail: default in-house vendor once when empty; user can edit freely after
  useEffect(() => {
    if (decorationType === 'in_house' && !decoratorVendor?.trim()) {
      setValue('decorator_vendor', 'Raju');
    }
  }, [decorationType, decoratorVendor, setValue]);

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
        kitchen_required: values.kitchen_required === 'yes',
        kitchen_amount: Number(values.kitchen_amount ?? 0),
        decoration_type: values.decoration_type as DecorationType,
        decorator_vendor: values.decorator_vendor?.trim() || null,
        decoration_amount: Number(values.decoration_amount ?? 0),
        royalty_fee: Number(values.royalty_fee ?? 0),
        advance: Number(values.advance ?? 0),
        payment_date: values.payment_date,
      });

      if (result.ok) {
        if (fromInquiryId) {
          try {
            await linkInquiryToBooking(fromInquiryId, result.booking.id);
          } catch (err) {
            toast.error(toErrorMessage(err, 'Booking saved but inquiry could not be linked'));
            navigate(`/booking/${result.booking.id}`);
            return;
          }
        }
        toast.success(fromInquiryId ? 'Booking created and inquiry converted' : 'Booking created');
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

          <SelectInput label="Kitchen Required?" error={errors.kitchen_required?.message} {...register('kitchen_required')}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </SelectInput>
          {kitchenRequired === 'yes' && (
            <TextInput
              label="Kitchen Amount (₹)"
              type="number"
              inputMode="decimal"
              min={0}
              error={errors.kitchen_amount?.message}
              {...register('kitchen_amount')}
            />
          )}

          <SelectInput label="Decoration Type" error={errors.decoration_type?.message} {...register('decoration_type')}>
            <option value="not_required">Not Required</option>
            <option value="in_house">In-house</option>
            <option value="outside">Outside</option>
          </SelectInput>
          {decorationType === 'outside' && (
            <TextInput
              label="Royalty Fee (₹)"
              type="number"
              inputMode="decimal"
              min={0}
              error={errors.royalty_fee?.message}
              {...register('royalty_fee')}
            />
          )}
          {decorationType === 'in_house' && (
            <>
              <TextInput
                label="Decorator Vendor Name"
                placeholder="Raju"
                error={errors.decorator_vendor?.message}
                {...register('decorator_vendor')}
              />
              <TextInput
                label="Decoration Amount (₹, optional)"
                type="number"
                inputMode="decimal"
                min={0}
                error={errors.decoration_amount?.message}
                {...register('decoration_amount')}
              />
            </>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">Financial Details</h2>
          <TextInput
            label="Hall Booking Amount (₹)"
            type="number"
            inputMode="decimal"
            min={0}
            error={errors.budget?.message}
            {...register('budget')}
          />
          <TextInput
            label="Advance Received (₹)"
            type="number"
            inputMode="decimal"
            min={0}
            error={errors.advance?.message}
            {...register('advance')}
          />
          <TextInput
            label="Payment Collection Date"
            type="date"
            error={errors.payment_date?.message}
            {...register('payment_date')}
          />
          <FinancialSummary
            hallAmount={budget}
            kitchenAmount={kitchenAmount}
            decorationAmount={decorationAmount}
            royaltyFee={royaltyFee}
            advanceReceived={advance}
            collected={advance}
          />
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
            ? (() => {
                const total = calcTotalBookingValue({
                  budget: Number(confirming.budget),
                  kitchen_required: confirming.kitchen_required === 'yes',
                  kitchen_amount: Number(confirming.kitchen_amount ?? 0),
                  decoration_type: confirming.decoration_type as DecorationType,
                  decoration_amount: Number(confirming.decoration_amount ?? 0),
                  royalty_fee: Number(confirming.royalty_fee ?? 0),
                });
                return `Save booking for ${confirming.customer_name} on ${confirming.booking_date} (${confirming.booking_slot})? Total ${formatCurrency(total)}, advance ${formatCurrency(Number(confirming.advance ?? 0))}.`;
              })()
            : ''
        }
        confirmLabel="Save Booking"
        onConfirm={() => confirming && doSubmit(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
