import { useEffect, useState } from 'react';
import { organizationService } from '../../../services/organizationService.ts';
import { INITIAL_ORGANIZATIONS } from '../../../data/mockOrganizations.ts';
import { COMMUNITIES } from '../data/communities.data.ts';

export interface OrganizationOption {
  id: string;
  name: string;
  kind: 'organization' | 'community';
}

export function useOrganizations() {
  const [data, setData] = useState<OrganizationOption[]>(() => [
    ...INITIAL_ORGANIZATIONS.filter((o) => o.verified && o.verificationStatus === 'approved').map(
      (o) => ({ id: o.id, name: o.name, kind: 'organization' as const })
    ),
    ...COMMUNITIES.map((c) => ({ id: c.id, name: c.name, kind: 'community' as const })),
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    organizationService.list().then((orgs) => {
      if (!active) return;
      const verified = orgs
        .filter((o) => o.verified && o.verificationStatus === 'approved')
        .map((o) => ({ id: o.id, name: o.name, kind: 'organization' as const }));
      setData([...verified, ...COMMUNITIES.map((c) => ({ id: c.id, name: c.name, kind: 'community' as const }))]);
    });
    return () => {
      active = false;
    };
  }, []);

  return { data, isLoading };
}
