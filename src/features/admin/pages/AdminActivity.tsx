import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserPlus, Building2, FilePlus2, FileCheck2, FilePen, FileX2, Trash2, HandCoins, Flag, ShieldCheck, Phone, Settings2, CircleCheck, CircleX, Eye,
} from 'lucide-react';
import { ActivityEvent, ActivityType } from '../types/admin.types.ts';
import { useAdmin } from '../hooks/AdminContext.ts';
import { EmptyState, FilterTabs, SearchBox, SectionHeader, fmtDateTime } from '../components/AdminUI.tsx';

const ICONS: Record<ActivityType, React.ReactNode> = {
  user_registered: <UserPlus className="w-4 h-4" />,
  organization_registered: <Building2 className="w-4 h-4" />,
  fundraiser_submitted: <FilePlus2 className="w-4 h-4" />,
  fundraiser_approved: <FileCheck2 className="w-4 h-4" />,
  fundraiser_changes_requested: <FilePen className="w-4 h-4" />,
  fundraiser_rejected: <FileX2 className="w-4 h-4" />,
  fundraiser_edited: <FilePen className="w-4 h-4" />,
  fundraiser_deleted: <Trash2 className="w-4 h-4" />,
  donation_submitted: <HandCoins className="w-4 h-4" />,
  donation_confirmed: <CircleCheck className="w-4 h-4" />,
  donation_rejected: <CircleX className="w-4 h-4" />,
  report_submitted: <Flag className="w-4 h-4" />,
  report_reviewed: <Eye className="w-4 h-4" />,
  report_resolved: <CircleCheck className="w-4 h-4" />,
  report_dismissed: <CircleX className="w-4 h-4" />,
  organization_approved: <ShieldCheck className="w-4 h-4" />,
  organization_changes_requested: <FilePen className="w-4 h-4" />,
  organization_rejected: <FileX2 className="w-4 h-4" />,
  organization_contacted: <Phone className="w-4 h-4" />,
  admin_action: <Settings2 className="w-4 h-4" />,
};

export const ActivityList: React.FC<{ events: ActivityEvent[] }> = ({ events }) => {
  const { t } = useTranslation();
  return events.length === 0 ? (
    <EmptyState title={t('adminActivity.empty')} text={t('adminActivity.emptyHint')} />
  ) : (
    <ul className="divide-y divide-[#26211C]/10 dark:divide-[#9A7432]/15">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-3 px-5 py-3">
          <span className="mt-0.5 p-1.5 border border-[#9A7432]/50 text-[#8B2626] dark:text-[#D8B066] shrink-0">{ICONS[e.type]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#201C18] dark:text-[#F4EFE6]">{e.message}</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
              {e.actor}{e.actorIsAdmin ? ` (${t('adminUi.adminRole')})` : ''} · {fmtDateTime(e.at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const GROUPS: Record<string, (t: ActivityType) => boolean> = {
  all: () => true,
  users: (t) => t === 'user_registered' || t === 'organization_registered',
  fundraisers: (t) => t.startsWith('fundraiser_'),
  donations: (t) => t.startsWith('donation_'),
  reports: (t) => t.startsWith('report_'),
  organizations: (t) => t.startsWith('organization_'),
  admin: (t) => t === 'admin_action',
};

export const AdminActivity: React.FC = () => {
  const { t } = useTranslation();
  const { store } = useAdmin();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const events = store.snapshot!.activity;
  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          GROUPS[tab](e.type) &&
          (!q || `${e.message} ${e.actor}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [events, tab, q]
  );
  return (
    <div>
      <SectionHeader title={t('adminActivity.title')} subtitle={t('adminActivity.description')} actions={<SearchBox value={q} onChange={setQ} placeholder={t('adminActivity.search')} />} />
      <FilterTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'all', label: t('adminUi.all'), count: events.length },
          { id: 'users', label: t('adminUi.users') },
          { id: 'fundraisers', label: t('adminUi.fundraisers') },
          { id: 'donations', label: t('adminUi.donations') },
          { id: 'reports', label: t('adminUi.reports') },
          { id: 'organizations', label: t('adminUi.organizations') },
          { id: 'admin', label: t('adminActivity.adminActions') },
        ]}
      />
      <div className="border border-[#26211C]/30 dark:border-[#9A7432]/30 bg-[#FCF9F2] dark:bg-[#1E1A17]">
        <ActivityList events={filtered} />
      </div>
    </div>
  );
};
