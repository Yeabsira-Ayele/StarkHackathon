import React from 'react';
import { Users, Building2, HandCoins, TrendingUp, Rocket, Hourglass, Flag, ArrowRight } from 'lucide-react';
import { useAdmin } from '../hooks/AdminContext.ts';
import { Panel, SectionHeader, StatTile, fmtDateTime, fmtETB, AdminButton } from '../components/AdminUI.tsx';
import { ActivityList } from './AdminActivity.tsx';

export const AdminDashboard: React.FC = () => {
  const { store, go } = useAdmin();
  const s = store.snapshot!;
  const confirmed = s.donations.filter((d) => d.status === 'confirmed');
  const totalDonationsAmount = confirmed.reduce((a, d) => a + d.amount, 0);
  const totalRaised = store.campaigns.reduce((a, c) => a + (c.raisedAmount || 0), 0);
  const active = store.campaigns.filter((c) => c.status === 'approved').length;
  const pendingFund = store.campaigns.filter((c) => c.status === 'pending').length;
  const pendingReports = s.reports.filter((r) => r.status === 'pending').length;
  const orgs = s.organizations.filter((o) => o.status === 'approved').length;
  const pendingDonations = s.donations.filter((d) => d.status === 'pending').length;
  const pendingOrgs = s.organizations.filter((o) => o.status === 'pending').length;

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Platform-wide overview of users, money raised, and items waiting for review." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total users" value={s.users.length} icon={<Users className="w-4 h-4" />} onClick={() => go('users')} />
        <StatTile label="Organizations" value={orgs} sub="Verified" icon={<Building2 className="w-4 h-4" />} onClick={() => go('organizations')} />
        <StatTile label="Total donations" value={confirmed.length} sub={`${fmtETB(totalDonationsAmount)} confirmed`} icon={<HandCoins className="w-4 h-4" />} onClick={() => go('donations')} />
        <StatTile label="Total raised" value={fmtETB(totalRaised)} icon={<TrendingUp className="w-4 h-4" />} />
        <StatTile label="Active fundraisers" value={active} icon={<Rocket className="w-4 h-4" />} onClick={() => go('fundraisers')} />
        <StatTile label="Pending fundraisers" value={pendingFund} alert={pendingFund > 0} icon={<Hourglass className="w-4 h-4" />} onClick={() => go('fundraisers')} />
        <StatTile label="Pending reports" value={pendingReports} alert={pendingReports > 0} icon={<Flag className="w-4 h-4" />} onClick={() => go('reports')} />
        <StatTile label="Needs verification" value={pendingDonations + pendingOrgs} sub={`${pendingDonations} donations · ${pendingOrgs} org applications`} alert={pendingDonations + pendingOrgs > 0} onClick={() => go('donations')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <Panel
          className="lg:col-span-2"
          title="Recent activity"
          flush
          actions={<AdminButton tone="ghost" onClick={() => go('activity')} icon={<ArrowRight className="w-3.5 h-3.5" />}>Complete activity</AdminButton>}
        >
          <ActivityList events={s.activity.slice(0, 8)} />
        </Panel>

        <Panel title="Waiting for you">
          <ul className="space-y-3 font-mono text-xs">
            {[
              ['Fundraisers pending review', pendingFund, 'fundraisers'],
              ['Reports to review', pendingReports, 'reports'],
              ['Donations to verify', pendingDonations, 'donations'],
              ['Organization applications', pendingOrgs, 'organizations'],
            ].map(([label, n, sec]) => (
              <li key={label as string} className="flex items-center justify-between">
                <span>{label}</span>
                <button
                  onClick={() => go(sec as any)}
                  className={`px-2 py-0.5 border cursor-pointer font-bold ${(n as number) > 0 ? 'border-[#8B2626] text-[#8B2626]' : 'border-[#26211C]/30 text-zinc-500'}`}
                >
                  {n}
                </button>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] text-zinc-500 mt-5">Last refreshed {fmtDateTime(new Date().toISOString())}</p>
        </Panel>
      </div>
    </div>
  );
};
