import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/bn.tsx';
import { FundraiserSummary } from '../components/FundraiserSummary.tsx';
import { useFundraiser } from '../hooks/useFundraiser.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';

export const FundraiserPreview: React.FC<PageProps & { id: string }> = ({ id, go, toast }) => {
  const { data: f, isLoading } = useFundraiser(id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading preview…</p>;
  if (!f) return <p className="text-sm text-[#1E4D38] dark:text-[#52B788]">This fundraiser could not be found.</p>;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await fundraisingApi.submit(f.id);
      toast('Submitted for review. We will let you know the result.');
      go({ name: 'mine' });
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Preview</h1>
        <p className="text-sm text-zinc-500">Check everything before you submit. This is what the review team will see.</p>
      </div>
      <FundraiserSummary fundraiser={f} />
      {error && <p role="alert" className="text-sm text-[#1E4D38] dark:text-[#52B788] font-medium">{error}</p>}
      <div className="flex justify-between gap-3">
        <Button variant="outline" disabled={busy} onClick={() => go({ name: 'edit', id: f.id })} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to edit
        </Button>
        <Button isLoading={busy} onClick={submit} icon={<Send className="w-4 h-4" />}>
          Submit for review
        </Button>
      </div>
    </div>
  );
};
