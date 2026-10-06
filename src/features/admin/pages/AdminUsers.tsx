import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, UserX, UserCheck } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import {
  AdminButton, AdminErrorState, DataTable, DetailDrawer, DetailGrid, EmptyState, FilterTabs, Panel, SearchBox,
  SectionHeader, StatusBadge, Td, Tr, fmtDate, fmtETB, useAdminToast,
} from '../components/AdminUI.tsx';

export const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const { store, go } = useAdmin();
  const { notify } = useAdminToast();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const s = store.snapshot!;

  const stats = (id: string, email: string) => {
    const dons = s.donations.filter((d) => d.donorEmail === email);
    return {
      dons,
      total: dons.filter((d) => d.status === 'confirmed').reduce((a, d) => a + d.amount, 0),
      reports: s.reports.filter((r) => r.reporterId === id),
    };
  };
  const rows = useMemo(
    () => s.users.filter((u) => (tab === 'all' || u.accountType === tab) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()))),
    [s.users, tab, q]
  );
  const open = s.users.find((u) => u.id === openId) || null;
  const os = open ? stats(open.id, open.email) : null;

  if (s.unavailableSections?.includes('users')) {
    return <div><SectionHeader title={t('adminUsers.title')} subtitle={t('adminUsers.description')} /><AdminErrorState title="User records are unavailable" text="The admin backend does not currently provide user records, so no empty or sample list is shown." onRetry={() => void store.actions.refresh()} /></div>;
  }

  return (
    <div>
      <SectionHeader title={t('adminUsers.title')} subtitle={t('adminUsers.description')} actions={<SearchBox value={q} onChange={setQ} placeholder={t('adminUsers.search')} />} />
      <FilterTabs value={tab} onChange={setTab} tabs={[
        { id: 'all', label: t('adminUsers.all'), count: s.users.length },
        { id: 'individual', label: t('adminUsers.individuals'), count: s.users.filter((u) => u.accountType === 'individual').length },
        { id: 'organization', label: t('adminUsers.organizations'), count: s.users.filter((u) => u.accountType === 'organization').length },
      ]} />

      {rows.length === 0 ? <Panel><EmptyState title={t('adminUsers.empty')} /></Panel> : (
        <DataTable head={[t('adminUsers.user'), t('adminUsers.accountType'), t('adminUsers.joined'), t('adminUsers.donations'), t('adminUsers.fundraisers'), t('adminUsers.reports'), t('adminUsers.status'), '']}>
          {rows.map((u) => {
            const st = stats(u.id, u.email);
            return (
              <Tr key={u.id}>
                <Td><div className="text-sm font-semibold">{u.name}</div><div className="font-mono text-[10px] text-zinc-500">{u.email}</div></Td>
                <Td className="font-mono text-xs capitalize">{u.accountType}</Td>
                <Td className="font-mono text-xs whitespace-nowrap">{fmtDate(u.joinedAt)}</Td>
                <Td className="font-mono text-xs">{st.dons.length}</Td>
                <Td className="font-mono text-xs">{u.fundraisers.length}</Td>
                <Td className="font-mono text-xs">{st.reports.length}</Td>
                <Td><StatusBadge status={u.status} /></Td>
                <Td className="text-right"><AdminButton onClick={() => setOpenId(u.id)} icon={<Eye className="w-3.5 h-3.5" />}>{t('adminUsers.open')}</AdminButton></Td>
              </Tr>
            );
          })}
        </DataTable>
      )}

      <DetailDrawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name || ''}
        subtitle={open && <div className="flex gap-2 items-center"><StatusBadge status={open.status} /><span className="font-mono text-[10px] text-zinc-500 capitalize">{t('adminUsers.account', { type: open.accountType })}</span></div>}
        footer={open && (
          <AdminButton
            tone={open.status === 'active' ? 'red' : 'gold'}
            busy={busy}
            icon={open.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            onClick={async () => {
              setBusy(true);
              try {
                await store.actions.setUserStatus(open.id, open.status === 'active' ? 'suspended' : 'active');
                notify(t(open.status === 'active' ? 'adminUsers.suspended' : 'adminUsers.reactivated'));
              } finally { setBusy(false); }
            }}
          >
            {open.status === 'active' ? t('adminUsers.suspend') : t('adminUsers.reactivate')}
          </AdminButton>
        )}
      >
        {open && os && (
          <>
            <Panel title={t('adminUsers.profile')}><DetailGrid items={[[t('adminUsers.email'), open.email], [t('adminUsers.phone'), open.phone], [t('adminUsers.joined'), fmtDate(open.joinedAt)], [t('adminUsers.accountType'), <span className="capitalize">{open.accountType}</span>]]} /></Panel>
            <Panel title={t('adminUsers.donationsTotal', { count: os.dons.length, amount: fmtETB(os.total) })} flush>
              {os.dons.length === 0 ? <EmptyState title={t('adminUsers.noDonations')} /> : (
                <ul className="divide-y divide-[#26211C]/10 dark:divide-[#9A7432]/15">
                  {os.dons.map((d) => (
                    <li key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0"><p className="text-sm line-clamp-1">{store.campaignById.get(d.campaignId)?.title || d.campaignId}</p><p className="font-mono text-[10px] text-zinc-500">{fmtDate(d.createdAt)} · {fmtETB(d.amount)}</p></div>
                      <StatusBadge status={d.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title={t('adminUsers.fundraisers') + ` (${open.fundraisers.length})`} flush>
              {open.fundraisers.length === 0 ? <EmptyState title={t('adminUsers.noFundraisers')} /> : (
                <ul className="divide-y divide-[#26211C]/10 dark:divide-[#9A7432]/15">
                  {open.fundraisers.map((f) => (
                    <li key={f.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <button className="text-sm text-left hover:text-[#8B2626] cursor-pointer" onClick={() => go('fundraisers', f.id)}>{f.title}</button>
                      <StatusBadge status={f.status} fundraiser />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title={t('adminUsers.reportsFiled', { count: os.reports.length })} flush>
              {os.reports.length === 0 ? <EmptyState title={t('adminUsers.noReports')} /> : (
                <ul className="divide-y divide-[#26211C]/10 dark:divide-[#9A7432]/15">
                  {os.reports.map((r) => (
                    <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <button className="text-sm text-left hover:text-[#8B2626] cursor-pointer" onClick={() => go('reports', r.id)}>{r.category}</button>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </>
        )}
      </DetailDrawer>
    </div>
  );
};
