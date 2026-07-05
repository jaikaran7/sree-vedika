import { useCallback, useEffect, useState } from 'react';
import {
  createPayment as createPaymentApi,
  fetchPaymentsByBooking,
  toErrorMessage,
  updatePayment as updatePaymentApi,
} from '../lib/api';
import type { Payment, PaymentType } from '../lib/types';

export function usePayments(bookingId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await fetchPaymentsByBooking(bookingId);
      setPayments(data);
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addPayment = useCallback(
    async (input: { amount: number; payment_type: PaymentType; notes?: string }) => {
      if (!bookingId) return;
      await createPaymentApi({ booking_id: bookingId, ...input });
      await refetch();
    },
    [bookingId, refetch],
  );

  const editPayment = useCallback(
    async (paymentId: string, input: { amount: number; payment_type: PaymentType; notes?: string }) => {
      await updatePaymentApi(paymentId, input);
      await refetch();
    },
    [refetch],
  );

  return { payments, loading, error, refetch, addPayment, editPayment };
}
