import { INITIAL_ORGANIZATIONS } from '../../../data/mockOrganizations.ts';
import { COMMUNITIES } from '../data/communities.data.ts';

export interface OrganizationOption {
  id: string;
  name: string;
  kind: 'organization' | 'community';
}

export function useOrganizations() {
  const data: OrganizationOption[] = [
    ...INITIAL_ORGANIZATIONS.filter((o) => o.verified).map((o) => ({ id: o.id, name: o.name, kind: 'organization' as const })),
    ...COMMUNITIES.map((c) => ({ id: c.id, name: c.name, kind: 'community' as const })),
  ];
  return { data, isLoading: false };
}
