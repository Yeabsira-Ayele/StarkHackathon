import React from 'react';
import { HandCoins, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TransparencyAuditRecord } from '../types/reports.types';

interface TransparencyAuditTableProps {
  records: TransparencyAuditRecord[];
  onSelectRecord?: (record: TransparencyAuditRecord) => void;
}

export const TransparencyAuditTable: React.FC<TransparencyAuditTableProps> = ({
  records,
  onSelectRecord,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
            የተረጋገጡ ልገሳዎች (Verified Contributions)
          </h3>
          <p className="text-xs text-[#73685B] dark:text-[#A89E90]">
            Completed donation records grouped by campaign
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#D5C8B2]/60 dark:border-[#2E2822] text-[#73685B] dark:text-[#A89E90] text-[11px]">
              <th className="pb-3 font-semibold">የፕሮጀክቱ ርዕስ</th>
              <th className="pb-3 font-semibold">ተቀባይ ድርጅት</th>
              <th className="pb-3 font-semibold text-right">የተሰበሰበ መጠን</th>
              <th className="pb-3 font-semibold text-center">ልገሳዎች</th>
              <th className="pb-3 font-semibold">የመጨረሻ ልገሳ</th>
              <th className="pb-3 font-semibold text-right">ሁኔታ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5C8B2]/40 dark:divide-[#2E2822]">
            {records.map((rec) => (
              <tr
                key={rec.id}
                onClick={() => onSelectRecord?.(rec)}
                className="hover:bg-[#EFE7D5]/40 dark:hover:bg-[#1C1814] cursor-pointer transition-colors"
              >
                <td className="py-3.5 pr-3 font-medium text-[#14110E] dark:text-[#FAF6EE] max-w-xs truncate">
                  {rec.campaignTitle}
                </td>
                <td className="py-3.5 pr-3 text-[#5A5046] dark:text-[#B8AEA0]">
                  {rec.organization}
                </td>
                <td className="py-3.5 pr-3 text-right font-mono font-bold text-[#1E4D38] dark:text-[#52B788]">
                  {rec.totalRaisedETB.toLocaleString()} {t('common.currency')}
                </td>
                <td className="py-3.5 pr-3 text-center text-[#73685B] dark:text-[#A89E90]">
                  {rec.contributionCount.toLocaleString()}
                </td>
                <td className="py-3.5 pr-3 font-mono text-[10px] text-[#9A7432] dark:text-[#C9A24D]">
                  {rec.lastContributionAt ? new Date(rec.lastContributionAt).toLocaleDateString() : '—'}
                </td>
                <td className="py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <HandCoins className="w-3 h-3" />
                    Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransparencyAuditTable;
