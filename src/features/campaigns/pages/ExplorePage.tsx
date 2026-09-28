import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCampaignStore } from '../store/campaign.store';
import { CampaignFilter } from '../components/CampaignFilter';
import { CampaignGrid } from '../components/CampaignGrid';
import { Campaign } from '../types/campaign.types';

interface ExplorePageProps {
  onSelectCampaign: (campaign: Campaign) => void;
  onQuickPledge: (campaign: Campaign) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectCampaign,
  onQuickPledge,
}) => {
  const { t } = useTranslation();
  const { filteredCampaigns, isLoading, isError, error, refetch } = useCampaigns();
  const { resetFilters } = useCampaignStore();

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-[9px] font-black uppercase tracking-widest shadow-xs">
            {t('nav.explore')}
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#14110E] dark:text-[#FFFFFF] mt-1.5 tracking-tight">
            {t('campaigns.title')}
          </h2>
          <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            {t('campaigns.subtitle')}
          </p>
        </div>

        <div className="font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
          {filteredCampaigns.length} {t('common.active')}
        </div>
      </div>

      {/* Filter Component */}
      <CampaignFilter />

      {/* Grid Component */}
      <CampaignGrid
        campaigns={filteredCampaigns}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        onResetFilters={resetFilters}
        onSelectCampaign={onSelectCampaign}
        onQuickPledge={onQuickPledge}
      />
    </div>
  );
};
