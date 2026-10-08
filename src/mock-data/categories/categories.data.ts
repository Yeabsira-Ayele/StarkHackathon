import type { CampaignCategory } from '../../types/index.ts';

export interface CategoryItem {
  id: CampaignCategory | 'all';
  iconName: string;
}

export const CAMPAIGN_CATEGORIES: CategoryItem[] = [
  { id: 'all', iconName: 'LayoutGrid' },
  { id: 'medical', iconName: 'HeartPulse' },
  { id: 'education', iconName: 'GraduationCap' },
  { id: 'emergency', iconName: 'AlertTriangle' },
  { id: 'water', iconName: 'Droplet' },
  { id: 'environment', iconName: 'Trees' },
  { id: 'community', iconName: 'Users' },
  { id: 'business', iconName: 'Coins' },
  { id: 'other', iconName: 'MoreHorizontal' },
];

export const FUNDRAISING_CATEGORIES: { id: CampaignCategory }[] = [
  { id: 'medical' },
  { id: 'education' },
  { id: 'emergency' },
  { id: 'water' },
  { id: 'environment' },
  { id: 'community' },
  { id: 'business' },
  { id: 'other' },
];
