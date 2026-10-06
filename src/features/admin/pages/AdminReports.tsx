import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Eye, XCircle, Paperclip } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import { AdminReport } from '../types/admin.types.ts';
import {
  AdminButton, AdminErrorState, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, ReasonModal, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDate, fmtDateTime, useAdminToast,
} from '../components/AdminUI.tsx';

const TABS = ['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const;

export const AdminReports: React.FC = () => {
  const { t } = useTranslation();
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

  if (s.unavailableSections?.includes('reports')) {
    return <div><SectionHeader title={t('adminReports.title')} subtitle={t('adminReports.description')} /><AdminErrorState title="Report records are unavailable" text="The admin backend does not currently provide report records, so no empty or sample list is shown." onRetry={() => void store.actions.refresh()} /></div>;
  }

  const act = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); notify(ok); } catch (e: any) { notify(e?.message || 'Action failed', 'err'); } finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title={t('adminReports.title')} subtitle={t('adminReports.description')} actions={<SearchBox value={q} onChange={setQ} placeholder={t('adminReports.search')} />} />
      <FilterTabs value={tab} onChange={(value) => setTab(value as (typeof TABS)[number])} tabs={TABS.map((status) => ({ id: status, label: t(status === 'all' ? 'adminUi.all' : `adminUi.status.${status}`), count: status === 'all' ? s.reports.length : s.reports.filter((r) => r.status === status).length }))} />

      {rows.length === 0 ? (
        <Panel><EmptyState title={t('adminReports.empty')} text={t('adminUi.noMatches')} /></Panel>
      ) : (
        <DataTable head={[t('adminReports.reportedCause'), t('adminUi.category'), t('adminReports.reporter'), t('adminUi.date'), t('adminUi.statusLabel'), '']}>
          {rows.map((r) => (
            <Tr key={r.id}>
              <Td className="max-w-xs"><span className="text-sm font-semibold line-clamp-2">{view(r).cause}</span></Td>
              <Td className="font-mono text-xs">{r.category}</Td>
              <Td className="text-xs">{view(r).reporter}</Td>
              <Td className="font-mono text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</Td>
              <Td><StatusBadge status={r.status} /></Td>
              <Td className="text-right"><AdminButton onClick={() => setOpenId(r.id)} icon={<Eye className="w-3.5 h-3.5" />}>{t('adminUi.open')}</AdminButton></Td>
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
              {open.status === 'pending' && <AdminButton busy={busy} icon={<Eye className="w-3.5 h-3.5" />} onClick={() => act(async () => { await store.actions.updateReport(open.id, 'reviewed'); }, t('adminReports.reviewedToast'))}>{t('adminReports.markReviewed')}</AdminButton>}
              <AdminButton tone="gold" busy={busy} icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => setModal('resolve')}>{t('adminReports.resolve')}</AdminButton>
              <AdminButton tone="red" busy={busy} icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => setModal('dismiss')}>{t('adminReports.dismiss')}</AdminButton>
            </>
          ) : null
        }
      >
        {open && v && (
          <>
            <Panel title={t('adminReports.report')}>
              <DetailGrid items={[
                [t('adminReports.reportedBy'), <>{v.reporter}<div className="font-mono text-[10px] text-zinc-500">{v.reporterEmail}</div></>],
                [t('adminReports.causeOwner'), v.owner],
                [t('adminUi.category'), open.category],
                [t('adminUi.date'), fmtDateTime(open.createdAt)],
              ]} />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-4 mb-1">{t('adminReports.details')}</p>
              <p className="text-sm leading-relaxed">{open.details}</p>
            </Panel>
            <Panel title={t('adminReports.evidence')}>
              {open.evidence.length ? (
                <ul className="space-y-2">{open.evidence.map((e) => <li key={e} className="flex items-center gap-2 font-mono text-xs"><Paperclip className="w-4 h-4 text-[#9A7432]" />{e}</li>)}</ul>
              ) : <p className="font-mono text-xs text-zinc-500">{t('adminReports.noEvidence')}</p>}
            </Panel>
            {open.resolutionNote && <Panel title={t('adminUi.adminNote')}><p className="text-sm">{open.resolutionNote}</p></Panel>}
            <AdminButton tone="ghost" onClick={() => go('fundraisers', open.campaignId)}>{t('adminReports.openFundraiser')}</AdminButton>
          </>
        )}
      </DetailDrawer>

      <ReasonModal open={modal === 'resolve'} title={t('adminReports.resolve')} description={t('adminReports.resolveDescription')} confirmLabel={t('adminReports.resolve')} tone="gold" required={false} onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.updateReport(open!.id, 'resolved', n || undefined); setModal(null); }, t('adminReports.resolvedToast'))} />
      <ReasonModal open={modal === 'dismiss'} title={t('adminReports.dismiss')} description={t('adminReports.dismissDescription')} confirmLabel={t('adminReports.dismiss')} onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.updateReport(open!.id, 'dismissed', n); setModal(null); }, t('adminReports.dismissedToast'))} />
    </div>
  );
};
