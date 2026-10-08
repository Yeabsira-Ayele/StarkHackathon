import React, { useState } from 'react';
import { ArrowRight, Check, Copy, Heart, ShieldCheck } from 'lucide-react';
import type { ContributionCertificate } from '../../types/index.ts';
import { useCampaignPayoutAccounts, useCreateDonation } from '../../features/donations/hooks/useDonations';
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
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('500');
  const [donorName, setDonorName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const account = accounts.find((item) => item.accountId === selectedAccountId);
  const submitting = createDonation.isPending;

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
      const donation = await createDonation.mutateAsync({
        campaignId,
        amount: numericAmount,
        receiptUrl: receiptUrl.trim(),
        payoutAccountId: account.accountId,
        donorName: anonymous ? 'Anonymous' : donorName.trim() || 'Anonymous',
        anonymous,
        bankId: account.bankId,
        message: message.trim() || undefined,
      });
      if (donation.status !== 'successful' || !donation.certificateId) {
        setFormError(
          donation.verification?.failureReason
            || donation.verifiedPayment?.failureReason
            || 'Links.et did not return a successful verification result.',
        );
        return;
      }
      onDonationSuccess({
        certificateId: donation.certificateId,
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
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-3 text-primary"
            >
              <option value="">Select an account</option>
              {accounts.map((item) => (
                <option key={item.accountId} value={item.accountId}>
                  {item.bankName} — {item.accountName} ({item.accountNumber})
                </option>
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
            <input required type="number" min="50" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg border border-border bg-surface p-3 text-primary" />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Donor name</span>
            <input value={donorName} disabled={anonymous} onChange={(event) => setDonorName(event.target.value)} className="w-full rounded-lg border border-border bg-surface p-3 text-primary disabled:opacity-50" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            Donate anonymously
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Message (optional)</span>
            <input maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full rounded-lg border border-border bg-surface p-3 text-primary" />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-primary">Actual payment receipt URL</span>
            <input required type="url" value={receiptUrl} onChange={(event) => setReceiptUrl(event.target.value)} placeholder="Paste the receipt link provided after transfer" className="w-full rounded-lg border border-border bg-surface p-3 text-primary" />
          </label>
        </>
      )}
      {formError && <p role="alert" className="rounded border border-red-500/40 bg-red-500/10 p-3 text-red-700">{formError}</p>}
      <div className="space-y-2 border-t border-border-subtle pt-4">
        <button
          disabled={submitting || isLoading || isError || accounts.length === 0}
          type="submit"
          aria-busy={submitting}
          className="group relative flex min-h-16 w-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-[#B88B45] bg-[#173C32] px-4 py-3 text-left text-[#F7F4EB] shadow-[0_5px_14px_rgba(23,60,50,0.18),inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1E4D38] hover:shadow-[0_9px_18px_rgba(23,60,50,0.22)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88B45] focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] rounded-[9px] border border-[#D8B066]/35" />
          <span className="relative flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D8B066]/50 bg-white/5 text-[#D8B066] transition-transform duration-200 group-hover:scale-105">
              <Heart className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-bold tracking-wide sm:text-base">
                {submitting ? 'Verifying your donation…' : 'Complete donation'}
              </span>
              <span className="mt-0.5 block text-[11px] text-[#F7F4EB]/75">
                Secure receipt verification
              </span>
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="relative h-5 w-5 shrink-0 text-[#D8B066] transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
          <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-accent" />
          Your receipt is verified before your donation is recorded.
        </p>
      </div>
    </form>
  );
};
