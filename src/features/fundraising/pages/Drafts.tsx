import React from 'react';
import { Button } from '../components/bn.tsx';
import { FundraiserCard } from '../components/FundraiserCard.tsx';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';

export const Drafts: React.FC<PageProps> = ({ go, toast }) => {
  const { data, isLoading, refresh } = useMyFundraisers();
  const drafts = data.filter((f) => f.status === 'draft');

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Drafts</h1>
      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading drafts…</p>
      ) : drafts.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">You have no drafts. Start a fundraiser and save it to finish later.</p>
          <Button onClick={() => go({ name: 'form' })}>Start a fundraiser</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((f) => (
            <FundraiserCard
              key={f.id}
              fundraiser={f}
              actions={
                <>
                  <Button size="sm" onClick={() => go({ name: 'edit', id: f.id })}>Continue editing</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!window.confirm('Delete this draft? This cannot be undone.')) return;
                      await fundraisingApi.requestDelete(f.id);
                      toast('Draft deleted.');
                      refresh();
                    }}
                  >
                    Delete draft
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
