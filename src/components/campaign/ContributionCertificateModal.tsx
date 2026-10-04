import React, { useState } from 'react';
import { ContributionCertificate } from '../../types/index.ts';
import { ShieldCheck, Award, Download, Share2, Check, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';

export interface ContributionCertificateModalProps {
  certificate: ContributionCertificate | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDashboard?: () => void;
  onExploreMore?: () => void;
}

export const ContributionCertificateModal: React.FC<ContributionCertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onViewDashboard,
  onExploreMore,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + `?cert=${certificate.certificateId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const geezAmount = toGeezNumber(certificate.amount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative my-0 sm:my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-x-hidden overflow-y-auto bg-[#FAF6EE] dark:bg-[#141210] text-[#201C18] dark:text-[#F4EFE6] rounded-2xl shadow-2xl border-4 border-[#26211C] dark:border-[#9A7432] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 text-zinc-400 hover:text-[#8B2626] rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close Certificate"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ─── MUSEUM-GRADE ETHIOPIAN BANKNOTE CERTIFICATE ─── */}
        <div className="p-6 sm:p-10 relative banknote-paper select-none">
          
          {/* Intaglio Crosshatch Screen */}
          <div className="absolute inset-0 pointer-events-none intaglio-crosshatch opacity-35" />

          {/* Ornamental Double Banknote Framing */}
          <div className="relative border-4 border-[#26211C] dark:border-[#9A7432] rounded-xl p-6 sm:p-8 bg-[#FCF9F2] dark:bg-[#1E1A17] shadow-inner space-y-6">
            
            {/* 4 Corner Denomination Vignettes */}
            <div className="absolute -top-3.5 -left-3.5 w-10 h-10 rounded-lg border-2 border-[#9A7432] bg-[#F7F2E7] dark:bg-[#26201B] flex flex-col items-center justify-center font-display font-black text-xs text-[#26211C] dark:text-[#D8B066] shadow-sm">
              <span>{certificate.amount}</span>
              <span className="text-[8px] font-ethiopic leading-none">{geezAmount}</span>
            </div>

            <div className="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-lg border-2 border-[#9A7432] bg-[#F7F2E7] dark:bg-[#26201B] flex flex-col items-center justify-center font-display font-black text-xs text-[#26211C] dark:text-[#D8B066] shadow-sm">
              <span>{certificate.amount}</span>
              <span className="text-[8px] font-ethiopic leading-none">{geezAmount}</span>
            </div>

            <div className="absolute -bottom-3.5 -left-3.5 w-10 h-10 rounded-lg border-2 border-[#9A7432] bg-[#F7F2E7] dark:bg-[#26201B] flex flex-col items-center justify-center font-display font-black text-xs text-[#26211C] dark:text-[#D8B066] shadow-sm">
              <span>{certificate.amount}</span>
              <span className="text-[8px] font-ethiopic leading-none">{geezAmount}</span>
            </div>

            <div className="absolute -bottom-3.5 -right-3.5 w-10 h-10 rounded-lg border-2 border-[#9A7432] bg-[#F7F2E7] dark:bg-[#26201B] flex flex-col items-center justify-center font-display font-black text-xs text-[#26211C] dark:text-[#D8B066] shadow-sm">
              <span>{certificate.amount}</span>
              <span className="text-[8px] font-ethiopic leading-none">{geezAmount}</span>
            </div>

            {/* Top Serial & Official Seal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#D8CEBA] dark:border-[#332B23] pb-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#9A7432]" />
                <span className="banknote-serial-red font-black text-sm">№ {certificate.certificateId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-[#9A7432] uppercase font-bold block">
                  OFFICIAL SOLIDARITY CERTIFICATE
                </span>
                <span className="text-[10px] font-ethiopic text-zinc-500 font-bold block">
                  የኢትዮጵያ ሕዝባዊ አስተዋጽኦ ሰነድ
                </span>
              </div>
            </div>

            {/* Central Master Title */}
            <div className="text-center space-y-1">
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#9A7432] font-bold">
                ARCHIVAL CONTRIBUTION CERTIFICATE
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#26211C] dark:text-[#F4EFE6] leading-tight banknote-engraved-text">
                LEWEGENE · ለወገን
              </h2>
              <p className="text-xs font-serif italic text-zinc-600 dark:text-zinc-400">
                Official acknowledgment of verified civic underwriting and direct philanthropic impact.
              </p>
            </div>

            {/* Contributor & Denomination Display */}
            <div className="p-4 sm:p-6 rounded-xl border border-[#9A7432]/60 bg-[#F7F2E7]/80 dark:bg-[#26201B]/80 text-center space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                DISTINGUISHED PATRON &amp; BENEFACTOR
              </p>

              <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#8B2626] dark:text-[#D8B066] tracking-normal">
                {certificate.donorName || 'Generous Citizen Patron'}
              </h3>

              {/* Large Engraved Currency Numeral */}
              <div className="py-2.5 px-6 rounded-lg border-2 border-[#9A7432] bg-gradient-to-r from-[#8B2626]/10 via-[#9A7432]/20 to-[#8B2626]/10 dark:from-[#8B2626]/30 dark:to-[#9A7432]/30 inline-block shadow-sm">
                <span className="text-3xl sm:text-4xl font-display font-black text-[#26211C] dark:text-[#F4EFE6] tracking-wider">
                  {certificate.amount.toLocaleString()} ETB
                </span>
                <span className="block text-xs font-ethiopic font-bold text-[#9A7432] mt-0.5">
                  ({geezAmount} : ብር)
                </span>
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  DESIGNATED CAUSE
                </p>
                <p className="text-base sm:text-lg font-display font-bold text-[#201C18] dark:text-[#F4EFE6] max-w-xl mx-auto leading-snug">
                  {certificate.campaignTitle}
                </p>
                <p className="text-xs font-mono text-[#9A7432] font-semibold">
                  {certificate.organizationName} · {certificate.location}
                </p>
              </div>

              {/* Tangible Impact Declaration */}
              <div className="p-3 rounded-lg border border-[#D8CEBA] dark:border-[#332B23] bg-[#FCF9F2] dark:bg-[#1E1A17] text-xs font-mono max-w-lg mx-auto">
                <span className="font-bold text-[#8B2626] dark:text-[#D8B066]">CIVIC IMPACT: </span>
                <span className="text-zinc-700 dark:text-zinc-300">{certificate.impactSummary}</span>
              </div>
            </div>

            {/* Bottom Banknote Governor & Trustee Signatures */}
            <div className="grid grid-cols-2 gap-4 items-end pt-3 text-xs font-mono">
              <div className="space-y-0.5">
                <p className="font-bold text-[#201C18] dark:text-[#F4EFE6]">ISSUED: {formattedDate}</p>
                <p className="text-[10px] text-zinc-500">REF: {certificate.transactionRef}</p>
                <p className="text-[10px] text-emerald-600 font-bold">VERIFIED VIA: {certificate.paymentRail.toUpperCase()}</p>
              </div>

              <div className="text-right space-y-1">
                <div className="border-b border-[#26211C] dark:border-[#F4EFE6] inline-block px-4 pb-0.5 font-serif italic text-xs text-[#26211C] dark:text-[#D8B066]">
                  Board of Philanthropic Oversight
                </div>
                <p className="text-[9px] uppercase tracking-widest text-zinc-400">
                  AUTHENTICATED DIGITAL ARCHIVE CERTIFICATE
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Action Controls */}
        <div className="bg-[#EFE8D8] dark:bg-[#1E1A17] px-6 py-4 border-t-2 border-[#26211C] dark:border-[#332B23] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-[#9A7432] bg-[#FCF9F2] dark:bg-[#26201B] font-bold text-[#201C18] dark:text-[#F4EFE6] hover:bg-[#E5DDCB] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#9A7432]" />}
              <span>{copied ? 'LINK COPIED' : 'SHARE NOTE'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-[#9A7432] bg-[#FCF9F2] dark:bg-[#26201B] font-bold text-[#201C18] dark:text-[#F4EFE6] hover:bg-[#E5DDCB] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#9A7432]" />
              <span>PRINT BANKNOTE (PDF)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onViewDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onViewDashboard();
                }}
                className="px-3 py-1.5 rounded-lg border border-[#26211C] bg-[#FCF9F2] dark:bg-[#26201B] font-bold text-[#201C18] dark:text-[#F4EFE6] hover:bg-[#E5DDCB] transition-colors cursor-pointer"
              >
                PATRON VAULT →
              </button>
            )}

            {onExploreMore && (
              <button
                onClick={() => {
                  onClose();
                  onExploreMore();
                }}
                className="px-4 py-1.5 rounded-lg border-2 border-[#8B2626] bg-[#8B2626] text-white font-bold hover:bg-[#701E1E] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>EXPLORE MORE CAUSES</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
