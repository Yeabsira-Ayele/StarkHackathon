import React from 'react';
import { FundraiserForm } from '../components/FundraiserForm.tsx';
import { EDITABLE } from '../components/format.ts';
import { fundraiserToValues } from '../schemas/fundraiser.schema.ts';
import { useFundraiser } from '../hooks/useFundraiser.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';

export const EditFundraiser: React.FC<PageProps & { id: string }> = ({ id, go, toast }) => {
  const { data: f, isLoading } = useFundraiser(id);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!f) return <p className="text-sm text-[#1E4D38] dark:text-[#52B788]">This fundraiser could not be found.</p>;
  if (!EDITABLE.includes(f.status)) {
    return <p className="text-sm text-zinc-500">This fundraiser can no longer be edited.</p>;
  }

  // Drafts and "changes requested" go on to the preview (to be submitted). Others save and return.
  const goesToPreview = f.status === 'draft' || f.status === 'changes_requested';

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Edit fundraiser</h1>
      <FundraiserForm
        initial={fundraiserToValues(f)}
        lockSensitive={f.status === 'approved'}
        onBack={() => go(f.status === 'draft' ? { name: 'drafts' } : { name: 'manage', id: f.id })}
        onSaveDraft={
          f.status === 'draft'
            ? async (values) => {
                await fundraisingApi.save(values, f.id);
                toast('Draft saved.');
                go({ name: 'drafts' });
              }
            : undefined
        }
        continueLabel={goesToPreview ? 'Continue' : 'Save changes'}
        onContinue={async (values) => {
          await fundraisingApi.save(values, f.id);
          if (goesToPreview) go({ name: 'preview', id: f.id });
          else {
            toast('Changes saved.');
            go({ name: 'manage', id: f.id });
          }
        }}
      />
    </div>
  );
};
