import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, Compass, Moon, Sun } from 'lucide-react';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher.tsx';
import { BanknoteLivingBackground } from '../../components/banknote/BanknoteLivingBackground.tsx';
import { StartFundraising } from './pages/StartFundraising.tsx';
import { FundraiserFormPage } from './pages/FundraiserFormPage.tsx';
import { FundraiserPreview } from './pages/FundraiserPreview.tsx';
import { MyFundraisers } from './pages/MyFundraisers.tsx';
import { FundraiserManagement } from './pages/FundraiserManagement.tsx';
import { Drafts } from './pages/Drafts.tsx';
import { EditFundraiser } from './pages/EditFundraiser.tsx';

export type Route =
  | { name: 'start' }
  | { name: 'form' }
  | { name: 'preview'; id: string }
  | { name: 'mine' }
  | { name: 'manage'; id: string }
  | { name: 'drafts' }
  | { name: 'edit'; id: string };

export interface PageProps {
  go: (route: Route) => void;
  toast: (message: string) => void;
  onCampaignsChanged?: () => void;
}

/**
 * Member 2 entry point. Owns its own navigation so no shared router/App file needs to change.
 * When the team adds a router, replace `go()` with navigate() — the pages do not need to change.
 */
export default function FundraisingApp({
  onCampaignsChanged,
  embedded = false,
}: {
  onCampaignsChanged?: () => void;
  embedded?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route>({ name: 'start' });
  const [message, setMessage] = useState<string | null>(null);
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
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const go = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };
  const props: PageProps = { go, toast: setMessage, onCampaignsChanged };

  const tabs: { key: string; label: string; route: Route; active: Route['name'][] }[] = [
    { key: 'start', label: t('fundraiser.tabs.start', 'Start'), route: { name: 'start' }, active: ['start', 'form'] },
    { key: 'mine', label: t('fundraiser.tabs.mine', 'My fundraisers'), route: { name: 'mine' }, active: ['mine', 'manage'] },
    { key: 'drafts', label: t('fundraiser.tabs.drafts', 'Drafts'), route: { name: 'drafts' }, active: ['drafts'] },
  ];

  return (
    <div className={`relative w-full font-mono text-xs text-[#14110E] dark:text-[#F4EFE6] transition-colors ${embedded ? '' : 'min-h-screen bg-[#F2ECE1] dark:bg-[#080706]'} ${isDark ? 'dark' : ''}`}>
      <BanknoteLivingBackground isDark={isDark} />

      {!embedded && <header className="sticky top-0 z-30 border-b-2 border-[#1E4D38]/20 bg-[#FFFDF9]/95 shadow-xs backdrop-blur-xs transition-colors dark:border-[#9A7432]/30 dark:bg-[#12100E]/95">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 border border-[#26211C]/40 bg-[#F2ECE1] px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-[#14110E] transition-colors hover:border-[#1E4D38] hover:text-[#1E4D38] dark:border-[#9A7432]/50 dark:bg-[#1C1814] dark:text-[#F4EFE6] dark:hover:border-[#52B788] dark:hover:text-[#52B788] cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('nav.backToHome', 'Back to Home')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-1.5 border border-[#26211C]/30 bg-transparent px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#201C18] transition-colors hover:border-[#1E4D38] hover:text-[#1E4D38] dark:border-[#9A7432]/40 dark:text-[#E8DEC8] dark:hover:border-[#52B788] dark:hover:text-[#52B788] cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{t('nav.discoverCauses', 'Discover Causes')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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
      </header>}

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav aria-label="Fundraising" className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#12100E]">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => go(tab.route)} aria-current={tab.active.includes(route.name) ? 'page' : undefined}
                className={`px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest cursor-pointer ${
                  tab.active.includes(route.name) ? 'bg-[#1E4D38] dark:bg-[#52B788] text-white dark:text-[#080706]' : 'text-[#14110E] dark:text-[#F4EFE6] hover:text-[#1E4D38] dark:hover:text-[#52B788]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="mx-auto max-w-3xl">
          {route.name === 'start' && <StartFundraising {...props} />}
          {route.name === 'form' && <FundraiserFormPage {...props} />}
          {route.name === 'preview' && <FundraiserPreview key={route.id} id={route.id} {...props} />}
          {route.name === 'mine' && <MyFundraisers {...props} />}
          {route.name === 'manage' && <FundraiserManagement key={route.id} id={route.id} {...props} />}
          {route.name === 'drafts' && <Drafts {...props} />}
          {route.name === 'edit' && <EditFundraiser key={route.id} id={route.id} {...props} />}
        </main>
      </div>

      {message && (
        <div role="status" className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#FFFDF9] dark:bg-[#12100E] text-[#14110E] dark:text-[#F4EFE6] p-4 shadow-2xl border border-[#1E4D38]/40 dark:border-[#52B788]/40 flex items-center gap-3 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {message}
        </div>
      )}
    </div>
  );
}
