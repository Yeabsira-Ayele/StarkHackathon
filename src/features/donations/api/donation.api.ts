import { campaignApi as localCampaignApi } from '../../../services/api/campaignApi.ts';
import { useAuthStore } from '../../auth/store/auth.store.ts';
import {
  Donation,
  CreateDonationPayload,
  SubmitReferencePayload,
  ContributionCertificate,
  DonationSummaryStats,
  DonationSubmitPayload,
} from '../types/donation.types';
import { mockBanks, Bank } from '../data/banks.data';
import type { Campaign, Donation as CampaignDonation, PaymentRail as CampaignPaymentRail } from '../../../types/index.ts';

const PENDING_KEY = 'lewegene_local_pending_donations';

interface PendingDonation {
  donation: Donation;
  donorId: string;
  message?: string;
}

function getPendingDonations(): PendingDonation[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') as PendingDonation[];
  } catch {
    return [];
  }
}

function savePendingDonations(donations: PendingDonation[]): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(donations));
}

function toCampaignRail(bankId?: string): CampaignPaymentRail {
  if (bankId?.includes('telebirr')) return 'telebirr';
  if (bankId?.includes('cbe')) return 'cbe_birr';
  return 'bank_card';
}

function toDonation(
  campaign: Campaign,
  donation: CampaignDonation,
  bankId?: string,
  reference?: string,
): Donation {
  const bank = mockBanks.find((item) => item.id === bankId) || mockBanks.find((item) => item.id.includes(donation.paymentRail || ''));
  return {
    id: donation.id,
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    beneficiaryName: campaign.organizationName || campaign.creatorName,
    amount: donation.amount,
    donorName: donation.donorName,
    donorId: donation.donorId,
    anonymous: !donation.donorId,
    message: donation.message,
    bankId: bank?.id || 'bank_telebirr',
    bankName: bank?.shortName || 'Demo payment option',
    accountNumber: bank?.accountNumber,
    reference: reference || donation.transactionReference,
    status: donation.paymentStatus === 'completed' ? 'confirmed' : 'pending',
    createdAt: donation.createdAt,
    certificateId: donation.certificateId,
    paymentStatus: donation.paymentStatus,
    paymentRail: donation.paymentRail,
    transactionReference: donation.transactionReference,
  };
}

async function completePendingDonation(pending: PendingDonation, reference: string): Promise<Donation> {
  const result = await localCampaignApi.submitDonation(pending.donation.campaignId, {
    amount: pending.donation.amount,
    donorId: pending.donorId,
    donorName: pending.donation.donorName,
    message: pending.message,
    paymentRail: toCampaignRail(pending.donation.bankId),
  });
  const remaining = getPendingDonations().filter((entry) => entry.donation.id !== pending.donation.id);
  savePendingDonations(remaining);
  const campaign = await localCampaignApi.getCampaignById(result.campaign.id);
  return toDonation(campaign, result.donation, pending.donation.bankId, reference);
}

// Ge'ez numeral conversion helper for archival certificate
export function toGeezNumber(num: number): string {
  const ones = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
  const tens = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];
  const hundreds = '፻';
  const tenThousands = '፼';

  if (num <= 0) return '0';
  if (num < 10) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + ones[num % 10];
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rest = num % 100;
    const prefix = h === 1 ? '' : ones[h];
    return prefix + hundreds + (rest > 0 ? toGeezNumber(rest) : '');
  }
  if (num < 10000) {
    const th = Math.floor(num / 100);
    const rest = num % 100;
    return toGeezNumber(th) + hundreds + (rest > 0 ? toGeezNumber(rest) : '');
  }
  const tt = Math.floor(num / 10000);
  const rest = num % 10000;
  return toGeezNumber(tt) + tenThousands + (rest > 0 ? toGeezNumber(rest) : '');
}

