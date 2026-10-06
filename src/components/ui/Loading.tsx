import React from 'react';
import { useTranslation } from 'react-i18next';

export const Loading: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
      {/* Banknote Rosette Watermark Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#1E4D38]/30 dark:border-[#52B788]/30 border-t-[#1E4D38] dark:border-t-[#52B788] animate-spin" />
        <div className="absolute inset-2 rounded-full border border-[#9A7432]/40 dark:border-[#D8B066]/40 border-b-[#9A7432] dark:border-b-[#D8B066] animate-spin [animation-direction:reverse]" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-[#1E4D38] dark:text-[#52B788] font-bold">
        {message || t('common.loading')}
      </p>
    </div>
  );
};

export const CampaignSkeleton: React.FC = () => (
  <div className="border-2 border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#FFFDF9]/60 dark:bg-[#12100E]/60 p-5 space-y-4 animate-pulse rounded-[1px]">
    <div className="h-4 bg-[#EAE2D3] dark:bg-[#201B16] w-1/3" />
    <div className="aspect-16/9 bg-[#EAE2D3] dark:bg-[#201B16] w-full" />
    <div className="h-6 bg-[#EAE2D3] dark:bg-[#201B16] w-3/4" />
    <div className="h-4 bg-[#EAE2D3] dark:bg-[#201B16] w-full" />
    <div className="h-2.5 bg-[#EAE2D3] dark:bg-[#201B16] w-full mt-4" />
    <div className="h-10 bg-[#EAE2D3] dark:bg-[#201B16] w-full" />
  </div>
);
