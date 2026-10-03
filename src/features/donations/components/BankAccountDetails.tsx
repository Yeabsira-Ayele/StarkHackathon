import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bank } from '../data/banks.data';
import { Copy, Check, ExternalLink, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface BankAccountDetailsProps {
  bank: Bank;
  amount: number;
  donorName: string;
  onProceedToReference: () => void;
  onBack: () => void;
}

export const BankAccountDetails: React.FC<BankAccountDetailsProps> = ({
  bank,
  amount,
  donorName,
  onProceedToReference,
  onBack,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'am' | 'om') || 'en';
  const localizedBankName = bank.name[currentLang] || bank.name.en;
  const instructions = [
    'This payment option is shown for interface preview only.',
    'No bank, wallet, or payment provider is connected to this prototype.',
    'Continue with a made-up reference to simulate a local contribution.',
  ];

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('DEMO ONLY - NOT PAYABLE');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
          Demo Payment Options
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          These details are placeholders only. No transfer is initiated or verified. This demo flow records{' '}
          <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
            {amount.toLocaleString()} ETB
          </span>{' '}locally in this browser.
        </p>
      </div>

      {/* Main Bank Account Slate */}
      <div className="p-6 border-2 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#12100E] space-y-4 rounded-[1px] shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#26211C]/15 dark:border-[#9A7432]/30 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[1px] flex items-center justify-center font-black text-sm text-white uppercase shadow-xs"
              style={{ backgroundColor: bank.color }}
            >
              {bank.logoText}
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                SAMPLE ACCOUNT PLACEHOLDER
              </span>
              <h4 className="font-serif font-black text-lg text-[#14110E] dark:text-[#FFFFFF]">
                {localizedBankName}
              </h4>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788] text-[10px] font-black uppercase tracking-widest border border-[#1E4D38]/30">
            DEMO OPTION
          </span>
        </div>

        {/* Account Number Box with 1-Click Copy */}
        <div className="p-4 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] flex flex-wrap items-center justify-between gap-3 rounded-[1px]">
          <div>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 uppercase font-black block">
              DEMO REFERENCE · NOT PAYABLE
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#1E4D38] dark:text-[#52B788] tracking-wider select-all">
              DEMO ONLY - NOT PAYABLE
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all border-2 rounded-[1px] shadow-xs ${
              copied
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-[#1E4D38] bg-[#1E4D38] text-white hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY ACCOUNT NUMBER</span>
              </>
            )}
          </button>
        </div>

        {/* Detailed Account Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/60 dark:bg-[#1C1814]/60">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              RECIPIENT
            </span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              No live recipient is configured.
            </span>
          </div>
          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/60 dark:bg-[#1C1814]/60">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              STATUS
            </span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              Prototype only
            </span>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 pt-2 border-t border-[#26211C]/15 dark:border-[#9A7432]/25">
          <span className="text-[11px] font-black uppercase text-[#14110E] dark:text-[#F4EFE6] block">
            DEMO FLOW EXAMPLE:
          </span>
          <ol className="space-y-1.5 pl-5 list-decimal text-zinc-700 dark:text-zinc-300">
            {instructions.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Helpful Alert */}
      <div className="p-3.5 border border-[#9A7432]/50 bg-[#EFE7D5]/70 dark:bg-[#1E1A16] flex items-start gap-3 text-[11px] text-[#14110E] dark:text-[#E8DEC8]">
        <AlertCircle className="w-4 h-4 text-[#9A7432] shrink-0 mt-0.5" />
        <div>
          <span className="font-black uppercase block">Prototype Notice:</span>
          The sample account and instructions are not payable. Use a made-up reference in the next step; this prototype does not contact a bank or process money.
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15 dark:border-[#9A7432]/30">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#DFD3BC] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] font-bold cursor-pointer hover:bg-[#D5C6AC]"
        >
          ← CHANGE BANK
        </button>

        <button
          type="button"
          onClick={onProceedToReference}
          className="py-3.5 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] transition-all cursor-pointer shadow-md flex items-center gap-2"
        >
          <span>CONTINUE WITH DEMO REFERENCE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
