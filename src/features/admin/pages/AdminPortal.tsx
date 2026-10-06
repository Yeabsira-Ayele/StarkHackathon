import React, { useMemo, useRef, useState } from 'react';
import '../admin.css';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, FileCheck2, Flag, HandCoins, Users, Building2, Activity, ShieldCheck, UserCircle,
  Bell, Menu, X, Sun, Moon, LogOut, Search, ChevronDown, ExternalLink, Check,
} from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar.tsx';
import { AdminContext } from '../hooks/AdminContext.ts';
import { useAdminStore } from '../hooks/useAdminStore.ts';
import { AdminSection } from '../types/admin.types.ts';
import { AdminToastProvider } from '../components/AdminUI.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { AdminFundraisers } from './AdminFundraisers.tsx';
import { AdminReports } from './AdminReports.tsx';
import { AdminDonations } from './AdminDonations.tsx';
import { AdminUsers } from './AdminUsers.tsx';
import { AdminOrganizations } from './AdminOrganizations.tsx';
import { AdminActivity } from './AdminActivity.tsx';
import { AdminAdmins } from './AdminAdmins.tsx';
import { AdminProfile } from './AdminProfile.tsx';
import { useAuthStore } from '../../auth/store/auth.store.ts';
import { LanguageSwitcher } from '../../../components/common/LanguageSwitcher.tsx';

export interface AdminPortalProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onExit: () => void;
  onApproveCampaign?: (id: string) => void | Promise<void>;
  onRejectCampaign?: (id: string) => void | Promise<void>;
}

