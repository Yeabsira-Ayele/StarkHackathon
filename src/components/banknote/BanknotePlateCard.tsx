import React, { useState } from 'react';
import { Campaign } from '../../types/index.ts';
import { BanknoteRulerGauge } from './BanknoteArtwork.tsx';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export interface BanknotePlateCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onQuickPledge?: (campaign: Campaign) => void;
  isSpotlight?: boolean;
  className?: string;
}

export const BanknotePlateCard: React.FC<BanknotePlateCardProps> = ({
  campaign,
  onSelect,
  onQuickPledge,
  isSpotlight = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  if (!campaign) return null;

  const raised = campaign.raisedAmount || 0;
  const goal = campaign.goalAmount || 1;
  const percent = Math.min(Math.round((raised / goal) * 100), 100);

  const serial = campaign.serialCode || `№ ${String(campaign.id || '').replace('camp-', '00')}`;
  const categoryLabel = (campaign.category || 'CIVIC').toUpperCase();
  const locationLabel = (campaign.location || 'ADDIS ABABA, ETHIOPIA').toUpperCase();
  const orgName = campaign.organizationName || campaign.creatorName || 'Accredited Civil Society Org';

  return (
    <div
      onClick={() => onSelect(campaign)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(campaign);
        }
      }}
      className={`group relative flex flex-col justify-between border-2 transition-all duration-300 cursor-pointer select-none ${
        isSpotlight
          ? 'border-[#26211C] dark:border-[#9A7432] bg-[#FCF9F2] dark:bg-[#1E1A17] shadow-lg ring-1 ring-[#9A7432]/40'
          : 'border-[#26211C]/80 dark:border-[#4A3E33] bg-[#FCF9F2] dark:bg-[#1E1A17] hover:border-[#26211C] hover:shadow-xl'
      } p-4 sm:p-5 ${className}`}
    >
      {/* ─── INTAGLIO INNER PERIMETER LINE ─── */}
      <div className="absolute inset-1.5 border border-[#9A7432]/35 pointer-events-none" />

      {/* ─── TOP BANKNOTE PANEL HEADER ─── */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#26211C]/25 dark:border-[#4A3E33] pb-2 mb-3">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest text-[#26211C] dark:text-[#E8DEC8] uppercase">
          <span>PROJECT</span>
          <span className="text-[#8B2626] dark:text-[#D8B066] font-bold">№ {serial}</span>
        </div>

        <div className="flex items-center gap-2">
          {campaign.verifiedOrganization && (
            <span
              title="Federal ACSO Verified Organization"
              className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#8B2626] dark:text-[#D8B066]"
            >
              <ShieldCheck className="w-3 h-3 text-[#8B2626]" />
              <span>ACSO VERIFIED</span>
            </span>
          )}
          <span className="font-mono text-[9px] font-bold text-zinc-500">2026</span>
        </div>
      </div>

      {/* ─── ENGRAVED PROJECT ILLUSTRATION VIGNETTE ─── */}
      <div className="relative z-10 mb-3 w-full aspect-16/10 overflow-hidden border border-[#26211C] dark:border-[#9A7432] bg-[#EFE8D8] dark:bg-[#26201B]">
        {campaign.imageUrl && !imgError ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover filter contrast-110 saturate-90 group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-600 dark:text-zinc-400 font-mono text-xs">
            <span className="font-display font-black text-lg text-[#26211C] dark:text-[#D8B066]">LEWEGENE</span>
            <span>ENGRAVED ARCHIVE</span>
          </div>
        )}

        {/* Intaglio Line-Screen Etching Overlay */}
        <div className="absolute inset-0 pointer-events-none intaglio-overlay opacity-60 mix-blend-multiply" />

        {/* Category Corner Stamp */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#FAF6EE]/95 dark:bg-[#1C1815]/95 border border-[#26211C] text-[9px] font-mono font-black tracking-widest text-[#26211C] dark:text-[#D8B066] uppercase">
          {categoryLabel}
        </div>
      </div>

      {/* ─── TITLE & ORGANIZATION & LOCATION IDENTIFIERS ─── */}
      <div className="relative z-10 space-y-1 mb-3">
        <h3 className="font-serif font-bold text-base sm:text-lg text-[#201C18] dark:text-[#F4EFE6] line-clamp-2 leading-snug group-hover:text-[#8B2626] dark:group-hover:text-[#D8B066] transition-colors">
          {campaign.title}
        </h3>

        <p className="font-mono text-[10px] text-[#8B2626] dark:text-[#D8B066] font-bold tracking-wide truncate">
          {orgName}
        </p>

        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
          <MapPin className="w-3 h-3 text-[#9A7432]" />
          <span className="truncate">{locationLabel}</span>
        </div>
      </div>

      {/* ─── ENGRAVED FUNDING RULER GAUGE ─── */}
      <div className="relative z-10 mb-4">
        <BanknoteRulerGauge
          percent={percent}
          raised={campaign.raisedAmount}
          goal={campaign.goalAmount}
        />
      </div>

      {/* ─── ACTION & PROMISSORY FOOTER (OBVIOUS BUTTON!) ─── */}
      <div className="relative z-10 pt-2 border-t border-[#26211C]/25 dark:border-[#4A3E33] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickPledge) {
              onQuickPledge(campaign);
            } else {
              onSelect(campaign);
            }
          }}
          className="flex-1 py-2 px-3 border border-[#8B2626] bg-[#8B2626] text-white dark:bg-[#8B2626] dark:text-white font-mono text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5 hover:bg-[#701E1E] transition-colors cursor-pointer shadow-xs active:translate-y-px"
        >
          <span>SUPPORT THIS CAUSE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(campaign);
          }}
          className="py-2 px-2.5 border border-[#26211C] dark:border-[#4A3E33] bg-[#EFE8D8] dark:bg-[#26201B] text-[#201C18] dark:text-[#E8DEC8] font-mono text-[10px] font-bold uppercase hover:bg-[#E5DDCB] transition-colors cursor-pointer"
          title="Examine complete details and audit report"
        >
          DETAILS
        </button>
      </div>

      {/* ─── BOTTOM SERIAL FOOTER ─── */}
      <div className="relative z-10 mt-2 flex justify-between items-center text-[8px] font-mono text-zinc-500 tracking-wider">
        <span>{serial}</span>
        <span>{campaign.donationsCount || 0} PATRONS</span>
        <span>ACSO CLEARING · ፳፻፲፰</span>
      </div>
    </div>
  );
};
