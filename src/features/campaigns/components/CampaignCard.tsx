import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Campaign } from '../types/campaign.types';
import { APP_NAME } from '../../../data/content.ts';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onQuickPledge: (campaign: Campaign) => void;
  variant?: 'standard' | 'compact';
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelect,
  onQuickPledge,
  variant = 'standard',
}) => {
  const { t } = useTranslation();
  const percentage = campaign.goalAmount
    ? Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
    : 0;

  return (
    <article
      onClick={() => onSelect(campaign)}
      className="group relative flex flex-col justify-between border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#1E4D38] dark:hover:border-[#52B788] hover:shadow-xl cursor-pointer select-none rounded-[1px]"
    >
      {/* Decorative banknote corner stamps */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#1E4D38]/40 dark:border-[#9A7432]/40 pointer-events-none" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#1E4D38]/40 dark:border-[#9A7432]/40 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#1E4D38]/40 dark:border-[#9A7432]/40 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#1E4D38]/40 dark:border-[#9A7432]/40 pointer-events-none" />

      <div>
        {/* Top Identification Band */}
        <div className="flex items-center justify-between font-mono text-[10px] pb-3 border-b border-[#26211C]/15 dark:border-[#9A7432]/25">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-[#1E4D38] dark:text-[#52B788] tracking-widest">
              № {campaign.serialCode || 'LW-0421'}
            </span>
            <span className="text-zinc-400">·</span>
            <span className="font-bold uppercase text-[#8B5E14] dark:text-[#D8B066]">
              {t(`categories.${campaign.category}`)}
            </span>
          </div>

          <div className={`flex items-center gap-1 font-bold ${
            campaign.status === 'approved' ? 'text-[#1E4D38] dark:text-[#52B788]' : 'text-amber-700 dark:text-amber-400'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[9px] uppercase tracking-wider">
              {t(campaign.status === 'approved' ? 'common.fundraiserVerified' : 'common.fundraiserPendingVerification')}
            </span>
          </div>
        </div>

        {/* Thumbnail Plate */}
        <div className="relative aspect-16/9 w-full mt-3 overflow-hidden border border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#F2ECE1] dark:bg-[#181512]">
          {campaign.imageUrl ? (
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-zinc-500">
              {t('campaigns.intaglioPlate', { appName: APP_NAME.toUpperCase() })}
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#FAF6EC]/90 dark:bg-[#0C0A09]/90 border border-[#26211C]/30 text-[9px] font-mono font-bold text-[#14110E] dark:text-[#E8DEC8]">
            {t('campaigns.fundedPercent', { percent: percentage })}
          </div>
        </div>

        {/* Cause Headline & Narrative */}
        <div className="mt-4 space-y-2">
          <h3 className="font-serif font-black text-lg sm:text-xl text-[#14110E] dark:text-[#FFFFFF] leading-snug line-clamp-2 group-hover:text-[#1E4D38] dark:group-hover:text-[#52B788] transition-colors">
            {campaign.title}
          </h3>

          <p className="font-sans text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {campaign.story}
          </p>
        </div>
      </div>

      {/* Progress & Bottom Actions */}
      <div className="mt-5 pt-4 border-t border-[#26211C]/15 dark:border-[#9A7432]/25 space-y-3">
        {/* Promissory Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-[#EAE2D3] dark:bg-[#201B16] border border-[#26211C]/30 dark:border-[#9A7432]/40 rounded-[1px] overflow-hidden p-0.5">
            <div
              className="h-full bg-[#1E4D38] dark:bg-[#52B788] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
              {campaign.raisedAmount.toLocaleString()} {t('common.currency')}
            </span>
            <span className="text-zinc-500 font-bold">
              / {campaign.goalAmount.toLocaleString()} {t('common.currency')}
            </span>
          </div>
        </div>

        {/* Organization / Location info */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
          <span className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3 h-3 text-[#9A7432] shrink-0" />
            <span className="truncate">{campaign.location || t('campaigns.defaultLocation')}</span>
          </span>
          <span className="font-bold">
            {campaign.donationsCount || 0} {t('common.patrons')}
          </span>
        </div>

        {/* Direct Action Button */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickPledge(campaign);
            }}
            className="flex-1 py-2.5 px-3 border border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] dark:hover:bg-[#3E966C] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>{t('campaigns.underwrite')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
