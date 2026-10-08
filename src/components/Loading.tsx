import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'full';
  count?: number;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  variant = 'spinner',
  count = 3,
  className = '',
}) => {
  const { t } = useTranslation();
  const loadingText = message || t('common.loading');

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#EBE3D3]/50 dark:bg-[#1A1714]/60 border border-[#D5C8B2]/40 dark:border-[#2E2822]/40 space-y-3"
          >
            <div className="h-4 bg-[#D8CEBC]/60 dark:bg-[#2A241F]/80 rounded w-1/3" />
            <div className="h-3 bg-[#E0D7C7]/50 dark:bg-[#241F1A]/70 rounded w-3/4" />
            <div className="h-3 bg-[#E0D7C7]/50 dark:bg-[#241F1A]/70 rounded w-1/2" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-6 w-24 bg-[#D8CEBC]/60 dark:bg-[#2A241F]/80 rounded-full" />
              <div className="h-4 w-16 bg-[#E0D7C7]/50 dark:bg-[#241F1A]/70 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`min-h-[50vh] flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#9A7432]/20 border-t-[#9A7432] animate-spin" />
        </div>
        <p className="text-sm font-medium text-[#5A5046] dark:text-[#A89E90] animate-pulse">
          {loadingText}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-2.5 py-6 text-[#5A5046] dark:text-[#A89E90] ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin text-[#9A7432]" />
      <span className="text-xs font-medium">{loadingText}</span>
    </div>
  );
};

export default Loading;
