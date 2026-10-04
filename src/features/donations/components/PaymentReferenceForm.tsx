import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bank } from '../data/banks.data';
import { Link2, ShieldCheck, CheckCircle2, ArrowRight, Loader2, AlertCircle, FileText, Upload, Sparkles } from 'lucide-react';
import { isValidReceiptUrl } from '../../../services/payment/linksetService.ts';

interface PaymentReferenceFormProps {
  bank: Bank;
  amount: number;
  donorName: string;
  receiptUrl?: string;
  reference?: string;
  proofUrl?: string;
  isSubmitting: boolean;
  onChangeReceiptUrl?: (url: string) => void;
  onChangeReference?: (ref: string) => void;
  onChangeProofUrl?: (url?: string) => void;
  onSubmit: (receiptUrlToSubmit?: string) => void | Promise<void>;
  onBack: () => void;
}

export const PaymentReferenceForm: React.FC<PaymentReferenceFormProps> = ({
  bank,
  amount,
  donorName,
  receiptUrl: initialReceiptUrl = '',
  reference = '',
  proofUrl,
  isSubmitting,
  onChangeReceiptUrl,
  onChangeReference,
  onChangeProofUrl,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [localReceiptUrl, setLocalReceiptUrl] = useState<string>(initialReceiptUrl);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const PRESET_SAMPLE_LINKS = [
    { label: 'CBE Birr Receipt', url: `https://receipt.cbe.com.et/tx/FT${Math.floor(1000000000 + Math.random() * 9000000000)}` },
    { label: 'Telebirr Receipt', url: `https://telebirr.et/receipt/TB-${Date.now().toString().slice(-6)}` },
    { label: 'Chapa Link', url: `https://checkout.chapa.co/receipt/CHP-${Date.now().toString().slice(-6)}` },
  ];

  const handleUrlChange = (val: string) => {
    setLocalReceiptUrl(val);
    onChangeReceiptUrl?.(val);
    if (urlError) setUrlError(null);
  };

  const handleSelectPreset = (sampleUrl: string) => {
    setLocalReceiptUrl(sampleUrl);
    onChangeReceiptUrl?.(sampleUrl);
    setUrlError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = localReceiptUrl.trim();

    if (!cleanUrl) {
      setUrlError('Please paste your payment receipt link to continue.');
      return;
    }

    if (!isValidReceiptUrl(cleanUrl)) {
      setUrlError('Please enter a valid receipt link (e.g. https://receipt.cbe.com.et/tx/... or https://telebirr.et/receipt/...)');
      return;
    }

    setUrlError(null);
    onSubmit(cleanUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedName(file.name);
      onChangeProofUrl?.(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Payment Receipt Link Verification</span>
        </div>
        <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
          Submit Payment Receipt Link
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
          Paste the official digital receipt link or web confirmation URL from your {bank.shortName} transfer. Lewegene authenticates the transaction directly with the payment gateway to confirm your contribution.
        </p>
      </div>

      {/* Summary Recap Badge */}
      <div className="p-4 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] rounded-[1px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">
            PAYMENT RAIL
          </span>
          <span className="font-black text-[#14110E] dark:text-[#FFFFFF] text-sm">
            {bank.name.en}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">
            CONTRIBUTION AMOUNT
          </span>
          <span className="font-black text-[#1E4D38] dark:text-[#52B788] text-base">
            {amount.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Primary Receipt Link Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
              <span>PAYMENT RECEIPT LINK:</span>
            </span>
            <span className="text-[#1E4D38] dark:text-[#52B788] text-[10px] font-bold">REQUIRED</span>
          </label>

          <input
            type="url"
            required
            value={localReceiptUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://receipt.cbe.com.et/tx/FT2608492019 or https://telebirr.et/receipt/TB-948201"
            className={`w-full p-3.5 border-2 ${
              urlError 
                ? 'border-red-500 ring-1 ring-red-500' 
                : 'border-[#1E4D38] dark:border-[#52B788] ring-1 ring-[#1E4D38]/40'
            } bg-[#FFFDF9] dark:bg-[#181512] font-mono text-xs sm:text-sm text-[#14110E] dark:text-[#FFFFFF] focus:outline-none transition-colors`}
          />

          {urlError ? (
            <p className="text-[11px] text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{urlError}</span>
            </p>
          ) : (
            <span className="text-[10px] text-zinc-500 mt-1.5 block">
              Found on your transaction completion screen, digital receipt page, or in your confirmation SMS link.
            </span>
          )}

          {/* Quick Preset Sample Links for testing */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Sample receipt links:</span>
            {PRESET_SAMPLE_LINKS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className="px-2 py-0.5 border border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#1C1814] text-[10px] text-[#9A7432] dark:text-[#C9A24D] hover:bg-[#F2ECE1] dark:hover:bg-[#25201A] transition-colors cursor-pointer rounded-xs"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Fallback Details Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] text-[#9A7432] dark:text-[#C9A24D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvanced ? '− Hide optional backup details' : '+ Optional: Add reference code or receipt screenshot'}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="p-4 border border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#F2ECE1]/40 dark:bg-[#1C1814]/40 space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                TRANSACTION REFERENCE / SMS CODE (OPTIONAL):
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => onChangeReference?.(e.target.value)}
                placeholder="e.g. FT2608492019"
                className="w-full p-2.5 border border-border bg-[#FFFDF9] dark:bg-[#12100E] font-mono text-xs text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
                ATTACH SCREENSHOT (OPTIONAL):
              </label>
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-[#FFFDF9] dark:bg-[#12100E] cursor-pointer hover:bg-surface-alt text-xs">
                <Upload className="w-3.5 h-3.5 text-accent" />
                <span>{uploadedName || 'Choose image file...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        )}

        {/* Verification Status Banner when Submitting */}
        {isSubmitting && (
          <div className="p-3.5 border border-[#1E4D38]/40 bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788] flex items-center gap-2.5 text-xs">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Verifying payment receipt link with payment gateway via Links.et...</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#26211C]/15 dark:border-[#9A7432]/30">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#DFD3BC] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] font-bold cursor-pointer hover:bg-[#D5C6AC] disabled:opacity-50"
          >
            ← BACK TO INSTRUCTIONS
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3.5 px-6 sm:px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>VERIFYING RECEIPT...</span>
              </>
            ) : (
              <>
                <span>VERIFY RECEIPT &amp; CONFIRM CONTRIBUTION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
