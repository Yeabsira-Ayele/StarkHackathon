import React from 'react';
import { FundraiserForm } from '../components/FundraiserForm.tsx';
import { emptyValues } from '../schemas/fundraiser.schema.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';

export const FundraiserFormPage: React.FC<PageProps> = ({ go, toast }) => (
  <div className="space-y-5">
    <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Create your fundraiser</h1>
    <FundraiserForm
      initial={emptyValues}
      onBack={() => go({ name: 'start' })}
      onSaveDraft={async (values) => {
        await fundraisingApi.save(values);
        toast('Draft saved.');
        go({ name: 'drafts' });
      }}
      onContinue={async (values) => {
        const saved = await fundraisingApi.save(values);
        go({ name: 'preview', id: saved.id });
      }}
    />
  </div>
);
