import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Eye, XCircle, Paperclip } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import { AdminReport } from '../types/admin.types.ts';
import {
  AdminButton, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, ReasonModal, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDate, fmtDateTime, useAdminToast,
} from '../components/AdminUI.tsx';

const TABS = ['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const;

export const AdminReports: React.FC = () => {
  const { store, focusId, go } = useAdmin();
  const { notify } = useAdminToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(focusId);
  const [modal, setModal] = useState<null | 'resolve' | 'dismiss'>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (focusId) setOpenId(focusId); }, [focusId]);

  const s = store.snapshot!;
  const user = (id: string) => s.users.find((u) => u.id === id);
  const view = (r: AdminReport) => {
    const c = store.campaignById.get(r.campaignId);
    const u = user(r.reporterId);
    return { cause: c?.title || r.campaignId, owner: c?.creatorName || '—', reporter: u?.name || 'Unknown', reporterEmail: u?.email || '' };
  };
  const rows = useMemo(
    () => s.reports.filter((r) => (tab === 'all' || r.status === tab) && (!q || `${view(r).cause} ${view(r).reporter} ${r.category}`.toLowerCase().includes(q.toLowerCase()))),
    [s.reports, tab, q, store.campaignById]
  );
  const open = s.reports.find((r) => r.id === openId) || null;
  const v = open ? view(open) : null;

  const act = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || 'Action failed', 'err'); } finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title="Reports" subtitle="Every reported cause lands here. Review it, then resolve or dismiss." actions={<SearchBox value={q} onChange={setQ} placeholder="Search cause, reporter…" />} />
      <FilterTabs value={tab} onChange={(t) => setTab(t as any)} tabs={TABS.map((t) => ({ id: t, label: t === 'all' ? 'All' : t[0].toUpperCase() + t.slice(1), count: t === 'all' ? s.reports.length : s.reports.filter((r) => r.status === t).length }))} />

      {rows.length === 0 ? (
        <Panel><EmptyState title="No reports" text="Nothing matches this filter." /></Panel>
      ) : (
        <DataTable head={['Reported cause', 'Category', 'Reporter', 'Date', 'Status', '']}>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td className="max-w-xs"><span className="text-sm font-semibold line-clamp-2">{view(r).cause}</span></Td>
              <Td className="font-mono text-xs">{r.category}</Td>
              <Td className="text-xs">{view(r).reporter}</Td>
              <Td className="font-mono text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</Td>
              <Td><StatusBadge status={r.status} /></Td>
              <Td className="text-right"><AdminButton onClick={() => setOpenId(r.id)} icon={<Eye className="w-3.5 h-3.5" />}>Open</AdminButton></Td>
            </Tr>
          ))}
        </DataTable>
      )}

      <DetailDrawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={v?.cause || ''}
        subtitle={open && <div className="flex gap-2 items-center"><StatusBadge status={open.status} /><span className="font-mono text-[10px] text-zinc-500">{open.id}</span></div>}
        footer={
          open && (open.status === 'pending' || open.status === 'reviewed') ? (
            <>
              {open.status === 'pending' && <AdminButton busy={busy} icon={<Eye className="w-3.5 h-3.5" />} onClick={() => act(async () => { await store.actions.updateReport(open.id, 'reviewed'); }, 'Report marked as reviewed.')}>Mark reviewed</AdminButton>}
              <AdminButton tone="gold" busy={busy} icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => setModal('resolve')}>Resolve</AdminButton>
              <AdminButton tone="red" busy={busy} icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => setModal('dismiss')}>Dismiss</AdminButton>
            </>
          ) : null
        }
      >
        {open && v && (
          <>
            <Panel title="Report">
              <DetailGrid items={[
                ['Reported by', <>{v.reporter}<div className="font-mono text-[10px] text-zinc-500">{v.reporterEmail}</div></>],
                ['Cause owner', v.owner],
                ['Category', open.category],
                ['Date', fmtDateTime(open.createdAt)],
              ]} />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-4 mb-1">Details</p>
              <p className="text-sm leading-relaxed">{open.details}</p>
            </Panel>
            <Panel title="Evidence">
              {open.evidence.length ? (
                <ul className="space-y-2">{open.evidence.map((e) => <li key={e} className="flex items-center gap-2 font-mono text-xs"><Paperclip className="w-4 h-4 text-[#9A7432]" />{e}</li>)}</ul>
              ) : <p className="font-mono text-xs text-zinc-500">No evidence provided.</p>}
            </Panel>
            {open.resolutionNote && <Panel title="Admin note"><p className="text-sm">{open.resolutionNote}</p></Panel>}
            <AdminButton tone="ghost" onClick={() => go('fundraisers', open.campaignId)}>Open the reported fundraiser</AdminButton>
          </>
        )}
      </DetailDrawer>

      <ReasonModal open={modal === 'resolve'} title="Resolve report" description="Describe what was done." confirmLabel="Resolve" tone="gold" required={false} onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.updateReport(open!.id, 'resolved', n || undefined); setModal(null); }, 'Report resolved. The reporter will be notified.')} />
      <ReasonModal open={modal === 'dismiss'} title="Dismiss report" description="Explain why no action is needed." confirmLabel="Dismiss" onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.updateReport(open!.id, 'dismissed', n); setModal(null); }, 'Report dismissed.')} />
    </div>
  );
};
