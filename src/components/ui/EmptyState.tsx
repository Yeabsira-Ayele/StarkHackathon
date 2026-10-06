import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  onReset,
  actionText,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full p-12 text-center border-2 border-dashed border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9]/80 dark:bg-[#12100E]/80 font-mono space-y-4 rounded-[1px]">
      <div className="w-10 h-10 mx-auto rounded-full bg-[#9A7432]/10 flex items-center justify-center text-[#9A7432]">
        <AlertCircle className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h4 className="font-serif font-black text-lg text-[#14110E] dark:text-[#FFFFFF]">
          {title || t('common.empty')}
        </h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          {description || t('campaigns.noResults')}
        </p>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 py-2 px-4 border border-[#1E4D38] bg-[#1E4D38] text-white text-xs font-bold uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{actionText || t('campaigns.resetFilters')}</span>
        </button>
      )}
    </div>
  );
};
