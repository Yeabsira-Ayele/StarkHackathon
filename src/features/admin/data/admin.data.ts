import { INITIAL_ORGANIZATIONS } from '../../../data/mockOrganizations.ts';
import {
  ActivityEvent,
  AdminAccount,
  AdminDonation,
  AdminReport,
  AdminSnapshot,
  FundraiserReviewInfo,
  OrgApplication,
  PlatformUser,
} from '../types/admin.types.ts';

export const ADMIN_ALL_PERMISSIONS: AdminAccount['permissions'] = [
  'fundraisers',
  'reports',
  'donations',
  'users',
  'organizations',
  'admins',
];

export const ADMIN_ROLE_LABELS = {
  super_admin: 'Super Admin',
  moderator: 'Moderator',
  finance: 'Finance',
} as const;

export const ADMIN_ROLE_DEFAULT_PERMISSIONS: Record<AdminAccount['role'], AdminAccount['permissions']> = {
  super_admin: ADMIN_ALL_PERMISSIONS,
  moderator: ['fundraisers', 'reports', 'organizations', 'users'],
  finance: ['donations'],
};

export const adminAccounts: AdminAccount[] = [
  {
    id: 'adm-1',
    name: 'Hana Bekele',
    email: 'hana.bekele@lewegene.org',
    role: 'super_admin',
    permissions: ADMIN_ALL_PERMISSIONS,
    status: 'active',
    lastActive: '2026-09-30T08:40:00Z',
  },
  {
    id: 'adm-2',
    name: 'Yared Tesfaye',
    email: 'yared.tesfaye@lewegene.org',
    role: 'moderator',
    permissions: ADMIN_ROLE_DEFAULT_PERMISSIONS.moderator,
    status: 'active',
    lastActive: '2026-09-29T17:05:00Z',
  },
  {
    id: 'adm-3',
    name: 'Liya Girma',
    email: 'liya.girma@lewegene.org',
    role: 'finance',
    permissions: ADMIN_ROLE_DEFAULT_PERMISSIONS.finance,
    status: 'active',
    lastActive: '2026-09-28T12:20:00Z',
  },
];

export const platformUsers: PlatformUser[] = [
  {
    id: 'usr-1', name: 'Dawit Alemayehu', email: 'dawit.a@example.com', phone: '+251 91 120 4412',
    accountType: 'individual', status: 'active', joinedAt: '2026-02-11T09:00:00Z', fundraisers: [],
  },
  {
    id: 'usr-2', name: 'Selamawit Kebede', email: 'selam.k@example.com', phone: '+251 92 331 7788',
    accountType: 'individual', status: 'active', joinedAt: '2026-03-02T11:30:00Z', fundraisers: [],
  },
  {
    id: 'usr-3', name: 'Meron Tadesse', email: 'meron@tikuranbessa.org.et', phone: '+251 11 551 1211',
    accountType: 'organization', status: 'active', joinedAt: '2026-01-19T08:15:00Z',
    fundraisers: [{ id: 'camp-101', title: 'Pediatric Heart Surgery', status: 'approved' }],
  },
  {
    id: 'usr-4', name: 'Abebe Girma', email: 'abebe.g@example.com', phone: '+251 93 410 2290',
    accountType: 'individual', status: 'active', joinedAt: '2026-05-21T14:45:00Z',
    fundraisers: [{ id: 'camp-105', title: 'Community fundraiser (pending review)', status: 'pending' }],
  },
  {
    id: 'usr-5', name: 'Tigist Haile', email: 'tigist.h@example.com', phone: '+251 94 772 6601',
    accountType: 'individual', status: 'active', joinedAt: '2026-06-09T10:10:00Z', fundraisers: [],
  },
  {
    id: 'usr-6', name: 'Sidama Youth & Education Initiative', email: 'contact@sidama-edu.org.et', phone: '+251 46 220 8912',
    accountType: 'organization', status: 'active', joinedAt: '2026-02-03T13:00:00Z',
    fundraisers: [{ id: 'camp-102', title: 'STEM laboratory kits', status: 'approved' }],
  },
  {
    id: 'usr-7', name: 'Kalkidan Wondimu', email: 'kalkidan.w@example.com', phone: '+251 91 889 0034',
    accountType: 'individual', status: 'suspended', joinedAt: '2026-07-14T16:20:00Z', fundraisers: [],
  },
  {
    id: 'usr-8', name: 'Robel Assefa', email: 'robel.a@example.com', phone: '+251 97 145 5520',
    accountType: 'individual', status: 'active', joinedAt: '2026-08-30T09:50:00Z', fundraisers: [],
  },
];

