import { User } from '../types/auth.types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-donor-01',
    name: 'አቤል ተፈራ (Abel Tefera)',
    email: 'abel.tefera@gmail.com',
    phone: '+251911223344',
    role: 'donor',
    verified: true,
    totalDonated: 12500,
    certificatesCount: 4,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'usr-foundation-01',
    name: 'ዶ/ር አለምነህ ታደሰ (Rotary Addis Central)',
    email: 'alemneh@rotaryaddis.org',
    phone: '+251922334455',
    role: 'foundation',
    organizationId: 'org-rotary-eth',
    verified: true,
    createdAt: '2023-11-10T08:30:00Z',
  },
  {
    id: 'usr-admin-01',
    name: 'ACSO Compliance Desk (የሲቪል ማኅበራት ዴስክ)',
    email: 'oversight@acso.gov.et',
    role: 'admin',
    verified: true,
    createdAt: '2023-01-01T00:00:00Z',
  },
];
