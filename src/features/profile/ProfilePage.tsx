import React, { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Bookmark, FlaskConical, Heart, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher.tsx';
import { campaignApi } from '../../services/api/campaignApi.ts';
import type { Campaign } from '../../types/index.ts';
import { useAuthStore } from '../auth/store/auth.store.ts';
import { fundraisingApi } from '../fundraising/api/fundraising.api.ts';
import { profileApi } from './api/profile.api.ts';
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

const ProfilePage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedCauses, setSavedCauses] = useState<Campaign[]>([]);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lewegene_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('lewegene_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user?.id, user?.name, user?.email, user?.phone]);

  useEffect(() => {
    let active = true;
    setSavedCauses([]);
    setFundraisers([]);
    setCollectionsError(null);
    if (!user || (user.role !== 'donor' && user.role !== 'foundation')) {
      setCollectionsLoading(false);
      return () => {
        active = false;
      };
    }
    setCollectionsLoading(true);
    const load = async () => {
      try {
        const [campaigns, list] = await Promise.all([
          user.role === 'donor' ? campaignApi.getAllCampaigns() : Promise.resolve([]),
          user.role === 'foundation' ? fundraisingApi.getMine() : Promise.resolve([]),
        ]);
        if (active) {
          const ids = readSavedCauseIds();
          setSavedCauses(campaigns.filter((campaign) => ids.includes(campaign.id)));
          setFundraisers(list);
        }
      } catch (error) {
        console.error('Could not load the profile data.', error);
        if (active) setCollectionsError(error instanceof Error ? error.message : t('profile.loadError'));
      } finally {
        if (active) setCollectionsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user?.id, user?.role, loadAttempt, t]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    setMessageIsError(false);
    try {
      await profileApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        preferredLanguage: i18n.language === 'en' ? 'en' : 'am',
      });
      setUser({
        ...user,
        name: name.trim(),
        email: email.trim(),
        preferredLanguage: i18n.language === 'en' ? 'en' : 'am',
      }, token);
      setMessage(t('profile.updated'));
    } catch (error) {
      console.error('Could not save profile.', error);
      setMessage(error instanceof Error ? error.message : t('profile.saveError'));
      setMessageIsError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const roleLabel = user?.role === 'foundation'
    ? t('profile.roleFundraiser')
    : user?.role === 'admin'
      ? t('profile.roleAdmin')
      : t('profile.roleDonor');

  return (
    <main className="min-h-screen bg-[#F7F2E7] px-4 py-8 text-[#201C18] dark:bg-[#12100E] dark:text-[#F4EFE6] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {!embedded && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9A7432]/25 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs font-bold uppercase tracking-wider">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 border border-[#26211C]/35 bg-[#FFFDF9] px-3 py-1.5 font-black text-[#1E4D38] transition-colors hover:border-[#1E4D38] dark:border-[#9A7432]/45 dark:bg-[#1C1814] dark:text-[#52B788]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('nav.home', 'Home')}</span>
            </Link>
            <Link
              to="/fundraising"
              className="px-2.5 py-1.5 text-[#201C18] transition-colors hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:text-[#52B788]"
            >
              {t('nav.myFundraisers', 'My Fundraisers')}
            </Link>
            <Link
              to="/contributions"
              className="px-2.5 py-1.5 text-[#201C18] transition-colors hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:text-[#52B788]"
            >
              {t('nav.myContributions', 'My Contributions')}
            </Link>
            <Link
              to="/reports"
              className="px-2.5 py-1.5 text-[#201C18] transition-colors hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:text-[#52B788]"
            >
              {t('nav.myReports', 'My Reports')}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={t('nav.toggleTheme', 'Toggle Parchment / Midnight Ink')}
              title={t('nav.toggleTheme', 'Toggle Parchment / Midnight Ink')}
              className="p-2 border border-[#9A7432]/50 bg-[#F2ECE1] hover:bg-[#9A7432]/15 text-[#201C18] dark:bg-[#1C1814] dark:text-[#D8B066] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#9A7432]/30 pb-5">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9A7432]">{t('profile.space')}</p>
            <h1 className="mt-2 font-serif text-3xl font-black sm:text-4xl">{t('profile.title')}</h1>
          </div>
          <span className="inline-flex items-center gap-2 border border-[#9A7432]/40 px-3 py-2 font-mono text-[10px] font-bold uppercase">
            <ShieldCheck className="h-3.5 w-3.5 text-[#9A7432]" /> {t('profile.verifiedAccount')}
          </span>
        </div>

        {user ? (
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.7fr)]">
            <section className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03] sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#9A7432]/40 bg-[#F2EADA] dark:bg-[#201B16]"><UserRound className="h-5 w-5 text-[#1E4D38] dark:text-[#52B788]" /></span>
                <div>
                  <h2 className="font-serif text-xl font-bold">{user.name}</h2>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9A7432]">{roleLabel} {t('profile.account')}</p>
                </div>
              </div>
              <form onSubmit={saveProfile} className="grid gap-4">
                <label className="grid gap-1.5 font-mono text-xs font-bold">{t('profile.name')}
                  <input required value={name} onChange={(event) => setName(event.target.value)} className="border border-[#26211C]/20 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]" />
                </label>
                <label className="grid gap-1.5 font-mono text-xs font-bold">{t('profile.email')}
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border border-[#26211C]/20 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]" />
                </label>
                <label className="grid gap-1.5 font-mono text-xs font-bold">{t('profile.phone')}
                  <input value={phone} readOnly className="border border-[#26211C]/20 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]" />
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" disabled={isSaving} className="bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-[#163E2C] disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? t('common.loading', 'Saving…') : t('profile.saveProfile')}</button>
                  {message && <p role={messageIsError ? 'alert' : 'status'} className={`text-xs ${messageIsError ? 'text-red-700 dark:text-red-300' : 'text-zinc-600 dark:text-zinc-400'}`}>{message}</p>}
                </div>
              </form>
            </section>

            <aside className="grid content-start gap-4">
              {user.role === 'donor' && (
                <>
                  <Link to="/contributions" className="group flex items-center justify-between border border-[#9A7432]/30 bg-white/60 p-5 hover:border-[#1E4D38] dark:bg-white/[.03]">
                    <span className="flex items-center gap-3"><Heart className="h-5 w-5 text-[#9A7432]" /><span><strong className="block font-serif text-lg">{t('profile.myDonations')}</strong><small className="text-xs text-zinc-500">{t('profile.contributionHistory')}</small></span></span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <section className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03]">
                    <h3 className="flex items-center gap-2 font-serif text-lg font-bold"><Bookmark className="h-4 w-4 text-[#9A7432]" /> {t('profile.savedCauses')}</h3>
                    {collectionsLoading ? (
                      <p role="status" className="mt-2 text-xs text-zinc-500">Loading saved causes…</p>
                    ) : collectionsError ? (
                      <div role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">
                        <p>{collectionsError}</p>
                        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="mt-2 underline">Retry</button>
                      </div>
                    ) : savedCauses.length ? <ul className="mt-3 grid gap-2">{savedCauses.map((cause) => <li key={cause.id}><Link className="text-sm font-semibold hover:text-[#1E4D38] dark:hover:text-[#52B788]" to={`/causes/${cause.id}`}>{cause.title}</Link></li>)}</ul> : <p className="mt-2 text-xs text-zinc-500">{t('profile.saveCauseHint')}</p>}
                  </section>
                </>
              )}
              {user.role === 'foundation' && (
                <>
                  <Link to="/fundraising" className="group flex items-center justify-between border border-[#9A7432]/30 bg-white/60 p-5 hover:border-[#1E4D38] dark:bg-white/[.03]">
                    <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#9A7432]" /><span><strong className="block font-serif text-lg">{t('profile.fundraiserWorkspace')}</strong><small className="text-xs text-zinc-500">{t('profile.createManageCampaigns')}</small></span></span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <section className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03]">
                    <div className="flex items-center justify-between gap-3"><h3 className="font-serif text-lg font-bold">{t('profile.myCampaigns')}</h3><Link to="/fundraising" className="font-mono text-[10px] font-bold uppercase text-[#1E4D38] dark:text-[#52B788]">{t('profile.manage')}</Link></div>
                    {collectionsLoading ? (
                      <p role="status" className="mt-2 text-xs text-zinc-500">Loading your campaigns…</p>
                    ) : collectionsError ? (
                      <div role="alert" className="mt-2 text-xs text-red-700 dark:text-red-300">
                        <p>{collectionsError}</p>
                        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="mt-2 underline">Retry</button>
                      </div>
                    ) : fundraisers.length ? <ul className="mt-3 grid gap-3">{fundraisers.map((item) => <li key={item.id} className="border-t border-[#9A7432]/20 pt-3"><Link className="text-sm font-semibold hover:text-[#1E4D38] dark:hover:text-[#52B788]" to="/fundraising">{item.title}</Link><p className="mt-1 font-mono text-[10px] uppercase text-zinc-500">{t('profile.status', { status: item.status.replace('_', ' ') })}</p></li>)}</ul> : <p className="mt-2 text-xs text-zinc-500">{t('profile.noCampaigns')}</p>}
                  </section>
                </>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="group flex items-center justify-between border border-[#9A7432]/30 bg-white/60 p-5 hover:border-[#1E4D38] dark:bg-white/[.03]">
                  <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#9A7432]" /><span><strong className="block font-serif text-lg">{t('profile.adminConsole')}</strong><small className="text-xs text-zinc-500">{t('profile.reviewAdmin')}</small></span></span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </aside>
          </div>
        ) : (
          <section className="mt-8 border border-[#9A7432]/35 bg-white/60 p-6 dark:bg-white/[.03]">
            <h2 className="font-serif text-2xl font-bold">{t('profile.signInPrompt')}</h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">{t('profile.authenticatedOnly')}</p>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
