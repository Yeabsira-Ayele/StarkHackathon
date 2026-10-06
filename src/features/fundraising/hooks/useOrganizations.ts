import { useCallback, useEffect, useState } from 'react';
import { organizationService } from '../../../services/organizationService.ts';

export interface OrganizationOption {
  id: string;
  name: string;
  kind: 'organization' | 'community';
}

export function useOrganizations() {
  const [data, setData] = useState<OrganizationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationService.list();
      setData(
        orgs
          .filter((org) => org.verified && org.verificationStatus === 'approved')
          .map((org) => ({ id: org.id, name: org.name, kind: 'organization' as const }))
      );
    } catch (loadError) {
      setData([]);
      setError(loadError instanceof Error ? loadError.message : 'Could not load organizations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
