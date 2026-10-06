import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Campaign } from '../../types/index.ts';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { ShieldCheck, Heart, ArrowRight, MapPin, Award, FileText } from 'lucide-react';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';

export interface BanknoteVignetteCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
}

export const BanknoteVignetteCard: React.FC<BanknoteVignetteCardProps> = ({
  campaign,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  if (!campaign) return null;

  const raised = campaign.raisedAmount || 0;
  const goal = campaign.goalAmount || 1;
  const percent = Math.min(Math.round((raised / goal) * 100), 100);

  const categoryLabels: Record<string, { en: string; am: string }> = {
    medical: { en: 'HEALTHCARE', am: 'የህክምና ዋስትና' },
    education: { en: 'EDUCATION', am: 'የትምህርት ፈንድ' },
    emergency: { en: 'EMERGENCY', am: 'የአደጋ ጊዜ ድጋፍ' },
    water: { en: 'CLEAN WATER', am: 'የንፁህ ውሃ ፕሮጀክት' },
    business: { en: 'ARTISAN GUILD', am: 'የባህል ሙያተኞች' },
    environment: { en: 'ENVIRONMENT', am: 'የተፈጥሮ ጥበቃ' },
    other: { en: 'SOLIDARITY', am: 'የማህበረሰብ ስራ' },
  };

  const label = categoryLabels[campaign.category] || { en: 'CIVIC NOTE', am: 'የህዝብ ዘመቻ' };

  return (
    <div
      onClick={() => onSelect(campaign)}
      className="group relative cursor-pointer rounded-xl border-2 border-[#173C32]/80 dark:border-[#B08A45]/70 bg-[#FAF7F0] dark:bg-[#161B18] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between banknote-shadow active:scale-[0.99] select-none"
    >
      {/* Decorative Corner Watermark Elements */}
      <div className="absolute top-1.5 left-2 text-[#B08A45] text-[10px] font-serif pointer-events-none">❖</div>
      <div className="absolute top-1.5 right-2 text-[#B08A45] text-[10px] font-serif pointer-events-none">❖</div>
      <div className="absolute bottom-1.5 left-2 text-[#B08A45] text-[10px] font-serif pointer-events-none">❖</div>
      <div className="absolute bottom-1.5 right-2 text-[#B08A45] text-[10px] font-serif pointer-events-none">❖</div>

      {/* Top Banknote Serial Ribbon */}
      <div className="px-4 py-2 bg-[#F3ECE0] dark:bg-[#1B221E] border-b border-[#D8CEBA] dark:border-[#2C3831] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#B08A45]" />
          <span className="banknote-serial-red text-[11px]">№ {campaign.serialCode || 'LW-0421'}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-[#173C32] dark:text-[#C5A059] uppercase tracking-wider block">
            {label.en}
          </span>
          <span className="text-[9px] font-ethiopic text-zinc-400 block leading-none">
            {label.am}
          </span>
        </div>
      </div>

      {/* Engraved Vignette Window with Intaglio Line Screen */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-surface-alt border-b border-[#D8CEBA] dark:border-[#2C3831]">
        {campaign.imageUrl && !imgError ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover intaglio-image group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-alt text-zinc-400 p-4 text-center">
            <Heart className="w-8 h-8 text-[#B08A45] mb-1" />
            <span className="text-xs font-semibold text-primary capitalize font-mono">
              {campaign.category}
            </span>
          </div>
        )}

        {/* Intaglio Line Screen Overlay */}
        <div className="absolute inset-0 intaglio-overlay opacity-60" />

        <div className={`absolute top-2.5 left-2.5 rounded border px-2 py-0.5 text-[9px] font-mono font-bold shadow-sm ${
          campaign.status === 'approved'
            ? 'border-[#B08A45]/60 bg-[#FAF7F0]/95 text-[#173C32] dark:bg-[#161B18]/95 dark:text-[#C5A059]'
            : 'border-amber-600/50 bg-amber-50/95 text-amber-800 dark:bg-[#161411]/95 dark:text-amber-300'
        }`}>
          {t(campaign.status === 'approved' ? 'common.fundraiserVerified' : 'common.fundraiserPendingVerification')}
        </div>

        {/* ACSO Verified Seal Badge */}
        {campaign.verifiedOrganization && (
          <div className="absolute top-2.5 right-2.5 bg-[#FAF7F0]/95 dark:bg-[#161B18]/95 backdrop-blur-xs text-[#173C32] dark:text-[#C5A059] border border-[#B08A45]/60 rounded px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>ACSO VERIFIED</span>
          </div>
        )}

        {/* Denomination Percentage Stamp */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#173C32]/95 text-[#F7F4EB] border border-[#B08A45]/40 rounded px-2 py-0.5 text-[10px] font-mono font-black tracking-wider">
          {percent}% FUNDED ({toGeezNumber(percent)}%)
        </div>
      </div>

      {/* Vignette Text & Financial Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location & Organization */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <MapPin className="w-3 h-3 text-[#B08A45]" />
              {campaign.location || 'Ethiopia'}
            </span>
            <span className="font-semibold text-zinc-400">
              {campaign.donationsCount || 0} Backers
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-display font-bold text-primary mt-2 line-clamp-2 group-hover:text-[#B08A45] transition-colors leading-snug tracking-tight">
            {campaign.title}
          </h3>

          {/* Promissory Excerpt */}
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
            {campaign.story}
          </p>

          {/* Impact Statement */}
          {campaign.impactMetric && (
            <div className="mt-2.5 p-2 rounded border border-[#B08A45]/40 bg-[#F4EFE6]/70 dark:bg-[#1C221F] text-[11px] text-zinc-700 dark:text-zinc-300 line-clamp-1 font-mono">
              <span className="font-bold text-[#173C32] dark:text-[#C5A059]">IMPACT: </span>
              {campaign.impactMetric}
            </div>
          )}
        </div>

        {/* Banknote Financial Progress & Underwrite Button */}
        <div className="pt-3 border-t border-[#D8CEBA] dark:border-[#2C3831] space-y-2">
          
          <ProgressBar
            value={campaign.raisedAmount}
            max={campaign.goalAmount}
            size="sm"
            color="accent"
          />

          <div className="flex justify-between items-baseline text-xs font-mono">
            <div>
              <span className="text-sm font-bold text-[#173C32] dark:text-[#C5A059] tabular-nums font-display">
                {campaign.raisedAmount.toLocaleString()} ETB
              </span>
              <span className="text-zinc-400 text-[10px] ml-1">raised</span>
            </div>
            <div className="text-right text-zinc-500">
              <span className="tabular-nums font-medium">
                {campaign.goalAmount.toLocaleString()} ETB
              </span>
              <span className="text-zinc-400 text-[10px] ml-1">goal</span>
            </div>
          </div>

          {/* Banknote Seal Stamp Button */}
          <button
            type="button"
            className="w-full mt-2 py-2 px-3 rounded-lg border-2 border-[#173C32] dark:border-[#C5A059] bg-[#173C32] dark:bg-[#C5A059] text-[#F7F4EB] dark:text-[#1C1A17] font-display font-bold text-xs tracking-wider group-hover:bg-[#112F27] transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>UNDERWRITE CAUSE</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
};
