import React from 'react';
import { Button, Card } from '../components/bn.tsx';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';
import type { PageProps } from '../FundraisingApp.tsx';

const NEEDS = [
  ['Your story and a goal', 'Who needs help, how much, and by when.'],
  ['Where donations go', 'A bank account in the name of the person or group receiving the money.'],
  ['Proof', 'A supporting letter or document so the team can verify your fundraiser.'],
];

const ACTIVE_INCOMPLETE_STATUSES: FundraiserStatus[] = ['pending', 'changes_requested', 'approved', 'paused'];

export const StartFundraising: React.FC<PageProps> = ({ go }) => {
  const { data } = useMyFundraisers();
  const drafts = data.filter((f) => f.status === 'draft').length;
  const activeFundraiser = data.find((f) => ACTIVE_INCOMPLETE_STATUSES.includes(f.status));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Start a fundraiser</h1>
        <p className="text-sm text-zinc-500 max-w-xl">
          Tell your story and raise support from people who want to help. We review every fundraiser before it goes live.
        </p>
      </div>

      {activeFundraiser && (
        <div className="p-4 border-2 border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] space-y-2">
          <div className="flex items-center gap-2 text-[#9A7432]">
            <AlertCircle className="w-4 h-4" />
            <span className="font-serif font-bold text-sm text-[#14110E] dark:text-[#F4EFE6]">
              Active fundraiser in progress
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            You currently have an active fundraiser (&ldquo;{activeFundraiser.title}&rdquo;). Lewegene policy permits only one active or incomplete fundraiser at a time.
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => go({ name: 'manage', id: activeFundraiser.id })}>
              Manage active fundraiser
            </Button>
          </div>
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6] mb-3">Have these ready</h2>
        <ul className="space-y-3">
          {NEEDS.map(([title, text]) => (
            <li key={title}>
              <p className="text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">{title}</p>
              <p className="text-xs text-zinc-500">{text}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={() => go({ name: 'form' })}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          {activeFundraiser ? 'Create draft fundraiser' : 'Start a fundraiser'}
        </Button>
        {drafts > 0 && (
          <Button size="lg" variant="outline" onClick={() => go({ name: 'drafts' })}>
            Continue a draft ({drafts})
          </Button>
        )}
      </div>
    </div>
  );
};

