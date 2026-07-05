import { useCallback, useEffect, useState } from 'react';
import { fetchInquiry, toErrorMessage } from '../lib/api';

export function useInquiry(id: string | undefined) {
  const [inquiry, setInquiry] = useState<Awaited<ReturnType<typeof fetchInquiry>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const data = await fetchInquiry(id);
      setInquiry(data);
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load inquiry'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { inquiry, loading, error, refetch };
}
