import axios from 'axios';
import { api } from '../../../api/axios.ts';
import { toGeezNumber } from '../../../services/utils/currencyUtils.ts';
import { Campaign, ContributionCertificate } from '../../../types/index.ts';
import {
  Donation,
  CreateDonationPayload,
  SubmitReferencePayload,
  SubmitReceiptPayload,
  DonationSummaryStats,
  DonationSubmitPayload,
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
  requestedAmount?: number;
  amount: number;
  donorName: string;
  donorEmail?: string;
  bankId?: string;
  anonymous?: boolean;
  message?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  provider?: string;
  receiptKey?: string;
  certificateId?: string;
  createdAt: string;
}

interface DonationResponse {
  donation: BackendDonation;
  stats?: DonationSummaryStats;
}

function toDonation(donation: BackendDonation): Donation {
  const campaign = typeof donation.campaignId === 'string' ? undefined : donation.campaignId;
  const status = donation.paymentStatus === 'completed'
    ? 'confirmed'
    : donation.paymentStatus === 'failed'
      ? 'failed'
      : 'pending';

  return {
    id: donation._id,
    campaignId: campaign?._id || String(donation.campaignId),
    donorId: donation.donorId,
    campaignTitle: campaign?.title,
    beneficiaryName: campaign?.organizationName || campaign?.creatorName,
    amount: donation.paymentStatus === 'completed' ? donation.amount : donation.requestedAmount || donation.amount,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    anonymous: Boolean(donation.anonymous),
    message: donation.message,
    bankId: donation.bankId || donation.provider || '',
    bankName: getBankById(donation.bankId || '')?.shortName || donation.bankId || donation.provider,
    status,
    createdAt: donation.createdAt,
    certificateId: donation.certificateId,
    paymentStatus: donation.paymentStatus,
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
    const response = await api.post<DonationResponse>('/donations/drafts', payload);
    return toDonation(response.data.donation);
  },

  async submitReceiptVerification(
    donationId: string,
    payload: SubmitReceiptPayload,
  ): Promise<Donation> {
    const response = await api.post<DonationResponse>(`/donations/records/${donationId}/verify`, {
      receiptUrl: payload.receiptUrl,
    });
    return toDonation(response.data.donation);
  },

  async submitPaymentReference(
    donationId: string,
    payload: SubmitReferencePayload,
  ): Promise<Donation> {
    return this.submitReceiptVerification(donationId, {
      donationId,
      receiptUrl: payload.reference,
      proofUrl: payload.proofUrl,
    });
  },

  async getDonationDetails(donationId: string): Promise<Donation | null> {
    const response = await api.get<DonationResponse>(`/donations/record/${donationId}`);
    return toDonation(response.data.donation);
  },

  async getMyContributions(): Promise<{ donations: Donation[]; stats: DonationSummaryStats }> {
    const response = await api.get<{ donations: BackendDonation[]; stats: DonationSummaryStats }>('/users/me/donations');
    return { donations: response.data.donations.map(toDonation), stats: response.data.stats };
  },

  async confirmDonation(_donationId: string): Promise<Donation> {
    throw new Error('Manual donation confirmation is an admin operation and is not available from this screen.');
  },

  async rejectDonation(_donationId: string, _reason: string): Promise<Donation> {
    throw new Error('Manual donation rejection is an admin operation and is not available from this screen.');
  },

  async submitDonation(payload: DonationSubmitPayload): Promise<{
    certificate: ContributionCertificate;
    donation: Donation;
  }> {
    throw new Error(`Submit a bank receipt link to verify the ${payload.amount.toLocaleString()} ETB contribution.`);
  },

  async getPatronCertificates(): Promise<ContributionCertificate[]> {
    const { donations } = await this.getMyContributions();
    return donations
      .filter((donation) => donation.status === 'confirmed' && donation.certificateId)
      .map(toCertificate);
  },

  async getCertificate(certificateId: string): Promise<ContributionCertificate | null> {
    const { donations } = await this.getMyContributions();
    const donation = donations.find((item) => item.certificateId === certificateId);
    return donation ? toCertificate(donation) : null;
  },
};
