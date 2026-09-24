import React, { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { PaymentRail } from '../../types/index.ts';
import { ShieldCheck, Heart } from 'lucide-react';

export interface DonateFormProps {
  campaignId: string;
  campaignTitle: string;
  onDonationSuccess: (amount: number, donorName: string, rail: PaymentRail) => void;
  onSubmit: (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => Promise<any>;
}

export const DonateForm: React.FC<DonateFormProps> = ({
  onSubmit,
}) => {
  const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000];

  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
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
      await onSubmit({
        amount: effectiveAmount,
        donorName: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
        message: message.trim() || undefined,
        paymentRail,
      });
      // Reset form
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Preset amount buttons */}
      <div>
        <label className="block text-xs font-semibold text-primary mb-2">
          Select Amount (ETB)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((amt) => {
            const isSelected = selectedAmount === amt && !customAmount;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all tabular-nums cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-xs'
                    : 'bg-surface text-primary border-border hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {amt.toLocaleString()} ETB
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

      {/* Payment Rail */}
      <div>
        <Select
          label="Payment Method"
          options={railOptions}
          value={paymentRail}
          onChange={(e) => setPaymentRail(e.target.value as PaymentRail)}
        />
      </div>

      {/* Donor Name & Anonymous Toggle */}
      <div className="space-y-2">
        <Input
          label="Your Full Name (optional)"
          placeholder="e.g. Dawit Alemayehu"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          disabled={isAnonymous}
        />
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span>Give anonymously</span>
        </label>
      </div>

      {/* Encouragement Message */}
      <div>
        <label className="block text-xs font-semibold text-primary mb-1.5">
          Words of Encouragement (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Add a brief note of support..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full text-xs rounded-lg border border-border bg-surface p-2.5 text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
        />
      </div>

      {error && <p className="text-xs font-medium text-error">{error}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full justify-center text-sm font-bold shadow-xs"
        isLoading={isSubmitting}
        icon={<Heart className="w-4 h-4 fill-white/20" />}
      >
        Donate {effectiveAmount > 0 ? `${effectiveAmount.toLocaleString()} ETB` : ''}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
        <span>Direct encrypted settlement via Telebirr & CBE Birr</span>
      </div>
    </form>
  );
};
