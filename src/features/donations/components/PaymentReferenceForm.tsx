import React, { useState } from 'react';
import { ArrowRight, Link2, Loader2, ShieldCheck } from 'lucide-react';
import { isValidReceiptUrl } from '../../../services/payment/linksetService.ts';

interface PaymentReferenceFormProps {
  bankName: string;
  amount: number;
  donorName: string;
  receiptUrl?: string;
  isSubmitting: boolean;
  onChangeReceiptUrl?: (url: string) => void;
  onSubmit: (receiptUrlToSubmit?: string) => void | Promise<void>;
  onBack: () => void;
}

export const PaymentReferenceForm: React.FC<PaymentReferenceFormProps> = ({
  bankName,
  amount,
  receiptUrl: initialReceiptUrl = '',
  isSubmitting,
  onChangeReceiptUrl,
  onSubmit,
  onBack,
}) => {
  const [localReceiptUrl, setLocalReceiptUrl] = useState(initialReceiptUrl);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanUrl = localReceiptUrl.trim();
    if (!cleanUrl) {
      setUrlError('Enter the receipt URL from your actual completed transfer.');
      return;
    }
    if (!isValidReceiptUrl(cleanUrl)) {
      setUrlError('This receipt host is not supported. Use the actual receipt URL issued by your payment provider.');
      return;
    }
    setUrlError(null);
    onSubmit(cleanUrl);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" /> Receipt verification
        </div>
        <h3 className="font-serif text-2xl font-black">Submit payment receipt</h3>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Enter the real receipt URL for your {bankName} transfer. The backend will verify the transaction before confirming the donation.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-2 border-border bg-surface-alt p-4">
        <span className="font-bold">{bankName}</span>
        <span className="font-black">{amount.toLocaleString()} ETB</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="payment-receipt-url" className="block font-bold uppercase">Payment receipt URL</label>
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 shrink-0" />
          <input
            id="payment-receipt-url"
            type="url"
            required
            value={localReceiptUrl}
            onChange={(event) => {
              setLocalReceiptUrl(event.target.value);
              onChangeReceiptUrl?.(event.target.value);
              setUrlError(null);
            }}
            placeholder="Paste the receipt URL provided after your transfer"
            className="w-full border-2 border-border bg-background p-3"
          />
        </div>
        {urlError && <p role="alert" className="text-red-600">{urlError}</p>}
        {isSubmitting && (
          <p role="status" className="flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" /> Verifying receipt with the configured payment verifier…
          </p>
        )}
        <div className="flex justify-between gap-3 border-t pt-4">
          <button type="button" onClick={onBack} disabled={isSubmitting} className="rounded border px-4 py-2 font-bold disabled:opacity-50">← BACK</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">
            {isSubmitting ? 'VERIFYING…' : 'VERIFY RECEIPT'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
