import { Donation, PaymentRail } from '../types/donation.types';

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

/**
 * Mock donation records covering all four statuses in the Links.et verification flow:
 *   - confirmed: Links.et verified successfully
 *   - pending:   donation created, reference not yet submitted
 *   - verifying: reference submitted, Links.et verification in progress
 *   - failed:    Links.et could not verify (with failureReason), donor can resubmit
 */
export const INITIAL_MOCK_DONATIONS: Donation[] = [
  // ── Confirmed: Links.et verified successfully ──
  {
    id: 'don-1001',
    campaignId: 'camp-101',
    campaignTitle: 'Urgent Pediatric Heart Surgery for Bethlehem at Tikur Anbessa',
    beneficiaryName: 'Bethlehem (Tikur Anbessa)',
    amount: 2500,
    donorName: 'Dr. Yosef Hailu',
    donorEmail: 'yosef.h@ethiohealth.org',
    anonymous: false,
    message: 'Wishing quick recovery and complete health to Bethlehem!',
    bankId: 'bank_cbe',
    bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '1000284920194',
    reference: 'FT260849214',
    status: 'confirmed',
    verification: {
      verifiedAt: '2026-03-24T16:00:00Z',
      verifiedAmount: 2500,
      verifiedSender: 'YOSEF HAILU',
      failureReason: null,
    },
    createdAt: '2026-03-24T14:32:00Z',
    verifiedAt: '2026-03-24T16:00:00Z',
    certificateId: 'LW-ETB-849201',
    paymentStatus: 'completed',
    paymentRail: 'cbe',
    transactionReference: 'FT260849214',
  },
  // ── Confirmed: anonymous donor, verified via Links.et ──
  {
    id: 'don-1002',
    campaignId: 'camp-102',
    campaignTitle: 'Emergency Drought Relief & Clean Water Tankers for Borena Pastoralists',
    beneficiaryName: 'Borena Pastoralist Households',
    amount: 1000,
    donorName: 'Anonymous Patron',
    donorEmail: 'patron.eth@gmail.com',
    anonymous: true,
    message: 'In deep solidarity with our brothers and sisters in Borena.',
    bankId: 'bank_telebirr',
    bankName: 'Telebirr (Ethio Telecom)',
    accountNumber: '584920',
    reference: 'TB94821034',
    status: 'confirmed',
    verification: {
      verifiedAt: '2026-03-25T09:15:32Z',
      verifiedAmount: 1000,
      verifiedSender: 'ANONYMOUS',
      failureReason: null,
    },
    createdAt: '2026-03-25T09:15:00Z',
    verifiedAt: '2026-03-25T09:15:32Z',
    certificateId: 'LW-ETB-593021',
    paymentStatus: 'completed',
    paymentRail: 'telebirr',
    transactionReference: 'TB94821034',
  },
  // ── Pending: donation created, reference not yet submitted ──
  {
    id: 'don-1003',
    campaignId: 'camp-103',
    campaignTitle: 'Community Solar Pump for Farmers Cooperative in Wolaita',
    beneficiaryName: 'Damot Farmers Cooperative',
    amount: 500,
    donorName: 'Almaz Tadesse',
    donorEmail: 'almaz.tadesse@gmail.com',
    anonymous: false,
    message: 'For sustainable agriculture and green energy in Wolaita.',
    bankId: 'bank_abyssinia',
    bankName: 'Bank of Abyssinia',
    accountNumber: '84739201',
    status: 'pending',
    createdAt: '2026-03-28T11:00:00Z',
    paymentStatus: 'pending',
    paymentRail: 'boa',
  },
  // ── Confirmed: diaspora donation, verified via Links.et ──
  {
    id: 'don-1004',
    campaignId: 'camp-101',
    campaignTitle: 'Urgent Pediatric Heart Surgery for Bethlehem at Tikur Anbessa',
    beneficiaryName: 'Bethlehem (Tikur Anbessa)',
    amount: 5000,
    donorName: 'Ethiopian Diaspora Solidarity Circle',
    donorEmail: 'diaspora.circle@lewegene.org',
    anonymous: false,
    message: 'Standing with Bethlehem from abroad. With love and prayers.',
    bankId: 'bank_awash',
    bankName: 'Awash Bank',
    accountNumber: '01320849201900',
    reference: 'AWI-9382104',
    status: 'confirmed',
    verification: {
      verifiedAt: '2026-03-26T18:40:18Z',
      verifiedAmount: 5000,
      verifiedSender: 'ETHIOPIAN DIASPORA SOLIDARITY CIRCLE',
      failureReason: null,
    },
    createdAt: '2026-03-26T18:40:00Z',
    verifiedAt: '2026-03-26T18:40:18Z',
    certificateId: 'LW-ETB-201948',
    paymentStatus: 'completed',
    paymentRail: 'awash',
    transactionReference: 'AWI-9382104',
  },
  // ── Failed: Links.et could not verify — reference not found ──
  {
    id: 'don-1005',
    campaignId: 'camp-102',
    campaignTitle: 'Emergency Drought Relief & Clean Water Tankers for Borena Pastoralists',
    beneficiaryName: 'Borena Pastoralist Households',
    amount: 750,
    donorName: 'Kidist Mekonnen',
    donorEmail: 'kidist.m@outlook.com',
    anonymous: false,
    message: 'Praying for rain and relief for the Borena community.',
    bankId: 'bank_cbe',
    bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '1000284920194',
    reference: 'FT260INVALID',
    status: 'failed',
    verification: {
      verifiedAt: null,
      verifiedAmount: null,
      verifiedSender: null,
      failureReason: 'Reference not found. The transaction reference "FT260INVALID" could not be matched against the issuing bank records.',
    },
    createdAt: '2026-03-29T08:20:00Z',
    paymentStatus: 'failed',
    paymentRail: 'cbe',
    transactionReference: 'FT260INVALID',
  },
  // ── Failed: Links.et detected amount mismatch ──
  {
    id: 'don-1006',
    campaignId: 'camp-103',
    campaignTitle: 'Community Solar Pump for Farmers Cooperative in Wolaita',
    beneficiaryName: 'Damot Farmers Cooperative',
    amount: 2000,
    donorName: 'Bereket Abera',
    donorEmail: 'bereket.a@gmail.com',
    anonymous: false,
    bankId: 'bank_telebirr',
    bankName: 'Telebirr (Ethio Telecom)',
    accountNumber: '584920',
    reference: 'TB99001122',
    status: 'failed',
    verification: {
      verifiedAt: null,
      verifiedAmount: 200,
      verifiedSender: 'BEREKET ABERA',
      failureReason: 'Amount mismatch. Expected 2,000 ETB but the verified transaction amount is 200 ETB.',
    },
    createdAt: '2026-03-29T14:05:00Z',
    paymentStatus: 'failed',
    paymentRail: 'telebirr',
    transactionReference: 'TB99001122',
  },
  // ── Verifying: reference just submitted, Links.et call in progress ──
  {
    id: 'don-1007',
    campaignId: 'camp-101',
    campaignTitle: 'Urgent Pediatric Heart Surgery for Bethlehem at Tikur Anbessa',
    beneficiaryName: 'Bethlehem (Tikur Anbessa)',
    amount: 1500,
    donorName: 'Hana Girma',
    donorEmail: 'hana.girma@icloud.com',
    anonymous: false,
    message: 'Every child deserves a healthy heart.',
    bankId: 'bank_cbe',
    bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '1000284920194',
    reference: 'FT260998877',
    status: 'verifying',
    createdAt: '2026-03-30T10:45:00Z',
    paymentStatus: 'pending',
    paymentRail: 'cbe',
    transactionReference: 'FT260998877',
  },
];
