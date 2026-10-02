import { api } from '../../../api/axios';
import {
  Donation,
  CreateDonationPayload,
  SubmitReferencePayload,
  ContributionCertificate,
  DonationSummaryStats,
  DonationSubmitPayload,
  VerificationResult,
} from '../types/donation.types';
import { mockBanks, Bank, getBankById } from '../data/banks.data';
import { INITIAL_MOCK_DONATIONS } from '../data/donations.data';
import { campaignApi } from '../../campaigns/api/campaign.api';

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

const DONATIONS_STORAGE_KEY = 'lewegene_donations_history';
const VAULT_STORAGE_KEY = 'lewegene_certificates_vault';

function getStoredDonations(): Donation[] {
  try {
    const stored = localStorage.getItem(DONATIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading donations from storage', err);
  }
  // Initialize with mock donations
  try {
    localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DONATIONS));
  } catch {}
  return [...INITIAL_MOCK_DONATIONS];
}

function saveStoredDonations(donations: Donation[]) {
  try {
    localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donations));
  } catch (err) {
    console.error('Failed saving donations to storage', err);
  }
}

/**
 * Simulates a Links.et verification call for mock/demo purposes.
 * In the real backend, this is handled server-side — the frontend never calls Links.et directly.
 * The backend receives the reference via POST /donations/:donationId/verify, calls Links.et,
 * and returns the result to the frontend.
 *
 * This mock randomly resolves to confirmed (~75%) or failed (~25%) after a short delay
 * to simulate the near-instant verification behavior.
 */
async function simulateLinksEtVerification(
  donation: Donation,
  reference: string
): Promise<{ status: 'confirmed' | 'failed'; verification: VerificationResult }> {
  // Simulate a 1–2 second delay for the Links.et API call
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Mock: ~75% chance of success for demo purposes
  const isSuccess = Math.random() < 0.75;

  if (isSuccess) {
    return {
      status: 'confirmed',
      verification: {
        verifiedAt: new Date().toISOString(),
        verifiedAmount: donation.amount,
        verifiedSender: donation.donorName.toUpperCase(),
        failureReason: null,
      },
    };
  }

  // Randomly pick a failure reason
  const failureReasons = [
    `Reference not found. The transaction reference "${reference}" could not be matched against the issuing bank records.`,
    `Amount mismatch. Expected ${donation.amount.toLocaleString()} ETB but the verified transaction amount differs.`,
    `Transaction expired. The reference "${reference}" refers to a transaction older than the allowed verification window.`,
  ];
  const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

  return {
    status: 'failed',
    verification: {
      verifiedAt: null,
      verifiedAmount: null,
      verifiedSender: null,
      failureReason: reason,
    },
  };
}

