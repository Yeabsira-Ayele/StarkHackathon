import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/bn.tsx';
import { FundraiserCard } from '../components/FundraiserCard.tsx';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { ErrorState } from '../../../components/ErrorState.tsx';
import { Loading } from '../../../components/Loading.tsx';

export const Drafts: React.FC<PageProps> = ({ go, toast }) => {
  const { t } = useTranslation();
  const { data, isLoading, error, refresh } = useMyFundraisers();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const drafts = data.filter((f) => f.status === 'draft');

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
        {t('fundraiser.drafts.title')}
      </h1>
      {actionError && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{actionError}</p>}
      {isLoading ? (
        <Loading message={t('fundraiser.drafts.loading')} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      ) : drafts.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{t('fundraiser.drafts.empty')}</p>
          <Button onClick={() => go({ name: 'form' })}>{t('fundraiser.listing.start')}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((f) => (
            <FundraiserCard
              key={f.id}
              fundraiser={f}
              actions={
                confirmingId === f.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {t('fundraiser.drafts.deleteConfirm')}
                    </span>
                    <Button
                      size="sm"
                      isLoading={deletingId === f.id}
                      loadingLabel={t('common.loading')}
                      onClick={async () => {
                        setDeletingId(f.id);
                        setActionError(null);
                        try {
                          await fundraisingApi.requestDelete(f.id);
                          setConfirmingId(null);
                          toast(t('fundraiser.drafts.deleted'));
                          await refresh();
                        } catch (cause) {
                          setActionError(cause instanceof Error ? cause.message : 'Could not request fundraiser deletion.');
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      {t('fundraiser.drafts.confirm')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>
                      {t('fundraiser.drafts.cancel')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button size="sm" onClick={() => go({ name: 'edit', id: f.id })}>
                      {t('fundraiser.listing.continueEditing')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmingId(f.id)}
                    >
                      {t('fundraiser.drafts.delete')}
                    </Button>
                  </>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
