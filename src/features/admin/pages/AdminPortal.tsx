import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, FileCheck2, Flag, HandCoins, Users, Building2, Activity, ShieldCheck, UserCircle,
  Bell, Menu, X, Sun, Moon, LogOut,
} from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar.tsx';
import { AdminContext } from '../hooks/AdminContext.ts';
import { useAdminStore } from '../hooks/useAdminStore.ts';
import { AdminSection } from '../types/admin.types.ts';
import { AdminToastProvider, fmtDateTime } from '../components/AdminUI.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { AdminFundraisers } from './AdminFundraisers.tsx';
import { AdminReports } from './AdminReports.tsx';
import { AdminDonations } from './AdminDonations.tsx';
import { AdminUsers } from './AdminUsers.tsx';
import { AdminOrganizations } from './AdminOrganizations.tsx';
import { AdminActivity } from './AdminActivity.tsx';
import { AdminAdmins } from './AdminAdmins.tsx';
import { AdminProfile } from './AdminProfile.tsx';

export interface AdminPortalProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onExit: () => void;
  onApproveCampaign?: (id: string) => void | Promise<void>;
  onRejectCampaign?: (id: string) => void | Promise<void>;
}

const NAV: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'fundraisers', label: 'Fundraisers', icon: <FileCheck2 className="w-4 h-4" /> },
  { id: 'reports', label: 'Reports', icon: <Flag className="w-4 h-4" /> },
  { id: 'donations', label: 'Donations', icon: <HandCoins className="w-4 h-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { id: 'organizations', label: 'Organizations', icon: <Building2 className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  { id: 'admins', label: 'Admins', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'profile', label: 'Admin Profile', icon: <UserCircle className="w-4 h-4" /> },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({ isDark, onToggleTheme, onExit, onApproveCampaign, onRejectCampaign }) => {
  const store = useAdminStore({ onApproveCampaign, onRejectCampaign });
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const go = (s: AdminSection, id?: string) => {
    setSection(s);
    setFocusId(id ?? null);
    setMenuOpen(false);
    setBellOpen(false);
    window.scrollTo({ top: 0 });
  };

  const snap = store.snapshot;
  const counts = useMemo(() => {
    if (!snap) return {} as Record<string, number>;
    return {
      fundraisers: store.campaigns.filter((c) => c.status === 'pending').length,
      reports: snap.reports.filter((r) => r.status === 'pending').length,
      donations: snap.donations.filter((d) => d.status === 'pending').length,
      organizations: snap.organizations.filter((o) => o.status === 'pending').length,
    } as Record<string, number>;
  }, [snap, store.campaigns]);
  const totalPending = Object.values(counts).reduce((a, b) => a + b, 0);
  const me = snap?.admins.find((a) => a.id === snap.currentAdminId);

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
    <nav className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-[#26211C]/15 dark:border-[#9A7432]/25">
        <h1 className="font-display font-black text-xl tracking-[0.2em] text-[#201C18] dark:text-[#F4EFE6] leading-none">LEWEGENE</h1>
        <span className="font-mono text-[9px] tracking-[0.25em] text-[#9A7432] uppercase font-bold mt-1 block">Admin console</span>
      </div>
      <ul className="flex-1 overflow-y-auto py-3">
        {NAV.map((n) => {
          const active = section === n.id;
          const c = counts[n.id];
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => go(n.id)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider cursor-pointer border-l-2 transition-colors ${
                  active
                    ? 'border-[#8B2626] bg-[#8B2626]/8 text-[#8B2626] dark:border-[#D8B066] dark:text-[#D8B066] dark:bg-[#9A7432]/10'
                    : 'border-transparent text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
                }`}
              >
                {n.icon}
                <span className="flex-1 text-left">{n.label}</span>
                {c > 0 && <span className="px-1.5 bg-[#8B2626] text-white text-[10px] rounded-xs">{c}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-[#26211C]/15 dark:border-[#9A7432]/25 space-y-2">
        {me && (
          <div className="flex items-center gap-3 mb-2">
            <Avatar name={me.name} src={me.photo} size="sm" />
            <div className="min-w-0"><p className="text-xs font-semibold truncate text-[#201C18] dark:text-[#F4EFE6]">{me.name}</p><p className="font-mono text-[10px] text-zinc-500 truncate">{me.email}</p></div>
          </div>
        )}
        <button type="button" onClick={onExit} className="w-full flex items-center justify-center gap-2 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 font-mono text-[11px] font-black uppercase cursor-pointer hover:border-[#8B2626] hover:text-[#8B2626] text-[#201C18] dark:text-[#E8DEC8]">
          <LogOut className="w-3.5 h-3.5" /> Exit admin
        </button>
      </div>
    </nav>
  );

  return (
    <AdminToastProvider>
      <div className="relative min-h-screen w-full bg-[#F6F1E5] dark:bg-[#141210] text-[#201C18] dark:text-[#F4EFE6] font-sans">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-[#FCF9F2] dark:bg-[#1E1A17] border-r border-[#26211C]/20 dark:border-[#9A7432]/30 z-30">{sidebar}</aside>
        {/* Mobile sidebar */}
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-[#FCF9F2] dark:bg-[#1E1A17] border-r border-[#26211C]/20">{sidebar}</aside>
          </div>
        )}

        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-8 py-3 bg-[#F6F1E5]/90 dark:bg-[#141210]/90 backdrop-blur-xs border-b border-[#26211C]/15 dark:border-[#9A7432]/25">
            <div className="flex items-center gap-3">
              <button type="button" className="lg:hidden p-2 border border-[#26211C]/30 dark:border-[#9A7432]/40 cursor-pointer" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu className="w-4 h-4" /></button>
              <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#8B2626] dark:text-[#D8B066]">{NAV.find((n) => n.id === section)?.label}</span>
            </div>
            <div className="flex items-center gap-2 relative">
              <button type="button" onClick={() => setBellOpen((v) => !v)} className="relative p-2 border border-[#9A7432]/50 hover:bg-[#9A7432]/15 cursor-pointer" aria-label="Items needing review">
                <Bell className="w-3.5 h-3.5" />
                {totalPending > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 grid place-items-center bg-[#8B2626] text-white font-mono text-[9px] font-bold">{totalPending}</span>}
              </button>
              <button type="button" onClick={onToggleTheme} title="Toggle Parchment / Midnight Ink" className="p-2 border border-[#9A7432]/50 hover:bg-[#9A7432]/15 cursor-pointer">
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#FCF9F2] dark:bg-[#1E1A17] border border-[#26211C]/30 dark:border-[#9A7432]/40 shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#26211C]/15 dark:border-[#9A7432]/25">
                    <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#8B2626] dark:text-[#D8B066]">Needs review</span>
                    <button onClick={() => setBellOpen(false)} className="cursor-pointer" aria-label="Close"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {([
                    ['fundraisers', 'New fundraisers submitted'],
                    ['reports', 'New reports'],
                    ['donations', 'Donations to verify'],
                    ['organizations', 'New organization applications'],
                  ] as const).map(([id, label]) => (
                    <button key={id} onClick={() => go(id)} className="w-full flex items-center justify-between px-4 py-2.5 font-mono text-xs cursor-pointer hover:bg-[#EFE8D8] dark:hover:bg-[#26221D] text-[#201C18] dark:text-[#F4EFE6]">
                      <span>{label}</span><span className={counts[id] ? 'font-bold text-[#8B2626]' : 'text-zinc-500'}>{counts[id] ?? 0}</span>
                    </button>
                  ))}
                  <p className="px-4 py-2 font-mono text-[10px] text-zinc-500 border-t border-[#26211C]/15 dark:border-[#9A7432]/25">Email alerts are also sent for these items · {fmtDateTime(new Date().toISOString())}</p>
                </div>
              )}
            </div>
          </header>

          <main className="px-4 sm:px-8 py-8 max-w-[1400px]">
            {store.loading || !snap ? (
              <p className="font-mono text-xs text-zinc-500">Loading admin data…</p>
            ) : (
              <AdminContext.Provider value={{ store, go, focusId, isDark, onExit }}>{page()}</AdminContext.Provider>
            )}
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
};
