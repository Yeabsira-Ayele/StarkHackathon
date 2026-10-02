import type { CampaignCategory } from '../../campaigns/types/campaign.types.ts';

// Ids match Member 1's CampaignCategory type exactly.
export const CATEGORIES: { id: CampaignCategory; name: string }[] = [
  { id: 'medical', name: 'Medical' },
  { id: 'education', name: 'Education' },
  { id: 'emergency', name: 'Emergency' },
  { id: 'water', name: 'Clean water' },
  { id: 'environment', name: 'Environment' },
  { id: 'community', name: 'Community' },
  { id: 'other', name: 'Other' },
];
