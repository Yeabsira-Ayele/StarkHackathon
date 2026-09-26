import React, { useState } from 'react';
import { Campaign, ContributionCertificate, PaymentRail } from '../types/index.ts';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { DonateForm } from '../components/campaign/DonateForm.tsx';
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
  Check,
  Heart,
  Users,
  MapPin,
  Calendar,
  Building2,
  Award,
  Clock,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import { toGeezNumber } from '../services/utils/currencyUtils.ts';

export interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onDonate: (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => Promise<any>;
  onDonationCompleted?: (cert: ContributionCertificate) => void;
  onViewOrganization?: () => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onBack,
  onDonate,
  onDonationCompleted,
  onViewOrganization,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formattedDate = new Date(campaign.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const percent = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100);

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* ─── TOP BREADCRUMB & SERIAL BADGE ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8CEBA] dark:border-[#2C3831] pb-3 text-xs font-mono">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg border border-[#B08A45]/60 bg-[#FAF7F0] dark:bg-[#1B221E] font-bold text-primary hover:bg-[#F0EAD8] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO BILL OVERVIEW</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="banknote-serial-red text-xs font-black">
            № {campaign.serialCode || 'LW-0421'}
          </span>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg border border-[#B08A45]/60 bg-[#FAF7F0] dark:bg-[#1B221E] font-bold text-primary hover:bg-[#F0EAD8] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#B08A45]" />}
            <span>{copied ? 'LINK COPIED' : 'SHARE NOTE'}</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN ENGRAVED VIGNETTE LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 Columns: Engraved Scene & Narrative */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Engraved Master Illustration Screen */}
          <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden border-2 border-[#173C32] dark:border-[#B08A45] bg-surface-alt shadow-lg">
            {campaign.imageUrl && !imgError ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover intaglio-image"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-surface-alt text-zinc-400 p-6 text-center">
                <Heart className="w-12 h-12 text-[#B08A45] mb-2" />
                <span className="text-sm font-semibold text-primary capitalize font-mono">
                  {campaign.category}
                </span>
              </div>
            )}

            {/* Intaglio Crosshatch Overlay */}
            <div className="absolute inset-0 intaglio-overlay opacity-60" />

            {/* Corner Banknote Stamps */}
            <div className="absolute top-3 left-3 bg-[#173C32]/95 backdrop-blur-xs text-[#F7F4EB] border border-[#B08A45] rounded px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
              <Award className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>№ {campaign.serialCode || 'LW-0421'}</span>
            </div>

            {campaign.verifiedOrganization && (
              <div className="absolute top-3 right-3 bg-[#FAF7F0]/95 dark:bg-[#161B18]/95 backdrop-blur-xs text-[#173C32] dark:text-[#C5A059] border border-[#B08A45] rounded px-3 py-1 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>ACSO CERTIFIED NGO</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-[#173C32]/95 text-[#F7F4EB] border border-[#B08A45] rounded px-3 py-1 text-xs font-mono font-black">
              {percent}% FUNDED ({toGeezNumber(percent)}%)
            </div>
          </div>

          {/* Title & Organization Registry Strip */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="text-accent font-bold uppercase tracking-wider">
                {campaign.category}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B08A45]" />
                {campaign.location || 'Ethiopia'}
              </span>
              <span>·</span>
              <span>ISSUED {formattedDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-primary tracking-tight leading-snug">
              {campaign.title}
            </h1>

            {/* Organization Endorsement Box */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F7F4EB]/70 dark:bg-[#1A201D] text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-[#B08A45] bg-[#173C32] text-white font-display font-black text-base flex items-center justify-center shadow-xs">
                  {(campaign.organizationName || campaign.creatorName).charAt(0)}
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">
                    ISSUING ENTITY
                  </span>
                  <span className="font-bold text-primary text-sm">
                    {campaign.organizationName || campaign.creatorName}
                  </span>
                </div>
              </div>

              {onViewOrganization && (
                <button
                  onClick={onViewOrganization}
                  className="px-3 py-1.5 rounded border border-[#B08A45] text-xs font-bold text-accent hover:bg-[#F0EAD8] cursor-pointer"
                >
                  VIEW PROFILE →
                </button>
              )}
            </div>
          </div>

          {/* Story Narrative */}
          <div className="p-6 rounded-2xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#181D1A] shadow-xs space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#B08A45]">
              STATEMENT OF URGENT CIVIC NEED
            </h2>
            <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
              {campaign.story}
            </div>
          </div>

          {/* Tangible Impact Declaration */}
          {campaign.impactMetric && (
            <div className="p-4 rounded-xl border-2 border-[#B08A45]/60 bg-[#F4EFE6]/90 dark:bg-[#1B221E] space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Award className="w-4 h-4 text-[#B08A45]" />
                <span className="text-[#173C32] dark:text-[#C5A059]">AUDITED BENEFICIARY OUTCOME:</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 pl-6 leading-relaxed">
                {campaign.impactMetric}
              </p>
            </div>
          )}

          {/* Transparent Itemized Treasury Allocation */}
          {campaign.budgetBreakdown && campaign.budgetBreakdown.length > 0 && (
            <div className="p-6 rounded-2xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#181D1A] shadow-xs space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#D8CEBA] dark:border-[#2C3831] pb-2">
                <h2 className="font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#B08A45]" />
                  <span>TRANSPARENT TREASURY ALLOCATION</span>
                </h2>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                  ACSO AUDITED
                </span>
              </div>

              <div className="divide-y divide-[#D8CEBA] dark:divide-[#2C3831]">
                {campaign.budgetBreakdown.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <p className="font-bold text-primary">{item.item}</p>
                      {item.description && (
                        <p className="text-[10px] text-zinc-500 font-sans mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <span className="font-bold text-[#173C32] dark:text-[#C5A059] tabular-nums">
                      {item.cost.toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Updates & Field Milestones */}
          {campaign.updates && campaign.updates.length > 0 && (
            <div className="p-6 rounded-2xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#181D1A] shadow-xs space-y-4 font-mono text-xs">
              <h2 className="font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-[#D8CEBA] dark:border-[#2C3831] pb-2">
                <Clock className="w-4 h-4 text-[#B08A45]" />
                <span>FIELD MILESTONE DISPATCHES ({campaign.updates.length})</span>
              </h2>

              <div className="space-y-3">
                {campaign.updates.map((upd) => (
                  <div key={upd.id} className="p-4 rounded-xl border border-border bg-[#F4EFE6]/60 dark:bg-[#151917] space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span className="font-bold text-primary">{upd.authorName}</span>
                      <span>{new Date(upd.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-primary text-sm font-display">{upd.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">{upd.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Underwriters Ledger */}
          <div className="p-6 rounded-2xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#181D1A] shadow-xs space-y-4 font-mono text-xs">
            <h2 className="font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-[#D8CEBA] dark:border-[#2C3831] pb-2">
              <Users className="w-4 h-4 text-[#B08A45]" />
              <span>CITIZEN UNDERWRITERS &amp; ENDORSEMENTS ({campaign.donations?.length || 0})</span>
            </h2>

            {(!campaign.donations || campaign.donations.length === 0) ? (
              <p className="text-zinc-500 italic py-4 text-center">
                Be the initial underwriter to stamp this promissory note.
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-[#D8CEBA] dark:divide-[#2C3831]">
                {campaign.donations.map((don, idx) => (
                  <div key={don.id || idx} className={`pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-primary">
                        {don.donorName || 'Citizen Benefactor'}
                      </span>
                      <span className="font-black text-[#173C32] dark:text-[#C5A059] tabular-nums">
                        {don.amount.toLocaleString()} ETB ({toGeezNumber(don.amount)}:ብር)
                      </span>
                    </div>
                    {don.message && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 italic font-serif">
                        &ldquo;{don.message}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                      <span className="uppercase">{don.paymentRail || 'TELEBIRR'}</span>
                      <span>·</span>
                      <span>REF: {don.transactionReference || 'TB-ET'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 5 Columns: Sticky Underwriting & Minting Portal */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl border-2 border-[#173C32] dark:border-[#B08A45] bg-[#FAF7F0] dark:bg-[#181D1A] shadow-xl banknote-shadow space-y-5">
            
            {/* Header progress numbers */}
            <div className="font-mono">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-3xl font-display font-black text-[#173C32] dark:text-[#C5A059] tabular-nums">
                    {campaign.raisedAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 ml-1.5">ETB UNDERWRITTEN</span>
                </div>
                <div className="text-right text-xs text-zinc-500">
                  <span>TARGET: </span>
                  <span className="font-bold text-primary tabular-nums">
                    {campaign.goalAmount.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar
                  value={campaign.raisedAmount}
                  max={campaign.goalAmount}
                  showLabel
                  size="md"
                  color="accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#D8CEBA] dark:border-[#2C3831] text-center">
                <div className="bg-[#F4EFE6] dark:bg-zinc-800/40 p-2.5 rounded border border-[#D8CEBA] dark:border-[#2C3831]">
                  <span className="text-base font-bold text-primary tabular-nums">
                    {campaign.donationsCount || 0}
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase">Backers</span>
                </div>
                <div className="bg-[#F4EFE6] dark:bg-zinc-800/40 p-2.5 rounded border border-[#D8CEBA] dark:border-[#2C3831]">
                  <span className="text-base font-bold text-accent tabular-nums">
                    100%
                  </span>
                  <span className="block text-[10px] text-zinc-500 font-bold uppercase">Audited Escrow</span>
                </div>
              </div>
            </div>

            {/* Direct Donation Form */}
            <div className="pt-2 border-t border-[#D8CEBA] dark:border-[#2C3831]">
              <DonateForm
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                impactMetric={campaign.impactMetric}
                onSubmit={onDonate}
                onDonationSuccess={(cert) => {
                  if (onDonationCompleted) {
                    onDonationCompleted(cert);
                  }
                }}
              />
            </div>
          </div>

          {/* Guarantee Card */}
          <div className="p-4 rounded-xl border border-[#B08A45]/50 bg-[#F4EFE6] dark:bg-[#151917] text-xs font-mono text-zinc-600 dark:text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-primary">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>ACSO ESCROW &amp; TELEBIRR SETTLEMENT</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              Every Birr committed to this promissory note is locked into verified escrow accounts and released only upon validated milestone clearance.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
