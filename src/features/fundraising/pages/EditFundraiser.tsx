import React from 'react';
import { useTranslation } from 'react-i18next';
import { FundraiserForm } from '../components/FundraiserForm.tsx';
import { EDITABLE } from '../components/format.ts';
import { fundraiserToValues } from '../schemas/fundraiser.schema.ts';
import { useFundraiser } from '../hooks/useFundraiser.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { ErrorState } from '../../../components/ErrorState.tsx';
import { Loading } from '../../../components/Loading.tsx';

export const EditFundraiser: React.FC<PageProps & { id: string }> = ({ id, go, toast }) => {
  const { t } = useTranslation();
  const { data: f, isLoading, error, refresh } = useFundraiser(id);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          {t('fundraiser.form.editTitle')}
        </h1>
        <Loading message={t('fundraiser.manage.loading')} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          {t('fundraiser.form.editTitle')}
        </h1>
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      </div>
    );
  }
  if (!f) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          {t('fundraiser.form.editTitle')}
        </h1>
        <p className="text-sm text-[#1E4D38] dark:text-[#52B788]">{t('fundraiser.manage.notFound')}</p>
      </div>
    );
  }
  if (!EDITABLE.includes(f.status)) {
    return <p className="text-sm text-zinc-500">{t('fundraiser.form.cannotEdit')}</p>;
  }

  // Drafts and "changes requested" go on to the preview (to be submitted). Others save and return.
  const goesToPreview = f.status === 'draft' || f.status === 'changes_requested';

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">{t('fundraiser.form.editTitle')}</h1>
      <FundraiserForm
        initial={fundraiserToValues(f)}
        lockSensitive={f.status === 'approved'}
        onBack={() => go(f.status === 'draft' ? { name: 'drafts' } : { name: 'manage', id: f.id })}
        onSaveDraft={
          f.status === 'draft'
            ? async (values) => {
                await fundraisingApi.save(values, f.id);
                toast(t('fundraiser.form.draftSaved'));
                go({ name: 'drafts' });
              }
            : undefined
        }
        continueLabel={goesToPreview ? 'fundraiser.form.continue' : 'fundraiser.form.saveChanges'}
        onContinue={async (values) => {
          await fundraisingApi.save(values, f.id);
          if (goesToPreview) go({ name: 'preview', id: f.id });
          else {
            toast(t('fundraiser.form.changesSaved'));
            go({ name: 'manage', id: f.id });
          }
        }}
      />
    </div>
  );
};
