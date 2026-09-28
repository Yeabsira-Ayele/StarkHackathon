import { CampaignCategory } from '../types/campaign.types';

export interface CategoryItem {
  id: CampaignCategory | 'all';
  label: string; // Default label
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
    label: 'Emergency Relief',
    labels: {
      am: 'አስቸኳይ ዕርዳታ',
      en: 'Emergency Relief',
      om: 'Birmannaa Hatattamaa',
    },
    iconName: 'ShieldAlert',
  },
  {
    id: 'water',
    label: 'Clean Water',
    labels: {
      am: 'ንጹሕ መጠጥ ውኃ',
      en: 'Clean Water',
      om: 'Bishaan Qulqulluu',
    },
    iconName: 'Droplets',
  },
  {
    id: 'environment',
    label: 'Ecology & Trees',
    labels: {
      am: 'አካባቢ ጥበቃ',
      en: 'Ecology & Trees',
      om: 'Eegumsa Naannoo',
    },
    iconName: 'Trees',
  },
  {
    id: 'community',
    label: 'Community Building',
    labels: {
      am: 'የማኅበረሰብ ግንባታ',
      en: 'Community Building',
      om: 'Ijaarsa Hawaasaa',
    },
    iconName: 'Users',
  },
];
