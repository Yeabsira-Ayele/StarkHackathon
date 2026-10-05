import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Eye, FileText, Mail, MessageSquareWarning, Phone, XCircle } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import {
  AdminButton, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, ReasonModal, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDate, fmtDateTime, fmtETB, useAdminToast,
} from '../components/AdminUI.tsx';

const TABS = ['all', 'pending', 'approved', 'needs_changes', 'rejected'] as const;

export const AdminOrganizations: React.FC = () => {
  const { t } = useTranslation();
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
      <SectionHeader title={t('adminOrganizations.title')} subtitle={t('adminOrganizations.description')} actions={<SearchBox value={q} onChange={setQ} placeholder={t('adminOrganizations.search')} />} />
      <FilterTabs value={tab} onChange={setTab} tabs={TABS.map((status) => ({ id: status, label: t(status === 'all' ? 'adminUi.all' : status === 'pending' ? 'adminOrganizations.newApplications' : `adminUi.status.${status}`), count: status === 'all' ? orgs.length : orgs.filter((o) => o.status === status).length }))} />

      {rows.length === 0 ? <Panel><EmptyState title={t('adminOrganizations.empty')} text={t('adminUi.noMatches')} /></Panel> : (
        <DataTable head={[t('adminOrganizations.organization'), t('adminUi.type'), t('adminOrganizations.contact'), t('adminUi.submitted'), t('adminUi.statusLabel'), '']}>
          {rows.map((o) => (
            <Tr key={o.id}>
              <Td><div className="text-sm font-semibold">{o.name}</div><div className="font-mono text-[10px] text-zinc-500">{o.address}</div></Td>
              <Td className="font-mono text-xs capitalize">{o.organizationType}</Td>
              <Td className="font-mono text-[11px]">{o.officialEmail}<br />{o.phone}</Td>
              <Td className="font-mono text-xs whitespace-nowrap">{fmtDate(o.submittedAt)}</Td>
              <Td><StatusBadge status={o.status} /></Td>
              <Td className="text-right"><AdminButton onClick={() => setOpenId(o.id)} icon={<Eye className="w-3.5 h-3.5" />}>{t('adminUi.open')}</AdminButton></Td>
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
            <AdminButton tone="gold" busy={busy} icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => act(async () => { await store.actions.decideOrganization(open!.id, 'approved'); }, t('adminOrganizations.approvedToast'))}>{t('adminUi.approve')}</AdminButton>
            <AdminButton busy={busy} icon={<MessageSquareWarning className="w-3.5 h-3.5" />} onClick={() => setModal('changes')}>{t('adminUi.requestChanges')}</AdminButton>
            <AdminButton tone="red" busy={busy} icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => setModal('reject')}>{t('adminUi.reject')}</AdminButton>
          </>
        ) : null}
      >
        {open && (
          <>
            <Panel title={t('adminOrganizations.organization')}>
              <DetailGrid items={[
                [t('adminOrganizations.officialEmail'), open.officialEmail], [t('adminOrganizations.phone'), open.phone],
                [t('adminUi.type'), <span className="capitalize">{open.organizationType}</span>], [t('adminOrganizations.locationAddress'), open.address],
                [t('adminUi.submitted'), fmtDate(open.submittedAt)], [t('adminOrganizations.verificationStatus'), <StatusBadge status={open.status} />],
              ]} />
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-4 mb-1">{t('adminUi.descriptionLabel')}</p>
              <p className="text-sm leading-relaxed">{open.description}</p>
            </Panel>

            <Panel title={t('adminOrganizations.contactOrganization')} actions={open.lastContactedAt ? <span className="font-mono text-[10px] text-zinc-500">{t('adminOrganizations.lastContacted', { date: fmtDateTime(open.lastContactedAt) })}</span> : undefined}>
              <p className="font-mono text-[11px] text-zinc-500 mb-3">{t('adminOrganizations.contactHint')}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${open.officialEmail}`} onClick={() => store.actions.contactOrganization(open.id, 'email')}>
                  <AdminButton icon={<Mail className="w-3.5 h-3.5" />} type="button">{t('adminOrganizations.email')}</AdminButton>
                </a>
                <a href={`tel:${open.phone.replace(/\s/g, '')}`} onClick={() => store.actions.contactOrganization(open.id, 'phone')}>
                  <AdminButton icon={<Phone className="w-3.5 h-3.5" />} type="button">{t('adminOrganizations.call')}</AdminButton>
                </a>
              </div>
            </Panel>

            <Panel title={t('adminOrganizations.representative')}><DetailGrid cols={3} items={[[ t('adminOrganizations.name'), open.representative.name], [t('adminOrganizations.role'), open.representative.role], [t('adminOrganizations.phone'), open.representative.phone]]} /></Panel>
            <Panel title={t('adminOrganizations.bankAccount')}><DetailGrid cols={3} items={[[ t('adminUi.bank'), open.bank.bank], [t('adminUi.accountNumber'), open.bank.accountNumber], [t('adminOrganizations.accountName'), open.bank.accountName]]} /></Panel>

            <Panel title={t('adminOrganizations.verificationDocuments')}>
              {open.documents.length === 0 ? <p className="font-mono text-xs text-[#8B2626]">{t('adminOrganizations.noDocuments')}</p> : (
                <ul className="space-y-2">{open.documents.map((d) => <li key={d} className="flex items-center gap-2 font-mono text-xs"><FileText className="w-4 h-4 text-[#9A7432]" />{d}</li>)}</ul>
              )}
            </Panel>

            {open.status === 'approved' && (
              <Panel title={t('adminOrganizations.verifiedProfile')}><DetailGrid cols={3} items={[[t('adminOrganizations.activeCauses'), open.activeCauses], [t('adminOrganizations.totalRaised'), fmtETB(open.totalRaised)], [t('adminOrganizations.badge'), t('adminUi.status.approved')]]} /></Panel>
            )}
            {open.decisionNote && <Panel title={t('adminUi.adminNote')}><p className="text-sm">{open.decisionNote}</p></Panel>}
          </>
        )}
      </DetailDrawer>

      <ReasonModal open={modal === 'changes'} title={t('adminUi.requestChanges')} description={t('adminOrganizations.requestDescription')} confirmLabel={t('adminOrganizations.sendRequest')} tone="gold" onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.decideOrganization(open!.id, 'needs_changes', n); setModal(null); }, t('adminOrganizations.changesRequested'))} />
      <ReasonModal open={modal === 'reject'} title={t('adminOrganizations.rejectApplication')} description={t('adminOrganizations.rejectDescription')} confirmLabel={t('adminOrganizations.rejectApplication')} onClose={() => setModal(null)}
        onConfirm={(n) => act(async () => { await store.actions.decideOrganization(open!.id, 'rejected', n); setModal(null); }, t('adminOrganizations.rejectedToast'))} />
    </div>
  );
};
