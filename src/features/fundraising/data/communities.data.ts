// MOCK communities. Organizations come from the shared data/mockOrganizations.ts (not copied here).
export interface Community {
  id: string;
  name: string;
}

export const COMMUNITIES: Community[] = [
  { id: 'com-201', name: 'Kolfe Keranio Neighbourhood Idir' },
  { id: 'com-202', name: 'Bole Diaspora Support Circle' },
  { id: 'com-203', name: 'Gondar University Alumni Association' },
];
