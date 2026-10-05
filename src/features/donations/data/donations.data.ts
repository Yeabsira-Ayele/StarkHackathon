import { PaymentRail } from '../types/donation.types';

export const PRESET_DONATION_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

export const PAYMENT_RAILS_CONFIG: Array<{
  id: PaymentRail;
  name: {
    am: string;
    en: string;
    om: string;
  };
  provider: string;
  badge: string;
  instant: boolean;
}> = [
  {
    id: 'telebirr',
    name: {
      am: 'ቴሌብር (Telebirr)',
      en: 'Telebirr SuperApp',
      om: 'Telebirr',
    },
    provider: 'Ethio Telecom',
    badge: '1-Sec Instant Clearing',
    instant: true,
  },
  {
    id: 'cbe',
    name: {
      am: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
      en: 'Commercial Bank of Ethiopia',
      om: 'Baankii Daldala Itoophiyaa',
    },
    provider: 'Commercial Bank of Ethiopia',
    badge: 'Nationwide Escrow',
    instant: false,
  },
  {
    id: 'cbe_birr',
    name: {
      am: 'ሲቢኢ ብር (CBE Birr)',
      en: 'CBE Birr Wallet',
      om: 'CBE Birr',
    },
    provider: 'Commercial Bank of Ethiopia',
    badge: 'Direct Mobile Wallet',
    instant: true,
  },
  {
    id: 'boa',
    name: {
      am: 'አቢሲንያ ባንክ (BOA)',
      en: 'Bank of Abyssinia',
      om: 'Baankii Abisiiniyaa',
    },
    provider: 'Bank of Abyssinia',
    badge: 'Apollo & Retail Direct',
    instant: false,
  },
  {
    id: 'awash',
    name: {
      am: 'አዋሽ ባንክ (Awash)',
      en: 'Awash Bank Wire',
      om: 'Baankii Hawaas',
    },
    provider: 'Awash International Bank',
    badge: 'Direct Bank Wire',
    instant: false,
  },
  {
    id: 'chapa',
    name: {
      am: 'ቻፓ ክፍያ (Chapa Gateway)',
      en: 'Chapa Payments',
      om: 'Kaffaltii Chapa',
    },
    provider: 'Chapa Financial Technologies',
    badge: 'Visa / Mastercard / Local Banks',
    instant: true,
  },
  {
    id: 'bank_card',
    name: {
      am: 'ቀጥታ የባንክ ዝውውር (Direct Rail)',
      en: 'Direct Bank Wire (RTGS)',
      om: 'Dabarsa Baankii Kallattii',
    },
    provider: 'National Bank of Ethiopia Network',
    badge: 'Institutional Wire',
    instant: false,
  },
];
