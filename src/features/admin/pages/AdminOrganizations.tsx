import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Eye, FileText, Mail, MessageSquareWarning, Phone, XCircle } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import {
  AdminButton, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, ReasonModal, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDate, fmtDateTime, fmtETB, useAdminToast,
} from '../components/AdminUI.tsx';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'New applications' },
  { id: 'approved', label: 'Approved' },
  { id: 'needs_changes', label: 'Needs changes' },
  { id: 'rejected', label: 'Rejected' },
];

export const AdminOrganizations: React.FC = () => {
  const { store, focusId } = useAdmin();
  const { notify } = useAdminToast();
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(focusId);
  const [modal, setModal] = useState<null | 'changes' | 'reject'>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (focusId) setOpenId(focusId); }, [focusId]);

  const orgs = store.snapshot!.organizations;
  const rows = useMemo(
    () => orgs.filter((o) => (tab === 'all' || o.status === tab) && (!q || `${o.name} ${o.officialEmail} ${o.address}`.toLowerCase().includes(q.toLowerCase()))),
    [orgs, tab, q]
  );
  const open = orgs.find((o) => o.id === openId) || null;
  const canDecide = open && (open.status === 'pending' || open.status === 'needs_changes');

  const act = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || 'Action failed', 'err'); } finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title="Organizations" subtitle="Review organization applications. Only verified organizations get an official profile." actions={<SearchBox value={q} onChange={setQ} placeholder="Search name, email, location…" />} />
      <FilterTabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ ...t, count: t.id === 'all' ? orgs.length : orgs.filter((o) => o.status === t.id).length }))} />

      {rows.length === 0 ? <Panel><EmptyState title="No organizations here" text="Nothing matches this filter." /></Panel> : (
        <DataTable head={['Organization', 'Type', 'Contact', 'Submitted', 'Status', '']}>
          {rows.map((o) => (
            <Tr key={o.id}>
              <Td><div className="text-sm font-semibold">{o.name}</div><div className="font-mono text-[10px] text-zinc-500">{o.address}</div></Td>
              <Td className="font-mono text-xs capitalize">{o.organizationType}</Td>
              <Td className="font-mono text-[11px]">{o.officialEmail}<br />{o.phone}</Td>
              <Td className="font-mono text-xs whitespace-nowrap">{fmtDate(o.submittedAt)}</Td>
              <Td><StatusBadge status={o.status} /></Td>
              <Td className="text-right"><AdminButton onClick={() => setOpenId(o.id)} icon={<Eye className="w-3.5 h-3.5" />}>Open</AdminButton></Td>
            </Tr>
          ))}
        </DataTable>
      )}

      <DetailDrawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name || ''}
        subtitle={open && <div className="flex gap-2 items-center"><StatusBadge status={open.status} /><span className="font-mono text-[10px] text-zinc-500 capitalize">{open.organizationType}</span></div>}
        footer={canDecide ? (
          <>
            <AdminButton tone="gold" busy={busy} icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => act(async () => { await store.actions.decideOrganization(open!.id, 'approved'); }, 'Organization approved. A verified profile is now active.')}>Approve</AdminButton>
            <AdminButton busy={busy} icon={<MessageSquareWarning className="w-3.5 h-3.5" />} onClick={() => setModal('changes')}>Request changes</AdminButton>
            <AdminButton tone="red" busy={busy} icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => setModal('reject')}>Reject</AdminButton>
          </>
        ) : null}
      >
        {open && (
          <>
            <Panel title="Organization">
              <DetailGrid items={[
                ['Official email', open.officialEmail], ['Phone', open.phone],
                ['Type', <span className="capitalize">{open.organizationType}</span>], ['Location / address', open.address],
                ['Submitted', fmtDate(open.submittedAt)], ['Verification status', <StatusBadge status={open.status} />],
              ]} />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-4 mb-1">Description</p>
              <p className="text-sm leading-relaxed">{open.description}</p>
            </Panel>

            <Panel title="Contact the organization" actions={open.lastContactedAt ? <span className="font-mono text-[10px] text-zinc-500">Last contacted {fmtDateTime(open.lastContactedAt)}</span> : undefined}>
              <p className="font-mono text-[11px] text-zinc-500 mb-3">Use the provided email or phone when clarification is needed.</p>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${open.officialEmail}`} onClick={() => store.actions.contactOrganization(open.id, 'email')}>
                  <AdminButton icon={<Mail className="w-3.5 h-3.5" />} type="button">Email</AdminButton>
                </a>
                <a href={`tel:${open.phone.replace(/\s/g, '')}`} onClick={() => store.actions.contactOrganization(open.id, 'phone')}>
                  <AdminButton icon={<Phone className="w-3.5 h-3.5" />} type="button">Call</AdminButton>
                </a>
              </div>
            </Panel>

            <Panel title="Authorized representative"><DetailGrid cols={3} items={[['Name', open.representative.name], ['Role', open.representative.role], ['Phone', open.representative.phone]]} /></Panel>
            <Panel title="Receiving bank account"><DetailGrid cols={3} items={[['Bank', open.bank.bank], ['Account number', open.bank.accountNumber], ['Account name', open.bank.accountName]]} /></Panel>

            <Panel title="Verification documents">
              {open.documents.length === 0 ? <p className="font-mono text-xs text-[#8B2626]">No documents uploaded.</p> : (
                <ul className="space-y-2">{open.documents.map((d) => <li key={d} className="flex items-center gap-2 font-mono text-xs"><FileText className="w-4 h-4 text-[#9A7432]" />{d}</li>)}</ul>
              )}
            </Panel>

            {open.status === 'approved' && (
              <Panel title="Verified profile"><DetailGrid cols={3} items={[['Active causes', open.activeCauses], ['Total funds raised', fmtETB(open.totalRaised)], ['Badge', 'Verified']]} /></Panel>
            )}
            {open.decisionNote && <Panel title="Admin note"><p className="text-sm">{open.decisionNote}</p></Panel>}
          </>
        )}
      </DetailDrawer>

      <ReasonModal open={modal === 'changes'} title="Request changes" description="Tell the organization what to fix or add." confirmLabel="Send request" tone="gold" onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.decideOrganization(open!.id, 'needs_changes', n); setModal(null); }, 'Changes requested from the organization.')} />
      <ReasonModal open={modal === 'reject'} title="Reject application" description="Explain why the organization cannot be verified." confirmLabel="Reject application" onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.decideOrganization(open!.id, 'rejected', n); setModal(null); }, 'Application rejected.')} />
    </div>
  );
};
