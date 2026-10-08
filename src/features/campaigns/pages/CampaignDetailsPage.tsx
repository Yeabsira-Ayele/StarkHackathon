import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Campaign } from '../types/campaign.types';
import { getCampaignFundedPercentage } from '../../../services/utils/campaignProgress.ts';
import { APP_NAME } from '../../../data/content.ts';

interface CampaignDetailsPageProps {
  campaign: Campaign;
  onBack: () => void;
  onPledge: (campaign: Campaign) => void;
}

export const CampaignDetailsPage: React.FC<CampaignDetailsPageProps> = ({
  campaign,
  onBack,
  onPledge,
}) => {
  const { t } = useTranslation();
  const percentage = Math.round(getCampaignFundedPercentage(campaign.raisedAmount, campaign.goalAmount));

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </button>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-sm font-black text-[#1E4D38] dark:text-[#52B788]">
            № {campaign.serialCode || 'LW-0421'}
          </span>
          <span className="px-2.5 py-0.5 border border-[#26211C]/40 text-[10px] font-bold uppercase">
            {campaign.category}
          </span>
          <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase ${
            campaign.status === 'approved'
              ? 'bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706]'
              : 'border border-amber-600/50 text-amber-800 dark:text-amber-300'
          }`}>
            {t(campaign.status === 'approved' ? 'common.fundraiserVerified' : 'common.fundraiserPendingVerification')}
          </span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual & Story */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual Plate */}
          <div className="relative aspect-16/10 w-full border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#F2ECE1] dark:bg-[#141210] overflow-hidden rounded-[1px]">
            {campaign.imageUrl ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover filter contrast-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-sm">
                {t('campaigns.intaglioPlate', { appName: APP_NAME.toUpperCase() })}
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#FFFDF9]/95 dark:bg-[#080706]/95 border border-[#26211C] font-mono text-xs font-bold text-[#1E4D38] dark:text-[#52B788]">
              {t('campaigns.beneficiaries')}: {campaign.beneficiariesTarget || 100}
            </div>
          </div>

          {/* Narrative Card */}
          <div className="p-6 sm:p-8 border-2 border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FFFDF9]/95 dark:bg-[#12100E]/95 space-y-4 rounded-[1px]">
            <h3 className="font-serif font-black text-xl text-[#14110E] dark:text-[#FFFFFF] border-b border-[#26211C]/15 pb-2">
              {campaign.title}
            </h3>

            <p className="font-sans text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {campaign.story}
            </p>

            {campaign.impactMetric && (
              <div className="p-4 border border-[#9A7432]/40 bg-[#F7F2E7]/80 dark:bg-[#201B16]/80 font-mono text-xs space-y-1">
                <p className="font-bold text-[#1E4D38] dark:text-[#52B788] uppercase">
                  {t('campaigns.impactMetric')}:
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {campaign.impactMetric}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Funding Box & Direct Action */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="p-6 sm:p-8 border-2 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-lg">
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold text-[#1E4D38] dark:text-[#52B788] tracking-wide uppercase">
                {campaign.organizationName || t('campaigns.accreditedOrg')}
              </span>
              <h2 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF] leading-snug">
                {campaign.title}
              </h2>
              <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9A7432]" />
                <span>{campaign.location || t('campaigns.defaultLocation')}</span>
              </p>
            </div>

            {/* Progress Metrics */}
            <div className="space-y-2 pt-2 border-t border-[#26211C]/15 dark:border-[#4A3E33]">
              <div className="w-full h-3 bg-[#EAE2D3] dark:bg-[#201B16] border border-[#26211C]/30 dark:border-[#9A7432]/40 rounded-[1px] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#1E4D38] dark:bg-[#52B788] transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-baseline font-mono pt-1">
                <div>
                  <span className="text-2xl font-black text-[#1E4D38] dark:text-[#52B788]">
                    {campaign.raisedAmount.toLocaleString()} {t('common.currency')}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">
                    ({percentage}%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 font-bold">
                    {t('common.goal')}: {campaign.goalAmount.toLocaleString()} {t('common.currency')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
              <div className="p-3 border border-[#26211C]/20 bg-[#F7F2E7] dark:bg-[#181512]">
                <span className="block text-[10px] text-zinc-500 font-bold uppercase">{t('common.patrons')}</span>
                <span className="text-lg font-black">{campaign.donationsCount || 0}</span>
              </div>
              <div className="p-3 border border-[#26211C]/20 bg-[#F7F2E7] dark:bg-[#181512]">
                <span className="block text-[10px] text-zinc-500 font-bold uppercase">{t('common.directEscrow')}</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">100%</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => onPledge(campaign)}
              className="w-full py-4 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-sm font-black tracking-widest uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] dark:hover:bg-[#3E966C] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:translate-y-px"
            >
              <span>{t('campaigns.underwrite')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