export const donationApi = {
  /**
   * Endpoint: GET /banks
   * Retrieves available supported Ethiopian banks and payment rails
   */
  async getBanks(): Promise<Bank[]> {
    try {
      const response = await api.get<{ success: boolean; data: Bank[] }>('/banks');
      if (response.data?.data) return response.data.data;
    } catch {
      // Mock fallback
    }
    return mockBanks;
  },

  /**
   * Endpoint: POST /donations
   * Creates a new pending donation record with donor and bank information
   */
  async createDonation(payload: CreateDonationPayload): Promise<Donation> {
    try {
      const response = await api.post<{ success: boolean; data: Donation }>('/donations', payload);
      if (response.data?.data) return response.data.data;
    } catch {
      // Mock fallback
    }

    const bank = getBankById(payload.bankId) || mockBanks[0];
    let campaignTitle = 'Community Cause';
    let beneficiaryName = 'Verified Beneficiary';

    try {
      const camp = await campaignApi.getCampaignById(payload.campaignId);
      if (camp) {
        campaignTitle = camp.title;
        beneficiaryName = camp.organizationName || camp.creatorName || beneficiaryName;
      }
    } catch {
      // ignore
    }

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      campaignId: payload.campaignId,
      campaignTitle,
      beneficiaryName,
      amount: payload.amount,
      donorName: payload.anonymous
        ? 'Anonymous Patron'
        : (payload.donorName?.trim() || 'Anonymous Patron'),
      donorEmail: payload.donorEmail,
      donorPhone: payload.donorPhone,
      anonymous: payload.anonymous,
      message: payload.message,
      bankId: bank.id,
      bankName: bank.name.en,
      accountNumber: bank.accountNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending',
      paymentRail: (bank.code.toLowerCase() as any) || 'telebirr',
    };

    const currentList = getStoredDonations();
    saveStoredDonations([newDonation, ...currentList]);

    return newDonation;
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
    try {
      const response = await api.post<{ success: boolean; data: Donation }>(
        `/donations/${donationId}/verify`,
        payload
      );
      if (response.data?.data) return response.data.data;
    } catch {
      // Mock fallback — simulate Links.et verification locally
    }

    const currentList = getStoredDonations();
    const index = currentList.findIndex((d) => d.id === donationId);

    if (index === -1) {
      throw new Error('Donation not found');
    }

    // First, set status to 'verifying' while we simulate the Links.et call
    currentList[index] = {
      ...currentList[index],
      reference: payload.reference,
      proofUrl: payload.proofUrl,
      transactionReference: payload.reference,
      status: 'verifying',
    };
    saveStoredDonations(currentList);

    // Simulate Links.et verification (1–2 second delay)
    const verificationResult = await simulateLinksEtVerification(
      currentList[index],
      payload.reference
    );

    const certificateId = verificationResult.status === 'confirmed'
      ? `LW-ETB-${Math.floor(100000 + Math.random() * 900000)}`
      : undefined;

    const updated: Donation = {
      ...currentList[index],
      status: verificationResult.status,
      verification: verificationResult.verification,
      verifiedAt: verificationResult.verification.verifiedAt || undefined,
      certificateId,
      paymentStatus: verificationResult.status === 'confirmed' ? 'completed' : 'failed',
    };

    currentList[index] = updated;
    saveStoredDonations(currentList);

    // On confirmed: record contribution to campaign raisedAmount and create certificate
    if (verificationResult.status === 'confirmed') {
      try {
        await campaignApi.recordContribution(updated.campaignId, updated.amount);
      } catch {}

      // Create and save certificate
      const cert: ContributionCertificate = {
        certificateId: certificateId!,
        donationId: updated.id,
        campaignId: updated.campaignId,
        campaignTitle: updated.campaignTitle || 'Civic Cause',
        organizationName: updated.beneficiaryName || 'Verified Civil Society Partner',
        donorName: updated.donorName,
        amount: updated.amount,
        amountGeEz: `${toGeezNumber(updated.amount)} ብር`,
        currency: 'ETB',
        impactSummary: 'Direct citizen escrow support.',
        location: 'Addis Ababa, Ethiopia',
        issuedAt: new Date().toISOString(),
        transactionRef: payload.reference,
        paymentRail: updated.bankName || 'Direct Bank Escrow',
        status: updated.status,
      };

      try {
        const existingVault = localStorage.getItem(VAULT_STORAGE_KEY);
        const vaultList = existingVault ? JSON.parse(existingVault) : [];
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify([cert, ...vaultList]));
      } catch {}
    }

    return updated;
  },

  /**
   * Endpoint: GET /donations/:donationId
   * Retrieves full details of a specific donation
   */
  async getDonationDetails(donationId: string): Promise<Donation | null> {
    try {
      const response = await api.get<{ success: boolean; data: Donation }>(
        `/donations/${donationId}`
      );
      if (response.data?.data) return response.data.data;
    } catch {
      // Mock fallback
    }

    const list = getStoredDonations();
    const found = list.find((d) => d.id === donationId);
    return found || null;
  },

  /**
   * Endpoint: GET /users/me/donations
   * Retrieves logged-in user's donation history and impact summary
   */
  async getMyContributions(): Promise<{
    donations: Donation[];
    stats: DonationSummaryStats;
  }> {
    try {
      const response = await api.get<{
        success: boolean;
        data: { donations: Donation[]; stats: DonationSummaryStats };
      }>('/users/me/donations');
      if (response.data?.data) return response.data.data;
    } catch {
      // Mock fallback
    }

    const donations = getStoredDonations();
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueCauses = new Set(donations.map((d) => d.campaignId)).size;
    const confirmedCount = donations.filter((d) => d.status === 'confirmed').length;
    const pendingCount = donations.filter((d) => d.status === 'pending').length;
    const verifyingCount = donations.filter((d) => d.status === 'verifying').length;
    const failedCount = donations.filter((d) => d.status === 'failed').length;
    const largestDonation = donations.reduce((max, d) => Math.max(max, d.amount), 0);

    return {
      donations,
      stats: {
        totalAmount,
        totalDonationsCount: donations.length,
        causesSupportedCount: uniqueCauses,
        confirmedCount,
        pendingCount,
        verifyingCount,
        failedCount,
        largestDonation,
      },
    };
  },

  /**
   * Admin Fallback: Manually confirm a donation.
   * This is the exception path for edge cases where Links.et verification fails or
   * is inconclusive, and an admin needs to manually override and confirm/reject.
   * This is NOT the default path every donation goes through — the default is
   * automatic verification via Links.et through POST /donations/:donationId/verify.
   */
  async confirmDonation(donationId: string): Promise<Donation> {
    const list = getStoredDonations();
    const idx = list.findIndex((d) => d.id === donationId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'confirmed',
        paymentStatus: 'completed',
        verifiedAt: new Date().toISOString(),
        verification: {
          verifiedAt: new Date().toISOString(),
          verifiedAmount: list[idx].amount,
          verifiedSender: list[idx].donorName.toUpperCase(),
          failureReason: null,
        },
      };
      saveStoredDonations(list);
      return list[idx];
    }
    throw new Error('Donation not found');
  },

  /**
   * Admin Fallback: Reject a donation that Links.et couldn't conclusively verify.
   * Kept for edge cases only — not part of the normal donor-facing flow.
   */
  async rejectDonation(donationId: string, reason: string): Promise<Donation> {
    const list = getStoredDonations();
    const idx = list.findIndex((d) => d.id === donationId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'failed',
        paymentStatus: 'failed',
        verification: {
          ...list[idx].verification,
          verifiedAt: null,
          verifiedAmount: null,
          verifiedSender: null,
          failureReason: reason || 'Manually rejected by admin.',
        },
      };
      saveStoredDonations(list);
      return list[idx];
    }
    throw new Error('Donation not found');
  },

  /**
   * Backward Compatibility: submitDonation
   */
  async submitDonation(payload: DonationSubmitPayload): Promise<{
    certificate: ContributionCertificate;
    donation: Donation;
  }> {
    const bankId = payload.bankId || 'bank_telebirr';
    const donation = await this.createDonation({
      campaignId: payload.campaignId,
      amount: payload.amount,
      donorName: payload.donorName,
      donorEmail: payload.donorEmail,
      anonymous: !!payload.anonymous,
      bankId,
      message: payload.message,
    });

    const updated = await this.submitPaymentReference(donation.id, {
      donationId: donation.id,
      reference: payload.reference || `TXN-${Date.now()}`,
    });

    const certificate: ContributionCertificate = {
      certificateId: updated.certificateId || `LW-ETB-${Math.floor(100000 + Math.random() * 900000)}`,
      donationId: updated.id,
      campaignId: updated.campaignId,
      campaignTitle: updated.campaignTitle || 'Solidarity Cause',
      organizationName: updated.beneficiaryName || 'Verified Civil Society Partner',
      donorName: updated.donorName,
      amount: updated.amount,
      amountGeEz: `${toGeezNumber(updated.amount)} ብር`,
      currency: 'ETB',
      impactSummary: 'Direct citizen escrow support.',
      location: 'Addis Ababa, Ethiopia',
      issuedAt: new Date().toISOString(),
      transactionRef: updated.reference || `TX-${Date.now()}`,
      paymentRail: updated.bankName || 'Direct Escrow',
      status: updated.status,
    };

    return { certificate, donation: updated };
  },

  /**
   * Fetch patron's stored certificates (backward compatibility)
   */
  async getPatronCertificates(): Promise<ContributionCertificate[]> {
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  },
};
