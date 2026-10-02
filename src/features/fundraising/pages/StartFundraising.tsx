import React from 'react';
import { Button, Card } from '../components/bn.tsx';
import { ArrowRight } from 'lucide-react';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import type { PageProps } from '../FundraisingApp.tsx';

const NEEDS = [
  ['Your story and a goal', 'Who needs help, how much, and by when.'],
  ['Where donations go', 'A bank account in the name of the person or group receiving the money.'],
  ['Proof', 'A supporting letter or document so the team can verify your fundraiser.'],
];

export const StartFundraising: React.FC<PageProps> = ({ go }) => {
  const { data } = useMyFundraisers();
  const drafts = data.filter((f) => f.status === 'draft').length;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Start a fundraiser</h1>
        <p className="text-sm text-zinc-500 max-w-xl">
          Tell your story and raise support from people who want to help. We review every fundraiser before it goes live.
        </p>
      </div>

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
        <Button size="lg" onClick={() => go({ name: 'form' })} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
          Start a fundraiser
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
