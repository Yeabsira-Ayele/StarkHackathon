import { useEffect, useState } from 'react';
import type { Fundraiser } from '../types/fundraiser.types.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';

export function useFundraiser(id: string, reloadKey = 0) {
  const [data, setData] = useState<Fundraiser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    fundraisingApi.getById(id).then((f) => {
      if (alive) {
        setData(f);
        setIsLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  return { data, isLoading };
}
