import { useEffect, useState } from 'react';
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

  useEffect(() => {
    let active = true;
    organizationService.list()
      .then((orgs) => {
        if (!active) return;
        setData(orgs
          .filter((org) => org.verified && org.verificationStatus === 'approved')
          .map((org) => ({ id: org.id, name: org.name, kind: 'organization' as const })));
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Could not load organizations.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading, error };
}
