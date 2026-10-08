import React, { useState } from 'react';
import { Campaign } from '../../../types/index.ts';
import { ShieldCheck, Check, X, Building2, MapPin, AlertCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CampaignModerationCardProps {
  campaign: Campaign;
  onApprove: (id: string, reason?: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  isProcessing?: boolean;
}

export const CampaignModerationCard: React.FC<CampaignModerationCardProps> = ({
  campaign,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);

  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
              ማረጋገጫ የሚሻ (Pending Review)
            </span>
            <span className="text-[10px] text-[#73685B] dark:text-[#A89E90] font-mono">
              ID: {campaign.id}
            </span>
          </div>
          <h3 className="text-base font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
            {campaign.title}
          </h3>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#73685B] dark:text-[#A89E90]">የተጠየቀው ግብ</p>
          <p className="text-base font-serif font-bold text-[#1E4D38] dark:text-[#52B788]">
            {campaign.goalAmount.toLocaleString()} {t('common.currency')}
          </p>
        </div>
      </div>

      <p className="text-xs text-[#5A5046] dark:text-[#B8AEA0] line-clamp-3 leading-relaxed">
        {campaign.story}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#73685B] dark:text-[#A89E90] pt-2 border-t border-[#D5C8B2]/50 dark:border-[#2E2822]">
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#9A7432]" />
          {campaign.organizationName || campaign.creatorName}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {campaign.location}
        </span>
        {campaign.beneficiariesTarget && (
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {campaign.beneficiariesTarget.toLocaleString()} ተጠቃሚዎች
          </span>
        )}
      </div>

      {showRejectInput && (
        <div className="pt-2 animate-in fade-in">
          <label className="block text-[11px] font-semibold text-red-600 dark:text-red-400 mb-1">
            ውድቅ የተደረገበት ኦፊሴላዊ ምክንያት
          </label>
          <input
            type="text"
            placeholder="የውድቅ ማድረጊያ ማስታወሻ ያስገቡ..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-red-300 dark:border-red-900/50 text-xs text-[#14110E] dark:text-[#FAF6EE] focus:outline-none"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {showRejectInput ? (
          <>
            <button
              onClick={() => setShowRejectInput(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-[#73685B] hover:text-[#14110E] cursor-pointer"
            >
              ተመለስ
            </button>
            <button
              onClick={() => onReject(campaign.id, rejectReason || 'በሲቪል ማኅበራት ህግ መሰረት ውድቅ ተደርጓል')}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              ውድቅ አድርግ
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowRejectInput(true)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              ውድቅ አድርግ
            </button>
            <button
              onClick={() => onApprove(campaign.id, 'የሲቪል ማኅበራት ህጋዊ ሰነድ ተረጋግጧል')}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              አጽድቅና ለህዝብ ይፋ አድርግ (Approve)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignModerationCard;
