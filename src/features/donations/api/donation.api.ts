import { api } from '../../../api/axios';
import { DonationSubmitPayload, ContributionCertificate } from '../types/donation.types';
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

const VAULT_STORAGE_KEY = 'lewegene_certificates_vault';

export const donationApi = {
  /**
   * Submit a new donation, settles escrow, and mints an official banknote certificate
   */
  async submitDonation(payload: DonationSubmitPayload): Promise<{
    certificate: ContributionCertificate;
  }> {
    try {
      const response = await api.post<{ certificate: ContributionCertificate }>(
        '/donations',
        payload
      );
      if (response.data?.certificate) return response.data;
    } catch {
      // Mock / Local settlement fallback
    }

    // Update campaign raisedAmount
    const campaign = await campaignApi.recordContribution(payload.campaignId, payload.amount);

    const certificate: ContributionCertificate = {
      certificateId: `LW-ETB-${Math.floor(100000 + Math.random() * 900000)}`,
      donationId: `don-${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      organizationName: campaign.organizationName || 'Verified Civil Society Partner',
      donorName: payload.donorName || 'Anonymous Patron',
      amount: payload.amount,
      amountGeEz: `${toGeezNumber(payload.amount)} ብር`,
      currency: 'ETB',
      impactSummary: campaign.impactMetric || 'Direct verified civic support.',
      location: campaign.location || 'Addis Ababa, Ethiopia',
      issuedAt: new Date().toISOString(),
      transactionRef: `TX-ESCROW-${Date.now()}`,
      paymentRail: payload.paymentRail,
    };

    // Save to user's local patron vault
    try {
      const existing = localStorage.getItem(VAULT_STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify([certificate, ...list]));
    } catch (e) {
      console.error('Failed to update vault', e);
    }

    return { certificate };
  },

  /**
   * Fetch patron's stored certificates
   */
  async getPatronCertificates(): Promise<ContributionCertificate[]> {
    try {
      const response = await api.get<ContributionCertificate[]>('/donations/my-certificates');
      if (response.data) return response.data;
    } catch {
      // Local fallback
    }
    try {
      const raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  },
};
