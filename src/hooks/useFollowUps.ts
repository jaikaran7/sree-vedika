import { useCallback, useEffect, useState } from 'react';
import { createFollowUp as createFollowUpApi, fetchFollowUps, toErrorMessage } from '../lib/api';
import type { FollowUp } from '../lib/types';

export function useFollowUps(inquiryId: string | undefined) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!inquiryId) return;
    setError(null);
    try {
      const data = await fetchFollowUps(inquiryId);
      setFollowUps(data);
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load follow-ups'));
    } finally {
      setLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addFollowUp = useCallback(
    async (input: Parameters<typeof createFollowUpApi>[0]) => {
      const result = await createFollowUpApi(input);
      await refetch();
      return result;
    },
    [refetch],
  );

  return { followUps, loading, error, refetch, addFollowUp };
}