export const adminDonations: AdminDonation[] = [
  { id: 'dn-9001', campaignId: 'camp-101', donorName: 'Dawit Alemayehu', donorEmail: 'dawit.a@example.com', anonymous: false, amount: 15000, bank: 'Commercial Bank of Ethiopia', accountNumber: '1000 2345 6789 0', reference: 'FT26273KQ1P2', status: 'pending', createdAt: '2026-09-30T07:12:00Z' },
  { id: 'dn-9002', campaignId: 'camp-102', donorName: 'Anonymous', donorEmail: 'anon.donor@example.com', anonymous: true, amount: 2500, bank: 'Awash Bank', accountNumber: '0132 8890 4411', reference: 'AWB-7781203', status: 'pending', createdAt: '2026-09-29T19:40:00Z' },
  { id: 'dn-9003', campaignId: 'camp-103', donorName: 'Selamawit Kebede', donorEmail: 'selam.k@example.com', anonymous: false, amount: 5000, bank: 'Bank of Abyssinia', accountNumber: '8841 2230 0015', reference: 'BOA-4412870', status: 'pending', createdAt: '2026-09-29T11:05:00Z' },
  { id: 'dn-9004', campaignId: 'camp-101', donorName: 'Tigist Haile', donorEmail: 'tigist.h@example.com', anonymous: false, amount: 1200, bank: 'Dashen Bank', accountNumber: '5021 7745 0098', reference: 'DSH-0093321', status: 'confirmed', createdAt: '2026-09-27T15:30:00Z' },
  { id: 'dn-9005', campaignId: 'camp-104', donorName: 'Robel Assefa', donorEmail: 'robel.a@example.com', anonymous: false, amount: 8000, bank: 'Commercial Bank of Ethiopia', accountNumber: '1000 2345 6789 0', reference: 'FT26270XZ9A1', status: 'confirmed', createdAt: '2026-09-26T09:10:00Z' },
  { id: 'dn-9006', campaignId: 'camp-102', donorName: 'Anonymous', donorEmail: 'gift.giver@example.com', anonymous: true, amount: 20000, bank: 'Awash Bank', accountNumber: '0132 8890 4411', reference: 'AWB-7779004', status: 'confirmed', createdAt: '2026-09-24T18:00:00Z' },
  { id: 'dn-9007', campaignId: 'camp-103', donorName: 'Kalkidan Wondimu', donorEmail: 'kalkidan.w@example.com', anonymous: false, amount: 900, bank: 'Dashen Bank', accountNumber: '5021 7745 0098', reference: 'DSH-0091102', status: 'rejected', createdAt: '2026-09-22T13:25:00Z', decisionNote: 'Reference not found in bank statement.' },
  { id: 'dn-9008', campaignId: 'camp-104', donorName: 'Abebe Girma', donorEmail: 'abebe.g@example.com', anonymous: false, amount: 3000, bank: 'Bank of Abyssinia', accountNumber: '8841 2230 0015', reference: 'BOA-4410009', status: 'confirmed', createdAt: '2026-09-21T10:45:00Z' },
];

export const adminReports: AdminReport[] = [
  { id: 'rp-501', reporterId: 'usr-5', campaignId: 'camp-101', category: 'False Information', details: 'The hospital named in the story says it has no record of this patient. Please verify the medical documents.', evidence: ['hospital-reply-screenshot.png'], status: 'pending', createdAt: '2026-09-30T06:20:00Z' },
  { id: 'rp-502', reporterId: 'usr-2', campaignId: 'camp-103', category: 'Misleading Content', details: 'The progress shown seems higher than what the donors list suggests. Some amounts look duplicated.', evidence: [], status: 'pending', createdAt: '2026-09-29T14:05:00Z' },
  { id: 'rp-503', reporterId: 'usr-1', campaignId: 'camp-104', category: 'Fraud / Scam', details: 'The account holder name does not match the beneficiary in the story. I suspect this is a scam.', evidence: ['account-name-check.jpg', 'chat-log.pdf'], status: 'reviewed', createdAt: '2026-09-26T08:00:00Z' },
  { id: 'rp-504', reporterId: 'usr-8', campaignId: 'camp-102', category: 'Other', details: 'The deadline on the page has already passed but the cause is still listed as ongoing.', evidence: [], status: 'resolved', createdAt: '2026-09-20T12:40:00Z', resolutionNote: 'Owner contacted; deadline updated.' },
  { id: 'rp-505', reporterId: 'usr-4', campaignId: 'camp-101', category: 'Misleading Content', details: 'Photo looks reused from another website.', evidence: [], status: 'dismissed', createdAt: '2026-09-18T16:10:00Z', resolutionNote: 'Photo confirmed as original by the organization.' },
];

