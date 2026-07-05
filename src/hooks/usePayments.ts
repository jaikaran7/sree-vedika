import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Payment, PaymentType } from '../lib/types';

export function usePayments(bookingId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!bookingId) return;
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setPayments(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
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
      const { error: insertError } = await supabase.from('payments').insert({
        booking_id: bookingId,
        amount: input.amount,
        payment_type: input.payment_type,
        notes: input.notes || null,
      });
      if (insertError) throw insertError;
      await refetch();
    },
    [bookingId, refetch],
  );

  const editPayment = useCallback(
    async (paymentId: string, input: { amount: number; payment_type: PaymentType; notes?: string }) => {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ amount: input.amount, payment_type: input.payment_type, notes: input.notes || null })
        .eq('id', paymentId);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch],
  );

  return { payments, loading, error, refetch, addPayment, editPayment };
}
