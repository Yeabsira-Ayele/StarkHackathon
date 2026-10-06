import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, FileCheck, CheckCircle2, Building2, Calendar, Hash } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { EmptyState } from '../../../components/EmptyState';

interface CampaignReportDetailPageProps {
  onBack?: () => void;
}

export const CampaignReportDetailPage: React.FC<CampaignReportDetailPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { selectedRecord } = useReports();

  if (!selectedRecord) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <EmptyState
          title="ምንም የኦዲት ሪፖርት አልተመረጠም"
          actionLabel="ወደ ሪፖርቶች ተመለስ"
          onAction={onBack}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#73685B] hover:text-[#14110E] dark:hover:text-[#FAF6EE] mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', 'ወደ ኋላ')}
        </button>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            የተረጋገጠ የኦዲት ማህደር (Verified Audit Trail)
          </span>
        </div>

        <div>
          <h1 className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
            {selectedRecord.campaignTitle}
          </h1>
          <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1">
            ኦፊሴላዊ የገንዘብ ማስተላለፍ እና የኤስክሮ ማረጋገጫ ሰነድ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#EFE7D5]/50 dark:bg-[#1A1714] border border-[#D5C8B2]/50 dark:border-[#2E2822] text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-semibold">
              ተቀባይ ድርጅት
            </span>
            <p className="font-bold text-[#14110E] dark:text-[#FAF6EE] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#9A7432]" />
              {selectedRecord.organization}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-semibold">
              የተላለፈ መጠን
            </span>
            <p className="font-mono font-bold text-base text-[#1E4D38] dark:text-[#52B788]">
              {selectedRecord.disbursedAmount.toLocaleString()} {t('common.currency', 'ብር')}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-semibold">
              የኤስክሮ መለያ ቁጥር (Escrow Ref)
            </span>
            <p className="font-mono font-semibold text-[#14110E] dark:text-[#FAF6EE] flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#9A7432]" />
              {selectedRecord.escrowReference}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-semibold">
              የተላለፈበት ቀን
            </span>
            <p className="font-medium text-[#14110E] dark:text-[#FAF6EE] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#73685B]" />
              {selectedRecord.disbursementDate}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            ይህ የገንዘብ ዝውውር በኢ.ፌ.ዲ.ሪ ሲቪል ማኅበራት ድርጅቶች ባለስልጣን እና በኢትዮጵያ ብሔራዊ ባንክ ኤስክሮ ህግጋት መሰረት ኦዲት ተደርጎ ጸድቋል።
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignReportDetailPage;
