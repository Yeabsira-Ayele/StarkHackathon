import React, { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import type { CampaignPayoutAccount } from '../types/donation.types';

interface BankAccountDetailsProps {
  account: CampaignPayoutAccount;
  amount: number;
  donorName: string;
  onProceedToReference: () => void;
  onBack: () => void;
}

export const BankAccountDetails: React.FC<BankAccountDetailsProps> = ({
  account,
  amount,
  onProceedToReference,
  onBack,
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    window.setTimeout(() => setCopyState('idle'), 2500);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-white">Campaign payment details</h3>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Transfer directly to the account saved by this fundraiser. The account details are campaign-specific.
        </p>
      </div>
      <div className="space-y-4 rounded border-2 border-[#1E4D38] bg-[#FFFDF9] p-6 dark:bg-[#12100E]">
        <div>
          <span className="block text-[10px] font-bold uppercase text-zinc-500">Receiving institution</span>
          <strong className="text-lg">{account.bankName}</strong>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y py-4">
          <div>
            <span className="block text-[10px] font-bold uppercase text-zinc-500">Account number</span>
            <strong className="select-all text-xl tracking-wider">{account.accountNumber}</strong>
          </div>
          <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded border px-4 py-2 font-bold">
            {copyState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copyState === 'copied' ? 'Copied' : 'Copy account'}
          </button>
          {copyState === 'error' && <span role="alert" className="text-red-700">Could not copy. Select and copy the number manually.</span>}
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase text-zinc-500">Account holder</span>
          <strong>{account.accountName}</strong>
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase text-zinc-500">Transfer amount</span>
          <strong>{amount.toLocaleString()} ETB</strong>
        </div>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">
        After transferring, continue to submit the receipt URL. The backend verifies the receipt before confirming your donation.
      </p>
      <div className="flex justify-between gap-3 border-t pt-4">
        <button type="button" onClick={onBack} className="rounded border px-4 py-2 font-bold">← CHANGE ACCOUNT</button>
        <button type="button" onClick={onProceedToReference} className="inline-flex items-center gap-2 rounded bg-[#1E4D38] px-5 py-3 font-bold text-white">
          CONTINUE TO RECEIPT <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
