import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, MessageSquareWarning, XCircle, FileText, Eye } from 'lucide-react';
import { Campaign } from '../../../types/index.ts';
import { useAdmin } from '../hooks/AdminContext.ts';
import { getFundraiserReviewInfo } from '../data/admin.data.ts';
import {
  AdminButton, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, ReasonModal, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDate, fmtDateTime, fmtETB, useAdminToast,
} from '../components/AdminUI.tsx';

const TABS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'pending', label: 'Pending Review', match: (c: Campaign) => c.status === 'pending' },
  { id: 'approved', label: 'Active', match: (c: Campaign) => c.status === 'approved' },
  { id: 'needs_changes', label: 'Needs Changes', match: (c: Campaign) => c.status === 'needs_changes' },
  { id: 'rejected', label: 'Rejected', match: (c: Campaign) => c.status === 'rejected' },
  { id: 'completed', label: 'Completed', match: (c: Campaign) => c.status === 'completed' },
];

export const AdminFundraisers: React.FC = () => {
  const { store, focusId } = useAdmin();
  const { notify } = useAdminToast();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(focusId);
  const [modal, setModal] = useState<null | 'changes' | 'reject'>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (focusId) setOpenId(focusId); }, [focusId]);

  const all = store.campaigns;
  const rows = useMemo(() => {
    const t = TABS.find((x) => x.id === tab)!;
    return all.filter(
      (c) => t.match(c) && (!q || `${c.title} ${c.creatorName} ${c.location || ''}`.toLowerCase().includes(q.toLowerCase()))
    );
  }, [all, tab, q]);

  const open = openId ? store.campaignById.get(openId) || null : null;
  const info = open ? getFundraiserReviewInfo(open.id, open.creatorName) : null;
  const history = open
    ? [
        ...store.snapshot!.activity.filter((e) => e.refId === open.id).map((e) => ({ at: e.at, text: e.message, by: e.actor })),
        { at: open.createdAt, text: 'Fundraiser created', by: open.creatorName },
      ].sort((a, b) => +new Date(b.at) - +new Date(a.at))
    : [];

  const act = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || 'Action failed', 'err'); } finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title="Fundraisers" subtitle="Nothing goes public until an admin approves it. Open a fundraiser to review it." actions={<SearchBox value={q} onChange={setQ} placeholder="Search title, creator, location…" />} />
      <FilterTabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ id: t.id, label: t.label, count: all.filter(t.match).length }))} />

      {rows.length === 0 ? (
        <Panel><EmptyState title="No fundraisers here" text="Nothing matches this filter." /></Panel>
      ) : (
        <DataTable head={['Fundraiser', 'Category', 'Goal', 'Raised', 'Status', 'Creator', '']}>
          {rows.map((c) => (
            <Tr key={c.id}>
              <Td className="max-w-xs">
                <div className="font-semibold text-sm line-clamp-1">{c.title}</div>
                <div className="font-mono text-[10px] text-zinc-500">{c.location || '—'} · {fmtDate(c.createdAt)}</div>
              </Td>
              <Td className="font-mono text-xs capitalize">{c.category}</Td>
              <Td className="font-mono text-xs tabular-nums whitespace-nowrap">{fmtETB(c.goalAmount)}</Td>
              <Td className="font-mono text-xs tabular-nums whitespace-nowrap">{fmtETB(c.raisedAmount)}</Td>
              <Td><StatusBadge status={c.status} fundraiser /></Td>
              <Td className="text-xs max-w-[180px]"><span className="line-clamp-2">{c.creatorName}</span></Td>
              <Td className="text-right"><AdminButton onClick={() => setOpenId(c.id)} icon={<Eye className="w-3.5 h-3.5" />}>Open</AdminButton></Td>
            </Tr>
          ))}
        </DataTable>
      )}

      <DetailDrawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.title || ''}
        subtitle={open && <div className="flex gap-2 items-center"><StatusBadge status={open.status} fundraiser /><span className="font-mono text-[10px] text-zinc-500">{open.serialCode || open.id}</span></div>}
        footer={
          open?.status === 'pending' ? (
            <>
              <AdminButton tone="gold" busy={busy} icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => act(async () => { await store.actions.approveFundraiser(open); }, 'Fundraiser approved and published.')}>Approve</AdminButton>
              <AdminButton busy={busy} icon={<MessageSquareWarning className="w-3.5 h-3.5" />} onClick={() => setModal('changes')}>Request changes</AdminButton>
              <AdminButton tone="red" busy={busy} icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => setModal('reject')}>Reject</AdminButton>
            </>
          ) : open ? (
            <span className="font-mono text-[11px] text-zinc-500">Review actions are available while a fundraiser is Pending Review.</span>
          ) : null
        }
      >
        {open && info && (
          <>
            <Panel title="Fundraiser">
              <DetailGrid items={[
                ['Category', <span className="capitalize">{open.category}</span>],
                ['Location', open.location],
                ['Goal', fmtETB(open.goalAmount)],
                ['Raised', fmtETB(open.raisedAmount)],
                ['Deadline', 'Not set'],
                ['Submitted', fmtDate(open.createdAt)],
              ]} />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-4 mb-1">Story</p>
              <p className="text-sm leading-relaxed text-[#201C18] dark:text-[#F4EFE6]">{open.story}</p>
            </Panel>

            <Panel title="Creator · Beneficiary · Receiver">
              <div className="grid sm:grid-cols-3 gap-5">
                <div><p className="font-mono text-[10px] font-black uppercase text-[#8B2626] mb-1">Creator</p><p className="text-sm">{open.creatorName}</p>{open.organizationName && <p className="font-mono text-[10px] text-zinc-500">{open.organizationName}</p>}</div>
                <div><p className="font-mono text-[10px] font-black uppercase text-[#8B2626] mb-1">Beneficiary</p><p className="text-sm">{info.beneficiary.name}</p><p className="font-mono text-[10px] text-zinc-500">{info.beneficiary.relation} · {info.beneficiary.phone}</p></div>
                <div><p className="font-mono text-[10px] font-black uppercase text-[#8B2626] mb-1">Receiving account</p><p className="text-sm">{info.receiving.accountName}</p><p className="font-mono text-[10px] text-zinc-500">{info.receiving.bank}<br />{info.receiving.accountNumber}</p></div>
              </div>
            </Panel>

            <Panel title="Supporting & verification information">
              <ul className="space-y-2 mb-3">
                {info.documents.map((d) => (
                  <li key={d.name} className="flex items-center gap-2 font-mono text-xs"><FileText className="w-4 h-4 text-[#9A7432]" /><span>{d.name}</span><span className="text-zinc-500">· {d.kind}</span></li>
                ))}
              </ul>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{info.verificationNotes}</p>
            </Panel>

            <Panel title="History" flush>
              <ul className="divide-y divide-[#26211C]/10 dark:divide-[#9A7432]/15">
                {history.map((h, i) => (
                  <li key={i} className="px-5 py-3"><p className="text-sm">{h.text}</p><p className="font-mono text-[10px] text-zinc-500">{h.by} · {fmtDateTime(h.at)}</p></li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </DetailDrawer>

      <ReasonModal
        open={modal === 'changes'}
        title="Request changes"
        description="The creator can edit and resubmit."
        confirmLabel="Send request"
        tone="gold"
        onClose={() => setModal(null)}
        onConfirm={(r) => act(async () => { await store.actions.requestFundraiserChanges(open!, r); setModal(null); }, 'Changes requested. The creator will be notified.')}
      />
      <ReasonModal
        open={modal === 'reject'}
        title="Reject fundraiser"
        description="Explain why this fundraiser cannot be published."
        confirmLabel="Reject fundraiser"
        onClose={() => setModal(null)}
        onConfirm={(r) => act(async () => { await store.actions.rejectFundraiser(open!, r); setModal(null); }, 'Fundraiser rejected.')}
      />
    </div>
  );
};
