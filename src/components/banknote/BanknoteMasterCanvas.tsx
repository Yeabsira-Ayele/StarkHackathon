import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Campaign, ContributionCertificate, PaymentRail, Organization } from '../../types/index.ts';
import {
  CentralMonumentEngraving,
  AcsoCircularSeal,
  VoxideVoiceSeal,
  BanknoteRulerGauge,
} from './BanknoteArtwork.tsx';
import { BanknotePlateCard } from './BanknotePlateCard.tsx';
import { BanknoteLivingBackground } from './BanknoteLivingBackground.tsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher.tsx';
import { ExplorePage } from '../../features/campaigns/pages/ExplorePage';
import { CampaignDetailsPage } from '../../features/campaigns/pages/CampaignDetailsPage';
import { PledgeWizardPage } from '../../features/donations/pages/PledgeWizardPage';
import { PatronVaultPage } from '../../features/donations/pages/PatronVaultPage';
import { CreateCampaignPage } from '../../features/fundraiser/pages/CreateCampaignPage';
import { FoundationDashboardPage } from '../../features/fundraiser/pages/FoundationDashboardPage';
import FundraisingApp from '../../features/fundraising/FundraisingApp';
import ProfilePage from '../../features/profile/ProfilePage';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Calendar,
  Users,
  MapPin,
  ExternalLink,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  FileText,
  DollarSign,
  TrendingUp,
  Check,
  HandHeart,
  HeartHandshake,
  BadgeCheck,
  Flag,
  Bookmark,
  X,
  HelpCircle,
  Info,
  Filter,
  UserRound,
  LogOut,
  Clock,
} from 'lucide-react';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';
import { adminApi } from '../../features/admin/api/admin.api.ts';
import { campaignApi } from '../../services/api/campaignApi.ts';
import { useAuthStore } from '../../features/auth/store/auth.store.ts';
import { DISCOVER_LOCATIONS } from '../../services/lookupService.ts';
import { CAMPAIGN_CATEGORIES } from '../../mock-data/categories/categories.data.ts';
import { localizeErrorMessage } from '../../i18n/errorMessage.ts';
import { APP_NAME } from '../../data/content.ts';

const ETHIOPIAN_REGIONS = DISCOVER_LOCATIONS;

export type BanknoteZoomMode =
  | 'overview'
  | 'discover'
  | 'detail'
  | 'pledge'
  | 'vault'
  | 'impact'
  | 'treasury'
  | 'engrave'
  | 'audit'
  | 'profile'
  | 'fundraising';

