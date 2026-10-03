import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bank } from '../data/banks.data';
import { FileText, Upload, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface PaymentReferenceFormProps {
  bank: Bank;
  amount: number;
  donorName: string;
  reference: string;
  proofUrl?: string;
  isSubmitting: boolean;
  onChangeReference: (ref: string) => void;
  onChangeProofUrl: (url?: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const PaymentReferenceForm: React.FC<PaymentReferenceFormProps> = ({
  bank,
  amount,
  donorName,
  reference,
  proofUrl,
  isSubmitting,
  onChangeReference,
  onChangeProofUrl,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const handleSimulatedUpload = (file: File) => {
    setUploadedName(file.name);
    onChangeProofUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSimulatedUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
          Demo Contribution Confirmation
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Enter any reference text to complete the local simulation. Do not enter real banking or receipt details.
        </p>
      </div>

      {/* Summary Recap Badge */}
      <div className="p-4 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] rounded-[1px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">
            SELECTED BANK &amp; ACCOUNT
          </span>
          <span className="font-black text-[#14110E] dark:text-[#FFFFFF] text-sm">
            {bank.shortName} • DEMO ONLY
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">
            SIMULATED AMOUNT
          </span>
          <span className="font-black text-[#1E4D38] dark:text-[#52B788] text-base">
            {amount.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Reference Input Form */}
      <div className="space-y-4">
        <div>
          <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1.5 flex items-center justify-between">
            <span>TRANSACTION REFERENCE NUMBER / SMS CODE:</span>
            <span className="text-[#1E4D38] dark:text-[#52B788] text-[10px]">REQUIRED</span>
          </label>
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => onChangeReference(e.target.value)}
            placeholder={bank.code === 'CBE' ? 'e.g. FT2608492019' : 'e.g. TXN-948201 or SMS code'}
            className="w-full p-3.5 border-2 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#181512] font-mono text-base font-black text-[#14110E] dark:text-[#FFFFFF] uppercase tracking-wider focus:outline-none ring-1 ring-[#1E4D38] transition-colors"
          />
          <span className="text-[10px] text-zinc-500 mt-1 block">
            Found on your bank SMS confirmation, CBE receipt, or Telebirr notification message.
          </span>
        </div>

        {/* Optional Screenshot / Proof Dropzone */}
        <div>
          <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1.5">
            TRANSFER RECEIPT / SCREENSHOT (OPTIONAL):
          </label>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleSimulatedUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`p-6 border-2 border-dashed rounded-[1px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#1E4D38] bg-[#1E4D38]/10'
                : 'border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#181512] hover:bg-[#F2ECE1] dark:hover:bg-[#201C18]'
            }`}
          >
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-[#1E4D38] dark:text-[#52B788]" />
            <div className="text-center">
              {uploadedName ? (
                <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
                  Attached: {uploadedName} (Ready)
                </span>
              ) : (
                <>
                  <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block">
                    Click to browse or drop transfer screenshot / receipt PDF
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    PNG, JPG, or PDF up to 10MB
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="p-4 border border-[#1E4D38]/30 dark:border-[#52B788]/30 bg-[#1E4D38]/5 dark:bg-[#52B788]/5 space-y-1 text-zinc-700 dark:text-zinc-300">
        <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] font-black uppercase text-[11px]">
          <ShieldCheck className="w-4 h-4" />
            <span>No Payment Verification</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          This frontend-only prototype does not connect to a bank or payment provider. Submitting this demo reference only updates local campaign totals and creates a prototype contribution record; no money is transferred.
        </p>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15 dark:border-[#9A7432]/30">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#DFD3BC] dark:bg-[#181512] font-bold cursor-pointer"
        >
          ← BACK TO ACCOUNT INFO
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !reference.trim()}
          className="py-3.5 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span>VERIFYING PAYMENT...</span>
          ) : (
            <>
              <span>RECORD DEMO CONTRIBUTION</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
