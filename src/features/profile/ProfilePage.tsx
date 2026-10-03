import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Bookmark, FlaskConical, Heart, ShieldCheck, UserRound } from 'lucide-react';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher.tsx';
import { campaignApi } from '../../services/api/campaignApi.ts';
import type { Campaign } from '../../types/index.ts';
import { useAuthStore } from '../auth/store/auth.store.ts';
import { DEMO_ACCOUNTS, DEMO_SESSION_TOKEN, type DemoRole } from '../auth/data/demoAccounts.ts';
import { fundraisingApi } from '../fundraising/api/fundraising.api.ts';
import type { Fundraiser } from '../fundraising/types/fundraiser.types.ts';

const SAVED_CAUSES_KEY = 'lewegene_saved_causes';

function readSavedCauseIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_CAUSES_KEY) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedCauses, setSavedCauses] = useState<Campaign[]>([]);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user?.id, user?.name, user?.email, user?.phone]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (user?.role === 'donor') {
          const ids = readSavedCauseIds();
          const campaigns = await campaignApi.getAllCampaigns();
          if (active) setSavedCauses(campaigns.filter((campaign) => ids.includes(campaign.id)));
        } else {
          setSavedCauses([]);
        }
        if (user?.role === 'foundation') {
          const list = await fundraisingApi.getMine();
          if (active) setFundraisers(list);
        } else {
          setFundraisers([]);
        }
      } catch (error) {
        console.error('Could not load the local profile data.', error);
        if (active) setMessage('Some demo profile data could not be loaded. Please try again.');
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setUser({ ...user, name: name.trim(), email: email.trim(), phone: phone.trim() }, DEMO_SESSION_TOKEN);
    setMessage('Profile updated in this browser only.');
  };

  const selectDemoRole = (role: DemoRole) => {
    setUser(DEMO_ACCOUNTS[role], DEMO_SESSION_TOKEN);
    if (role === 'admin') navigate('/admin');
    else if (role === 'fundraiser') navigate('/fundraising');
  };

  const roleLabel = user?.role === 'foundation' ? 'Fundraiser' : user?.role;

  return (
    <main className="min-h-screen bg-[#F7F2E7] px-4 py-10 text-[#201C18] dark:bg-[#12100E] dark:text-[#F4EFE6] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="font-mono text-xs font-bold uppercase tracking-widest text-[#1E4D38] dark:text-[#52B788]">
            ← {t('nav.home', 'Back to Lewegene')}
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#9A7432]/30 pb-5">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9A7432]">Your Lewegene space</p>
            <h1 className="mt-2 font-serif text-3xl font-black sm:text-4xl">Profile</h1>
          </div>
          <span className="inline-flex items-center gap-2 border border-[#9A7432]/40 px-3 py-2 font-mono text-[10px] font-bold uppercase">
            <FlaskConical className="h-3.5 w-3.5 text-[#9A7432]" /> Demo data · saved in this browser
          </span>
        </div>

        {!user ? (
          <section className="mt-8 border border-[#9A7432]/35 bg-white/60 p-6 dark:bg-white/[.03]">
            <h2 className="font-serif text-2xl font-bold">Choose a demo profile</h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">Explore donor, fundraiser, and admin flows without creating a real account.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {(['donor', 'fundraiser', 'admin'] as DemoRole[]).map((role) => (
                <button key={role} type="button" onClick={() => selectDemoRole(role)} className="border border-[#1E4D38] bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-bold uppercase text-white hover:bg-[#163E2C]">
                  Continue as {role}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.7fr)]">
            <section className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03] sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#9A7432]/40 bg-[#F2EADA] dark:bg-[#201B16]"><UserRound className="h-5 w-5 text-[#1E4D38] dark:text-[#52B788]" /></span>
                <div>
                  <h2 className="font-serif text-xl font-bold">{user.name}</h2>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9A7432]">{roleLabel} demo account</p>
                </div>
              </div>
              <form onSubmit={saveProfile} className="grid gap-4">
                <label className="grid gap-1.5 font-mono text-xs font-bold">Name
                  <input required value={name} onChange={(event) => setName(event.target.value)} className="border border-[#26211C]/20 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]" />
                </label>
                <label className="grid gap-1.5 font-mono text-xs font-bold">Email
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border border-[#26211C]/20 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]" />
                </label>
                <label className="grid gap-1.5 font-mono text-xs font-bold">Phone
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="border border-[#26211C]/20 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]" />
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" className="bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-[#163E2C]">Save profile</button>
                  {message && <p role="status" className="text-xs text-zinc-600 dark:text-zinc-400">{message}</p>}
                </div>
              </form>
            </section>

            <aside className="grid content-start gap-4">
              {user.role === 'donor' && (
                <>
                  <Link to="/contributions" className="group flex items-center justify-between border border-[#9A7432]/30 bg-white/60 p-5 hover:border-[#1E4D38] dark:bg-white/[.03]">
                    <span className="flex items-center gap-3"><Heart className="h-5 w-5 text-[#9A7432]" /><span><strong className="block font-serif text-lg">My donations</strong><small className="text-xs text-zinc-500">View contribution history</small></span></span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <section className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03]">
                    <h3 className="flex items-center gap-2 font-serif text-lg font-bold"><Bookmark className="h-4 w-4 text-[#9A7432]" /> Saved causes</h3>
                    {savedCauses.length ? <ul className="mt-3 grid gap-2">{savedCauses.map((cause) => <li key={cause.id}><Link className="text-sm font-semibold hover:text-[#1E4D38] dark:hover:text-[#52B788]" to={`/causes/${cause.id}`}>{cause.title}</Link></li>)}</ul> : <p className="mt-2 text-xs text-zinc-500">Save a cause from its details page to find it here.</p>}
                  </section>
                </>
              )}
              {user.role === 'foundation' && (
                <>
                  <Link to="/fundraising" className="group flex items-center justify-between border border-[#9A7432]/30 bg-white/60 p-5 hover:border-[#1E4D38] dark:bg-white/[.03]">
                    <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#9A7432]" /><span><strong className="block font-serif text-lg">Fundraiser workspace</strong><small className="text-xs text-zinc-500">Create and manage campaigns</small></span></span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <section className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03]">
                    <div className="flex items-center justify-between gap-3"><h3 className="font-serif text-lg font-bold">My campaigns</h3><Link to="/fundraising" className="font-mono text-[10px] font-bold uppercase text-[#1E4D38] dark:text-[#52B788]">Manage</Link></div>
                    {fundraisers.length ? <ul className="mt-3 grid gap-3">{fundraisers.map((item) => <li key={item.id} className="border-t border-[#9A7432]/20 pt-3"><Link className="text-sm font-semibold hover:text-[#1E4D38] dark:hover:text-[#52B788]" to="/fundraising">{item.title}</Link><p className="mt-1 font-mono text-[10px] uppercase text-zinc-500">Status: {item.status.replace('_', ' ')}</p></li>)}</ul> : <p className="mt-2 text-xs text-zinc-500">No campaigns yet. Start a fundraiser to see its draft and review status here.</p>}
                  </section>
                </>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="group flex items-center justify-between border border-[#9A7432]/30 bg-white/60 p-5 hover:border-[#1E4D38] dark:bg-white/[.03]">
                  <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#9A7432]" /><span><strong className="block font-serif text-lg">Admin console</strong><small className="text-xs text-zinc-500">Review campaigns, users, and reports</small></span></span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
