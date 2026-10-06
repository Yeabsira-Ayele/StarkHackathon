import React, { useState } from 'react';
import { Check, Copy, Heart } from 'lucide-react';
import type { ContributionCertificate } from '../../types/index.ts';
import { useCampaignPayoutAccounts, useCreateDonation, useSubmitReceiptVerification } from '../../features/donations/hooks/useDonations';
import { isValidReceiptUrl } from '../../services/payment/linksetService.ts';

export interface DonateFormProps {
  campaignId: string;
  campaignTitle: string;
  impactMetric?: string;
  onDonationSuccess: (cert: ContributionCertificate) => void;
}

export const DonateForm: React.FC<DonateFormProps> = ({
  campaignId,
  campaignTitle,
  impactMetric,
  onDonationSuccess,
}) => {
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
    refetch: retryAccounts,
  } = useCampaignPayoutAccounts(campaignId);
  const createDonation = useCreateDonation();
  const verifyReceipt = useSubmitReceiptVerification();
  const [selectedBankId, setSelectedBankId] = useState('');
  const [amount, setAmount] = useState('500');
  const [donorName, setDonorName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [pendingDonationId, setPendingDonationId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const account = accounts.find((item) => item.bankId === selectedBankId);
  const submitting = createDonation.isPending || verifyReceipt.isPending;

  const handleCopy = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
    window.setTimeout(() => setCopyStatus('idle'), 2500);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!account) {
      setFormError('Choose a saved receiving account for this fundraiser.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount < 50) {
      setFormError('The minimum contribution is 50 ETB.');
      return;
    }
    if (!isValidReceiptUrl(receiptUrl.trim())) {
      setFormError('Enter the actual receipt URL from your completed transfer.');
      return;
    }

    setFormError(null);
    try {
      const donationId = pendingDonationId || (await createDonation.mutateAsync({
          campaignId,
          amount: numericAmount,
          donorName: anonymous ? 'Anonymous' : donorName.trim() || 'Anonymous',
          anonymous,
          bankId: account.bankId,
          message: message.trim() || undefined,
        })).id;
      setPendingDonationId(donationId);
      const donation = await verifyReceipt.mutateAsync({
        donationId,
        payload: { donationId, receiptUrl: receiptUrl.trim() },
      });
      onDonationSuccess({
        certificateId: donation.certificateId || '',
        donationId: donation.id,
        campaignId,
        campaignTitle,
        organizationName: donation.beneficiaryName || 'Campaign beneficiary',
        donorName: donation.donorName,
        amount: donation.amount,
        currency: 'ETB',
        impactSummary: impactMetric || 'Your verified contribution supports this campaign.',
        location: 'Ethiopia',
        issuedAt: donation.verifiedAt || donation.createdAt,
        transactionRef: donation.transactionReference || '',
      });
      setReceiptUrl('');
      setMessage('');
      setPendingDonationId(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not submit the donation. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <h3 className="flex items-center gap-2 text-base font-bold text-primary">
        <Heart className="h-4 w-4 text-accent" /> Support this campaign
      </h3>
      {isLoading && <p role="status">Loading saved campaign payment accounts…</p>}
      {isError && (
        <div role="alert" className="rounded border border-red-500/40 bg-red-500/10 p-3 text-red-700">
          Could not load this campaign’s payment accounts. {error instanceof Error ? error.message : ''}
          <button type="button" onClick={() => void retryAccounts()} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}
      {!isLoading && !isError && accounts.length === 0 && (
        <p role="status" className="rounded border border-border p-3 text-zinc-600">
          The fundraiser has not saved a valid receiving account yet. No account details are available for payment.
        </p>
      )}

      {accounts.length > 0 && (
        <>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Campaign receiving account</span>
            <select
              required
              disabled={Boolean(pendingDonationId)}
              value={selectedBankId}
              onChange={(event) => setSelectedBankId(event.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-3 text-primary"
            >
              <option value="">Select an account</option>
              {accounts.map((item) => (
                <option key={item.bankId} value={item.bankId}>{item.bankName} — {item.accountName}</option>
              ))}
            </select>
          </label>
          {account && (
            <div className="space-y-3 rounded-lg border border-border bg-surface-alt p-4">
              <p><span className="text-zinc-500">Account holder: </span><strong>{account.accountName}</strong></p>
              <p><span className="text-zinc-500">Account number: </span><strong className="font-mono">{account.accountNumber}</strong></p>
              <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 font-semibold">
                {copyStatus === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copyStatus === 'copied' ? 'Copied' : 'Copy account details'}
              </button>
              {copyStatus === 'failed' && <p role="alert" className="text-red-700">Could not copy. Select and copy the account number manually.</p>}
            </div>
          )}
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Contribution amount (ETB)</span>
            <input required disabled={Boolean(pendingDonationId)} type="number" min="50" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg border border-border bg-surface p-3 text-primary disabled:opacity-50" />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Donor name</span>
            <input value={donorName} disabled={anonymous || Boolean(pendingDonationId)} onChange={(event) => setDonorName(event.target.value)} className="w-full rounded-lg border border-border bg-surface p-3 text-primary disabled:opacity-50" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" disabled={Boolean(pendingDonationId)} checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            Donate anonymously
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Message (optional)</span>
            <input disabled={Boolean(pendingDonationId)} maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full rounded-lg border border-border bg-surface p-3 text-primary disabled:opacity-50" />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Actual payment receipt URL</span>
            <input required type="url" value={receiptUrl} onChange={(event) => setReceiptUrl(event.target.value)} placeholder="Paste the receipt link provided after transfer" className="w-full rounded-lg border border-border bg-surface p-3 text-primary" />
          </label>
        </>
      )}
      {formError && <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 p-3 text-red-700">{formError}</p>}
      <button
        disabled={submitting || isLoading || isError || accounts.length === 0}
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Verifying donation…' : 'Submit donation'}
      </button>
    </form>
  );
};
