import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './bn.tsx';
import type { Fundraiser } from '../types/fundraiser.types.ts';
import { StatusBadge } from './StatusBadge.tsx';
import { formatEtb } from './format.ts';

// Feature-local card for "My fundraisers" / "Drafts". Member 1 owns the public CampaignCard.
export const FundraiserCard: React.FC<{ fundraiser: Fundraiser; actions: React.ReactNode }> = ({ fundraiser: f, actions }) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('am') ? 'am-ET' : 'en-GB';
  const updatedDate = f.updatedAt
    ? new Date(f.updatedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <Card className="flex flex-col sm:flex-row">
      <div className="sm:w-44 h-32 sm:h-auto shrink-0 bg-[#EFE7D5] dark:bg-[#181512]">
        {f.images[0] && <img src={f.images[0]} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 p-4 space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={f.status} />
          {f.deleteRequested && (
            <span className="text-xs text-[#1E4D38] dark:text-[#52B788] font-medium">
              {t('fundraiser.card.deleteRequested')}
            </span>
          )}
        </div>
        <h3 className="font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6] truncate">
          {f.title || t('fundraiser.card.untitled')}
        </h3>
        <p className="text-xs text-zinc-500">
          {f.goalAmount
            ? t('fundraiser.card.goal', { amount: formatEtb(f.goalAmount) })
            : t('fundraiser.card.noGoal')}{' '}
          · {t('fundraiser.card.lastEdited', { date: updatedDate })}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
      </div>
    </Card>
  );
};