const approvedOrgs: OrgApplication[] = INITIAL_ORGANIZATIONS.map((o, i) => ({
  id: o.id,
  name: o.name,
  organizationType: o.type.replace(/_/g, ' '),
  officialEmail: o.contactEmail,
  phone: o.contactPhone,
  address: o.location,
  description: o.description,
  logoUrl: o.logoUrl,
  representative: { name: 'Authorized Representative', role: 'Director', phone: o.contactPhone },
  bank: { bank: 'Commercial Bank of Ethiopia', accountNumber: `1000 ${4400 + i} 7781 2`, accountName: o.name },
  documents: ['ACSO registration certificate', 'Board resolution letter'],
  status: 'approved',
  submittedAt: `2026-0${1 + (i % 3)}-1${i}T09:00:00Z`,
  activeCauses: o.activeProjectsCount,
  totalRaised: o.totalRaised,
}));

export const organizationApplications: OrgApplication[] = [
  {
    id: 'org-201', name: 'Gambella Mothers Health Network', organizationType: 'charity foundation',
    officialEmail: 'info@gambellamothers.org.et', phone: '+251 47 551 0021', address: 'Gambella Town, Gambella',
    description: 'Mobile antenatal clinics and safe-delivery kits for rural mothers across Gambella.',
    representative: { name: 'Aster Kiros', role: 'Executive Director', phone: '+251 91 700 4412' },
    bank: { bank: 'Commercial Bank of Ethiopia', accountNumber: '1000 8821 4410 3', accountName: 'Gambella Mothers Health Network' },
    documents: ['ACSO registration certificate', 'Authorized representative ID', 'Bank account letter'],
    status: 'pending', submittedAt: '2026-09-29T10:30:00Z', activeCauses: 0, totalRaised: 0,
  },
  {
    id: 'org-202', name: 'Lalibela Heritage Youth Cooperative', organizationType: 'community coop',
    officialEmail: 'contact@lalibela-youth.coop', phone: '+251 33 336 0910', address: 'Lalibela, Amhara',
    description: 'Youth cooperative funding guide training and restoration apprenticeships.',
    representative: { name: 'Mekuria Bogale', role: 'Chairperson', phone: '+251 92 004 1188' },
    bank: { bank: 'Awash Bank', accountNumber: '0132 5501 7723', accountName: 'Lalibela Youth Cooperative' },
    documents: ['Cooperative license'],
    status: 'needs_changes', submittedAt: '2026-09-24T15:00:00Z', activeCauses: 0, totalRaised: 0,
    decisionNote: 'Please upload the representative ID and a bank account letter.',
  },
  {
    id: 'org-203', name: 'Hope Bridge Relief Fund', organizationType: 'registered ngo',
    officialEmail: 'hopebridge.fund@example.com', phone: '+251 91 000 0000', address: 'Addis Ababa',
    description: 'Emergency relief fund.',
    representative: { name: 'Unknown', role: 'N/A', phone: '+251 91 000 0000' },
    bank: { bank: 'Dashen Bank', accountNumber: '5021 0000 0001', accountName: 'Personal account' },
    documents: [],
    status: 'rejected', submittedAt: '2026-09-15T09:10:00Z', activeCauses: 0, totalRaised: 0,
    decisionNote: 'No registration documents; receiving account is personal.',
  },
  ...approvedOrgs,
];

