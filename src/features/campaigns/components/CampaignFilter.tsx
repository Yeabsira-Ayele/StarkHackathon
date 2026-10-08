import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useCampaignStore } from '../store/campaign.store';
import { CAMPAIGN_CATEGORIES } from '../data/categories.data';
import { CampaignCategory, CampaignFilterStatus } from '../types/campaign.types';
import { DISCOVER_LOCATIONS } from '../../../services/lookupService.ts';

export const CampaignFilter: React.FC = () => {
  const { t } = useTranslation();

  const {
    searchQuery,
    selectedCategory,
    filterStatus,
    selectedLocation,
    setSearchQuery,
    setSelectedCategory,
    setFilterStatus,
    setSelectedLocation,
    resetFilters,
  } = useCampaignStore();

  const statusOptions: { id: CampaignFilterStatus; labelKey: string }[] = [
    { id: 'all', labelKey: 'common.all' },
    { id: 'active', labelKey: 'common.active' },
    { id: 'nearly_funded', labelKey: 'common.nearly_funded' },
    { id: 'completed', labelKey: 'common.completed' },
  ];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    filterStatus !== 'all' ||
    selectedLocation !== 'all' ||
    searchQuery.trim() !== '';

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

      {/* Filter Options: Sector next to Status next to Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-[#26211C]/15 dark:border-[#4A3E33]">
        {/* 1. SECTOR SELECTOR */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="sector-filter-select" className="text-[10px] font-mono font-bold text-zinc-500 uppercase flex items-center justify-between">
            <span>{t('campaigns.sector')}:</span>
            {selectedCategory !== 'all' && (
              <span className="text-[9px] text-[#1E4D38] dark:text-[#52B788] font-bold">{t('campaigns.filterActive')}</span>
            )}
          </label>
          <select
            id="sector-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CampaignCategory | 'all')}
            className="w-full appearance-none px-3 py-1.5 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#1C1814] font-mono text-xs font-bold uppercase text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] cursor-pointer shadow-xs"
          >
            {CAMPAIGN_CATEGORIES.map((cat) => {
              return (
                <option key={cat.id} value={cat.id} className="bg-[#FAF6EC] dark:bg-[#1C1814] text-[#201C18] dark:text-[#F4EFE6]">
                  {t(`categories.${cat.id}`)}
                </option>
              );
            })}
          </select>
        </div>

        {/* 2. STATUS SELECTOR */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="status-filter-select" className="text-[10px] font-mono font-bold text-zinc-500 uppercase flex items-center justify-between">
            <span>{t('campaigns.statusLabel')}:</span>
            {filterStatus !== 'all' && (
              <span className="text-[9px] text-[#1E4D38] dark:text-[#52B788] font-bold">{t('campaigns.filterActive')}</span>
            )}
          </label>
          <select
            id="status-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CampaignFilterStatus)}
            className="w-full appearance-none px-3 py-1.5 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#1C1814] font-mono text-xs font-bold uppercase text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] cursor-pointer shadow-xs"
          >
            {statusOptions.map((status) => (
              <option key={status.id} value={status.id} className="bg-[#FAF6EC] dark:bg-[#1C1814] text-[#201C18] dark:text-[#F4EFE6]">
                {t(status.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* 3. LOCATION SELECTOR */}
        <div className="flex flex-col gap-0.5">
          <label htmlFor="location-filter-select" className="text-[10px] font-mono font-bold text-zinc-500 uppercase flex items-center justify-between">
            <span>{t('campaigns.location')}:</span>
            {selectedLocation !== 'all' && (
              <span className="text-[9px] text-[#1E4D38] dark:text-[#52B788] font-bold">{t('campaigns.filterActive')}</span>
            )}
          </label>
          <select
            id="location-filter-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full appearance-none px-3 py-1.5 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#1C1814] font-mono text-xs font-bold uppercase text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] cursor-pointer shadow-xs"
          >
            <option value="all" className="bg-[#FAF6EC] dark:bg-[#1C1814] text-[#201C18] dark:text-[#F4EFE6]">
              {t('campaigns.allLocations')}
            </option>
            {DISCOVER_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-[#FAF6EC] dark:bg-[#1C1814] text-[#201C18] dark:text-[#F4EFE6]">
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={resetFilters}
            className="text-[10px] font-mono font-bold text-[#1E4D38] dark:text-[#52B788] uppercase hover:underline cursor-pointer"
          >
            {t('campaigns.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
};