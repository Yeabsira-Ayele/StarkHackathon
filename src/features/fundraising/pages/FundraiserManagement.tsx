import React, { useState } from 'react';
import { Button, Card } from '../components/bn.tsx';
import { ArrowLeft, Pencil } from 'lucide-react';
import { FundraiserSummary } from '../components/FundraiserSummary.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { EDITABLE } from '../components/format.ts';
import { useFundraiser } from '../hooks/useFundraiser.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';

export const FundraiserManagement: React.FC<PageProps & { id: string }> = ({ id, go, toast }) => {
  const [reload, setReload] = useState(0);
  const { data: f, isLoading } = useFundraiser(id, reload);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!f) return <p className="text-sm text-[#1E4D38] dark:text-[#52B788]">This fundraiser could not be found.</p>;

  const canEdit = EDITABLE.includes(f.status);

  return (
    <div className="space-y-5">
      <Button variant="outline" size="sm" onClick={() => go({ name: 'mine' })} icon={<ArrowLeft className="w-4 h-4" />}>
        My fundraisers
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Manage fundraiser</h1>
        <StatusBadge status={f.status} />
      </div>

      {f.reviewNote && (
        <Card className="p-4 border-[#1E4D38] dark:border-[#52B788]">
          <p className="text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">Message from the review team</p>
          <p className="text-sm text-zinc-500 mt-1">{f.reviewNote}</p>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {canEdit && (
          <Button onClick={() => go({ name: 'edit', id: f.id })} icon={<Pencil className="w-4 h-4" />}>
            {f.status === 'changes_requested' ? 'Edit and resubmit' : 'Edit fundraiser'}
          </Button>
        )}
        {!f.deleteRequested && (
          <Button
            variant="outline"
            onClick={async () => {
              if (!window.confirm('Ask the team to delete this fundraiser?')) return;
              await fundraisingApi.requestDelete(f.id);
              toast('Deletion requested. The team will review it.');
              setReload((n) => n + 1);
            }}
          >
            Request deletion
          </Button>
        )}
        {f.deleteRequested && <p className="text-sm text-[#1E4D38] dark:text-[#52B788] self-center">Deletion requested</p>}
      </div>

      <FundraiserSummary fundraiser={f} />

      {/* DEMO ONLY: stands in for Member 5's admin screen. Delete this block when admin review is connected. */}
      {f.status === 'pending' && (
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-500">Demo only — pretend to be the admin</p>
          <div className="flex flex-wrap gap-2">
            {(['approved', 'changes_requested', 'rejected'] as const).map((s) => (
              <Button key={s} size="sm" variant="secondary" onClick={async () => { await fundraisingApi.demoReview(f.id, s); setReload((n) => n + 1); }}>
                {s === 'approved' ? 'Approve' : s === 'rejected' ? 'Reject' : 'Request changes'}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
