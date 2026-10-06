import React from 'react';
import { Inbox, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl border border-dashed border-[#D5C8B2]/80 dark:border-[#2E2822] bg-[#FAF6EE]/50 dark:bg-[#12100E]/40 ${className}`}
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#EBE3D3]/60 dark:bg-[#1E1A16] flex items-center justify-center text-[#9A7432] shadow-inner">
        {icon || <Inbox className="w-6 h-6 stroke-[1.75]" />}
      </div>
      <h3 className="text-base font-semibold text-[#26211C] dark:text-[#F4EFE6] tracking-tight">
        {title || t('common.empty', 'ምንም መረጃ አልተገኘም')}
      </h3>
      {description && (
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1.5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#26211C] text-[#FAF6EE] dark:bg-[#F4EFE6] dark:text-[#181512] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
