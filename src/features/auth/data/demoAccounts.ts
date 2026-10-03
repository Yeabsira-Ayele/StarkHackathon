import type { User } from '../types/auth.types.ts';

export type DemoRole = 'donor' | 'fundraiser' | 'admin';

export const DEMO_ACCOUNTS: Record<DemoRole, User> = {
  donor: {
    id: 'demo-donor-001',
    name: 'Mimi Bekele',
    email: 'donor@demo.lewegene',
    phone: '+251 91 234 5678',
    role: 'donor',
    verified: true,
    totalDonated: 4250,
    certificatesCount: 4,
    createdAt: '2025-05-12T09:00:00.000Z',
  },
  fundraiser: {
    id: 'demo-fundraiser-001',
    name: 'Mimi Community Initiative',
    email: 'fundraiser@demo.lewegene',
    phone: '+251 92 345 6789',
    role: 'foundation',
    verified: true,
    organizationId: 'org-102',
    organizationName: 'Sidama Youth & Education Initiative',
    createdAt: '2025-01-20T09:00:00.000Z',
  },
  admin: {
    id: 'demo-admin-001',
    name: 'Lewegene Demo Admin',
    email: 'admin@demo.lewegene',
    phone: '+251 11 000 0000',
    role: 'admin',
    verified: true,
    createdAt: '2024-01-01T09:00:00.000Z',
  },
};

export const DEMO_SESSION_TOKEN = 'lewegene-local-demo-session';
