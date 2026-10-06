import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/bn.tsx';
import { FundraiserSummary } from '../components/FundraiserSummary.tsx';
import { useFundraiser } from '../hooks/useFundraiser.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { ErrorState } from '../../../components/ErrorState.tsx';
import { Loading } from '../../../components/Loading.tsx';

export const FundraiserPreview: React.FC<PageProps & { id: string }> = ({ id, go, toast, onCampaignsChanged }) => {
  const { t } = useTranslation();
  const { data: f, isLoading, error: loadError, refresh } = useFundraiser(id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <Loading message="Loading fundraiser preview…" />;
  if (loadError) return <ErrorState message={loadError.message} onRetry={() => void refresh()} />;
  if (!f) return <p className="text-sm text-[#1E4D38] dark:text-[#52B788]">This fundraiser could not be found.</p>;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await fundraisingApi.submit(f.id);
      onCampaignsChanged?.();
      toast(t('fundraiser.preview.published'));
      go({ name: 'mine' });
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">{t('fundraiser.preview.title')}</h1>
        <p className="text-sm text-zinc-500">{t('fundraiser.preview.description')}</p>
      </div>
      <FundraiserSummary fundraiser={f} />
      {error && <p role="alert" className="text-sm text-[#1E4D38] dark:text-[#52B788] font-medium">{error}</p>}
      <div className="flex justify-between gap-3">
        <Button variant="outline" disabled={busy} onClick={() => go({ name: 'edit', id: f.id })} icon={<ArrowLeft className="w-4 h-4" />}>
          {t('fundraiser.preview.backToEdit')}
        </Button>
        <Button isLoading={busy} onClick={submit} icon={<Send className="w-4 h-4" />}>
          {t('fundraiser.preview.publish')}
        </Button>
      </div>
    </div>
  );
};
