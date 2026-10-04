/**
 * Canonical Discover locations for Lewegene
 * Sourced from the Discover page region filter.
 *
 * NOTE: The specification mentions "the same 13 locations as the Discover page".
 * The existing Discover page implementation in BanknoteMasterCanvas defines the 14
 * Ethiopian administrative regions and chartered cities listed below.
 * In accordance with implementation constraints, all 14 entries are preserved verbatim
 * to prevent silent deletion or unilateral administrative assumptions.
 */
export const DISCOVER_LOCATIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Central Ethiopia',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'South Ethiopia',
  "South West Ethiopia Peoples'",
  'Tigray',
] as const;

export type DiscoverLocation = (typeof DISCOVER_LOCATIONS)[number];

export const DEFAULT_LOCATION: DiscoverLocation = 'Addis Ababa';
