import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/bn.tsx';
import { FundraiserCard } from '../components/FundraiserCard.tsx';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';
import type { PageProps } from '../FundraisingApp.tsx';

const FILTERS: { id: string; labelKey: string; match: FundraiserStatus[] | null }[] = [
  { id: 'all', labelKey: 'all', match: null },
  { id: 'verified', labelKey: 'verified', match: ['approved'] },
  { id: 'unverified', labelKey: 'unverified', match: ['pending', 'changes_requested'] },
  { id: 'rejected', labelKey: 'rejected', match: ['rejected'] },
  { id: 'completed', labelKey: 'completed', match: ['completed'] },
  { id: 'drafts', labelKey: 'drafts', match: ['draft'] },
];

export const MyFundraisers: React.FC<PageProps> = ({ go }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useMyFundraisers();
  const [filter, setFilter] = useState('all');
  const match = FILTERS.find((f) => f.id === filter)?.match;
  const shown = match ? data.filter((f) => match.includes(f.status)) : data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          {t('fundraiser.listing.title')}
        </h1>
        <Button onClick={() => go({ name: 'form' })}>{t('fundraiser.listing.start')}</Button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('fundraiser.listing.filterLabel')}>
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
            className={`font-mono text-[10px] font-black uppercase tracking-wider px-3 py-1.5  border cursor-pointer ${
              filter === f.id ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#F4EFE6]' : 'border-[#26211C]/20 dark:border-[#9A7432]/30 text-zinc-500 hover:border-[#1E4D38] dark:hover:border-[#52B788]'}`}>
            {t(`fundraiser.listing.filters.${f.labelKey}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">{t('fundraiser.listing.loading')}</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {data.length === 0
            ? t('fundraiser.listing.noneStarted')
            : t('fundraiser.listing.noneInGroup')}
        </p>
      ) : (
        <div className="space-y-3">
          {shown.map((f) => (
            <FundraiserCard
              key={f.id}
              fundraiser={f}
              actions={
                f.status === 'draft' ? (
                  <Button size="sm" onClick={() => go({ name: 'edit', id: f.id })}>
                    {t('fundraiser.listing.continueEditing')}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => go({ name: 'manage', id: f.id })}>
                    {t('fundraiser.listing.manage')}
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
