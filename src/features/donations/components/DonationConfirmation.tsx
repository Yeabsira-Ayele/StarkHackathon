import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Donation } from '../types/donation.types';
import { toGeezNumber } from '../api/donation.api';
import {
  CheckCircle2,
  Clock,
  Share2,
  Download,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Printer,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { ShareDonationModal } from './ShareDonationModal';

interface DonationConfirmationProps {
  donation: Donation;
  onExploreMore: () => void;
  onViewContributions: () => void;
  onBackToCause?: () => void;
  onStartNew?: () => void;
  onRetryReference?: () => void;
}

export const DonationConfirmation: React.FC<DonationConfirmationProps> = ({
  donation,
  onExploreMore,
  onViewContributions,
  onBackToCause,
  onStartNew,
  onRetryReference,
}) => {
  const { t } = useTranslation();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(donation.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = donation.status === 'confirmed';
  const isVerifying = donation.status === 'verifying';
  const isFailed = donation.status === 'failed';
  const isPending = donation.status === 'pending';

  const getStatusIcon = () => {
    if (isConfirmed) return <CheckCircle2 className="w-10 h-10" />;
    if (isVerifying) return <Loader2 className="w-10 h-10 animate-spin" />;
    if (isFailed) return <AlertTriangle className="w-10 h-10" />;
    return <Clock className="w-10 h-10 animate-pulse" />;
  };

  const getStatusColor = () => {
    if (isConfirmed) return 'bg-[#1E4D38]/10 border-[#1E4D38] text-[#1E4D38] dark:text-[#52B788]';
    if (isFailed) return 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400';
    if (isVerifying) return 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400';
    return 'bg-[#9A7432]/10 border-[#9A7432] text-[#9A7432]';
  };

  const getHeading = () => {
    if (isConfirmed) return 'Contribution Verified & Confirmed!';
    if (isVerifying) return 'Verifying Your Payment...';
    if (isFailed) return 'Verification Could Not Be Completed';
    return 'Contribution Recorded!';
  };

  const getDescription = () => {
    if (isConfirmed) {
      return `Your contribution of ${donation.amount.toLocaleString()} ETB to ${donation.campaignTitle || 'this cause'} has been verified and recorded.`;
    }
    if (isVerifying) {
      return `Verifying your payment of ${donation.amount.toLocaleString()} ETB — this usually takes a few seconds.`;
    }
    if (isFailed) {
      const reason =
        donation.verification?.failureReason ||
        donation.verifiedPayment?.failureReason ||
        'The payment receipt link could not be verified.';
      return `${reason} You can submit a different receipt link to try again.`;
    }
    return `Your contribution of ${donation.amount.toLocaleString()} ETB has been recorded. Please submit your payment receipt link to complete verification.`;
  };

  const getStatusPill = () => {
    if (isConfirmed) {
      return (
        <span className="bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] px-2 py-0.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VERIFIED &amp; CONFIRMED</span>
        </span>
      );
    }
    if (isVerifying) {
      return (
        <span className="bg-blue-600 text-white px-2 py-0.5 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>VERIFYING PAYMENT</span>
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="bg-red-600 text-white px-2 py-0.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>VERIFICATION FAILED</span>
        </span>
      );
    }
    return (
      <span className="bg-[#9A7432] text-white px-2 py-0.5 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>AWAITING RECEIPT</span>
      </span>
    );
  };

  const verifiedAmount = donation.verification?.verifiedAmount ?? donation.verifiedPayment?.amount;
  const verifiedSender = donation.verification?.verifiedSender ?? donation.verifiedPayment?.sender;
  const verifiedAt = donation.verification?.verifiedAt ?? donation.verifiedPayment?.timestamp ?? donation.verifiedAt;
  const verifiedReceiptUrl = donation.receiptUrl || donation.verifiedPayment?.receiptUrl;

  return (
    <div className="space-y-8 font-mono text-xs animate-in fade-in duration-300">
      {/* Top Banner Celebration */}
      <div className="text-center space-y-3 pt-2">
        <div
          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${getStatusColor()}`}
        >
          {getStatusIcon()}
        </div>

        <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#14110E] dark:text-[#FFFFFF]">
          {getHeading()}
        </h2>

        <p className="text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto text-sm leading-relaxed">
          {getDescription()}
        </p>

        {/* Verification Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[1px] border text-xs font-black uppercase tracking-wider">
          {getStatusPill()}
        </div>
      </div>

      {/* Failed: Retry Action */}
      {isFailed && onRetryReference && (
        <div className="p-4 border-2 border-red-500/30 bg-red-50 dark:bg-red-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[1px]">
          <div className="text-sm text-red-700 dark:text-red-300">
            <span className="font-black block">Payment receipt could not be verified.</span>
            <span>Please double-check your receipt link or try a different one.</span>
          </div>
          <button
            type="button"
            onClick={onRetryReference}
            className="py-2.5 px-5 border-2 border-red-600 bg-red-600 text-white font-mono text-xs font-black uppercase tracking-wider hover:bg-red-700 cursor-pointer shrink-0 flex items-center gap-2"
          >
            <span>RESUBMIT RECEIPT LINK</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Verification Details (if available) */}
      {isConfirmed && (donation.verification || donation.verifiedPayment) && (
        <div className="p-4 border border-[#1E4D38]/30 dark:border-[#52B788]/30 bg-[#1E4D38]/5 dark:bg-[#52B788]/5 space-y-2 rounded-[1px]">
          <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] font-black uppercase text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Automatic Receipt Verification Complete</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {verifiedAmount && (
              <div>
                <span className="text-zinc-500 uppercase font-bold block">Verified Amount</span>
                <span className="font-black text-[#14110E] dark:text-white">
                  {verifiedAmount.toLocaleString()} ETB
                </span>
              </div>
            )}
            {verifiedSender && (
              <div>
                <span className="text-zinc-500 uppercase font-bold block">Verified Sender</span>
                <span className="font-black text-[#14110E] dark:text-white">
                  {verifiedSender}
                </span>
              </div>
            )}
            {verifiedAt && (
              <div>
                <span className="text-zinc-500 uppercase font-bold block">Verified At</span>
                <span className="font-black text-[#14110E] dark:text-white">
                  {new Date(verifiedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          {verifiedReceiptUrl && (
            <div className="pt-2 border-t border-[#1E4D38]/15 dark:border-[#52B788]/15 text-[11px] flex items-center justify-between gap-2">
              <span className="text-zinc-500 uppercase font-bold shrink-0">Verified Receipt Link:</span>
              <span className="font-mono text-[#1E4D38] dark:text-[#52B788] truncate">{verifiedReceiptUrl}</span>
            </div>
          )}
        </div>
      )}

      {/* Living Ethiopian Banknote Commemorative Certificate Card */}
      <div
        id="printable-donation-receipt"
        className="p-8 border-4 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-2xl relative overflow-hidden"
      >
        {/* Watermark / Banknote Guilloche Pattern Emulation */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none font-serif text-6xl font-black text-[#1E4D38] dark:text-[#52B788]">
          LEWEGENE
        </div>

        {/* Certificate Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E4D38]/30 dark:border-[#52B788]/30 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#1E4D38] dark:text-[#52B788] tracking-widest block">
              LEWEGENE NATIONAL CIVIC SOLIDARITY TENDER
            </span>
            <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF] mt-0.5">
              Official Contribution Certificate
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">
              DONATION ID
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="font-black text-[#1E4D38] dark:text-[#52B788] text-sm">
                {donation.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 hover:bg-[#F2ECE1] dark:hover:bg-[#1C1814] cursor-pointer"
                title="Copy Donation ID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Core Financial Amount Plate */}
        <div className="p-6 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] flex flex-wrap items-center justify-between gap-4 rounded-[1px]">
          <div>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-black uppercase block">
              VERIFIED CONTRIBUTION AMOUNT
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#1E4D38] dark:text-[#52B788]">
                {donation.amount.toLocaleString()} ETB
              </span>
              <span className="text-base font-ethiopic font-bold text-[#1E4D38] dark:text-[#52B788]">
                ({toGeezNumber(donation.amount)} ብር)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase block">
              ESCROW SETTLEMENT STATUS
            </span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
              Verified &amp; Disbursed to Cause
            </span>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">CAUSE TITLE</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5 line-clamp-1">
              {donation.campaignTitle || 'Solidarity Cause'}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              BENEFICIARY / ORGANIZATION
            </span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5 line-clamp-1">
              {donation.beneficiaryName || 'Accredited Partner'}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">DONOR RECORD</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {donation.anonymous ? 'Anonymous Patron' : donation.donorName}
              {donation.donorEmail && !donation.anonymous && (
                <span className="text-[10px] text-zinc-500 font-normal ml-2">
                  ({donation.donorEmail})
                </span>
              )}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              PAYMENT RAIL
            </span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {donation.bankName || 'Direct Rail'}{donation.accountNumber ? ` • ${donation.accountNumber}` : ''}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              VERIFIED TRANSACTION REF
            </span>
            <span className="font-mono font-black text-[#1E4D38] dark:text-[#52B788] block mt-0.5">
              {donation.reference || donation.verifiedPayment?.railReference || 'Verified'}
            </span>
          </div>

          <div className="p-3 border border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F2ECE1]/50 dark:bg-[#181512]">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">DATE &amp; TIME</span>
            <span className="font-bold text-[#14110E] dark:text-[#FFFFFF] block mt-0.5">
              {new Date(donation.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {donation.message && (
          <div className="p-3 border border-[#9A7432]/40 bg-[#F2ECE1]/70 dark:bg-[#1C1814] text-xs">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              SOLIDARITY MESSAGE:
            </span>
            <p className="italic text-zinc-700 dark:text-zinc-300 mt-1">
              "{donation.message}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-[#26211C]/10 dark:border-[#9A7432]/20 pt-3">
          <span>100% Disbursed to Cause</span>
          <span>Verified via Links.et Escrow Gateway</span>
        </div>
      </div>

      {/* Action Buttons: Share, Download Receipt, Back to Discover */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="py-3 px-5 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#F2ECE1] dark:hover:bg-[#201C18] cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
            <span>SHARE DONATION</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-5 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#F2ECE1] dark:hover:bg-[#201C18] cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
            <span>PRINT CERTIFICATE</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onBackToCause && (
            <button
              type="button"
              onClick={onBackToCause}
              className="py-3 px-5 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE8D8] dark:bg-[#1C1814] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] dark:hover:border-[#52B788] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('nav.returnToCampaign', 'Return to Campaign')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExploreMore}
            className="py-3 px-5 border-2 border-[#1E4D38] dark:border-[#52B788] bg-transparent text-[#1E4D38] dark:text-[#52B788] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#1E4D38] hover:text-white dark:hover:bg-[#52B788] dark:hover:text-[#080706] transition-colors cursor-pointer"
          >
            <span>{t('common.explore', 'Explore Causes')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onStartNew && (
            <button
              type="button"
              onClick={onStartNew}
              className="py-3 px-5 border border-[#26211C]/35 dark:border-[#9A7432]/45 bg-[#FFFDF9] dark:bg-[#181512] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] dark:hover:border-[#52B788] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Pledge</span>
            </button>
          )}

          <button
            type="button"
            onClick={onViewContributions}
            className="py-3 px-6 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] cursor-pointer shadow-md flex items-center gap-2"
          >
            <span>VIEW IN MY CONTRIBUTIONS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
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
