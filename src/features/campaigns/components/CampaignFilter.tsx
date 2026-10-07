import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useCampaignStore } from '../store/campaign.store';
import { CAMPAIGN_CATEGORIES } from '../data/categories.data';
import { CampaignCategory, CampaignFilterStatus } from '../types/campaign.types';

export const CampaignFilter: React.FC = () => {
  const { t } = useTranslation();

  const {
    searchQuery,
    selectedCategory,
    filterStatus,
    setSearchQuery,
    setSelectedCategory,
    setFilterStatus,
  } = useCampaignStore();

  const statusOptions: { id: CampaignFilterStatus; labelKey: string }[] = [
    { id: 'all', labelKey: 'common.all' },
    { id: 'active', labelKey: 'common.active' },
    { id: 'nearly_funded', labelKey: 'common.nearly_funded' },
    { id: 'completed', labelKey: 'common.completed' },
  ];

  return (
    <div className="p-4 sm:p-5 border-2 border-[#1E4D38]/25 dark:border-[#9A7432]/35 bg-[#FFFDF9]/95 dark:bg-[#141210]/95 space-y-4 shadow-sm rounded-[1px]">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-[#9A7432] absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('common.search')}
          className="w-full pl-10 pr-4 py-2 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#F7F2E7] dark:bg-[#080706] font-mono text-xs text-[#14110E] dark:text-[#FFFFFF] placeholder:text-zinc-500 focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788]"
        />
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#26211C]/15 dark:border-[#4A3E33]">
        {/* Sector Category Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
            {t('campaigns.sector')}:
          </span>
          {CAMPAIGN_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as CampaignCategory | 'all')}
                className={`px-3 py-1 border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] shadow-xs'
                    : 'border-[#26211C]/25 bg-[#FAF6EC] dark:bg-[#201B16] text-[#201C18] dark:text-[#E8DEC8] hover:border-[#1E4D38]'
                }`}
              >
                {t(`categories.${cat.id}`)}
              </button>
            );
          })}
        </div>

        {/* Funding Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
            {t('campaigns.statusLabel')}:
          </span>
          {statusOptions.map((status) => {
            const isSelected = filterStatus === status.id;

            return (
              <button
                key={status.id}
                type="button"
                onClick={() => setFilterStatus(status.id)}
                className={`px-2.5 py-1 border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#26211C] bg-[#26211C] text-white dark:border-[#9A7432] dark:bg-[#9A7432] dark:text-[#080706]'
                    : 'border-[#26211C]/25 bg-[#EAE2D3] dark:bg-[#161411] text-zinc-700 dark:text-zinc-300 hover:border-[#26211C]'
                }`}
              >
                {t(status.labelKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};