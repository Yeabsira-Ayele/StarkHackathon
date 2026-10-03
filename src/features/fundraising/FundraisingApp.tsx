import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher.tsx';
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
export default function FundraisingApp({ onCampaignsChanged }: { onCampaignsChanged?: () => void }) {
  const { t } = useTranslation();
  const [route, setRoute] = useState<Route>({ name: 'start' });
  const [message, setMessage] = useState<string | null>(null);

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
    <div className="w-full font-mono text-xs text-[#14110E] dark:text-[#F4EFE6]">
      <nav aria-label="Fundraising" className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#12100E]">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => go(tab.route)} aria-current={tab.active.includes(route.name) ? 'page' : undefined}
              className={`px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest cursor-pointer ${
                tab.active.includes(route.name) ? 'bg-[#1E4D38] dark:bg-[#52B788] text-white dark:text-[#080706]' : 'text-[#14110E] dark:text-[#F4EFE6] hover:text-[#1E4D38] dark:hover:text-[#52B788]'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <LanguageSwitcher />
      </nav>

      <main className="max-w-3xl">
        {route.name === 'start' && <StartFundraising {...props} />}
        {route.name === 'form' && <FundraiserFormPage {...props} />}
        {route.name === 'preview' && <FundraiserPreview key={route.id} id={route.id} {...props} />}
        {route.name === 'mine' && <MyFundraisers {...props} />}
        {route.name === 'manage' && <FundraiserManagement key={route.id} id={route.id} {...props} />}
        {route.name === 'drafts' && <Drafts {...props} />}
        {route.name === 'edit' && <EditFundraiser key={route.id} id={route.id} {...props} />}
      </main>

      {message && (
        <div role="status" className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#FFFDF9] dark:bg-[#12100E] text-[#14110E] dark:text-[#F4EFE6]  p-4 shadow-2xl border border-[#1E4D38]/40 dark:border-[#52B788]/40 flex items-center gap-3 font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {message}
        </div>
      )}
    </div>
  );
}
