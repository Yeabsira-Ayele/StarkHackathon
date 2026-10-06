import { useCallback, useEffect, useState } from 'react';
import type { Fundraiser } from '../types/fundraiser.types.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';

export function useMyFundraisers() {
  const [data, setData] = useState<Fundraiser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fundraisingApi.getMine());
    } catch (cause) {
      setData([]);
      setError(cause instanceof Error ? cause : new Error('Could not load fundraisers.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