export const seedActivity: ActivityEvent[] = [
  { id: 'ev-1', type: 'report_submitted', message: 'Report submitted: False Information on a cause', actor: 'Tigist Haile', at: '2026-09-30T06:20:00Z', refId: 'rp-501' },
  { id: 'ev-2', type: 'donation_submitted', message: 'Donation of 15,000 ETB submitted', actor: 'Dawit Alemayehu', at: '2026-09-30T07:12:00Z', refId: 'dn-9001' },
  { id: 'ev-3', type: 'organization_registered', message: 'Organization signup: Gambella Mothers Health Network', actor: 'Aster Kiros', at: '2026-09-29T10:30:00Z', refId: 'org-201' },
  { id: 'ev-4', type: 'donation_submitted', message: 'Donation of 2,500 ETB submitted', actor: 'Anonymous', at: '2026-09-29T19:40:00Z', refId: 'dn-9002' },
  { id: 'ev-5', type: 'fundraiser_submitted', message: 'Fundraiser submitted for review', actor: 'Abebe Girma', at: '2026-09-28T13:00:00Z', refId: 'camp-105' },
  { id: 'ev-6', type: 'donation_confirmed', message: 'Donation of 1,200 ETB confirmed', actor: 'Liya Girma', actorIsAdmin: true, at: '2026-09-27T16:10:00Z', refId: 'dn-9004' },
  { id: 'ev-7', type: 'report_reviewed', message: 'Report moved to Reviewed', actor: 'Yared Tesfaye', actorIsAdmin: true, at: '2026-09-26T10:15:00Z', refId: 'rp-503' },
  { id: 'ev-8', type: 'organization_changes_requested', message: 'Changes requested from Lalibela Heritage Youth Cooperative', actor: 'Hana Bekele', actorIsAdmin: true, at: '2026-09-25T09:00:00Z', refId: 'org-202' },
  { id: 'ev-9', type: 'fundraiser_edited', message: 'Fundraiser edit submitted with reason', actor: 'Meron Tadesse', at: '2026-09-24T12:00:00Z', refId: 'camp-101' },
  { id: 'ev-10', type: 'donation_rejected', message: 'Donation of 900 ETB rejected', actor: 'Liya Girma', actorIsAdmin: true, at: '2026-09-23T09:30:00Z', refId: 'dn-9007' },
  { id: 'ev-11', type: 'organization_rejected', message: 'Hope Bridge Relief Fund rejected', actor: 'Hana Bekele', actorIsAdmin: true, at: '2026-09-16T11:00:00Z', refId: 'org-203' },
  { id: 'ev-12', type: 'report_resolved', message: 'Report resolved', actor: 'Yared Tesfaye', actorIsAdmin: true, at: '2026-09-21T14:00:00Z', refId: 'rp-504' },
  { id: 'ev-13', type: 'fundraiser_deleted', message: 'Fundraiser deletion approved', actor: 'Hana Bekele', actorIsAdmin: true, at: '2026-09-19T10:00:00Z' },
  { id: 'ev-14', type: 'user_registered', message: 'New user registered', actor: 'Robel Assefa', at: '2026-08-30T09:50:00Z', refId: 'usr-8' },
  { id: 'ev-15', type: 'admin_action', message: 'Admin account created: Liya Girma', actor: 'Hana Bekele', actorIsAdmin: true, at: '2026-08-10T08:00:00Z' },
];

export const seedSnapshot = (): AdminSnapshot => ({
  users: platformUsers,
  donations: adminDonations,
  reports: adminReports,
  organizations: organizationApplications,
  activity: seedActivity,
  admins: adminAccounts,
  currentAdminId: 'adm-1',
});

// Mock-only: the campaign model has no beneficiary / receiving account / documents yet.
// Generates stable review info for any campaign so the review screen works end to end.
const BANKS = ['Commercial Bank of Ethiopia', 'Awash Bank', 'Bank of Abyssinia', 'Dashen Bank'];
export function getFundraiserReviewInfo(campaignId: string, creatorName: string): FundraiserReviewInfo {
  const n = campaignId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const forSelf = n % 3 === 0;
  return {
    beneficiary: forSelf
      ? { name: creatorName, relation: 'Raising for themselves', phone: '+251 91 200 18' + String(n % 90 + 10) }
      : { name: 'Beneficiary on file', relation: n % 2 ? 'Friend / Family' : 'Community', phone: '+251 92 310 44' + String(n % 90 + 10) },
    receiving: {
      bank: BANKS[n % BANKS.length],
      accountNumber: `1000 ${1000 + (n % 8999)} ${2000 + (n % 7999)} ${n % 9}`,
      accountName: forSelf ? creatorName : 'Beneficiary on file',
    },
    documents: [
      { name: 'Kebele support letter.pdf', kind: 'Kebele support letter' },
      { name: 'Supporting evidence.pdf', kind: 'Supporting evidence' },
    ],
    verificationNotes: forSelf
      ? 'Creator is the beneficiary. Account name matches creator.'
      : 'Relationship to be confirmed. Admin may contact the creator and the beneficiary.',
  };
}
