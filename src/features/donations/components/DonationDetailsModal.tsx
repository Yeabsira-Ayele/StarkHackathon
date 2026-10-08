import React, { useState } from 'react';
import { Donation } from '../types/donation.types';
import { toGeezNumber } from '../api/donation.api';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { ShareDonationModal } from './ShareDonationModal';
import { APP_NAME } from '../../../data/content.ts';

interface DonationDetailsModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  donation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !donation) return null;

  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyRef = () => {
    if (donation.reference) {
      navigator.clipboard.writeText(donation.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isSuccessful = donation.status === 'successful';
  const isFailed = donation.status === 'failed';

  const getStatusBadge = () => {
    if (isSuccessful) {
      return (
        <span className="px-3 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-black uppercase text-[10px] tracking-wider rounded-[1px] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SUCCESSFUL</span>
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="px-3 py-1 bg-red-600 text-white font-black uppercase text-[10px] tracking-wider rounded-[1px] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>VERIFICATION FAILED</span>
        </span>
      );
    }
    return null;
  };

  const verifiedAmount = donation.verification?.verifiedAmount ?? donation.verifiedPayment?.amount;
  const verifiedSender = donation.verification?.verifiedSender ?? donation.verifiedPayment?.sender;
  const verifiedAt = donation.verification?.verifiedAt ?? donation.verifiedPayment?.timestamp ?? donation.verifiedAt;
  const verifiedReceiptUrl = donation.receiptUrl || donation.verifiedPayment?.receiptUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl p-6 sm:p-8 border-4 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 font-mono text-xs rounded-[1px] shadow-2xl relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1E4D38]/30 dark:border-[#52B788]/30 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#1E4D38] dark:text-[#52B788] tracking-widest block">
              {APP_NAME.toUpperCase()} CIVIC LEDGER ENTRY
            </span>
            <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF] mt-0.5">
              Donation #{donation.id}
            </h3>
          </div>

          <div>
            {getStatusBadge()}
          </div>
        </div>

        {/* Amount Card */}
        <div className="p-5 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] flex items-baseline justify-between rounded-[1px]">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">CONTRIBUTION AMOUNT</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">
                {donation.amount.toLocaleString()} ETB
              </span>
              <span className="text-sm font-ethiopic font-bold text-[#1E4D38] dark:text-[#52B788]">
                ({toGeezNumber(donation.amount)} ብር)
              </span>
            </div>
          </div>
          <span className={`text-[11px] font-black ${isSuccessful ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {isSuccessful ? 'SUCCESSFUL' : 'FAILED'}
          </span>
        </div>

        {/* Failed: Verification Failure Details */}
        {isFailed && (donation.verification?.failureReason || donation.verifiedPayment?.failureReason) && (
          <div className="p-3.5 border-2 border-red-500/30 bg-red-50 dark:bg-red-950/20 space-y-1">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black uppercase text-[11px]">
              <AlertTriangle className="w-4 h-4" />
              <span>Verification Failed</span>
            </div>
            <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
              {donation.verification?.failureReason || donation.verifiedPayment?.failureReason}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              You can resubmit a different payment receipt link or contact support for assistance.
            </p>
          </div>
        )}

        {/* Verified: Verification Success Details */}
        {isSuccessful && (donation.verification || donation.verifiedPayment) && (
          <div className="p-3.5 border border-[#1E4D38]/30 dark:border-[#52B788]/30 bg-[#1E4D38]/5 dark:bg-[#52B788]/5 space-y-2">
            <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] font-black uppercase text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Automatic Receipt Verification Complete</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {verifiedAmount && (
                <div>
                  <span className="text-zinc-500 uppercase font-bold block">Amount</span>
                  <span className="font-black text-[#14110E] dark:text-white">
                    {verifiedAmount.toLocaleString()} ETB
                  </span>
                </div>
              )}
              {verifiedSender && (
                <div>
                  <span className="text-zinc-500 uppercase font-bold block">Sender</span>
                  <span className="font-black text-[#14110E] dark:text-white">
                    {verifiedSender}
                  </span>
                </div>
              )}
              {verifiedAt && (
                <div>
                  <span className="text-zinc-500 uppercase font-bold block">Verified</span>
                  <span className="font-black text-[#14110E] dark:text-white">
                    {new Date(verifiedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            {verifiedReceiptUrl && (
              <div className="pt-2 border-t border-[#1E4D38]/15 dark:border-[#52B788]/15 text-[11px] flex items-center justify-between gap-2">
                <span className="text-zinc-500 uppercase font-bold shrink-0">Receipt Link:</span>
                <span className="font-mono text-[#1E4D38] dark:text-[#52B788] truncate">{verifiedReceiptUrl}</span>
              </div>
            )}
          </div>
        )}

        {/* Details List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">CAUSE</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {donation.campaignTitle || 'Campaign title unavailable'}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">BENEFICIARY</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {donation.beneficiaryName || 'Beneficiary unavailable'}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">DONOR</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {donation.anonymous ? 'Anonymous Patron' : donation.donorName}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">RECEIVING BANK</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {donation.bankName || 'Campaign receiving account'}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">TRANSACTION REFERENCE</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-black text-[#1E4D38] dark:text-[#52B788]">
                {donation.reference || '—'}
              </span>
              {donation.reference && (
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-1 hover:bg-[#EFE7D5] dark:hover:bg-[#201C18] cursor-pointer"
                  title="Copy reference"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">RECORDED DATE</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {new Date(donation.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {donation.message && (
          <div className="p-3 border border-[#9A7432]/40 bg-[#F2ECE1]/70 dark:bg-[#1C1814] text-xs">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              SOLIDARITY NOTE:
            </span>
            <p className="italic text-zinc-700 dark:text-zinc-300 mt-1">"{donation.message}"</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#26211C]/15 dark:border-[#9A7432]/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer hover:bg-[#F2ECE1]"
            >
              <Share2 className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
              <span>SHARE</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer hover:bg-[#F2ECE1]"
            >
              <Printer className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
              <span>PRINT RECEIPT</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-bold uppercase cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>

      {isShareOpen && (
        <ShareDonationModal
          donation={donation}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
};