export const donationApi = {
  /**
   * Endpoint: GET /banks
   * Retrieves available supported Ethiopian banks and payment rails
   */
  async getBanks(): Promise<Bank[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return mockBanks;
  },

  /**
   * Endpoint: POST /donations
   * Creates a new pending donation record with donor and bank information
   */
  async createDonation(payload: CreateDonationPayload): Promise<Donation> {
    const user = useAuthStore.getState().user;
    if (!Number.isFinite(payload.amount) || payload.amount < 50) {
      throw new Error('Contribution amount must be at least 50 ETB.');
    }
    const bank = mockBanks.find((item) => item.id === payload.bankId);
    if (!bank) throw new Error('Choose one of the available demo payment options.');
    await new Promise((resolve) => setTimeout(resolve, 180));
    const donation: Donation = {
      id: `local-donation-${crypto.randomUUID()}`,
      campaignId: payload.campaignId,
      amount: payload.amount,
      donorName: payload.anonymous ? 'Anonymous Patron' : (payload.donorName || user?.name || 'Guest Donor'),
      donorId: user?.id || 'demo-guest',
      donorEmail: payload.donorEmail,
      anonymous: payload.anonymous,
      message: payload.message,
      bankId: bank.id,
      bankName: bank.shortName,
      accountNumber: bank.accountNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    savePendingDonations([...getPendingDonations(), { donation, donorId: user?.id || 'demo-guest', message: payload.message }]);
    return donation;
  },

  /**
   * Endpoint: POST /donations/:donationId/verify
   * Submits the donor's payment reference and triggers automatic verification via Links.et.
   *
   * IMPORTANT: The backend (not the frontend) is responsible for actually calling Links.et.
   * The frontend only submits the reference and displays whatever status comes back.
   * This replaces the old POST /donations/:donationId/reference endpoint — same idea
   * (donor submits their reference), but now this call triggers the backend's Links.et
   * verification and returns a result (confirmed/failed), not just storing the reference
   * for later manual review.
   */
  async submitPaymentReference(
    donationId: string,
    payload: SubmitReferencePayload
  ): Promise<Donation> {
    const pending = getPendingDonations().find((entry) => entry.donation.id === donationId);
    if (!pending) throw new Error('This local contribution draft could not be found. Restart the contribution flow.');
    if (!payload.reference.trim()) throw new Error('Enter a demo reference to continue.');
    await new Promise((resolve) => setTimeout(resolve, 450));
    return completePendingDonation(pending, payload.reference.trim());
  },

  async submitVerifiedReceipt(
    campaignId: string,
    payload: { receiptUrl: string; donorName?: string; message?: string },
  ) {
    throw new Error(`Receipt verification is not available in this frontend prototype for campaign ${campaignId}.`);
  },

  /**
   * Endpoint: GET /donations/:donationId
   * Retrieves full details of a specific donation
   */
  async getDonationDetails(donationId: string): Promise<Donation | null> {
    const pending = getPendingDonations().find((entry) => entry.donation.id === donationId);
    if (pending) return pending.donation;
    const campaigns = await localCampaignApi.getAllCampaigns();
    for (const campaign of campaigns) {
      const donation = campaign.donations?.find((item) => item.id === donationId);
      if (donation) return toDonation(campaign, donation);
    }
    return null;
  },

  /**
   * Endpoint: GET /users/me/donations
   * Retrieves logged-in user's donation history and impact summary
   */
  async getMyContributions(): Promise<{
    donations: Donation[];
    stats: DonationSummaryStats;
  }> {
    const userId = useAuthStore.getState().user?.id;
    const campaigns = await localCampaignApi.getAllCampaigns();
    const donations = campaigns.flatMap((campaign) =>
      (campaign.donations || [])
        .filter((donation) => !!userId && donation.donorId === userId)
        .map((donation) => toDonation(campaign, donation)),
    );
    const pending = getPendingDonations()
      .filter((entry) => !!userId && entry.donorId === userId)
      .map((entry) => entry.donation);
    const records = [...pending, ...donations];
    const completed = donations.filter((donation) => donation.status === 'confirmed');
    const stats: DonationSummaryStats = {
      totalAmount: completed.reduce((total, donation) => total + donation.amount, 0),
      totalDonationsCount: records.length,
      causesSupportedCount: new Set(records.map((donation) => donation.campaignId)).size,
      confirmedCount: completed.length,
      pendingCount: pending.length,
      verifyingCount: 0,
      failedCount: donations.filter((donation) => donation.status === 'failed').length,
      largestDonation: completed.reduce((largest, donation) => Math.max(largest, donation.amount), 0),
    };
    return { donations: records, stats };
  },

  /**
   * Admin Fallback: Manually confirm a donation.
   * This is the exception path for edge cases where Links.et verification fails or
   * is inconclusive, and an admin needs to manually override and confirm/reject.
   * This is NOT the default path every donation goes through — the default is
   * automatic verification via Links.et through POST /donations/:donationId/verify.
   */
  async confirmDonation(donationId: string): Promise<Donation> {
    const pending = getPendingDonations().find((entry) => entry.donation.id === donationId);
    if (!pending) throw new Error('No local pending contribution was found.');
    return completePendingDonation(pending, `DEMO-${Date.now()}`);
  },

  /**
   * Admin Fallback: Reject a donation that Links.et couldn't conclusively verify.
   * Kept for edge cases only — not part of the normal donor-facing flow.
   */
  async rejectDonation(donationId: string, reason: string): Promise<Donation> {
    const pending = getPendingDonations().find((entry) => entry.donation.id === donationId);
    if (!pending) throw new Error(`No local pending contribution was found. ${reason}`);
    savePendingDonations(getPendingDonations().filter((entry) => entry.donation.id !== donationId));
    return { ...pending.donation, status: 'failed' };
  },

  /**
   * Backward Compatibility: submitDonation
   */
  async submitDonation(payload: DonationSubmitPayload): Promise<{
    certificate: ContributionCertificate;
    donation: Donation;
  }> {
    const userId = useAuthStore.getState().user?.id;
    const result = await localCampaignApi.submitDonation(payload.campaignId, {
      amount: payload.amount,
      donorId: userId || 'demo-guest',
      donorName: payload.donorName,
      message: payload.message,
      paymentRail: toCampaignRail(payload.bankId || payload.paymentRail),
    });
    const campaign = await localCampaignApi.getCampaignById(result.campaign.id);
    return { certificate: result.certificate, donation: toDonation(campaign, result.donation) };
  },

  /**
   * Fetch patron's stored certificates (backward compatibility)
   */
  async getPatronCertificates(): Promise<ContributionCertificate[]> {
    const { donations } = await this.getMyContributions();
    const certificates = await Promise.all(
      donations
        .filter((donation) => donation.certificateId)
        .map((donation) => localCampaignApi.getCertificate(donation.certificateId!)),
    );
    return certificates.filter((certificate): certificate is ContributionCertificate => !!certificate);
  },
};
