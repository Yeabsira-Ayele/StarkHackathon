import React, { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { ContributionCertificate, PaymentRail } from '../../types/index.ts';
import { ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';

export interface DonateFormProps {
  campaignId: string;
  campaignTitle: string;
  impactMetric?: string;
  onDonationSuccess: (cert: ContributionCertificate) => void;
  onSubmit: (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => Promise<any>;
}

export const DonateForm: React.FC<DonateFormProps> = ({
  campaignTitle,
  impactMetric,
  onSubmit,
  onDonationSuccess,
}) => {
  const PRESET_AMOUNTS = [100, 250, 500, 1000, 5000];

  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [paymentRail, setPaymentRail] = useState<PaymentRail>('telebirr');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0) {
      setError('Please select or enter a valid donation amount (minimum 1 ETB).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSubmit({
        amount: effectiveAmount,
        donorName: isAnonymous ? 'Anonymous Patron' : donorName || 'Anonymous Patron',
        message: message.trim() || undefined,
        paymentRail,
      });

      if (res && res.certificate) {
        onDonationSuccess(res.certificate);
      }

      // Reset
      setMessage('');
      setCustomAmount('');
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const railOptions = [
    { value: 'telebirr', label: 'Telebirr (Ethio Telecom)' },
    { value: 'cbe_birr', label: 'CBE Birr (Commercial Bank of Ethiopia)' },
    { value: 'bank_card', label: 'Debit / Credit Card (Local or Diaspora)' },
    { value: 'chapa', label: 'Chapa Gateway' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Preset Banknote Amount Buttons */}
      <div>
        <label className="block text-xs font-semibold text-primary mb-2">
          Select Contribution Amount (ETB)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt && !customAmount;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`py-2 px-1 text-center rounded-lg border transition-all tabular-nums cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-[#1C1A17] font-bold border-accent shadow-xs'
                    : 'bg-surface text-primary border-border hover:bg-surface-alt'
                }`}
              >
                <span className="block text-xs font-bold">{amt.toLocaleString()} ETB</span>
                <span className="block text-[10px] text-zinc-400 font-ethiopic">{toGeezNumber(amt)} : ብር</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <Input
          label="Or enter custom amount in Birr:"
          type="number"
          min="1"
          placeholder="e.g. 10000"
          value={customAmount}
          onChange={handleCustomChange}
          suffix="ETB"
        />
      </div>

      {/* Real-time Contribution Review Summary */}
      <div className="p-3.5 rounded-xl border border-[#B08A45]/40 bg-[#F7F4EB] dark:bg-zinc-800/60 space-y-1.5 select-none">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-medium">Your Contribution:</span>
          <span className="font-display font-bold text-accent text-sm tabular-nums">
            {effectiveAmount.toLocaleString()} ETB ({toGeezNumber(effectiveAmount)} : ብር)
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-zinc-500">
          <span>Platform Fee:</span>
          <span className="text-emerald-600 font-semibold">0% (100% to cause)</span>
        </div>
        {impactMetric && (
          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 pt-1 border-t border-[#D8CEBA]/50 dark:border-[#313C36]/50">
            <span className="font-semibold text-accent">Direct Impact: </span>
            {impactMetric}
          </p>
        )}
      </div>

      {/* Payment Rail */}
      <div>
        <Select
          label="Select Local Payment Rail"
          options={railOptions}
          value={paymentRail}
          onChange={(e) => setPaymentRail(e.target.value as PaymentRail)}
        />
      </div>

      {/* Donor Name & Anonymous Toggle */}
      <div className="space-y-2">
        <Input
          label="Your Full Name (for Archival Certificate)"
          placeholder="e.g. Dawit Alemayehu"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          disabled={isAnonymous}
        />

        <label className="flex items-center gap-2 cursor-pointer pt-0.5">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded text-accent focus:ring-accent"
          />
          <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Contribute anonymously on public ledger
          </span>
        </label>
      </div>

      {/* Heartfelt Note / Message */}
      <div>
        <label className="block text-xs font-semibold text-primary mb-1">
          Words of Encouragement (optional)
        </label>
        <textarea
          rows={2}
          placeholder="Egziabher yimarat / Standing with you with love..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-primary text-xs focus:ring-1 focus:ring-accent leading-relaxed"
        />
      </div>

      {error && (
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Confirm Button */}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full font-bold shadow-sm"
        isLoading={isSubmitting}
        icon={<Award className="w-4 h-4 text-[#1C1A17]" />}
      >
        Confirm Contribution &amp; Issue Certificate
      </Button>
    </form>
  );
};
