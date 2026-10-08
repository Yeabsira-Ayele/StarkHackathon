import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertOctagon, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminStats } from '../types/admin.types';

interface AdminStatsBarProps {
  stats: AdminStats;
}

export const AdminStatsBar: React.FC<AdminStatsBarProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">በጥበቃ ላይ</span>
        </div>
        <p className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {stats.pendingCount}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">ማረጋገጫ የሚሹ ማመልከቻዎች</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">የተረጋገጡ</span>
        </div>
        <p className="text-2xl font-serif font-bold text-[#1E4D38] dark:text-[#52B788]">
          {stats.approvedCount}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">ለህዝብ ይፋ የተደረጉ ፕሮጀክቶች</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-2 text-[#9A7432] dark:text-[#C9A24D] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">የተሰበሰበ ድምር</span>
        </div>
        <p className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {(stats.totalVolumeETB / 1000000).toFixed(1)}M {t('common.currency')}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">በብሔራዊ ኤስክሮ የተጣራ</p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
          <Building2 className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">ሲቪል ድርጅቶች</span>
        </div>
        <p className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {stats.activeFoundations}
        </p>
        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] mt-0.5">በ ACCO ፈቃድ የተመዘገቡ</p>
      </div>
    </div>
  );
};

export default AdminStatsBar;
