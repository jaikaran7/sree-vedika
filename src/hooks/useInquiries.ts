import { useCallback, useEffect, useState } from 'react';
import {
  createInquiry as createInquiryApi,
  fetchAllInquiries,
  toErrorMessage,
} from '../lib/api';

export function useInquiries() {
  const [inquiries, setInquiries] = useState<Awaited<ReturnType<typeof fetchAllInquiries>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAllInquiries();
      setInquiries(data);
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load inquiries'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createInquiry = useCallback(
    async (input: Parameters<typeof createInquiryApi>[0]) => {
      const result = await createInquiryApi(input);
      if (result.ok) await refetch();
      return result;
    },
    [refetch],
  );

  return { inquiries, loading, error, refetch, createInquiry };
}
