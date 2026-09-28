import React from 'react';
import { History, Heart, FileCheck, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PatronActivity } from '../types/profile.types';

interface ActivityTimelineProps {
  activities: PatronActivity[];
  onViewCertificate?: (certificateId: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onViewCertificate,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
      <h3 className="text-sm font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-4 flex items-center gap-2">
        <History className="w-4 h-4 text-[#9A7432]" />
        የቅርብ ጊዜ አስተዋጽኦዎች (Recent Activity Log)
      </h3>

      <div className="divide-y divide-[#D5C8B2]/40 dark:divide-[#2E2822]">
        {activities.map((act) => (
          <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788] flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#14110E] dark:text-[#FAF6EE] truncate">
                  {act.title}
                </p>
                {act.campaignTitle && (
                  <p className="text-[11px] text-[#73685B] dark:text-[#A89E90] truncate mt-0.5">
                    {act.campaignTitle}
                  </p>
                )}
                <span className="text-[10px] text-[#9A7432] dark:text-[#C9A24D] font-mono">
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              {act.amount && (
                <p className="text-xs font-bold text-[#1E4D38] dark:text-[#52B788] font-mono">
                  +{act.amount.toLocaleString()} {t('common.currency', 'ብር')}
                </p>
              )}
              {act.certificateId && onViewCertificate && (
                <button
                  onClick={() => onViewCertificate(act.certificateId!)}
                  className="inline-flex items-center gap-1 text-[10px] text-[#9A7432] hover:underline font-semibold mt-1 cursor-pointer"
                >
                  <FileCheck className="w-3 h-3" />
                  ሰነድ ይመልከቱ
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
