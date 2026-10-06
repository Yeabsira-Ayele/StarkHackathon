import { useCallback, useEffect, useRef, useState } from 'react';
import type { Fundraiser } from '../types/fundraiser.types.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';

export function useFundraiser(id: string, reloadKey = 0) {
  const [data, setData] = useState<Fundraiser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestVersion = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++requestVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      const fundraiser = await fundraisingApi.getById(id);
      if (request === requestVersion.current) setData(fundraiser);
    } catch (cause) {
      if (request === requestVersion.current) {
        setData(null);
        setError(cause instanceof Error ? cause : new Error('Could not load fundraiser.'));
      }
    } finally {
      if (request === requestVersion.current) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
    return () => {
      requestVersion.current += 1;
    };
  }, [refresh, reloadKey]);

  return { data, isLoading, error, refresh };
}
