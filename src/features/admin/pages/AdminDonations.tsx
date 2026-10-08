import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import { AdminDonation } from '../types/admin.types.ts';
import {
  AdminButton, AdminErrorState, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDateTime, fmtETB,
} from '../components/AdminUI.tsx';

const TABS = ['all', 'successful', 'failed'] as const;

export const AdminDonations: React.FC = () => {
  const { t } = useTranslation();
  const { store, focusId } = useAdmin();
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(focusId);
  useEffect(() => { if (focusId) setOpenId(focusId); }, [focusId]);

  const s = store.snapshot!;
  const cause = (d: AdminDonation) => store.campaignById.get(d.campaignId)?.title || d.campaignId;
  const rows = useMemo(
    () => s.donations.filter((d) => (tab === 'all' || d.status === tab) && (!q || `${d.donorName} ${cause(d)} ${d.reference}`.toLowerCase().includes(q.toLowerCase()))),
    [s.donations, tab, q, store.campaignById]
  );
  const open = s.donations.find((d) => d.id === openId) || null;

  if (s.unavailableSections?.includes('donations')) {
    return <div><SectionHeader title={t('adminDonations.title')} subtitle={t('adminDonations.description')} /><AdminErrorState title="Donation records are unavailable" text="The admin backend does not currently provide donation records, so no empty or sample list is shown." onRetry={() => void store.actions.refresh()} /></div>;
  }

  return (
    <div>
      <SectionHeader title={t('adminDonations.title')} subtitle={t('adminDonations.description')} actions={<SearchBox value={q} onChange={setQ} placeholder={t('adminDonations.search')} />} />
      <FilterTabs value={tab} onChange={(value) => setTab(value as (typeof TABS)[number])} tabs={TABS.map((status) => ({ id: status, label: t(status === 'all' ? 'adminUi.all' : `adminUi.status.${status}`), count: status === 'all' ? s.donations.length : s.donations.filter((d) => d.status === status).length }))} />

      {rows.length === 0 ? (
        <Panel><EmptyState title={t('adminDonations.empty')} text={t('adminUi.noMatches')} /></Panel>
      ) : (
        <DataTable head={[t('adminDonations.donor'), t('adminUi.cause'), t('adminUi.amount'), t('adminUi.date'), t('adminDonations.reference'), t('adminUi.statusLabel'), '']}>
          {rows.map((d) => (
            <Tr key={d.id}>
              <Td className="text-sm">{d.anonymous ? <span className="italic">{t('adminDonations.anonymous')}</span> : d.donorName}</Td>
              <Td className="max-w-[220px]"><span className="text-xs line-clamp-2">{cause(d)}</span></Td>
              <Td className="font-mono text-xs font-bold tabular-nums whitespace-nowrap">{fmtETB(d.amount)}</Td>
              <Td className="font-mono text-xs whitespace-nowrap">{fmtDateTime(d.createdAt)}</Td>
              <Td className="font-mono text-xs">{d.reference}</Td>
              <Td><StatusBadge status={d.status} /></Td>
              <Td className="text-right whitespace-nowrap">
                <AdminButton onClick={() => setOpenId(d.id)} icon={<Eye className="w-3.5 h-3.5" />}>{t('adminUi.open')}</AdminButton>
              </Td>
            </Tr>
          ))}
        </DataTable>
      )}

      <DetailDrawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? fmtETB(open.amount) : ''}
        subtitle={open && <div className="flex gap-2 items-center"><StatusBadge status={open.status} /><span className="font-mono text-[10px] text-zinc-500">{open.id}</span></div>}
      >
        {open && (
          <>
            <Panel title={t('adminDonations.donation')}>
              <DetailGrid items={[
                [t('adminDonations.donor'), open.anonymous ? t('adminDonations.anonymousPublic') : open.donorName],
                [t('adminDonations.donorEmail'), open.donorEmail],
                [t('adminUi.cause'), cause(open)],
                [t('adminUi.date'), fmtDateTime(open.createdAt)],
              ]} />
            </Panel>
            <Panel title={t('adminDonations.paymentVerification')}>
              <DetailGrid items={[
                [t('adminUi.bank'), open.bank],
                [t('adminUi.accountNumber'), open.accountNumber],
                [t('adminDonations.paymentReference'), <span className="font-mono">{open.reference}</span>],
                [t('adminUi.amount'), fmtETB(open.amount)],
              ]} />
              <p className="font-mono text-[11px] text-zinc-500 mt-4">{t('adminDonations.verifyHint')}</p>
            </Panel>
          </>
        )}
      </DetailDrawer>

    </div>
  );
};
