import React, { useState } from 'react';
import { Button } from '../components/bn.tsx';
import { FundraiserCard } from '../components/FundraiserCard.tsx';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';
import type { PageProps } from '../FundraisingApp.tsx';

const FILTERS: { id: string; label: string; match: FundraiserStatus[] | null }[] = [
  { id: 'all', label: 'All', match: null },
  { id: 'active', label: 'Active', match: ['approved', 'paused'] },
  { id: 'pending', label: 'Pending', match: ['pending', 'changes_requested'] },
  { id: 'rejected', label: 'Rejected', match: ['rejected'] },
  { id: 'drafts', label: 'Drafts', match: ['draft'] },
];

export const MyFundraisers: React.FC<PageProps> = ({ go }) => {
  const { data, isLoading } = useMyFundraisers();
  const [filter, setFilter] = useState('all');
  const match = FILTERS.find((f) => f.id === filter)?.match;
  const shown = match ? data.filter((f) => match.includes(f.status)) : data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">My fundraisers</h1>
        <Button onClick={() => go({ name: 'form' })}>Start a fundraiser</Button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter fundraisers">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
            className={`font-mono text-[10px] font-black uppercase tracking-wider px-3 py-1.5  border cursor-pointer ${
              filter === f.id ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#F4EFE6]' : 'border-[#26211C]/20 dark:border-[#9A7432]/30 text-zinc-500 hover:border-[#1E4D38] dark:hover:border-[#52B788]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading your fundraisers…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {data.length === 0 ? 'You have not started a fundraiser yet.' : 'No fundraisers in this group.'}
        </p>
      ) : (
        <div className="space-y-3">
          {shown.map((f) => (
            <FundraiserCard
              key={f.id}
              fundraiser={f}
              actions={
                f.status === 'draft' ? (
                  <Button size="sm" onClick={() => go({ name: 'edit', id: f.id })}>Continue editing</Button>
                ) : (
                  <Button size="sm" onClick={() => go({ name: 'manage', id: f.id })}>Manage</Button>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