export interface BanknoteMasterCanvasProps {
  campaigns: Campaign[];
  pendingCampaigns: Campaign[];
  currentOrganization: Organization | null;
  organizations?: Organization[];
  initialMode?: BanknoteZoomMode;
  initialCampaignId?: string;
  onDonate: (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => Promise<any>;
  onApproveCampaign?: (id: string) => void;
  onRejectCampaign?: (id: string) => void;
  onCreateCampaign?: (campaignData: Partial<Campaign>) => Promise<any>;
  onOpenVoice: () => void;
  onOpenScholarxiv?: () => void;
  language: 'en' | 'am';
  isDark: boolean;
  onToggleTheme: () => void;
  onDonationCompleted?: (cert: ContributionCertificate) => void;
  isAuthenticated?: boolean;
  canAccessFoundation?: boolean;
  isDataLoading?: boolean;
  dataError?: string | null;
  onRetryData?: () => void;
  onRequireLogin?: (action: 'donate' | 'fundraise' | 'report' | 'save') => void;
  onFoundationAccessDenied?: () => void;
}

interface HomeLandingProps {
  campaigns: Campaign[];
  organizations: Organization[];
  isDataLoading?: boolean;
  totalRaised: number;
  totalDonations: number;
  showHero?: boolean;
  showImpact?: boolean;
  onDiscover: () => void;
  onFundraise: () => void;
  onVoxide: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

const HomeLanding: React.FC<HomeLandingProps> = ({
  campaigns,
  organizations,
  isDataLoading = false,
  totalRaised,
  totalDonations,
  showHero = true,
  showImpact = true,
  onDiscover,
  onFundraise,
  onVoxide,
  onSelectCampaign,
}) => {
  const { t } = useTranslation();
  const activeCampaigns = campaigns.filter((campaign) => ['pending', 'approved'].includes(campaign.status));
  const featuredCampaigns = [...activeCampaigns]
    .sort((a, b) => {
      const score = (campaign: Campaign) => {
        const percent = campaign.goalAmount ? campaign.raisedAmount / campaign.goalAmount : 0;
        return campaign.category === 'emergency' || percent >= 0.75 ? 1 : 0;
      };

      return score(b) - score(a);
    })
    .slice(0, 3);
  const trustedOrganizations = organizations.filter((organization) => organization.verified).slice(0, 4);
  const heroCampaign = featuredCampaigns[0];

  return (
    <div className="flex w-full flex-col gap-4 animate-in fade-in duration-300">
      {showHero && (
      <section className="relative overflow-hidden bg-[#EAE1CF] dark:bg-[#101711]">
        <div className="absolute inset-0 pointer-events-none intaglio-crosshatch opacity-60" />
        <div className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-10 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-20 lg:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-[#9A7432]/50 bg-[#F7F2E7]/80 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#805F29] dark:bg-[#161b16] dark:text-[#D8B066]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('home.hero.badge')}</span>
            </div>
            <div>
              <h1 className="font-display text-4xl font-black leading-[1.08] tracking-tight text-[#201C18] dark:text-[#F4EFE6] sm:text-6xl">
                {t('home.hero.titleLead')}<br />
                <span className="text-[#1E4D38] dark:text-[#52B788]">{t('home.hero.titleHighlight')}</span>
              </h1>
              <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-[#5A4E3E] dark:text-[#C9BEAC] sm:text-xl">
                {t('home.hero.description', { appName: APP_NAME })}
              </p>
              <p className="mt-3 font-ethiopic text-sm text-[#8B6A34]">{t('home.motto')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onDiscover} className="inline-flex items-center gap-2 border-2 border-[#1E4D38] bg-[#1E4D38] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#163E2C]">
                {t('home.hero.discover')} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={onFundraise} className="inline-flex items-center gap-2 border border-[#26211C]/50 bg-[#F7F2E7] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#201C18] transition hover:border-[#1E4D38] hover:text-[#1E4D38] dark:bg-[#1A201B] dark:text-[#F4EFE6]">
                {t('home.hero.startFundraising')} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={onVoxide} className="inline-flex items-center gap-2 border border-[#9A7432]/60 bg-[#F2EADA]/70 px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#805F29] transition hover:bg-[#E1D4BA] dark:bg-[#181612] dark:text-[#D8B066]">
                <Volume2 className="h-4 w-4" /> {t('home.hero.voxide')}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#26211C]/15 pt-4 font-mono text-[9px] font-bold uppercase tracking-wider text-[#5A4E3E] dark:text-[#B6AA98]">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#1E4D38]" /> {t('home.hero.verifiedOrganizations')}</span>
              <span className="inline-flex items-center gap-1.5"><HandHeart className="h-3.5 w-3.5 text-[#9A7432]" /> {t('home.hero.communityFirst')}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -inset-3 border border-[#9A7432]/45" />
            <div className="absolute -inset-1.5 border border-[#1E4D38]/35 dark:border-[#9A7432]/35" />
            {heroCampaign?.imageUrl ? (
              <img src={heroCampaign.imageUrl} alt={heroCampaign.title} className="relative block aspect-[4/3] w-full object-cover filter contrast-110 saturate-90" />
            ) : (
              <div className="relative grid aspect-[4/3] place-items-center bg-[#1E4D38] text-6xl text-[#D8B066]">{t('home.hero.brandMark')}</div>
            )}
            <div className="absolute inset-0 pointer-events-none intaglio-overlay opacity-50" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 border border-[#B88B45]/60 bg-[#F2ECE1]/95 p-4 shadow-xl dark:bg-[#141210]/95">
              <div className="min-w-0">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#1E4D38] dark:text-[#52B788]">{t('home.hero.closeToHome')}</span>
                <p className="mt-1 truncate font-serif text-base font-bold text-[#201C18] dark:text-[#F4EFE6]">{heroCampaign?.title || t('home.hero.findFirstCause')}</p>
              </div>
              <button type="button" onClick={onDiscover} aria-label={t('home.hero.discover')} className="grid h-9 w-9 shrink-0 place-items-center border border-[#1E4D38] bg-[#1E4D38] text-white hover:bg-[#163E2C]"><ArrowRight className="h-4 w-4" /></button>
            </div>
            <div className="absolute -right-5 -top-5 hidden h-16 w-16 rotate-6 flex-col items-center justify-center rounded-full border border-[#B88B45] bg-[#F2ECE1] font-mono text-[8px] font-black leading-tight text-[#1E4D38] dark:bg-[#141210] dark:text-[#D8B066] sm:flex">
              <HeartHandshake className="mb-0.5 h-5 w-5" /> {t('home.hero.giveLabel')}<br />{t('home.hero.togetherLabel')}
            </div>
          </div>
        </div>
      </section>
      )}

      <section id="home-featured-causes" className="scroll-mt-20 relative mx-auto w-full max-w-6xl border-2 border-[#1E4D38]/40 bg-[#FAF6EC] p-6 shadow-xl dark:border-[#9A7432]/50 dark:bg-[#0C0A09] sm:p-8">
        <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />
        <div className="relative z-10 mb-7 flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#1E4D38]/20 pb-4 dark:border-[#9A7432]/30">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#1E4D38] px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-white dark:bg-[#52B788] dark:text-[#080706]">{t('home.featured.badge')}</span>
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#8B5E14] dark:text-[#D8B066]">{t('home.featured.ledger')}</span>
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-black tracking-tight text-[#14110E] dark:text-white sm:text-3xl">{t('home.featured.title')}</h2>
            <p className="mt-2 max-w-xl font-serif text-base text-zinc-600 dark:text-zinc-400">{t('home.featured.description')}</p>
          </div>
          <button type="button" onClick={onDiscover} className="inline-flex items-center gap-2 border-b border-[#1E4D38] pb-1 font-mono text-[10px] font-black uppercase tracking-wider text-[#1E4D38] dark:text-[#52B788]">{t('home.featured.browseAll')} <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
        {featuredCampaigns.length > 0 ? (
          <div className="relative z-10 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredCampaigns.map((campaign, index) => (
              <BanknotePlateCard key={campaign.id} campaign={campaign} onSelect={onSelectCampaign} showViewCause isSpotlight={index === 0} />
            ))}
          </div>
        ) : (
          <div className="relative z-10 border border-dashed border-[#9A7432]/50 bg-[#F7F2E7]/70 p-10 text-center font-mono text-xs text-zinc-600 dark:bg-[#141210] dark:text-zinc-400">
            {t('home.featured.empty')}
          </div>
        )}
      </section>

      <section id="home-how-it-works" className="scroll-mt-20 relative border-2 border-[#9A7432]/50 bg-[#EAE1CF]/70 dark:bg-[#111410]">
        <div className="pointer-events-none absolute inset-2 border border-[#1E4D38]/25 dark:border-[#9A7432]/25" />
        <div className="relative mx-auto grid max-w-[1300px] gap-9 px-6 py-8 sm:px-12 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:px-20 lg:py-10">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#9A7432]">{t('home.howItWorks.eyebrow')}</p>
            <h2 className="mt-2 font-display text-2xl font-black leading-tight text-[#201C18] dark:text-[#F4EFE6] sm:text-3xl">{t('home.howItWorks.titleLine1')}<br />{t('home.howItWorks.titleLine2')}</h2>
            <p className="mt-3 max-w-sm font-serif text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{t('home.howItWorks.description')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { number: '01', title: t('home.howItWorks.step1Title'), detail: t('home.howItWorks.step1Detail'), icon: <Search className="h-5 w-5" /> },
              { number: '02', title: t('home.howItWorks.step2Title'), detail: t('home.howItWorks.step2Detail'), icon: <HandHeart className="h-5 w-5" /> },
              { number: '03', title: t('home.howItWorks.step3Title'), detail: t('home.howItWorks.step3Detail'), icon: <TrendingUp className="h-5 w-5" /> },
            ].map((step) => (
              <article key={step.number} className="border border-[#26211C]/20 bg-[#F7F2E7]/75 p-5 dark:border-[#9A7432]/30 dark:bg-[#171a16]">
                <div className="flex items-center justify-between font-mono text-[10px] font-black text-[#9A7432]"><span>{step.number}</span><span className="text-[#1E4D38] dark:text-[#52B788]">{step.icon}</span></div>
                <h3 className="mt-5 font-serif text-lg font-bold text-[#201C18] dark:text-[#F4EFE6]">{step.title}</h3>
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400">{step.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showImpact && (
      <section id="home-impact" className="scroll-mt-20 relative mx-auto w-full max-w-5xl border-2 border-[#9A7432]/50 bg-[#F7F2E7]/75 px-4 py-6 dark:bg-[#141210] sm:px-6">
        <div className="pointer-events-none absolute inset-2 border border-[#1E4D38]/25 dark:border-[#9A7432]/25" />
        <div className="relative grid grid-cols-2 gap-6 font-mono text-center lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-2xl font-black text-[#201C18] dark:text-[#D8B066] sm:text-3xl">
              {isDataLoading ? '—' : `${totalRaised.toLocaleString()} ${t('common.currency')}`}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t('home.impact.totalUnderwritten')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-[#201C18] dark:text-[#D8B066] sm:text-3xl">
              {isDataLoading ? '—' : totalDonations.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t('home.impact.communityPatrons')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-[#1E4D38] dark:text-[#52B788] sm:text-3xl">100%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t('home.impact.directToBeneficiaries')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-[#201C18] dark:text-[#D8B066] sm:text-3xl">
              {isDataLoading ? '—' : campaigns.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {t('home.impact.verifiedPlates')}
            </p>
          </div>
        </div>
      </section>
      )}

      <section id="home-communities" className="scroll-mt-20 mx-auto w-full max-w-[1300px] px-6 py-8 sm:px-12 lg:px-20">
        <div className="relative">
        <div className="mb-7 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#9A7432]">{t('home.communities.eyebrow')}</p>
          <h2 className="mt-2 font-display text-2xl font-black text-[#201C18] dark:text-[#F4EFE6] sm:text-3xl">{t('home.communities.title')}</h2>
          <p className="mx-auto mt-2 max-w-xl font-serif text-base text-zinc-600 dark:text-zinc-400">{t('home.communities.description')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustedOrganizations.map((organization) => (
            <article key={organization.id} className="flex min-h-36 flex-col justify-between border border-[#26211C]/20 bg-[#F7F2E7]/75 p-5 dark:border-[#9A7432]/30 dark:bg-[#141210]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center border border-[#9A7432]/50 bg-[#1E4D38] font-display text-lg font-black text-[#F4EFE6]">{organization.name.charAt(0)}</span>
                <BadgeCheck className="h-4 w-4 shrink-0 text-[#1E4D38] dark:text-[#52B788]" />
              </div>
              <div className="mt-5">
                <h3 className="font-serif text-sm font-bold leading-snug text-[#201C18] dark:text-[#F4EFE6]">{organization.name}</h3>
                <p className="mt-1 font-mono text-[9px] text-zinc-500">{organization.location}</p>
              </div>
            </article>
          ))}
          {trustedOrganizations.length === 0 && <p className="col-span-full text-center font-mono text-xs text-zinc-500">{t('home.communities.empty')}</p>}
        </div>
        </div>
      </section>

      <section id="home-voxide" className="scroll-mt-20 relative overflow-hidden border-2 border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#111410]">
        <div className="pointer-events-none absolute inset-2 border border-[#1E4D38]/25 dark:border-[#9A7432]/25" />
        <div className="relative mx-auto grid max-w-[1300px] gap-8 px-6 py-8 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-20">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#9A7432]/50 bg-[#FAF6EC] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[.18em] text-[#805F29] dark:bg-[#181612] dark:text-[#D8B066]">
              <Volume2 className="h-3.5 w-3.5" />
              {t('home.voxide.badge', { appName: APP_NAME })}
            </div>
            <h2 className="mt-3 font-display text-3xl font-black text-[#201C18] dark:text-[#F4EFE6] sm:text-4xl">{t('home.voxide.title')}</h2>
            <p className="mt-1 font-serif text-xl font-bold text-[#1E4D38] dark:text-[#52B788]">{t('home.voxide.tagline')}</p>
            <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t('home.voxide.description')}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#201C18] dark:text-[#E8DEC8] sm:text-xs">
              <span className="border border-[#26211C]/20 bg-[#FAF6EC] px-3 py-2 dark:border-[#9A7432]/30 dark:bg-[#171a16]">{t('home.voxide.speak')}</span>
              <ArrowRight className="h-4 w-4 text-[#9A7432]" />
              <span className="border border-[#26211C]/20 bg-[#FAF6EC] px-3 py-2 dark:border-[#9A7432]/30 dark:bg-[#171a16]">{t('home.voxide.understands')}</span>
              <ArrowRight className="h-4 w-4 text-[#9A7432]" />
              <span className="border border-[#26211C]/20 bg-[#FAF6EC] px-3 py-2 dark:border-[#9A7432]/30 dark:bg-[#171a16]">{t('home.voxide.takeAction')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onVoxide}
            className="inline-flex items-center justify-center gap-2 justify-self-start border-2 border-[#1E4D38] bg-[#1E4D38] px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#163E2C] lg:justify-self-end"
          >
            <Volume2 className="h-4 w-4" />
            {t('home.voxide.try')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="relative overflow-hidden border-2 border-[#9A7432]/60 bg-[#EAE1CF] px-6 py-8 text-center dark:bg-[#111410] sm:px-12">
        <div className="absolute inset-2 border border-[#9A7432]/25 pointer-events-none" />
        <div className="relative mx-auto max-w-2xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#9A7432]">{t('home.cta.eyebrow')}</p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-[#201C18] dark:text-[#F4EFE6] sm:text-4xl">{t('home.cta.title')}</h2>
          <p className="mx-auto mt-3 max-w-lg font-serif text-base text-zinc-600 dark:text-zinc-400">{t('home.cta.description')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onFundraise} className="inline-flex items-center gap-2 border-2 border-[#1E4D38] bg-[#1E4D38] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-white hover:bg-[#163E2C]">{t('home.cta.startFundraising')} <ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={onDiscover} className="inline-flex items-center gap-2 border border-[#26211C]/40 bg-[#F7F2E7] px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#201C18] hover:border-[#1E4D38] dark:bg-[#171a16] dark:text-[#F4EFE6]">{t('home.cta.discover')} <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const BanknoteMasterCanvas: React.FC<BanknoteMasterCanvasProps> = ({
  campaigns,
  pendingCampaigns,
  currentOrganization,
  organizations = [],
  initialMode = 'overview',
  initialCampaignId,
  onDonate,
  onApproveCampaign,
  onRejectCampaign,
  onCreateCampaign,
  onOpenVoice,
  onOpenScholarxiv,
  language,
  isDark,
  onToggleTheme,
  onDonationCompleted,
  isAuthenticated = false,
  canAccessFoundation = false,
  isDataLoading = false,
  dataError = null,
  onRetryData,
  onRequireLogin,
  onFoundationAccessDenied,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const setAuthUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const showPersonalNavigation = isAuthenticated && Boolean(authUser);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileName, setProfileName] = useState(authUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(authUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(authUser?.phone || '');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isProfileEditorOpen || !authUser) return;
    setProfileName(authUser.name);
    setProfileEmail(authUser.email);
    setProfilePhone(authUser.phone || '');
  }, [isProfileEditorOpen, authUser]);

  const hasReports = false;
  const hasFundraisers = false;

  // Navigation State
  const [zoomMode, setZoomMode] = useState<BanknoteZoomMode>(initialMode);
  const [activePlateIndex, setActivePlateIndex] = useState<number>(0);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignDetailLoading, setCampaignDetailLoading] = useState(false);
  const [campaignDetailError, setCampaignDetailError] = useState<string | null>(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<
    { key: string } | { error: unknown; fallbackKey: string } | null
  >(null);
  const [savedCauseIds, setSavedCauseIds] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('lewegene_saved_causes') || '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });
  const navigateToMode = (mode: BanknoteZoomMode, path?: string) => {
    setZoomMode(mode);
    const modePaths: Record<BanknoteZoomMode, string> = {
      overview: '/',
      discover: '/discover',
      detail: selectedCampaign ? `/causes/${selectedCampaign.id}` : '/causes',
      pledge: selectedCampaign ? `/donations/${selectedCampaign.id}` : '/donations',
      vault: '/contributions',
      impact: '/impact',
      treasury: '/fundraising',
      engrave: '/fundraising',
      audit: '/admin',
      profile: '/profile',
      fundraising: '/fundraising',
    };
    navigate(path || modePaths[mode]);
  };

  useEffect(() => {
    setZoomMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    let active = true;
    setCampaignDetailError(null);
    if (!initialCampaignId) {
      setCampaignDetailLoading(false);
      if (initialMode === 'detail' || initialMode === 'pledge') {
        setSelectedCampaign(campaigns[0] || null);
      }
      return () => {
        active = false;
      };
    }

    const listedCampaign = campaigns.find((campaign) => campaign.id === initialCampaignId);
    if (listedCampaign) {
      setSelectedCampaign(listedCampaign);
      setCampaignDetailLoading(false);
      return () => {
        active = false;
      };
    }
    if (isDataLoading) {
      setSelectedCampaign(null);
      setCampaignDetailLoading(true);
      return () => {
        active = false;
      };
    }

    setSelectedCampaign(null);
    setCampaignDetailLoading(true);
    campaignApi.getCampaignById(initialCampaignId)
      .then((campaign) => {
        if (active) setSelectedCampaign(campaign);
      })
      .catch((cause: unknown) => {
        if (active) setCampaignDetailError(cause instanceof Error ? cause.message : 'Could not load this campaign.');
      })
      .finally(() => {
        if (active) setCampaignDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [campaigns, initialCampaignId, initialMode, isDataLoading]);

  const openVault = () => {
    if (!isAuthenticated) {
      onRequireLogin?.('donate');
      return;
    }
    navigateToMode('vault');
  };

  const openFoundationDesk = () => {
    if (!isAuthenticated) {
      onRequireLogin?.('fundraise');
      return;
    }
    if (!canAccessFoundation) {
      onFoundationAccessDenied?.();
      return;
    }
    navigate('/foundation');
  };

  // User Role Switcher
  const [userRole, setUserRole] = useState<'patron' | 'foundation'>('patron');

  // Search & Filters for Causes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fundingStatusFilter, setFundingStatusFilter] = useState<'all' | 'ending_soon' | 'started_now' | 'ongoing'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Pledge / Contribution State (4-Step Wizard)
  const [pledgeStep, setPledgeStep] = useState<1 | 2 | 3 | 4>(1);
  const [pledgeAmount, setPledgeAmount] = useState<number>(500);
  const [customAmountStr, setCustomAmountStr] = useState<string>('500');
  const [donorName, setDonorName] = useState<string>('Anonymous Patron');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorMessage, setDonorMessage] = useState<string>('For our community, with utmost solidarity and love.');
  const [selectedPaymentRail, setSelectedPaymentRail] = useState<PaymentRail>('telebirr');
  const [isPledging, setIsPledging] = useState<boolean>(false);
  const [pledgeSuccessCert, setPledgeSuccessCert] = useState<ContributionCertificate | null>(null);

  // Foundation Project Creation State
  const [newTitle, setNewTitle] = useState<string>('Borehole Water Purification in Wolaita');
  const [newCategory, setNewCategory] = useState<Campaign['category']>('water');
  const [newGoal, setNewGoal] = useState<number>(120000);
  const [newLocation, setNewLocation] = useState<string>('Wolaita, SNNPR');
  const [newBeneficiaries, setNewBeneficiaries] = useState<number>(850);
  const [newStory, setNewStory] = useState<string>(
    'Providing sustainable solar borehole water filtration equipment for 850 rural households currently facing acute dry-season water stress.'
  );
  const [isSubmittingCause, setIsSubmittingCause] = useState<boolean>(false);

  // Seals modal
  const [showAcsoModal, setShowAcsoModal] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedCampaign) return;
    const refreshed = campaigns.find((campaign) => campaign.id === selectedCampaign.id);
    if (refreshed && refreshed !== selectedCampaign) setSelectedCampaign(refreshed);
  }, [campaigns, selectedCampaign]);

  // Active spotlight cause for featured vignette
  const activeSpotlight =
    campaigns && campaigns.length > 0
      ? campaigns[activePlateIndex % campaigns.length] || campaigns[0]
      : null;

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return (campaigns || []).filter((c) => {
      if (!c) return false;
      const matchesCategory =
        selectedCategory === 'all' ||
        c.category === selectedCategory ||
        (selectedCategory === 'community' && c.category === 'business');
      const matchesSearch =
        searchQuery.trim() === '' ||
        (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.serialCode && c.serialCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.organizationName && c.organizationName.toLowerCase().includes(searchQuery.toLowerCase()));

      const percent = c.goalAmount ? (c.raisedAmount / c.goalAmount) * 100 : 0;
      const createdAt = new Date(c.createdAt).getTime();
      const startedRecently = Number.isFinite(createdAt) &&
        createdAt <= Date.now() &&
        Date.now() - createdAt <= 30 * 24 * 60 * 60 * 1000;
      const isOngoing = ['pending', 'approved'].includes(c.status) && percent < 100;
      const isEndingSoon = ['pending', 'approved'].includes(c.status) &&
        percent < 100 &&
        (c.category === 'emergency' || percent >= 75);
      const matchesStatus =
        fundingStatusFilter === 'all' ||
        (fundingStatusFilter === 'ending_soon' && isEndingSoon) ||
        (fundingStatusFilter === 'started_now' && startedRecently) ||
        (fundingStatusFilter === 'ongoing' && isOngoing);
      const matchesLocation =
        selectedLocation === 'all' ||
        (c.location || '').toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesCategory && matchesSearch && matchesStatus && matchesLocation;
    });
  }, [campaigns, selectedCategory, searchQuery, fundingStatusFilter, selectedLocation]);

  // Aggregate Metrics
  const totalRaised = (campaigns || []).reduce((acc, c) => acc + (c?.raisedAmount || 0), 0);
  const totalDonations = (campaigns || []).reduce((acc, c) => acc + (c?.donationsCount || 0), 0);
  const totalProjects = (campaigns || []).length;

  const categories = [
    { id: 'all', num: '፩' },
    { id: 'medical', num: '፪' },
    { id: 'education', num: '፫' },
    { id: 'emergency', num: '፬' },
    { id: 'water', num: '፭' },
    { id: 'environment', num: '፮' },
    { id: 'community', num: '፯' },
    { id: 'other', num: '፰' },
  ].map((category) => ({
    ...category,
    label: t(`categories.${category.id}`),
  }));
  // Navigation Handlers
  const handleOpenDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsReportFormOpen(false);
    setReportReason('');
    setReportDetails('');
    setReportFeedback(null);
    navigateToMode('detail', `/causes/${campaign.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCampaign || !reportReason || isSubmittingReport) return;

    setIsSubmittingReport(true);
    try {
      const reportCategories = {
        misleading_information: 'Misleading Content',
        suspected_fraud: 'Fraud / Scam',
        duplicate: 'Other',
        inappropriate_content: 'Other',
        other: 'Other',
      } as const;
      const reporterId = useAuthStore.getState().user?.id;
      if (!reporterId) throw new Error('Sign in before submitting a cause report.');
      await adminApi.submitReport({
        reporterId,
        campaignId: selectedCampaign.id,
        category: reportCategories[reportReason as keyof typeof reportCategories] || 'Other',
        details: reportDetails.trim() || `Reported for ${reportReason.replaceAll('_', ' ')}.`,
        evidence: [],
      });
      setReportFeedback({ key: 'explore.reportSubmitted' });
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error('Failed to save cause report', error);
      setReportFeedback({ error, fallbackKey: 'errors.reportFailed' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const toggleSavedCause = (campaign: Campaign) => {
    try {
      const next = savedCauseIds.includes(campaign.id)
        ? savedCauseIds.filter((id) => id !== campaign.id)
        : [...savedCauseIds, campaign.id];
      localStorage.setItem('lewegene_saved_causes', JSON.stringify(next));
      setSavedCauseIds(next);
    } catch (error) {
      console.error('Failed to update saved causes', error);
      setReportFeedback({ error, fallbackKey: 'errors.savedCauseFailed' });
    }
  };

  const handleOpenPledge = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPledgeStep(1);
    navigateToMode('pledge', `/donations/${campaign.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecutePledge = async () => {
    if (!selectedCampaign || pledgeAmount <= 0) return;
    try {
      setIsPledging(true);
      const res = await onDonate({
        amount: pledgeAmount,
        donorName: isAnonymous ? 'Anonymous Patron' : (donorName.trim() || 'Generous Citizen'),
        message: donorMessage,
        paymentRail: selectedPaymentRail,
      });

      if (res && res.certificate) {
        setPledgeSuccessCert(res.certificate);
        setPledgeStep(4);
        if (onDonationCompleted) {
          onDonationCompleted(res.certificate);
        }
      }
    } catch (err) {
      console.error('Failed to underwrite cause', err);
    } finally {
      setIsPledging(false);
    }
  };

  const handleCreateCauseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireLogin?.('fundraise');
      return;
    }
    if (currentOrganization && currentOrganization.verificationStatus !== 'approved') {
      console.warn('Action restricted: organization is not approved.');
      return;
    }
    if (!onCreateCampaign) return;
    setIsSubmittingCause(true);
    try {
      await onCreateCampaign({
        title: newTitle,
        category: newCategory,
        goalAmount: newGoal,
        location: newLocation,
        story: newStory,
        creatorName: currentOrganization?.name || 'Accredited Foundation Partner',
        beneficiariesTarget: newBeneficiaries,
        impactMetric: `Direct verified community outcome for ${newBeneficiaries} people in ${newLocation}`,
        imageUrl: '/src/assets/images/ethiopia_school_stem_1790266427111.jpg',
      });
      navigateToMode('discover');
    } catch (err) {
      console.error('Failed to engrave cause', err);
    } finally {
      setIsSubmittingCause(false);
    }
  };

  const scrollToHomeSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen w-full select-none font-sans text-[#201C18] dark:text-[#F4EFE6] overflow-x-hidden">
      
      {/* ─────────────────────────────────────────────────────────────────────────────
          THE LIVING BANKNOTE CANVAS: FULL-SCREEN CINEMATIC PAPER ATMOSPHERE
          No vertical document frame. No giant outer box. The entire screen IS the paper.
      ───────────────────────────────────────────────────────────────────────────── */}
      <BanknoteLivingBackground isDark={isDark} />

      {/* ─────────────────────────────────────────────────────────────────────────────
          CLEAN WIDESCREEN NAVIGATION HEADER (HIGH USABILITY + INTAGLIO TYPOGRAPHY)
      ───────────────────────────────────────────────────────────────────────────── */}
      <header className={`relative ${isProfileMenuOpen ? 'z-40' : 'z-20'} w-full scroll-mt-32 px-4 py-4 border-b-2 border-[#1E4D38]/20 bg-[#FFFDF9]/95 shadow-xs backdrop-blur-xs transition-colors dark:border-[#9A7432]/30 dark:bg-[#12100E]/95 sm:scroll-mt-0 sm:px-8 sm:py-5 lg:px-16`}>
        
        {/* Top Micro-Ribbon: Edge Identification & Legal Clearing */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono pb-2.5 border-b border-[#26211C]/10 dark:border-[#9A7432]/15">
          <div className="flex items-center gap-2">
            <span className="banknote-serial-red font-black tracking-widest text-xs">
              № FE-8372490
            </span>
            <span className="hidden sm:inline text-zinc-500 font-bold">
              · SERIES 2026 / ፳፻፲፰ · ETHIOPIAN CIVIC REPOSITORY
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <span className="font-bold text-[#1E4D38] dark:text-[#52B788] text-[9px] sm:text-[10px]">
              ★ {t('nav.trustLine')}
            </span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 sm:gap-6">
          
          {/* Lewegene Logotype (Clean, Minimalist, Breathing) */}
          <div
            onClick={() => navigateToMode('overview')}
            className="cursor-pointer group flex flex-col"
          >
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[0.2em] text-[#201C18] dark:text-[#F4EFE6] leading-none transition-colors group-hover:text-[#1E4D38] dark:group-hover:text-[#52B788]">
              {APP_NAME.toUpperCase()}
            </h1>
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#9A7432] uppercase font-bold mt-1">
              {t('nav.tagline')}
            </span>
          </div>

          {/* Core Navigation Links */}
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 font-mono text-[11px] sm:text-xs font-black tracking-wider uppercase">
            <button
              type="button"
              onClick={() => navigateToMode('overview')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer ${
                zoomMode === 'overview'
                  ? 'text-[#1E4D38] dark:text-[#52B788] border-b-2 border-[#1E4D38] dark:border-[#52B788]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]'
              }`}
            >
              {t('nav.home')}
            </button>

            <button
              type="button"
              onClick={() => navigateToMode('discover')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                zoomMode === 'discover'
                  ? 'text-[#1E4D38] dark:text-[#52B788] border-b-2 border-[#1E4D38] dark:border-[#52B788]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]'
              }`}
            >
              <span>{t('nav.discoverCauses')}</span>
              {!isDataLoading && !dataError && (
                <span className="px-1.5 py-0.2 bg-[#1E4D38] text-white text-[9px] font-bold rounded-xs">
                  {campaigns.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigateToMode('fundraising')}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer ${
                zoomMode === 'fundraising'
                  ? 'text-[#1E4D38] dark:text-[#52B788] border-b-2 border-[#1E4D38] dark:border-[#52B788]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]'
              }`}
            >
              {showPersonalNavigation && hasFundraisers
                ? t('nav.myFundraisers')
                : t('nav.fundraise')}
            </button>

            {showPersonalNavigation ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/contributions')}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer ${
                    zoomMode === 'vault'
                      ? 'text-[#1E4D38] dark:text-[#52B788] border-b-2 border-[#1E4D38] dark:border-[#52B788]'
                      : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]'
                  }`}
                >
                  {t('nav.myContributions')}
                </button>
                <button
                  type="button"
                  onClick={() => navigateToMode('profile')}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer ${
                    zoomMode === 'profile'
                      ? 'text-[#1E4D38] dark:text-[#52B788] border-b-2 border-[#1E4D38] dark:border-[#52B788]'
                      : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]'
                  }`}
                >
                  {t('nav.myProfile')}
                </button>
                {hasReports && (
                  <button
                    type="button"
                    onClick={() => navigate('/reports')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
                  >
                    {t('nav.myReports')}
                  </button>
                )}
                {(authUser?.role === 'foundation' || (authUser?.role as string) === 'organization') && (
                  <button
                    type="button"
                    onClick={() => navigate('/foundation')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#1E4D38] dark:text-[#52B788] hover:underline"
                  >
                    {t('nav.orgDashboard')}
                  </button>
                )}
                {authUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#9A7432] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
                  >
                    {t('nav.adminPortal')}
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
              >
                {t('nav.signUpLogIn')}
              </button>
            )}

            {/* Subtle Divider */}
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700 px-1 select-none">|</span>

            {/* Language Selector: Amharic (Default), English */}
            <LanguageSwitcher />

            {/* Voxide Voice Assistant */}
            <button
              type="button"
              onClick={() => (showPersonalNavigation ? navigate('/voxide') : onOpenVoice())}
              className="p-2 border border-[#1E4D38]/60 bg-[#1E4D38]/5 hover:bg-[#1E4D38]/15 text-[#1E4D38] dark:text-[#52B788] transition-colors cursor-pointer flex items-center gap-1.5"
              title={t('nav.speakVoxide')}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className={`${showPersonalNavigation ? 'font-mono text-[10px] font-bold uppercase' : 'hidden xl:inline font-mono text-[10px] font-bold uppercase'}`}>{t('home.voxide.title')}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={t('nav.toggleTheme')}
              className="p-2 border border-[#9A7432]/50 hover:bg-[#9A7432]/15 text-[#201C18] dark:text-[#D8B066] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {showPersonalNavigation && authUser && (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  aria-label={t('nav.openProfileMenu')}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  title={t('nav.profileMenuTitle', { name: authUser.name })}
                  className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-[#9A7432]/60 bg-[#F2ECE1] text-[#1E4D38] transition-colors hover:border-[#1E4D38] dark:bg-[#1C1814] dark:text-[#52B788]"
                >
                  {authUser.avatarUrl
                    ? <img src={authUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : <span className="font-mono text-[10px] font-black">{authUser.name.trim().slice(0, 2).toUpperCase() || <UserRound className="h-4 w-4" />}</span>}
                </button>
                {isProfileMenuOpen && (
                  <div
                    role="menu"
                    aria-label={t('nav.profileOptions')}
                    className="absolute right-0 top-full z-50 mt-2 w-52 border border-[#9A7432]/40 bg-[#FFFDF9] p-1.5 text-left shadow-lg dark:bg-[#171410]"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-[#201C18] transition-colors hover:bg-[#1E4D38]/10 hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:bg-[#52B788]/10 dark:hover:text-[#52B788]"
                    >
                      <UserRound className="h-4 w-4" />
                      {t('nav.myProfile')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsProfileEditorOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-[#201C18] transition-colors hover:bg-[#1E4D38]/10 hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:bg-[#52B788]/10 dark:hover:text-[#52B788]"
                    >
                      <UserRound className="h-4 w-4" />
                      {t('nav.editMyProfile')}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/', { replace: true });
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-[#201C18] transition-colors hover:bg-red-700/10 hover:text-red-800 dark:text-[#E8DEC8] dark:hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

        </div>

      </header>

      {isProfileEditorOpen && authUser && createPortal(
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsProfileEditorOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-editor-title"
            className="w-full max-w-lg border border-[#9A7432]/50 bg-[#FFFDF9] p-5 text-[#201C18] shadow-2xl dark:bg-[#171410] dark:text-[#F4EFE6] sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#9A7432]/30 pb-4">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9A7432]">{t('profile.localDemoProfile')}</p>
                <h2 id="profile-editor-title" className="mt-1 font-serif text-2xl font-black">{t('profile.editTitle')}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileEditorOpen(false)}
                aria-label={t('profile.closeEditorAria')}
                className="grid h-8 w-8 place-items-center border border-[#9A7432]/40 text-xl leading-none hover:bg-[#9A7432]/10"
              >
                ×
              </button>
            </div>
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setAuthUser({
                  ...authUser,
                  name: profileName.trim(),
                  email: profileEmail.trim(),
                  phone: profilePhone.trim(),
                }, authToken);
                setIsProfileEditorOpen(false);
              }}
            >
              <label className="grid gap-1.5 font-mono text-xs font-bold">
                {t('profile.name')}
                <input
                  required
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="border border-[#26211C]/20 bg-white px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                />
              </label>
              <label className="grid gap-1.5 font-mono text-xs font-bold">
                {t('profile.email')}
                <input
                  required
                  type="email"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  className="border border-[#26211C]/20 bg-white px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                />
              </label>
              <label className="grid gap-1.5 font-mono text-xs font-bold">
                {t('profile.phone')}
                <input
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  className="border border-[#26211C]/20 bg-white px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                />
              </label>
              <p className="text-xs text-zinc-500">{t('profile.changesNote')}</p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsProfileEditorOpen(false)}
                  className="border border-[#9A7432]/50 px-4 py-2.5 font-mono text-xs font-bold uppercase hover:bg-[#9A7432]/10"
                >
                  {t('profile.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-[#163E2C]"
                >
                  {t('profile.saveProfile')}
                </button>
              </div>
            </form>
          </section>
        </div>,
        document.body,
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MAIN CONTENT VIEWPORT: WIDESCREEN & MINIMALIST
          Content sits peacefully inside the wide living banknote paper world.
      ───────────────────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col justify-between">
        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 1: OVERVIEW (HERO CINEMATIC: WIDE, MINIMALIST, HIGH USABILITY)
        ══════════════════════════════════════════════════════════════════════════ */}
        {false && zoomMode === 'overview' && (
          <HomeLanding
            campaigns={campaigns}
            organizations={organizations}
            totalRaised={totalRaised}
            totalDonations={totalDonations}
            isDataLoading={isDataLoading}
            onDiscover={() => navigateToMode('discover')}
            onFundraise={() => navigate('/fundraising')}
            onVoxide={onOpenVoice}
            onSelectCampaign={handleOpenDetail}
          />
        )}

        {zoomMode === 'overview' && (
          <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-12 lg:py-16 space-y-8 animate-in fade-in duration-300">
            
            {/* ── Wide Hero Section: Pure Negative Space & Authority ── */}
            <div id="home-hero" className="scroll-mt-20 max-w-4xl mx-auto text-center">
              <div className="relative space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#9A7432]/40 bg-[#F2EADA]/90 dark:bg-[#0E0D0B]/90 text-[10px] font-mono font-bold tracking-[0.25em] text-[#9A7432] uppercase">
                <span>{t('home.tenderBadgeLine1')}</span>
                <span>·</span>
                <span>{t('home.tenderBadgeLine2')}</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#201C18] dark:text-[#F4EFE6] tracking-tight leading-none banknote-engraved-text">
                  {APP_NAME.toUpperCase()}
                </h1>
                
                <p className="font-serif font-bold text-2xl sm:text-4xl text-[#1E4D38] dark:text-[#52B788] tracking-wide">
                  {t('home.tagline')}
                </p>

                <p className="font-ethiopic text-lg sm:text-xl text-[#201C18]/80 dark:text-[#E8DEC8]/80 italic">
                  {t('home.motto')}
                </p>
              </div>

              {/* The Two Primary Hero Actions */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigateToMode('discover')}
                  className="py-3.5 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-sm font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer shadow-md flex items-center gap-3 active:translate-y-px"
                >
                  <span>{t('home.exploreCauses')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openFoundationDesk}
                  className="py-3.5 px-6 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA]/90 dark:bg-[#0E0D0B]/90 text-[#201C18] dark:text-[#F4EFE6] font-mono text-sm font-black tracking-wider uppercase hover:bg-[#DFD3BC] transition-all cursor-pointer"
                >
                  <span>{t('home.forFoundations')}</span>
                </button>
              </div>
              </div>
            </div>

            {/* ── Delicate Centerpiece Engraving (Widescreen Monument) ── */}
            <div className="w-full max-w-4xl mx-auto relative border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#F2EADA]/80 dark:bg-[#0E0D0B]/80 p-4 sm:p-6">
              <div className="absolute inset-1 border border-[#9A7432]/25 pointer-events-none" />
              <CentralMonumentEngraving />
              <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>{t('home.plateSerial')}</span>
                <span>{t('home.plateCaption')}</span>
                <span>{t('home.plateLocation')}</span>
              </div>
            </div>

            {/* ── Explore Causes Gallery with Live Money Progress & Direct Underwriting ── */}
            {false && (
            <div className="w-full max-w-6xl mx-auto p-6 sm:p-8 border-2 border-[#1E4D38]/40 dark:border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#0C0A09] space-y-8 shadow-xl relative">
              <div className="absolute inset-1.5 border border-[#9A7432]/35 pointer-events-none" />

              {/* Panel Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-[9px] font-black uppercase tracking-widest shadow-xs">
                      EXPLORE VERIFIED CAUSES
                    </span>
                    <span className="font-mono text-xs font-black text-[#8B5E14] dark:text-[#D8B066] tracking-wider uppercase">
                      ★ DIRECT UNDERWRITING LEDGER
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#14110E] dark:text-[#FFFFFF] mt-1.5 tracking-tight">
                    COMMUNITY CAUSES &amp; LIVE BIRR PROGRESS
                  </h3>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788] block">
                    {isDataLoading
                      ? t('common.loading')
                      : t('explore.activePlates', { count: filteredCampaigns.length })}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                    {isDataLoading
                      ? t('common.loading')
                      : t('explore.pledgedAcross', { amount: totalRaised.toLocaleString() })}
                  </span>
                </div>
              </div>

              {/* Modern Search & Filters: Clean, Spacious, Usable */}
              <div className="relative z-10 p-4 sm:p-5 border border-[#1E4D38]/25 dark:border-[#9A7432]/35 bg-[#F2EADA]/90 dark:bg-[#141210] space-y-4">
                {/* Search Field */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-[#9A7432] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search causes by title, organization, location, or serial number..."
                    className="w-full pl-10 pr-4 py-2 border border-[#26211C]/30 dark:border-[#4A3E33] bg-[#EAE1CF] dark:bg-[#080706] font-mono text-xs text-[#201C18] dark:text-[#F4EFE6] placeholder:text-zinc-500 focus:outline-none focus:border-[#1E4D38]"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#26211C]/15 dark:border-[#4A3E33]">
                  {/* Sector Categories */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
                      SECTOR:
                    </span>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'border-[#1E4D38] bg-[#1E4D38] text-white shadow-xs'
                            : 'border-[#26211C]/25 bg-[#FAF6EC] dark:bg-[#201B16] text-[#201C18] dark:text-[#E8DEC8] hover:border-[#1E4D38]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Funding Status Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
                      STATUS &amp; LOCATION:
                    </span>
                    {[
                      { id: 'all', labelKey: 'common.all' },
                      { id: 'ending_soon', labelKey: 'banknote.status.ending_soon' },
                      { id: 'started_now', labelKey: 'banknote.status.started_now' },
                      { id: 'ongoing', labelKey: 'banknote.status.ongoing' },
                    ].map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setFundingStatusFilter(status.id as typeof fundingStatusFilter)}
                        className={`px-2.5 py-1 border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          fundingStatusFilter === status.id
                            ? 'border-[#26211C] bg-[#26211C] text-white dark:border-[#9A7432] dark:bg-[#9A7432] dark:text-[#080706]'
                            : 'border-[#26211C]/25 bg-[#EAE1CF] dark:bg-[#161411] text-zinc-700 dark:text-zinc-300 hover:border-[#26211C]'
                        }`}
                      >
                        {t(status.labelKey)}
                      </button>
                    ))}
                    <label className="flex items-center gap-1.5">
                      <span className="sr-only">{t('banknote.filterByLocation')}</span>
                      <select
                        value={selectedLocation}
                        onChange={(event) => setSelectedLocation(event.target.value)}
                        className="px-2.5 py-1 border border-[#26211C]/25 bg-[#FAF6EC] dark:bg-[#201B16] text-[10px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        <option value="all">{t('banknote.allLocations')}</option>
                        {ETHIOPIAN_REGIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* Causes Grid with Money Progress & Quick Pledge Actions */}
              <div className="relative z-10">
                {isDataLoading ? (
                  <p role="status" className="p-8 text-center font-mono text-xs text-zinc-500">
                    {t('common.loading')}
                  </p>
                ) : dataError ? (
                  <div role="alert" className="p-8 text-center border border-dashed border-red-500/40 font-mono text-xs space-y-3">
                    <p>{dataError}</p>
                    {onRetryData && (
                      <button
                        type="button"
                        onClick={() => void onRetryData?.()}
                        className="px-3 py-1 bg-[#1E4D38] text-white font-mono text-xs font-bold uppercase cursor-pointer"
                      >
                        {t('common.retry')}
                      </button>
                    )}
                  </div>
                ) : filteredCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((camp) => (
                      <BanknotePlateCard
                        key={camp.id}
                        campaign={camp}
                        onSelect={handleOpenDetail}
                        onQuickPledge={handleOpenPledge}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-[#26211C]/30 dark:border-[#9A7432]/40 font-mono text-xs space-y-2">
                    <p className="text-[#201C18] dark:text-[#F4EFE6] font-bold">
                      No causes matching your search or filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setFundingStatusFilter('all');
                        setSelectedLocation('all');
                        setSearchQuery('');
                      }}
                      className="px-3 py-1 bg-[#1E4D38] text-white font-mono text-xs font-bold uppercase cursor-pointer"
                    >
                      RESET FILTERS
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}

            <HomeLanding
              campaigns={campaigns}
              organizations={organizations}
              totalRaised={totalRaised}
              totalDonations={totalDonations}
              isDataLoading={isDataLoading}
              showHero={false}
              onDiscover={() => navigateToMode('discover')}
              onFundraise={() => navigate('/fundraising')}
              onVoxide={onOpenVoice}
              onSelectCampaign={handleOpenDetail}
            />

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 2: DISCOVER CAUSES (SPACIOUS WIDESCREEN GALLERY)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'discover' && (
          <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 space-y-8 animate-in fade-in duration-300">
            
            {/* Header Ribbon with Clear Back Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4">
              <button
                type="button"
                onClick={() => navigateToMode('overview')}
                className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#0E0D0B] font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#DFD3BC] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← {t('explore.backHome')}</span>
              </button>

              <div className="text-center">
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#201C18] dark:text-[#F4EFE6] leading-tight">
                  {t('explore.title')}
                </h2>
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {t('explore.subtitle')}
                </p>
              </div>

              <span className="font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
                {isDataLoading
                  ? t('common.loading')
                  : t('explore.count', { count: filteredCampaigns.length })}
              </span>
            </div>

            {/* Modern Search & Filters: Clean, Spacious, Usable */}
            <div className="p-6 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#F2EADA]/90 dark:bg-[#0E0D0B]/90 space-y-4">
              
              {/* Search Field */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#9A7432] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('explore.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#26211C]/30 dark:border-[#4A3E33] bg-[#EAE1CF] dark:bg-[#161411] font-mono text-xs text-[#201C18] dark:text-[#F4EFE6] placeholder:text-zinc-500 focus:outline-none focus:border-[#1E4D38]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#26211C]/15 dark:border-[#4A3E33]">
                {/* Sector Categories */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
                    {t('explore.sectorLabel')}
                  </span>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 border text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-[#1E4D38] bg-[#1E4D38] text-white'
                          : 'border-[#26211C]/25 bg-[#F7F2E7] dark:bg-[#26201B] text-[#201C18] dark:text-[#E8DEC8] hover:border-[#1E4D38]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Funding Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
                    {t('explore.statusLabel')}
                  </span>
                  {[
                    { id: 'all', label: t('explore.statusAll') },
                    { id: 'ending_soon', label: t('explore.statusEndingSoon') },
                    { id: 'started_now', label: t('explore.statusStartedNow') },
                    { id: 'ongoing', label: t('explore.statusOngoing') },
                  ].map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setFundingStatusFilter(status.id as typeof fundingStatusFilter)}
                      className={`px-2.5 py-1.5 border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        fundingStatusFilter === status.id
                          ? 'border-[#26211C] bg-[#26211C] text-white dark:border-[#9A7432] dark:bg-[#9A7432] dark:text-[#080706]'
                          : 'border-[#26211C]/25 bg-[#EAE1CF] dark:bg-[#161411] text-zinc-700 dark:text-zinc-300 hover:border-[#26211C]'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                  <label className="flex items-center gap-1.5">
                    <span className="sr-only">{t('explore.filterByLocation')}</span>
                    <select
                      value={selectedLocation}
                      onChange={(event) => setSelectedLocation(event.target.value)}
                      className="px-2.5 py-1.5 border border-[#26211C]/25 bg-[#EAE1CF] dark:bg-[#161411] text-[10px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <option value="all">{t('explore.allLocations')}</option>
                      {ETHIOPIAN_REGIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                    </select>
                  </label>
                </div>
              </div>

            </div>

            {/* Widescreen 3-Column Causes Grid (Breathable Banknote Plates) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {!isDataLoading && !dataError && filteredCampaigns.map((camp) => (
                <BanknotePlateCard
                  key={camp.id}
                  campaign={camp}
                  onSelect={handleOpenDetail}
                  onQuickPledge={handleOpenPledge}
                />
              ))}
            </div>

            {isDataLoading && (
              <p role="status" className="py-10 text-center font-mono text-xs text-zinc-500">
                {t('common.loading')}
              </p>
            )}

            {!isDataLoading && dataError && (
              <div role="alert" className="p-8 text-center border border-dashed border-red-500/40 font-mono text-xs space-y-3">
                <p>{dataError}</p>
                {onRetryData && (
                  <button
                    type="button"
                    onClick={() => void onRetryData()}
                    className="px-3 py-1 bg-[#1E4D38] text-white font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    {t('common.retry')}
                  </button>
                )}
              </div>
            )}

            {!isDataLoading && !dataError && filteredCampaigns.length === 0 && (
              <div className="p-16 text-center border border-dashed border-[#26211C]/30 bg-[#F2EADA]/80 dark:bg-[#0E0D0B]/80 font-mono space-y-4">
                <p className="text-base font-bold text-[#1E4D38] dark:text-[#52B788]">
                  {t('explore.emptyTitle')}
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  {t('explore.emptyHint')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setFundingStatusFilter('all');
                    setSelectedLocation('all');
                  }}
                  className="px-5 py-2.5 border border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase cursor-pointer hover:bg-[#163E2C]"
                >
                  {t('explore.resetFilters')}
                </button>
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 3: CAUSE DETAIL (SPACIOUS, TRANSPARENT LEDGER, CLEAR ACTIONS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'detail' && selectedCampaign && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 space-y-8 animate-in fade-in duration-300">
            
            {/* Top Navigation Ribbon: CLEAR BACK BUTTON */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4">
              <button
                type="button"
                onClick={() => navigateToMode('discover')}
                className="px-4 py-2 border border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#163E2C] transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← {t('banknote.backToCauses')}</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black text-[#1E4D38] dark:text-[#52B788]">
                  № {selectedCampaign.serialCode || 'LW-0421'}
                </span>
                <span className="px-2.5 py-0.5 border border-[#26211C]/40 text-[10px] font-mono font-bold uppercase">
                  {selectedCampaign.category.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 bg-[#1E4D38] text-white text-[9px] font-mono font-bold uppercase">
                  ACSO VERIFIED
                </span>
              </div>
            </div>

            {/* Master Vignette Plate Details: 2 Balanced Wide Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left 7 Columns: Grand Engraved Artwork & Narrative */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Grand Engraved Illustration Frame */}
                <div className="relative aspect-16/10 w-full border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#DFD3BC] dark:bg-[#161411] overflow-hidden">
                  {selectedCampaign.imageUrl ? (
                    <img
                      src={selectedCampaign.imageUrl}
                      alt={selectedCampaign.title}
                      className="w-full h-full object-cover filter contrast-110 saturate-95"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-sm">
                      ENGRAVED CAUSE PLATE
                    </div>
                  )}
                  {zoomMode === 'detail' && !selectedCampaign && (
                    <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center space-y-4">
                      <h2 className="font-serif font-black text-3xl text-[#201C18] dark:text-[#F4EFE6]">
                        {t('campaigns.title')}
                      </h2>
                      <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                        {campaignDetailLoading || isDataLoading
                          ? t('common.loading')
                          : campaignDetailError || dataError || t('campaigns.emptyDescription')}
                      </p>
                      {!campaignDetailLoading && !isDataLoading && (campaignDetailError || dataError) && onRetryData && (
                        <button
                          type="button"
                          onClick={onRetryData}
                          className="px-4 py-2 border border-[#1E4D38] text-[#1E4D38] dark:border-[#52B788] dark:text-[#52B788] font-mono text-xs font-bold uppercase cursor-pointer"
                        >
                          {t('common.retry')}
                        </button>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={() => navigateToMode('discover')}
                          className="px-4 py-2 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-bold uppercase cursor-pointer"
                        >
                          {t('home.exploreCauses')}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none intaglio-overlay opacity-40 mix-blend-multiply" />
                  
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#EAE1CF]/95 dark:bg-[#080706]/95 border border-[#26211C] font-mono text-xs font-bold text-[#1E4D38] dark:text-[#52B788]">
                    VERIFIED COMMUNITY BENEFICIARIES: {selectedCampaign.beneficiariesTarget || 500} CITIZENS
                  </div>
                </div>

                {/* Narrative & Field Reports */}
                <div className="p-6 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#F2EADA]/90 dark:bg-[#0E0D0B]/90 space-y-4">
                  <h3 className="font-serif font-black text-xl text-[#201C18] dark:text-[#F4EFE6] border-b border-[#26211C]/15 pb-2">
                    FIELD DIRECTIVE &amp; PROJECT STORY
                  </h3>
                  
                  <p className="font-sans text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {selectedCampaign.story}
                  </p>

                  <div className="p-4 border border-[#9A7432]/40 bg-[#F7F2E7]/80 dark:bg-[#26201B]/80 font-mono text-xs space-y-1">
                    <p className="font-bold text-[#1E4D38] dark:text-[#52B788] uppercase">
                      TANGIBLE IMPACT COMMITMENT:
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {selectedCampaign.impactMetric || 'Direct verified community outcome for local families.'}
                    </p>
                  </div>
                </div>

                {/* Verification & ACSO Credentials */}
                <div className="p-6 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FCF9F2]/80 dark:bg-[#1E1A17]/80 space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-[#201C18] dark:text-[#F4EFE6] uppercase flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
                    <span>{t('banknote.accreditation')}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="block text-zinc-400">{t('banknote.registrationLicense')}:</span>
                      <span className="font-bold text-[#201C18] dark:text-[#F4EFE6]">ACSO-ET-58291/2026</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">{t('banknote.disbursementEscrow')}:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{t('donations.clearingRail')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right 5 Columns: Sticky Funding Summary & Primary Action */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                
                <div className="p-6 sm:p-8 border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] space-y-6">
                  
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-bold text-[#1E4D38] dark:text-[#52B788] tracking-wide uppercase">
                      {selectedCampaign.organizationName || 'Accredited Civil Society Org'}
                    </span>
                    <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#201C18] dark:text-[#F4EFE6] leading-snug">
                      {selectedCampaign.title}
                    </h2>
                    <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9A7432]" />
                      <span>{selectedCampaign.location || 'Addis Ababa, Ethiopia'}</span>
                    </p>
                  </div>

                  {/* Promissory Ruler Gauge */}
                  <div className="space-y-2 pt-2 border-t border-[#26211C]/15 dark:border-[#4A3E33]">
                    <BanknoteRulerGauge
                      percent={
                        selectedCampaign.goalAmount
                          ? Math.min(100, Math.round((selectedCampaign.raisedAmount / selectedCampaign.goalAmount) * 100))
                          : 0
                      }
                      raised={selectedCampaign.raisedAmount}
                      goal={selectedCampaign.goalAmount}
                    />
                  </div>

                  {/* Quick Metric Ledger */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
                    <div className="p-3 border border-[#26211C]/20 bg-[#EAE1CF] dark:bg-[#161411]">
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase">{t('common.patrons')}</span>
                      <span className="text-lg font-black">{selectedCampaign.donationsCount || 0}</span>
                    </div>
                    <div className="p-3 border border-[#26211C]/20 bg-[#EAE1CF] dark:bg-[#161411]">
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase">{t('common.goal')}</span>
                      <span className="text-lg font-black">{selectedCampaign.goalAmount.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* UNMISSABLE PRIMARY ACTION: SUPPORT THIS CAUSE */}
                  <button
                    type="button"
                    onClick={() => handleOpenPledge(selectedCampaign)}
                    className="w-full py-4 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-sm font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:translate-y-px"
                  >
                    <span>{t('banknote.supportCause')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center font-mono text-[10px] text-zinc-500 uppercase">
                    AUTHENTICATED ESCROW RECORD · 100% DISBURSEMENT TO CAUSE
                  </div>

                </div>

              </div>

            </div>

            <section className="border-t border-[#26211C]/20 pt-6 dark:border-[#9A7432]/30">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#201C18] dark:text-[#F4EFE6]">{t('explore.keepCauseClose')}</h3>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                    {t('explore.savedCausesHint')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      onRequireLogin?.('save');
                      return;
                    }
                    toggleSavedCause(selectedCampaign);
                  }}
                  aria-pressed={savedCauseIds.includes(selectedCampaign.id)}
                  className="inline-flex items-center gap-2 border border-[#9A7432]/50 bg-[#F2EADA] px-4 py-2 font-mono text-xs font-bold uppercase text-[#201C18] transition hover:bg-[#E6D9C1] dark:bg-[#161411] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${savedCauseIds.includes(selectedCampaign.id) ? 'fill-current' : ''}`} />
                  {savedCauseIds.includes(selectedCampaign.id) ? t('explore.savedCause') : t('explore.saveCause')}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#201C18] dark:text-[#F4EFE6]">{t('explore.reportCause')}</h3>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                    {t('explore.reportCauseHint')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      onRequireLogin?.('report');
                      return;
                    }
                    setIsReportFormOpen(true);
                    setReportFeedback(null);
                  }}
                  className="inline-flex items-center gap-2 border border-[#9A7432]/50 bg-[#F2EADA] px-4 py-2 font-mono text-xs font-bold uppercase text-[#201C18] transition hover:bg-[#E6D9C1] dark:bg-[#161411] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
                  aria-haspopup="dialog"
                >
                  <Flag className="h-3.5 w-3.5" />
                  {t('explore.reportThisCause')}
                </button>
              </div>
              {isReportFormOpen && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4">
                  <button
                    type="button"
                    aria-label={t('explore.closeReport')}
                    onClick={() => setIsReportFormOpen(false)}
                    className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
                  />
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="report-cause-title"
                    className="relative z-10 my-auto w-full max-w-lg border-2 border-[#9A7432]/60 bg-[#F7F2E7] p-5 shadow-2xl dark:bg-[#12100E] sm:p-7"
                  >
                    <div className="pointer-events-none absolute inset-1.5 border border-[#1E4D38]/25 dark:border-[#9A7432]/25" />
                    <div className="relative">
                      <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#26211C]/15 pb-4 dark:border-[#9A7432]/25">
                        <div>
                          <p className="font-mono text-[9px] font-black uppercase tracking-[.18em] text-[#9A7432]">{t('explore.causeSafety')}</p>
                          <h3 id="report-cause-title" className="mt-1 font-serif text-xl font-black text-[#201C18] dark:text-[#F4EFE6]">{t('explore.reportCause')}</h3>
                          <p className="mt-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">{selectedCampaign.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsReportFormOpen(false)}
                          aria-label={t('explore.closeReport')}
                          className="border border-[#9A7432]/40 p-2 text-[#201C18] hover:bg-[#E6D9C1] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <form onSubmit={handleReportSubmit} className="grid gap-4">
                  <label className="grid gap-1.5 font-mono text-xs font-bold text-[#201C18] dark:text-[#F4EFE6]">
                    {t('explore.reportReason')}
                    <select
                      required
                      value={reportReason}
                      onChange={(event) => setReportReason(event.target.value)}
                      className="w-full border border-[#26211C]/25 bg-[#FFFDF9] px-3 py-2.5 font-mono text-xs dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                    >
                      <option value="">{t('explore.chooseReason')}</option>
                      <option value="misleading_information">{t('explore.misleadingInformation')}</option>
                      <option value="suspected_fraud">{t('explore.suspectedFraud')}</option>
                      <option value="duplicate">{t('explore.duplicateCause')}</option>
                      <option value="inappropriate_content">{t('explore.inappropriateContent')}</option>
                      <option value="other">{t('explore.otherConcern')}</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5 font-mono text-xs font-bold text-[#201C18] dark:text-[#F4EFE6]">
                    {t('explore.additionalDetails')} <span className="font-normal text-zinc-500">{t('explore.optional')}</span>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={(event) => setReportDetails(event.target.value)}
                      placeholder={t('explore.searchReportDetails')}
                      className="w-full resize-y border border-[#26211C]/25 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm font-normal dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-xl font-mono text-[10px] text-zinc-500">
                      {t('explore.reportReviewHint')}
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="border-2 border-[#1E4D38] bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-black uppercase text-white transition hover:bg-[#163E2C] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingReport ? t('common.loading') : t('explore.submitReport')}
                    </button>
                  </div>
                  {reportFeedback && (
                    <p role="status" className="font-mono text-xs text-[#1E4D38] dark:text-[#52B788]">
                      {'key' in reportFeedback
                        ? t(reportFeedback.key)
                        : localizeErrorMessage(t, reportFeedback.error, reportFeedback.fallbackKey)}
                    </p>
                  )}
                      </form>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </section>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 4: PLEDGE / UNDERWRITING FLOW (MEMBER 4 - COMPLETE SUPPORT FLOW)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'pledge' && selectedCampaign && (
          <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 py-10 lg:py-16">
            <PledgeWizardPage
              campaign={selectedCampaign}
              onBack={() => navigateToMode('detail')}
              onCertificateIssued={(cert) => {
                if (onDonationCompleted) {
                  onDonationCompleted(cert);
                }
              }}
              onViewVault={openVault}
              onExploreMore={() => navigateToMode('discover')}
            />
          </div>
        )}
        {zoomMode === 'pledge' && !selectedCampaign && (
          <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center space-y-4">
            <h2 className="font-serif font-black text-3xl text-[#201C18] dark:text-[#F4EFE6]">
              {t('campaigns.underwrite')}
            </h2>
            <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
              {isDataLoading
                ? t('common.loading')
                : dataError || t('campaigns.emptyDescription')}
            </p>
            <button
              type="button"
              onClick={() => navigateToMode('discover')}
              className="px-4 py-2 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-bold uppercase cursor-pointer"
            >
              {t('home.exploreCauses')}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 5: MY CONTRIBUTIONS (PATRON VAULT / DONATION HISTORY)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'profile' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16">
            <ProfilePage embedded />
          </div>
        )}

        {zoomMode === 'fundraising' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16">
            <FundraisingApp embedded />
          </div>
        )}

        {zoomMode === 'vault' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16">
            <PatronVaultPage
              onExploreCauses={() => navigateToMode('discover')}
              onSelectCertificate={(cert) => {
                if (onDonationCompleted) {
                  onDonationCompleted(cert);
                }
              }}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 6: FIELD IMPACT (COMMUNITY AUDIT & VERIFICATION)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'impact' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-[#26211C]/20 pb-4">
              <h2 className="font-serif font-black text-3xl text-[#201C18] dark:text-[#F4EFE6]">
                COMMUNITY FIELD IMPACT
              </h2>
              <p className="font-mono text-xs text-zinc-500">
                Real-time milestone verifications and photographic audit reports directly from local sites.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {campaigns.slice(0, 4).map((c) => (
                <div key={c.id} className="p-6 border border-[#26211C]/25 bg-[#F2EADA] dark:bg-[#0E0D0B] space-y-4 font-mono">
                  <div className="flex justify-between text-xs font-bold border-b border-[#26211C]/10 pb-2">
                    <span className="text-[#1E4D38] dark:text-[#52B788]">№ {c.serialCode || 'LW-0421'}</span>
                    <span className="text-[#1E4D38] dark:text-[#52B788]">{t('impactView.acsoCleared')}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#201C18] dark:text-[#F4EFE6]">{c.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">{c.impactMetric}</p>
                  <div className="text-[10px] text-zinc-500 flex justify-between pt-2 border-t border-[#26211C]/10">
                    <span>{t('impactView.locationLabel', { location: c.location })}</span>
                    <span>{t('impactView.beneficiariesLabel', { count: c.beneficiariesTarget })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 7: FOUNDATION DESK (MANAGEMENT & PROJECT ENGRAVING)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'treasury' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16 space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26211C]/20 pb-4">
              <div>
                <h2 className="font-serif font-black text-3xl text-[#201C18] dark:text-[#F4EFE6]">
                  FOUNDATION TREASURY DESK
                </h2>
                <p className="font-mono text-xs text-zinc-500">
                  Accredited civil society organizations management portal and project engraving form.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigateToMode('engrave')}
                className="py-2.5 px-6 border border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase cursor-pointer hover:bg-[#163E2C]"
              >
                + CREATE NEW PROJECT
              </button>
            </div>

            {/* Foundation Project Creation Form */}
            {currentOrganization && currentOrganization.verificationStatus !== 'approved' ? (
              <div className="p-8 border-2 border-amber-600/60 bg-[#FAF6EC] dark:bg-[#161411] space-y-4 font-mono">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-serif font-black text-xl text-[#201C18] dark:text-[#F4EFE6] uppercase">
                    CAUSE PLATE ENGRAVING RESTRICTED
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Your organization (&ldquo;{currentOrganization.name}&rdquo;) is currently{' '}
                  <span className="font-bold underline uppercase">
                    {currentOrganization.verificationStatus === 'pending'
                      ? 'PENDING ACSO REGULATORY REVIEW'
                      : currentOrganization.verificationStatus === 'needs_changes'
                      ? 'ACTION REQUIRED'
                      : 'NOT APPROVED'}
                  </span>
                  . Under platform governance, organizations cannot engrave cause plates or collect donor contributions until verified by an administrator.
                </p>
                {currentOrganization.decisionNote && (
                  <div className="p-3 bg-surface border border-border text-xs italic">
                    Reviewer Note: &ldquo;{currentOrganization.decisionNote}&rdquo;
                  </div>
                )}
              </div>
            ) : (
            <div className="p-8 border border-[#26211C]/30 bg-[#F2EADA] dark:bg-[#0E0D0B] space-y-6">
              <h3 className="font-serif font-bold text-2xl text-[#201C18] dark:text-[#F4EFE6]">
                {t('createCause.title')}
              </h3>
              
              <form onSubmit={handleCreateCauseSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-600 dark:text-zinc-400 mb-1">{t('createCause.projectTitleLabel')}</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#EAE1CF] dark:bg-[#161411] text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">{t('createCause.sectorLabel')}</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                    >
                      {CAMPAIGN_CATEGORIES.filter((category) => category.id !== 'all').map((category) => (
                        <option key={category.id} value={category.id}>
                          {t(`categories.${category.id}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">{t('createCause.fundingGoalLabel')}</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={newGoal}
                      onChange={(e) => setNewGoal(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">{t('createCause.locationLabel')}</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">{t('createCause.beneficiariesLabel')}</label>
                    <input
                      type="number"
                      required
                      value={newBeneficiaries}
                      onChange={(e) => setNewBeneficiaries(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-600 mb-1">{t('createCause.storyLabel')}</label>
                  <textarea
                    rows={4}
                    required
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingCause}
                    className="py-3 px-8 border border-[#1E4D38] bg-[#1E4D38] text-white font-black tracking-widest uppercase hover:bg-[#163E2C] cursor-pointer"
                  >
                    {isSubmittingCause ? 'ENGRAVING CAUSE...' : 'PUBLISH PROJECT TO CITIZENS'}
                  </button>
                </div>
              </form>
            </div>
            )}
          </div>
        )}

      </main>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MINIMALIST ENDORSEMENT FOOTER (FLOWS SEAMLESSLY OFF SCREEN)
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full px-6 sm:px-12 lg:px-20 py-8 border-t border-[#26211C]/15 dark:border-[#9A7432]/20 bg-[#EAE1CF]/95 dark:bg-[#080706]/95 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-[#201C18] dark:text-[#F4EFE6] block">
              {t('canvasFooter.brandLine', { appName: APP_NAME.toUpperCase() })}
            </span>
            <span>{t('canvasFooter.legalLine')}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setShowAcsoModal(true)}
              className="hover:text-[#1E4D38] dark:hover:text-[#52B788] cursor-pointer"
            >
              {t('canvasFooter.acsoRegulation')}
            </button>
            <button
              type="button"
              onClick={onOpenScholarxiv}
              className="hover:text-[#1E4D38] dark:hover:text-[#52B788] cursor-pointer"
            >
              {t('canvasFooter.academicArchive')}
            </button>
            <span className="text-[#1E4D38] dark:text-[#52B788] font-bold">{t('canvasFooter.communityOwned')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