const NAV_GROUPS: {
  label: string;
  labelKey: string;
  items: { id: AdminSection; label: string; labelKey: string; icon: React.ReactNode }[];
}[] = [
  { label: 'Overview', labelKey: 'admin.nav.groupOverview', items: [{ id: 'dashboard', label: 'Dashboard', labelKey: 'admin.nav.dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }] },
  { label: 'Review', labelKey: 'admin.nav.groupReview', items: [
    { id: 'fundraisers', label: 'Fundraisers', labelKey: 'admin.nav.fundraisers', icon: <FileCheck2 className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', labelKey: 'admin.nav.reports', icon: <Flag className="h-4 w-4" /> },
  ] },
  { label: 'Money', labelKey: 'admin.nav.groupMoney', items: [{ id: 'donations', label: 'Donations', labelKey: 'admin.nav.donations', icon: <HandCoins className="h-4 w-4" /> }] },
  { label: 'Platform', labelKey: 'admin.nav.groupPlatform', items: [
    { id: 'users', label: 'Users', labelKey: 'admin.nav.users', icon: <Users className="h-4 w-4" /> },
    { id: 'organizations', label: 'Organizations', labelKey: 'admin.nav.organizations', icon: <Building2 className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity', labelKey: 'admin.nav.activity', icon: <Activity className="h-4 w-4" /> },
    { id: 'admins', label: 'Admins', labelKey: 'admin.nav.admins', icon: <ShieldCheck className="h-4 w-4" /> },
  ] },
  { label: 'Account', labelKey: 'admin.nav.groupAccount', items: [{ id: 'profile', label: 'Admin profile', labelKey: 'admin.nav.profile', icon: <UserCircle className="h-4 w-4" /> }] },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({ isDark, onToggleTheme, onExit, onApproveCampaign, onRejectCampaign }) => {
  const { t } = useTranslation();
  const store = useAdminStore({ onApproveCampaign, onRejectCampaign });
  const authUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const go = (s: AdminSection, id?: string) => {
    setSection(s);
    setFocusId(id ?? null);
    setMenuOpen(false);
    setBellOpen(false);
    window.scrollTo({ top: 0 });
  };

  const snap = store.snapshot;
  const counts = useMemo(() => {
    if (!snap || store.loading || store.error) return {} as Record<string, number>;
    const unavailable = snap.unavailableSections || [];
    return {
      fundraisers: store.campaigns.filter((c) => c.status === 'pending').length,
      ...(unavailable.includes('reports') ? {} : { reports: snap.reports.filter((r) => r.status === 'pending').length }),
      ...(unavailable.includes('donations') ? {} : { donations: snap.donations.filter((d) => d.status === 'pending').length }),
      organizations: snap.organizations.filter((o) => o.status === 'pending').length,
    } as Record<string, number>;
  }, [snap, store.campaigns, store.loading, store.error]);
  const totalPending = Object.values(counts).reduce((a, b) => a + b, 0);
  const me = snap?.admins.find((a) => a.id === snap.currentAdminId);
  React.useEffect(() => {
    if (!searchOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [searchOpen]);
  const quickResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || !snap) return [];
    const results = [
      ...store.campaigns.filter((campaign) => `${campaign.title} ${campaign.creatorName} ${campaign.id}`.toLowerCase().includes(query))
        .map((campaign) => ({ id: campaign.id, label: campaign.title, detail: `Fundraiser · ${campaign.creatorName}`, section: 'fundraisers' as AdminSection })),
      ...snap.reports.filter((report) => `${report.category} ${report.details} ${report.campaignId} ${report.id}`.toLowerCase().includes(query))
        .map((report) => ({ id: report.id, label: report.category, detail: `Report · ${report.campaignId}`, section: 'reports' as AdminSection })),
      ...snap.users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query))
        .map((user) => ({ id: user.id, label: user.name, detail: `User · ${user.email}`, section: 'users' as AdminSection })),
      ...snap.donations.filter((donation) => `${donation.donorName} ${donation.campaignId} ${donation.reference}`.toLowerCase().includes(query))
        .map((donation) => ({ id: donation.id, label: donation.donorName, detail: `Donation · ${donation.campaignId}`, section: 'donations' as AdminSection })),
    ];
    return results.slice(0, 6);
  }, [search, snap, store.campaigns]);

  const page = () => {
    switch (section) {
      case 'dashboard': return <AdminDashboard />;
      case 'fundraisers': return <AdminFundraisers />;
      case 'reports': return <AdminReports />;
      case 'donations': return <AdminDonations />;
      case 'users': return <AdminUsers />;
      case 'organizations': return <AdminOrganizations />;
      case 'activity': return <AdminActivity />;
      case 'admins': return <AdminAdmins />;
      case 'profile': return <AdminProfile />;
    }
  };

  const sidebar = (
    <nav aria-label="Admin navigation" className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-[var(--admin-border)] px-4 xl:px-5">
        <div className="hidden xl:block">
          <h1 className="font-display text-lg font-black leading-none tracking-[0.16em] text-[var(--admin-ink)]">LEWEGENE</h1>
          <span className="mt-1 block font-mono text-[9px] font-semibold text-[var(--admin-muted)]">{t('admin.console', 'Admin console')}</span>
        </div>
        <span className="grid h-9 w-9 place-items-center border border-[var(--admin-gold)] font-display text-xl font-black text-[var(--admin-green)] xl:hidden">L</span>
      </div>
      <div className="admin-sidebar-scroll flex-1 overflow-y-auto py-3">
        {NAV_GROUPS.map((group) => (
          <section key={group.label} className="mb-2">
            <h2 className="hidden px-5 pb-1 pt-2 font-mono text-[10px] font-semibold text-[var(--admin-muted)] xl:block">{t(group.labelKey, group.label)}</h2>
            <ul>
              {group.items.map((item) => {
                const active = section === item.id;
                const count = counts[item.id];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      title={t(item.labelKey, item.label)}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => go(item.id)}
                      className={`group relative mx-2 flex min-h-10 w-[calc(100%-16px)] items-center gap-3 rounded-md border-l-[3px] px-3 text-left text-sm transition-colors xl:mx-2 xl:w-[calc(100%-16px)] xl:px-3 ${
                        active
                          ? 'border-[var(--admin-green)] bg-[var(--admin-green)]/10 font-semibold text-[var(--admin-green)]'
                          : 'border-transparent text-[var(--admin-ink)] hover:bg-[var(--admin-green)]/5 hover:text-[var(--admin-green)]'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="hidden flex-1 xl:block">{t(item.labelKey, item.label)}</span>
                      {typeof count === 'number' && count > 0 && (
                        <span className="hidden min-w-5 rounded-full bg-[var(--admin-red)] px-1.5 py-0.5 text-center font-mono text-[10px] font-bold leading-4 text-white xl:inline-block">{count}</span>
                      )}
                      {typeof count === 'number' && count > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--admin-red)] xl:hidden" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <div className="shrink-0 border-t border-[var(--admin-border)] p-3">
        <button
          type="button"
          onClick={onExit}
          title={t('admin.nav.viewPublicSite', 'View public site')}
          className="flex w-full items-center justify-center xl:justify-start gap-2 rounded-md px-3 py-2 text-sm text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-green)]/5 hover:text-[var(--admin-green)] cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span className="md:hidden xl:inline">{t('admin.nav.viewPublicSite', 'View public site')}</span>
        </button>
      </div>
    </nav>
  );

  return (
    <AdminToastProvider>
      <div className="admin-shell min-h-screen w-full font-sans">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] border-r border-[var(--admin-border)] bg-[var(--admin-paper)] md:block xl:w-60">
          {sidebar}
        </aside>
        {menuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-[var(--admin-border)] bg-[var(--admin-paper)] shadow-[var(--admin-shadow)]">{sidebar}</aside>
          </div>
        )}

        <div className="min-h-screen md:pl-[72px] xl:pl-60">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-paper)]/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="relative flex min-w-0 flex-1 items-center gap-3">
              <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[var(--admin-border)] md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open admin navigation" title="Open navigation">
                <Menu className="h-4 w-4" />
              </button>
              <div ref={searchRef} className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
                <input
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setSearchOpen(false);
                    if (event.key === 'Enter' && quickResults[0]) {
                      go(quickResults[0].section, quickResults[0].id);
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search admin workspace"
                  aria-label="Search admin workspace"
                  className="h-9 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-cream)] pl-9 pr-3 text-sm placeholder:text-[var(--admin-muted)]/80"
                />
                {searchOpen && search.trim() && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-1 shadow-[var(--admin-shadow)]">
                    {store.loading ? <p role="status" className="px-3 py-3 text-sm text-[var(--admin-muted)]">Loading admin records…</p>
                    : store.error ? <p role="alert" className="px-3 py-3 text-sm text-[var(--admin-red)]">{store.error}</p>
                    : quickResults.length ? quickResults.map((result) => (
                      <button key={`${result.section}-${result.id}`} type="button" onClick={() => { go(result.section, result.id); setSearchOpen(false); }} className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-green)]/10">
                        <span className="block truncate text-sm font-medium text-[var(--admin-ink)]">{result.label}</span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--admin-muted)]">{result.detail}</span>
                      </button>
                    )) : <p className="px-3 py-3 text-sm text-[var(--admin-muted)]">No matching records.</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onExit}
                title={t('admin.nav.viewPublicSite', 'View public site')}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--admin-border)] bg-[var(--admin-cream)] px-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--admin-ink)] transition-colors hover:bg-[var(--admin-green)]/10 hover:text-[var(--admin-green)] cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span>{t('nav.mainSite', 'Main Site')}</span>
              </button>
              <LanguageSwitcher variant="admin" />
              <div className="relative">
                <button type="button" onClick={() => { setBellOpen((open) => !open); setProfileOpen(false); }} title="Notifications" aria-label="Notifications" aria-expanded={bellOpen} className="relative grid h-9 w-9 place-items-center rounded-md border border-[var(--admin-border)] hover:bg-[var(--admin-green)]/10">
                  <Bell className="h-4 w-4" />
                  {!store.loading && !store.error && totalPending > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--admin-red)] px-1 font-mono text-[9px] font-bold text-white">{totalPending}</span>}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-2 shadow-[var(--admin-shadow)]">
                    <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-2 pb-2">
                      <h2 className="text-sm font-semibold">Needs review</h2>
                      <button type="button" onClick={() => setBellOpen(false)} aria-label="Close notifications" title="Close" className="rounded p-1 hover:bg-[var(--admin-green)]/10"><X className="h-4 w-4" /></button>
                    </div>
                    {store.loading ? <p role="status" className="px-3 py-3 text-sm text-[var(--admin-muted)]">Loading admin records…</p>
                    : store.error ? (
                      <div className="px-3 py-3" role="alert">
                        <p className="text-sm text-[var(--admin-red)]">{store.error}</p>
                        <button type="button" onClick={() => void store.actions.refresh()} className="mt-2 text-xs font-semibold text-[var(--admin-green)] hover:underline">Retry</button>
                      </div>
                    ) : ([
                      ['fundraisers', 'Fundraisers', counts.fundraisers],
                      ['reports', 'Reports', counts.reports],
                      ['donations', 'Donations', counts.donations],
                      ['organizations', 'Organizations', counts.organizations],
                    ] as const).map(([id, label, count]) => (
                      <button key={id} type="button" onClick={() => go(id)} className="flex w-full items-center justify-between rounded px-2 py-2.5 text-sm hover:bg-[var(--admin-green)]/10">
                        {label}<span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${typeof count !== 'number' ? 'text-[var(--admin-muted)]' : count ? 'bg-[var(--admin-red)] text-white' : 'bg-black/5 text-[var(--admin-muted)] dark:bg-white/10'}`}>{typeof count === 'number' ? count : 'Unavailable'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={onToggleTheme} title={isDark ? 'Switch to light theme' : 'Switch to dark theme'} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} className="grid h-9 w-9 place-items-center rounded-md border border-[var(--admin-border)] hover:bg-[var(--admin-green)]/10">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="relative">
                <button type="button" onClick={() => { setProfileOpen((open) => !open); setBellOpen(false); }} aria-label="Admin profile menu" aria-expanded={profileOpen} className="flex h-9 items-center gap-2 rounded-md border border-[var(--admin-border)] px-1.5 hover:bg-[var(--admin-green)]/10">
                  <Avatar name={authUser?.name || me?.name || 'Admin'} src={authUser?.avatarUrl || me?.photo} size="sm" />
                  <ChevronDown className="hidden h-3.5 w-3.5 text-[var(--admin-muted)] sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-1.5 shadow-[var(--admin-shadow)]">
                    <p className="truncate px-3 py-2 text-sm font-semibold">{authUser?.name || me?.name || 'Admin'}</p>
                    <button type="button" onClick={() => { go('profile'); setProfileOpen(false); }} className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[var(--admin-green)]/10">Admin profile</button>
                    <button type="button" onClick={() => { setProfileOpen(false); onExit(); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-[var(--admin-green)]/10"><ExternalLink className="h-4 w-4" /> {t('admin.nav.viewPublicSite', 'View public site')}</button>
                    <button type="button" onClick={() => { setProfileOpen(false); logout(); onExit(); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-[var(--admin-red)] hover:bg-[var(--admin-red)]/10"><LogOut className="h-4 w-4" /> Log out</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {store.loading ? (
              <div role="status" aria-label="Loading admin dashboard" className="space-y-6">
                <div className="h-16 max-w-md animate-pulse rounded-md bg-[var(--admin-gold)]/10" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)]" />)}
                </div>
                <div className="h-72 animate-pulse rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)]" />
              </div>
            ) : store.error ? (
              <div role="alert" className="max-w-xl rounded-md border border-[var(--admin-red)]/40 bg-[var(--admin-card)] p-6 shadow-[var(--admin-shadow)]">
                <h1 className="font-serif text-2xl font-bold">Admin data is unavailable</h1>
                <p className="mt-2 text-sm text-[var(--admin-muted)]">{store.error}</p>
                <button type="button" onClick={() => void store.actions.refresh()} className="mt-4 rounded-md bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white">Retry</button>
              </div>
            ) : !snap ? (
              <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card)] p-6">
                <h1 className="font-serif text-2xl font-bold">No admin data available</h1>
                <p className="mt-2 text-sm text-[var(--admin-muted)]">Try refreshing the admin workspace.</p>
                <button type="button" onClick={() => void store.actions.refresh()} className="mt-4 rounded-md bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white">Refresh data</button>
              </div>
            ) : (
              <AdminContext.Provider value={{ store, go, focusId, isDark, onExit }}>{page()}</AdminContext.Provider>
            )}
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
};
