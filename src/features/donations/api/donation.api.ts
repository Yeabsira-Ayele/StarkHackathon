import axios from 'axios';
import { api } from '../../../api/axios.ts';
import { toGeezNumber } from '../../../services/utils/currencyUtils.ts';
import { Campaign, ContributionCertificate } from '../../../types/index.ts';
import {
  Donation,
  CreateDonationPayload,
  DonationSummaryStats,
  CampaignPayoutAccount,
} from '../types/donation.types';
import { getBankById } from '../data/banks.data';
interface BackendCampaign {
  _id: string;
  title: string;
  creatorName: string;
  organizationName?: string;
  location?: string;
  impactMetric?: string;
}

interface BackendDonation {
  _id: string;
  campaignId: BackendCampaign | string;
  donorId?: string;
  amount: number;
  donorName: string;
  donorEmail?: string;
  bankId?: string;
  anonymous?: boolean;
  message?: string;
  paymentStatus: string;
  provider?: string;
  receiptKey?: string;
  certificateId?: string;
  createdAt: string;
}

interface DonationResponse {
  donation: BackendDonation;
}

function isVerifiedDonation(donation: BackendDonation): boolean {
  return donation.paymentStatus === 'completed';
}

function toDonation(donation: BackendDonation): Donation {
  if (!isVerifiedDonation(donation)) {
    throw new Error('Donation was not successfully verified.');
  }
  const campaign = typeof donation.campaignId === 'string' ? undefined : donation.campaignId;

  return {
    id: donation._id,
    campaignId: campaign?._id || String(donation.campaignId),
    donorId: donation.donorId,
    campaignTitle: campaign?.title,
    beneficiaryName: campaign?.organizationName || campaign?.creatorName,
    amount: donation.amount,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    anonymous: Boolean(donation.anonymous),
    message: donation.message,
    bankId: donation.bankId || donation.provider || '',
    bankName: getBankById(donation.bankId || '')?.shortName || donation.bankId || donation.provider,
    status: 'successful',
    createdAt: donation.createdAt,
    certificateId: donation.certificateId,
    paymentRail: undefined,
    transactionReference: donation.receiptKey,
  };
}

function toCertificate(donation: Donation): ContributionCertificate {
  return {
    certificateId: donation.certificateId || '',
    donationId: donation.id,
    campaignId: donation.campaignId,
    campaignTitle: donation.campaignTitle || 'Campaign title unavailable',
    organizationName: donation.beneficiaryName || 'Beneficiary unavailable',
    donorName: donation.donorName,
    amount: donation.amount,
    amountGeEz: `${toGeezNumber(donation.amount)} : ብር`,
    currency: 'ETB',
    impactSummary: 'Impact details are unavailable.',
    location: 'Location unavailable',
    issuedAt: donation.verifiedAt || donation.createdAt,
    transactionRef: donation.reference || donation.transactionReference || '',
  };
}

export { toGeezNumber };

export const donationApi = {
  async getCampaignPayoutAccounts(campaignId: string): Promise<CampaignPayoutAccount[]> {
    const response = await api.get<{ accounts: CampaignPayoutAccount[] }>(
      `/campaigns/${campaignId}/donation-accounts`,
    );
    return response.data.accounts.map((account) => ({
      ...account,
      bankName: account.bankName === account.bankId
        ? getBankById(account.bankId)?.name.en || account.bankName
        : account.bankName,
    }));
  },

  async createDonation(payload: CreateDonationPayload): Promise<Donation> {
    const { campaignId, ...donationPayload } = payload;
    const response = await api.post<DonationResponse>(`/donations/${campaignId}`, donationPayload, {
      timeout: 190_000,
    });
    return toDonation(response.data.donation);
  },

  async getDonationDetails(donationId: string): Promise<Donation | null> {
    const response = await api.get<DonationResponse>(`/donations/record/${donationId}`);
    return toDonation(response.data.donation);
  },

  async getMyContributions(): Promise<{ donations: Donation[]; stats: DonationSummaryStats }> {
    const response = await api.get<{ donations: BackendDonation[] }>('/users/me/donations');
    const donations = response.data.donations.filter(isVerifiedDonation).map(toDonation);
    return {
      donations,
      stats: {
        totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
        totalDonationsCount: donations.length,
        causesSupportedCount: new Set(donations.map((donation) => donation.campaignId)).size,
        successfulCount: donations.length,
        failedCount: 0,
        largestDonation: donations.reduce((largest, donation) => Math.max(largest, donation.amount), 0),
      },
    };
  },

  async getPatronCertificates(): Promise<ContributionCertificate[]> {
    const { donations } = await this.getMyContributions();
    return donations
      .filter((donation) => donation.certificateId)
      .map(toCertificate);
  },

  async getCertificate(certificateId: string): Promise<ContributionCertificate | null> {
    const { donations } = await this.getMyContributions();
    const donation = donations.find((item) => item.certificateId === certificateId);
    return donation ? toCertificate(donation) : null;
  },
};
