import React from 'react';
import { Coins, FolderKanban, HandCoins, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TransparencyOverview } from '../types/reports.types';

interface ImpactSummaryCardProps {
  overview: TransparencyOverview;
}

export const ImpactSummaryCard: React.FC<ImpactSummaryCardProps> = ({ overview }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-1.5 text-[#1E4D38] dark:text-[#52B788] mb-1">
          <Coins className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">የተረጋገጠ ልገሳ ድምር</span>
        </div>
        <p className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {overview.totalRaisedETB.toLocaleString()} {t('common.currency')}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">Completed payments only</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-1.5 text-[#9A7432] dark:text-[#C9A24D] mb-1">
          <HandCoins className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">የልገሳ ብዛት</span>
        </div>
        <p className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {overview.totalContributions.toLocaleString()}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">Verified payment records</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-1">
          <HeartHandshake className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">ድጋፍ ያገኙ ዘመቻዎች</span>
        </div>
        <p className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {overview.supportedCampaigns.toLocaleString()}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">Campaigns with donations</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
          <FolderKanban className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">የድጋፍ ዘርፎች</span>
        </div>
        <p className="text-xl font-serif font-bold text-[#1E4D38] dark:text-[#52B788]">
          {overview.sectorBreakdowns.length}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">Sectors with donations</p>
      </div>
    </div>
  );
};

export default ImpactSummaryCard;
