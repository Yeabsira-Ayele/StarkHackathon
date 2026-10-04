import type { CampaignCategory } from '../../types/index.ts';

export interface CategoryItem {
  id: CampaignCategory | 'all';
  label: string;
  labels: {
    am: string;
    en: string;
    om: string;
  };
  iconName: string;
}

export const CAMPAIGN_CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    label: 'All Causes',
    labels: {
      am: 'ሁሉም ምክንያቶች',
      en: 'All Causes',
      om: 'Dhimmoota Hunda',
    },
    iconName: 'LayoutGrid',
  },
  {
    id: 'medical',
    label: 'Medical & Health',
    labels: {
      am: 'ሕክምናና ጤና',
      en: 'Medical & Health',
      om: 'Fayyinaa fi Yaala',
    },
    iconName: 'HeartPulse',
  },
  {
    id: 'education',
    label: 'Education & Schools',
    labels: {
      am: 'ትምህርትና ዕውቀት',
      en: 'Education & Schools',
      om: 'Barnootaa fi Qorannoo',
    },
    iconName: 'GraduationCap',
  },
  {
    id: 'emergency',
    label: 'Disaster & Relief',
    labels: {
      am: 'አደጋና ፈጣን እርዳታ',
      en: 'Disaster & Relief',
      om: 'Balaawwanii fi Gargaarsa',
    },
    iconName: 'AlertTriangle',
  },
  {
    id: 'water',
    label: 'Clean Water',
    labels: {
      am: 'ንፁህ የመጠጥ ውሃ',
      en: 'Clean Water',
      om: 'Bishaan Qulqulluu',
    },
    iconName: 'Droplet',
  },
  {
    id: 'environment',
    label: 'Environment',
    labels: {
      am: 'አካባቢ ጥበቃ',
      en: 'Environment',
      om: 'Naannoo fi Qilleensa',
    },
    iconName: 'Trees',
  },
  {
    id: 'community',
    label: 'Community Support',
    labels: {
      am: 'ማኅበራዊ ልማት',
      en: 'Community Support',
      om: 'Hawaasaa fi Misooma',
    },
    iconName: 'Users',
  },
  {
    id: 'business',
    label: 'Artisan & Craft',
    labels: {
      am: 'የእጅ ጥበብና ንግድ',
      en: 'Artisan & Craft',
      om: 'Ogummaa fi Daldala',
    },
    iconName: 'Coins',
  },
  {
    id: 'other',
    label: 'Other Causes',
    labels: {
      am: 'ሌሎች ምክንያቶች',
      en: 'Other Causes',
      om: 'Dhimmoota Biroo',
    },
    iconName: 'MoreHorizontal',
  },
];

export const FUNDRAISING_CATEGORIES: { id: CampaignCategory; name: string }[] = [
  { id: 'medical', name: 'Medical' },
  { id: 'education', name: 'Education' },
  { id: 'emergency', name: 'Emergency' },
  { id: 'water', name: 'Clean water' },
  { id: 'environment', name: 'Environment' },
  { id: 'community', name: 'Community' },
  { id: 'business', name: 'Artisan & Craft' },
  { id: 'other', name: 'Other' },
];
