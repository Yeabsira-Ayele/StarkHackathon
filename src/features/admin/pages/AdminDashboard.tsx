import React, { useMemo, useState } from 'react';
import { Building2, Check, Flag, HandCoins, Users, TrendingUp, ArrowRight, Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../hooks/AdminContext.ts';
import { ActivityList } from './AdminActivity.tsx';
import { AdminButton, AdminErrorState, fmtDateTime, useAdminToast } from '../components/AdminUI.tsx';
import type { AdminDonation } from '../types/admin.types.ts';

const formatETB = (value: number, locale: string) => `ETB ${new Intl.NumberFormat(locale).format(value)}`;
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getTime();
const startOfPreviousMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() - 1, 1).getTime();

function weeklyValues<T>(items: T[], dateOf: (item: T) => string, valueOf: (item: T) => number): number[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).getTime();
  const buckets = Array.from({ length: 7 }, () => 0);
  for (const item of items) {
    const timestamp = new Date(dateOf(item)).getTime();
    const offset = Math.floor((timestamp - start) / 86_400_000);
    if (offset >= 0 && offset < buckets.length) buckets[offset] += valueOf(item);
  }
  return buckets;
}

function Sparkline({ values }: { values: number[] }) {
  const { t } = useTranslation();
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${index * 12},${26 - (value / max) * 22}`).join(' ');
  return (
    <svg viewBox="0 0 72 28" role="img" aria-label={t('adminDashboard.recentTrend')} className="h-7 w-[72px] text-[var(--admin-green)]">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonationsChart({ donations }: { donations: AdminDonation[] }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === 'am' ? 'am-ET' : 'en-ET';
  const monthly = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const amount = donations.filter((donation) => {
        const created = new Date(donation.createdAt).getTime();
        return donation.status === 'confirmed' && created >= date.getTime() && created < nextMonth.getTime();
      }).reduce((sum, donation) => sum + donation.amount, 0);
      return { label: date.toLocaleDateString(locale, { month: 'short' }), amount };
    });
  }, [donations, locale]);
  const max = Math.max(...monthly.map((entry) => entry.amount), 1);
  const hasData = monthly.some((entry) => entry.amount > 0);

  return (
    <section className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-[var(--admin-shadow)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
        <div>
          <h2 className="font-serif text-lg font-bold">{t('adminDashboard.donationsOverTime')}</h2>
          <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{t('adminDashboard.lastSixMonths')}</p>
        </div>
        <span className="font-mono text-[10px] text-[var(--admin-muted)]">ETB</span>
      </div>
      <div className="p-5">
        {hasData ? (
          <div className="grid h-44 grid-cols-6 items-end gap-3 sm:gap-5">
            {monthly.map((entry) => (
              <div key={entry.label} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="font-mono text-[9px] tabular-nums text-[var(--admin-muted)]">{entry.amount ? new Intl.NumberFormat(locale, { notation: 'compact' }).format(entry.amount) : ''}</span>
                <div className="flex h-28 w-full items-end">
                  <div
                    title={`${entry.label}: ${formatETB(entry.amount, locale)}`}
                    className="min-h-1 w-full rounded-t-sm bg-[var(--admin-green)] transition-[height] duration-300"
                    style={{ height: `${Math.max(entry.amount / max * 100, entry.amount ? 8 : 2)}%`, opacity: entry.amount ? 0.9 : 0.16 }}
                  />
                </div>
                <span className="font-mono text-[10px] text-[var(--admin-muted)]">{entry.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-44 place-items-center text-center">
            <div>
              <HandCoins className="mx-auto h-6 w-6 text-[var(--admin-gold)]" />
              <p className="mt-2 text-sm font-medium">{t('adminDashboard.noDonations')}</p>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">{t('adminDashboard.confirmDonationHint')}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { store, go } = useAdmin();
  const { notify } = useAdminToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const snapshot = store.snapshot!;
  if (['users', 'donations', 'reports'].some((section) => snapshot.unavailableSections?.includes(section as 'users' | 'donations' | 'reports'))) {
    return <AdminErrorState title="Dashboard data is incomplete" text="The admin backend does not currently provide user, donation, or report records. Dashboard totals and trends are hidden rather than shown as zero." onRetry={() => void store.actions.refresh()} />;
  }
  const now = new Date();
  const thisMonth = startOfMonth(now);
  const previousMonth = startOfPreviousMonth(now);
  const locale = i18n.resolvedLanguage === 'am' ? 'am-ET' : 'en-ET';
  const trendText = (current: number, previous: number) => {
    if (previous === 0) return t(current === 0 ? 'adminDashboard.trendNoChange' : 'adminDashboard.trendNew');
    const percent = Math.round(((current - previous) / previous) * 100);
    return t('adminDashboard.trendVsLastMonth', { percent: `${percent > 0 ? '+' : ''}${percent}` });
  };
  const confirmed = snapshot.donations.filter((donation) => donation.status === 'confirmed');
  const currentDonations = confirmed.filter((donation) => new Date(donation.createdAt).getTime() >= thisMonth);
  const previousDonations = confirmed.filter((donation) => {
    const createdAt = new Date(donation.createdAt).getTime();
    return createdAt >= previousMonth && createdAt < thisMonth;
  });
  const totalDonationAmount = confirmed.reduce((sum, donation) => sum + donation.amount, 0);
  const raised = store.campaigns.reduce((sum, campaign) => sum + (campaign.raisedAmount || 0), 0);
  const monthlyUsers = snapshot.users.filter((user) => new Date(user.joinedAt).getTime() >= thisMonth).length;
  const previousUsers = snapshot.users.filter((user) => {
    const joinedAt = new Date(user.joinedAt).getTime();
    return joinedAt >= previousMonth && joinedAt < thisMonth;
  }).length;
  const approvedOrganizations = snapshot.organizations.filter((organization) => organization.status === 'approved');
  const monthlyOrganizations = snapshot.organizations.filter((organization) => new Date(organization.submittedAt).getTime() >= thisMonth).length;
  const previousOrganizations = snapshot.organizations.filter((organization) => {
    const submittedAt = new Date(organization.submittedAt).getTime();
    return submittedAt >= previousMonth && submittedAt < thisMonth;
  }).length;
  const pendingFundraisers = store.campaigns.filter((campaign) => campaign.status === 'pending');
  const pendingReports = snapshot.reports.filter((report) => report.status === 'pending');
  const donationsByDay = weeklyValues(confirmed, (donation) => donation.createdAt, (donation) => donation.amount);
  const usersByDay = weeklyValues(snapshot.users, (user) => user.joinedAt, () => 1);
  const organizationsByDay = weeklyValues(snapshot.organizations, (organization) => organization.submittedAt, () => 1);

  const approve = async (id: string) => {
    const campaign = store.campaignById.get(id);
    if (!campaign) return;
    setBusyId(id);
    try {
      await store.actions.approveFundraiser(campaign);
      notify(t('adminDashboard.approved'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t('adminDashboard.approveFailed'), 'err');
    } finally {
      setBusyId(null);
    }
  };

  const stats = [
    { label: 'adminDashboard.totalUsers', value: snapshot.users.length.toLocaleString(locale), trend: trendText(monthlyUsers, previousUsers), icon: <Users className="h-4 w-4" />, spark: usersByDay, goTo: 'users' as const },
    { label: 'adminDashboard.organizations', value: approvedOrganizations.length.toLocaleString(locale), trend: trendText(monthlyOrganizations, previousOrganizations), icon: <Building2 className="h-4 w-4" />, spark: organizationsByDay, goTo: 'organizations' as const },
    { label: 'adminDashboard.totalDonations', value: formatETB(totalDonationAmount, locale), trend: trendText(currentDonations.reduce((sum, donation) => sum + donation.amount, 0), previousDonations.reduce((sum, donation) => sum + donation.amount, 0)), icon: <HandCoins className="h-4 w-4" />, spark: donationsByDay, goTo: 'donations' as const, sub: t('adminDashboard.confirmedContributions', { count: confirmed.length }) },
    { label: 'adminDashboard.totalRaised', value: formatETB(raised, locale), trend: trendText(currentDonations.reduce((sum, donation) => sum + donation.amount, 0), previousDonations.reduce((sum, donation) => sum + donation.amount, 0)), icon: <TrendingUp className="h-4 w-4" />, spark: donationsByDay },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--admin-ink)]">{t('adminDashboard.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--admin-muted)]">{t('adminDashboard.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminButton onClick={() => go('fundraisers')} icon={<ArrowRight className="h-3.5 w-3.5" />}>{t('adminDashboard.reviewFundraisers')}</AdminButton>
          <AdminButton tone="ghost" onClick={() => go('reports')}>{t('adminDashboard.viewReports')}</AdminButton>
        </div>
      </div>

      <section aria-labelledby="needs-review-title" className="overflow-hidden rounded-md border border-[var(--admin-red)]/35 bg-[var(--admin-card)] shadow-[var(--admin-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-red)]/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--admin-red)]/10 text-[var(--admin-red)]"><Clock3 className="h-4 w-4" /></span>
            <div>
              <h2 id="needs-review-title" className="font-serif text-xl font-bold">{t('adminDashboard.needsReview')}</h2>
              <p className="text-xs text-[var(--admin-muted)]">{t('adminDashboard.pendingAttention')}</p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--admin-red)] px-2.5 py-1 font-mono text-[10px] font-bold text-white">{pendingFundraisers.length + pendingReports.length} {t('adminDashboard.waiting')}</span>
        </div>
        {pendingFundraisers.length === 0 && pendingReports.length === 0 ? (
          <div className="px-5 py-7 text-center">
            <Check className="mx-auto h-6 w-6 text-[var(--admin-green)]" />
            <p className="mt-2 text-sm font-semibold">{t('adminDashboard.caughtUp')}</p>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">{t('adminDashboard.newSubmissions')}</p>
          </div>
        ) : (
          <div className="grid divide-y divide-[var(--admin-border)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <section className="p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('adminDashboard.pendingFundraisers')}</h3>
                <span className="rounded-full bg-[var(--admin-red)]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--admin-red)]">{pendingFundraisers.length}</span>
              </div>
              {pendingFundraisers.length ? (
                <ul className="space-y-2">
                  {pendingFundraisers.slice(0, 3).map((campaign) => (
                    <li key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--admin-border)] p-3 transition-colors hover:bg-[var(--admin-green)]/[0.04]">
                      <button type="button" onClick={() => go('fundraisers', campaign.id)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-medium">{campaign.title}</span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--admin-muted)]">{campaign.creatorName} · {campaign.id}</span>
                      </button>
                      <div className="flex gap-2">
                        <button type="button" disabled={busyId === campaign.id} onClick={() => void approve(campaign.id)} className="rounded-md bg-[var(--admin-green)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50">{busyId === campaign.id ? t('adminDashboard.approving') : t('adminDashboard.approve')}</button>
                        <button type="button" onClick={() => go('fundraisers', campaign.id)} className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--admin-green)]/10">{t('adminDashboard.review')}</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="rounded-md bg-[var(--admin-cream)] px-3 py-4 text-sm text-[var(--admin-muted)]">{t('adminDashboard.noPendingFundraisers')}</p>}
              {pendingFundraisers.length > 3 && <button type="button" onClick={() => go('fundraisers')} className="mt-3 text-xs font-semibold text-[var(--admin-green)] hover:underline">{t('adminDashboard.viewAllFundraisers', { count: pendingFundraisers.length })}</button>}
            </section>
            <section className="p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('adminDashboard.pendingReports')}</h3>
                <span className="rounded-full bg-[var(--admin-red)]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--admin-red)]">{pendingReports.length}</span>
              </div>
              {pendingReports.length ? (
                <ul className="space-y-2">
                  {pendingReports.slice(0, 3).map((report) => {
                    const cause = store.campaignById.get(report.campaignId);
                    return (
                      <li key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--admin-border)] p-3 transition-colors hover:bg-[var(--admin-green)]/[0.04]">
                        <button type="button" onClick={() => go('reports', report.id)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-medium">{cause?.title || report.campaignId}</span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--admin-muted)]">{report.category} · {fmtDateTime(report.createdAt)}</span>
                        </button>
                        <button type="button" onClick={() => go('reports', report.id)} className="rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--admin-green)]/10">{t('adminDashboard.review')}</button>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="rounded-md bg-[var(--admin-cream)] px-3 py-4 text-sm text-[var(--admin-muted)]">{t('adminDashboard.noPendingReports')}</p>}
              {pendingReports.length > 3 && <button type="button" onClick={() => go('reports')} className="mt-3 text-xs font-semibold text-[var(--admin-green)] hover:underline">{t('adminDashboard.viewAllReports', { count: pendingReports.length })}</button>}
            </section>
          </div>
        )}
      </section>

      <section aria-label={t('adminDashboard.platformStatistics')} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <button key={stat.label} type="button" onClick={() => stat.goTo && go(stat.goTo)} className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 text-left shadow-[var(--admin-shadow)] transition-colors hover:border-[var(--admin-green)] sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--admin-muted)]">{t(stat.label)}</p>
                <p className="mt-2 truncate font-mono text-2xl font-bold tabular-nums text-[var(--admin-ink)]" title={stat.value}>{stat.value}</p>
                {stat.sub && <p className="mt-1 text-[11px] text-[var(--admin-muted)]">{stat.sub}</p>}
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[var(--admin-green)]/10 text-[var(--admin-green)]">{stat.icon}</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2 border-t border-[var(--admin-border)] pt-3">
              <span className="text-[11px] text-[var(--admin-muted)]">{stat.trend}</span>
              <Sparkline values={stat.spark} />
            </div>
          </button>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <DonationsChart donations={snapshot.donations} />
        <section className="overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] shadow-[var(--admin-shadow)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <h2 className="font-serif text-lg font-bold">{t('adminDashboard.recentActivity')}</h2>
              <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{t('adminDashboard.latestChanges')}</p>
            </div>
            <button type="button" onClick={() => go('activity')} aria-label={t('adminDashboard.viewAllActivity')} title={t('adminDashboard.viewAllActivity')} className="grid h-8 w-8 place-items-center rounded-md border border-[var(--admin-border)] hover:bg-[var(--admin-green)]/10"><ArrowRight className="h-4 w-4" /></button>
          </div>
          <ActivityList events={snapshot.activity.slice(0, 5)} />
        </section>
      </div>
    </div>
  );
};
