import { useCallback, useEffect, useState } from 'react';
import type { Fundraiser } from '../types/fundraiser.types.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';

export function useMyFundraisers() {
  const [data, setData] = useState<Fundraiser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setData(await fundraisingApi.getMine());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isLoading, refresh };
}
