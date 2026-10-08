import React, { useState } from 'react';
import { Button, Card } from '../components/bn.tsx';
import { ArrowLeft, Pencil } from 'lucide-react';
import { FundraiserSummary } from '../components/FundraiserSummary.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { EDITABLE } from '../components/format.ts';
import { useFundraiser } from '../hooks/useFundraiser.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { ErrorState } from '../../../components/ErrorState.tsx';
import { Loading } from '../../../components/Loading.tsx';

export const FundraiserManagement: React.FC<PageProps & { id: string }> = ({ id, go, toast }) => {
  const [reload, setReload] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: f, isLoading, error, refresh } = useFundraiser(id, reload);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Manage fundraiser</h1>
        <Loading message="Loading fundraiser…" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Manage fundraiser</h1>
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      </div>
    );
  }
  if (!f) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">Manage fundraiser</h1>
        <p className="text-sm text-[#1E4D38] dark:text-[#52B788]">This fundraiser could not be found.</p>
      </div>
    );
  }

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

      {f.status === 'pending' && (
        <Card className="p-4 border-amber-600/40">
          <p className="text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">
            Your fundraiser is live and can accept donations while the admin team verifies it.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            It will receive a verified badge after admin approval.
          </p>
        </Card>
      )}

      {f.reviewNote && (
        <Card className="p-4 border-[#1E4D38] dark:border-[#52B788]">
          <p className="text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">Message from the review team</p>
          <p className="text-sm text-zinc-500 mt-1">{f.reviewNote}</p>
        </Card>
      )}

      {actionError && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{actionError}</p>}

      <div className="flex flex-wrap gap-3">
        {canEdit && (
          <Button onClick={() => go({ name: 'edit', id: f.id })} icon={<Pencil className="w-4 h-4" />}>
            {f.status === 'changes_requested' ? 'Edit and resubmit' : 'Edit fundraiser'}
          </Button>
        )}
        {!f.deleteRequested && !confirmingDelete && (
          <Button
            variant="outline"
            disabled={actionLoading}
            onClick={() => setConfirmingDelete(true)}
          >
            Request deletion
          </Button>
        )}
        {!f.deleteRequested && confirmingDelete && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Ask the team to delete this fundraiser?</span>
            <Button
              size="sm"
              isLoading={actionLoading}
              loadingLabel="Loading…"
              onClick={async () => {
                setActionLoading(true);
                setActionError(null);
                try {
                  await fundraisingApi.requestDelete(f.id);
                  setConfirmingDelete(false);
                  toast('Deletion requested. The team will review it.');
                  setReload((n) => n + 1);
                } catch (cause) {
                  setActionError(cause instanceof Error ? cause.message : 'Could not request fundraiser deletion.');
                } finally {
                  setActionLoading(false);
                }
              }}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        {f.deleteRequested && <p className="text-sm text-[#1E4D38] dark:text-[#52B788] self-center">Deletion requested</p>}
      </div>

      <FundraiserSummary fundraiser={f} />

      {f.status === 'pending' && (
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-500">Review Actions (Compliance Officer)</p>
          <div className="flex flex-wrap gap-2">
            {(['approved', 'changes_requested', 'rejected'] as const).map((s) => (
              <Button key={s} size="sm" variant="secondary" isLoading={actionLoading} loadingLabel="Loading…" onClick={async () => {
                setActionLoading(true);
                setActionError(null);
                try {
                  await fundraisingApi.demoReview(f.id, s);
                  setReload((n) => n + 1);
                } catch (cause) {
                  setActionError(cause instanceof Error ? cause.message : 'Could not update fundraiser status.');
                } finally {
                  setActionLoading(false);
                }
              }}>
                {s === 'approved' ? 'Approve' : s === 'rejected' ? 'Reject' : 'Request changes'}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
