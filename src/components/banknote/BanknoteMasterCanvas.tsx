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
import { useAuthStore } from '../../features/auth/store/auth.store.ts';
import { DISCOVER_LOCATIONS } from '../../services/lookupService.ts';

const ETHIOPIAN_REGIONS = DISCOVER_LOCATIONS;

function hasPersonalReports(userId: string): boolean {
  try {
    const snapshot = JSON.parse(localStorage.getItem('lewegene_admin_snapshot_v1') || '{}') as {
      reports?: Array<{ reporterId?: string; id?: string }>;
    };
    return Boolean(snapshot.reports?.some((report) => report.reporterId === userId && report.id !== 'demo-report-001'));
  } catch {
    return false;
  }
}

function hasPersonalFundraisers(userId: string): boolean {
  try {
    const fundraisers = JSON.parse(localStorage.getItem('lewegene_fundraisers_v1') || '[]') as Array<{ creatorId?: string }>;
    return Array.isArray(fundraisers) && fundraisers.some((fundraiser) => fundraiser.creatorId === userId);
  } catch {
    return false;
  }
}

export type BanknoteZoomMode =
  | 'overview'
  | 'discover'
  | 'detail'
  | 'pledge'
  | 'vault'
  | 'impact'
  | 'treasury'
  | 'engrave'
  | 'audit';

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
  language: 'en' | 'am' | 'om';
  isDark: boolean;
  onToggleTheme: () => void;
  onDonationCompleted?: (cert: ContributionCertificate) => void;
  isAuthenticated?: boolean;
  canAccessFoundation?: boolean;
  onRequireLogin?: (action: 'donate' | 'fundraise') => void;
  onFoundationAccessDenied?: () => void;
}

interface HomeLandingProps {
  campaigns: Campaign[];
  organizations: Organization[];
  totalRaised: number;
  totalDonations: number;
  onDiscover: () => void;
  onFundraise: () => void;
  onVoxide: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

const HomeLanding: React.FC<HomeLandingProps> = ({
  campaigns,
  organizations,
  totalRaised,
  totalDonations,
  onDiscover,
  onFundraise,
  onVoxide,
  onSelectCampaign,
}) => {
  const { t } = useTranslation();
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'approved');
  const featuredCampaigns = [...activeCampaigns]
    .sort((a, b) => {
      const score = (campaign: Campaign) => {
        const percent = campaign.goalAmount ? campaign.raisedAmount / campaign.goalAmount : 0;
        return campaign.category === 'emergency' || percent >= 0.75 ? 1 : 0;
      };

      return score(b) - score(a);
    })
    .slice(0, 3);

  return (
    <div className="flex w-full flex-col">
      {/* ── SECTION 2: FEATURED CAUSES (ONLY INDIVIDUAL CARDS ARE FRAMED PLATES) ── */}
      <section
        id="home-featured-causes"
        className="scroll-mt-20 w-full max-w-[1480px] mx-auto px-6 sm:px-12 lg:px-20 pt-16 sm:pt-24 pb-12 sm:pb-20"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#26211C]/15 pb-5 dark:border-[#9A7432]/25">
          <div className="space-y-1.5">
            <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6]">
              {t('home.featured.title', 'Community causes & live Birr progress')}
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5A4E3E] dark:text-[#9E9383]">
              {t(
                'home.featured.oneLiner',
                'Verified local causes ready for your direct support.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onDiscover}
            className="inline-flex items-center gap-2 border-b border-[#1E4D38] pb-1 font-mono text-xs font-bold uppercase tracking-wider text-[#1E4D38] hover:text-[#163E2C] dark:border-[#52B788] dark:text-[#52B788] cursor-pointer"
          >
            <span>{t('home.featured.browseAll', 'Browse all causes')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {featuredCampaigns.length > 0 ? (
          <div className="mx-auto grid w-full max-w-[315px] sm:max-w-[642px] lg:max-w-[969px] grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
            {featuredCampaigns.map((campaign, index) => (
              <BanknotePlateCard
                key={campaign.id}
                campaign={campaign}
                onSelect={onSelectCampaign}
                showViewCause
                isSpotlight={index === 0}
                className="w-full max-w-[315px] !p-3 sm:!p-3.5 [&_h3]:text-sm [&_h3]:sm:text-[15px]"
              />
            ))}
          </div>
        ) : (
          <p className="py-12 font-mono text-xs text-[#5A4E3E] dark:text-[#9E9383]">
            {t('home.featured.empty', 'New causes are being prepared. Check back soon or explore our community.')}
          </p>
        )}
      </section>

      {/* ── SECTION 3: ZERO-FEE DIRECT DISBURSEMENT PLEDGE (UNBOXED TEXT BESIDE FRAMED LEDGER PLATE) ── */}
      <section
        id="home-proverb"
        className="scroll-mt-20 w-full max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-20 py-14 sm:py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Unboxed Zero-Cut Text sitting directly on the page background */}
          <div className="lg:col-span-6 space-y-4">
            <p className="type-caption text-[#9A7432]">
              {t('home.zeroCut.eyebrow', 'Zero-deduction civic pledge')}
            </p>
            <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6]">
              {t('home.zeroCut.headline', '0% Platform Cut. 100% Direct to Causes.')}
            </h2>
            <p className="type-subhead text-[#1E4D38] dark:text-[#52B788]">
              {t(
                'home.zeroCut.subhead',
                'Every single Birr you give reaches the community it was meant for.'
              )}
            </p>
            <p className="type-body text-[#5A4E3E] dark:text-[#9E9383]">
              {t(
                'home.zeroCut.description',
                'Lewegene takes nothing from your generosity. Contributions settle straight into local Telebirr and CBE Birr accounts with zero platform commissions or middleman deductions.'
              )}
            </p>
          </div>

          {/* Framed Intaglio 0% Cut / 100% Direct Settlement Plate */}
          <div className="lg:col-span-6">
            <div className="relative border-2 border-[#26211C] dark:border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] p-5 sm:p-6 banknote-shadow">
              <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />

              {/* Plate Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-2.5 mb-5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#5A4E3E] dark:text-[#9E9383]">
                <span>{t('home.zeroCut.plateHeader', 'DIRECT SETTLEMENT GUARANTEE')}</span>
                <span className="text-[#1E4D38] dark:text-[#52B788]">100% PASS-THROUGH</span>
              </div>

              {/* Dual Engraved Numerals: 0% Platform Cut vs 100% Direct to Cause */}
              <div className="relative z-10 grid grid-cols-2 gap-4 pb-5 border-b border-[#26211C]/15 dark:border-[#9A7432]/25">
                <div className="p-4 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#F2EADA]/80 dark:bg-[#0E0D0B]/80 space-y-1">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#9A7432]">
                    {t('home.zeroCut.platformFeeLabel', 'Platform Commission')}
                  </span>
                  <span className="block font-display font-black text-3xl sm:text-4xl text-[#201C18] dark:text-[#F4EFE6] tabular-nums leading-none">
                    0%
                  </span>
                  <span className="block font-mono text-[10px] text-[#5A4E3E] dark:text-[#9E9383]">
                    {t('home.zeroCut.platformFeeNote', '0.00 ETB deducted')}
                  </span>
                </div>

                <div className="p-4 border border-[#1E4D38] dark:border-[#52B788] bg-[#1E4D38]/8 dark:bg-[#52B788]/10 space-y-1">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#1E4D38] dark:text-[#52B788]">
                    {t('home.zeroCut.directToCauseLabel', 'Delivered to Cause')}
                  </span>
                  <span className="block font-display font-black text-3xl sm:text-4xl text-[#1E4D38] dark:text-[#52B788] tabular-nums leading-none">
                    100%
                  </span>
                  <span className="block font-mono text-[10px] text-[#201C18] dark:text-[#E8DEC8] font-bold">
                    {t('home.zeroCut.directToCauseNote', 'Every Birr reaches the field')}
                  </span>
                </div>
              </div>

              {/* Engraved Intaglio Direct Transfer Flow Bar */}
              <div className="relative z-10 py-4 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-[#201C18] dark:text-[#F4EFE6]">
                  <span>{t('home.zeroCut.flowDonor', 'Donor Pledge: 1,000 ETB')}</span>
                  <span className="text-[#9A7432]">── 0% CUT ──►</span>
                  <span className="text-[#1E4D38] dark:text-[#52B788]">
                    {t('home.zeroCut.flowCause', 'Cause Receives: 1,000 ETB')}
                  </span>
                </div>
                <div className="h-2 w-full border border-[#26211C] dark:border-[#9A7432] bg-[#EAE1CF] dark:bg-[#0E0D0B] p-0.5">
                  <div className="h-full w-full bg-[#1E4D38] dark:bg-[#52B788]" />
                </div>
              </div>

              {/* Plate Footer */}
              <div className="relative z-10 mt-1 pt-2.5 border-t border-[#26211C]/15 dark:border-[#9A7432]/25 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-[#5A4E3E] dark:text-[#9E9383] uppercase tracking-widest">
                <span>{t('home.zeroCut.rails', 'TELEBIRR · CBE BIRR · DIRECT ESCROW RAILS')}</span>
                <span>{t('home.plateLocation', 'ADDIS ABABA · ፳፻፲፰')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS (UNBOXED SEQUENCE CONNECTED BY ENGRAVED THREAD LINE) ── */}
      <section
        id="home-how-it-works"
        className="scroll-mt-20 w-full max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-20 py-14 sm:py-20"
      >
        <div className="max-w-xl space-y-2 mb-10 sm:mb-12">
          <p className="type-caption text-[#9A7432]">
            {t('home.howItWorks.eyebrow', 'How it works')}
          </p>
          <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6]">
            {t('home.howItWorks.titleLine1', 'Good things happen')}{' '}
            {t('home.howItWorks.titleLine2', 'one step at a time.')}
          </h2>
          <p className="type-body text-[#5A4E3E] dark:text-[#9E9383]">
            {t(
              'home.howItWorks.description',
              'Find a community cause, lend your support, and follow the difference you helped make.'
            )}
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Continuous Engraved Thread Line on Desktop (horizontal) & Mobile (vertical) */}
          <div
            aria-hidden="true"
            className="pointer-events-none hidden md:block absolute top-4 left-0 right-0 h-px bg-[#9A7432]/45"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none md:hidden absolute top-2 bottom-2 left-4 w-px bg-[#9A7432]/45"
          />

          {[
            {
              number: '01',
              title: t('home.howItWorks.step1Title', 'Find a cause'),
              detail: t(
                'home.howItWorks.step1Detail',
                'Explore community-led projects and choose a cause that matters to you.'
              ),
              icon: <Search className="h-3.5 w-3.5" />,
            },
            {
              number: '02',
              title: t('home.howItWorks.step2Title', 'Give what you can'),
              detail: t(
                'home.howItWorks.step2Detail',
                'Every contribution matters. Support the people and purpose you believe in.'
              ),
              icon: <HandHeart className="h-3.5 w-3.5" />,
            },
            {
              number: '03',
              title: t('home.howItWorks.step3Title', 'See the impact'),
              detail: t(
                'home.howItWorks.step3Detail',
                'Follow cause updates and see how your community moves forward.'
              ),
              icon: <TrendingUp className="h-3.5 w-3.5" />,
            },
          ].map((step) => (
            <div
              key={step.number}
              className="relative pl-12 md:pl-0 md:pt-9"
            >
              {/* Thread Node Marker */}
              <div className="absolute left-0 top-0 md:top-0 md:left-0 inline-flex h-8 items-center gap-1.5 bg-[#F2ECE1] dark:bg-[#080706] pr-3 font-mono text-xs font-black text-[#9A7432]">
                <span className="inline-flex h-8 w-8 items-center justify-center border border-[#9A7432]/60 bg-[#F2ECE1] dark:bg-[#080706] text-[#1E4D38] dark:text-[#52B788]">
                  {step.number}
                </span>
                <span className="text-[#1E4D38] dark:text-[#52B788]">{step.icon}</span>
              </div>

              <h3 className="type-subhead text-[#201C18] dark:text-[#F4EFE6]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[48ch] font-sans text-xs sm:text-sm leading-relaxed text-[#5A4E3E] dark:text-[#9E9383]">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: IMPACT STATS (LARGE TYPOGRAPHIC NUMBERS DIRECTLY ON BACKGROUND) ── */}
      <section
        id="home-impact"
        className="scroll-mt-20 w-full max-w-[1360px] mx-auto px-6 sm:px-12 lg:px-20 py-16 sm:py-24"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 border-y border-[#26211C]/15 dark:border-[#9A7432]/25 py-10 sm:py-12">
          <div className="space-y-1.5">
            <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {totalRaised.toLocaleString()} <span className="text-lg sm:text-xl font-bold">ETB</span>
            </p>
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              {t('home.impact.totalUnderwritten', 'TOTAL UNDERWRITTEN BIRR')}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {totalDonations.toLocaleString()}
            </p>
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              {t('home.impact.communityPatrons', 'COMMUNITY PATRONS')}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1E4D38] dark:text-[#52B788] tabular-nums">
              100%
            </p>
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              {t('home.impact.directToBeneficiaries', 'DIRECT TO BENEFICIARIES')}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {campaigns.length}
            </p>
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              {t('home.impact.verifiedPlates', 'VERIFIED CAUSE PLATES')}
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FULL-BLEED CLOSING CTA BANNER (NO FLOATING BOX) ── */}
      <section
        id="home-closing-cta"
        className="w-full border-t border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#EAE1CF]/85 dark:bg-[#111410]/90 py-16 sm:py-24 px-6 sm:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-[1240px] flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <p className="type-caption text-[#9A7432]">
              {t('home.cta.eyebrow', 'There’s room for you here')}
            </p>
            <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6]">
              {t('home.cta.title', 'What good will you help grow?')}
            </h2>
            <p className="type-body text-[#5A4E3E] dark:text-[#9E9383]">
              {t(
                'home.cta.description',
                'Bring your community together around a verified cause, or use voice search to navigate in English, Amharic, or Afaan Oromo.'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 shrink-0">
            <button
              type="button"
              onClick={onFundraise}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 border-2 border-[#1E4D38] bg-[#1E4D38] px-7 py-3.5 font-mono text-xs sm:text-sm font-black uppercase tracking-widest text-white hover:bg-[#163E2C] transition-colors cursor-pointer"
            >
              <span>{t('home.cta.startFundraising', 'Start fundraising')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onVoxide}
              className="justify-center inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#5A4E3E] hover:text-[#1E4D38] dark:text-[#9E9383] dark:hover:text-[#52B788] underline underline-offset-4 transition-colors cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5 text-[#9A7432]" />
              <span>{t('home.voxide.try', 'Speak with Voxide')}</span>
            </button>
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
  const [personalDataRevision, setPersonalDataRevision] = useState(0);

  useEffect(() => {
    const refreshPersonalLinks = () => setPersonalDataRevision((revision) => revision + 1);
    window.addEventListener('lewegene:personal-data-changed', refreshPersonalLinks);
    window.addEventListener('storage', refreshPersonalLinks);
    return () => {
      window.removeEventListener('lewegene:personal-data-changed', refreshPersonalLinks);
      window.removeEventListener('storage', refreshPersonalLinks);
    };
  }, []);

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

  const hasReports = useMemo(
    () => Boolean(authUser && hasPersonalReports(authUser.id)),
    [authUser?.id, personalDataRevision],
  );
  const hasFundraisers = useMemo(
    () => Boolean(authUser && hasPersonalFundraisers(authUser.id)),
    [authUser?.id, personalDataRevision],
  );

  // Navigation State
  const [zoomMode, setZoomMode] = useState<BanknoteZoomMode>(initialMode);
  const [activePlateIndex, setActivePlateIndex] = useState<number>(0);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportFeedback, setReportFeedback] = useState<string>('');
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
    };
    navigate(path || modePaths[mode]);
  };

  useEffect(() => {
    setZoomMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialCampaignId) {
      setSelectedCampaign(campaigns.find((campaign) => campaign.id === initialCampaignId) || campaigns[0] || null);
    } else if (initialMode === 'detail' || initialMode === 'pledge') {
      setSelectedCampaign(campaigns[0] || null);
    }
  }, [campaigns, initialCampaignId, initialMode]);

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
      const isOngoing = c.status === 'approved' && percent < 100;
      const isEndingSoon = c.status === 'approved' &&
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
    { id: 'all', num: '፩', label: 'ALL CAUSES' },
    { id: 'medical', num: '፪', label: 'MEDICAL' },
    { id: 'education', num: '፫', label: 'EDUCATION' },
    { id: 'emergency', num: '፬', label: 'EMERGENCY' },
    { id: 'water', num: '፭', label: 'CLEAN WATER' },
    { id: 'environment', num: '፮', label: 'ENVIRONMENT' },
    { id: 'community', num: '፯', label: 'COMMUNITY' },
    { id: 'other', num: '፰', label: 'OTHER' },
  ];
  // Navigation Handlers
  const handleOpenDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsReportFormOpen(false);
    setReportReason('');
    setReportDetails('');
    setReportFeedback('');
    navigateToMode('detail', `/causes/${campaign.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCampaign || !reportReason) return;

    try {
      const storedReports = localStorage.getItem('lewegene_cause_reports');
      const reports: Array<{
        id: string;
        campaignId: string;
        reason: string;
        details: string;
        createdAt: string;
      }> = storedReports ? JSON.parse(storedReports) : [];
      if (!Array.isArray(reports)) {
        throw new Error('Saved cause reports are not in the expected format.');
      }

      reports.push({
        id: `report-${Date.now()}`,
        campaignId: selectedCampaign.id,
        reason: reportReason,
        details: reportDetails.trim(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('lewegene_cause_reports', JSON.stringify(reports));
      const reportCategories = {
        misleading_information: 'Misleading Content',
        suspected_fraud: 'Fraud / Scam',
        duplicate: 'Other',
        inappropriate_content: 'Other',
        other: 'Other',
      } as const;
      const reporterId = useAuthStore.getState().user?.id || 'demo-guest';
      await adminApi.submitReport({
        reporterId,
        campaignId: selectedCampaign.id,
        category: reportCategories[reportReason as keyof typeof reportCategories] || 'Other',
        details: reportDetails.trim() || `Reported for ${reportReason.replaceAll('_', ' ')}.`,
        evidence: [],
      });
      window.dispatchEvent(new Event('lewegene:personal-data-changed'));
      setReportFeedback('Report submitted to the moderation queue for administrative review.');
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error('Failed to save cause report', error);
      setReportFeedback('Could not save this report in the browser. Please try again.');
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
      setReportFeedback('Could not update saved causes in this browser.');
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
      <BanknoteLivingBackground isDark={isDark} showProverbScene={zoomMode === 'overview'} />

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
              ★ {t('nav.trustLine', '0% PLATFORM CUT · 100% DIRECT TO CAUSES')}
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
              LEWEGENE
            </h1>
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#9A7432] uppercase font-bold mt-1">
              {t('nav.tagline', 'Ethiopia · Civic Tender')}
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
              {t('nav.home', 'Home')}
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
              <span>{t('nav.discoverCauses', 'Discover Causes')}</span>
              <span className="px-1.5 py-0.2 bg-[#1E4D38] text-white text-[9px] font-bold rounded-xs">
                {campaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/fundraising')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
            >
              {showPersonalNavigation && hasFundraisers
                ? t('nav.myFundraisers', 'My Fundraisers')
                : t('nav.fundraise', 'Fundraise')}
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
                  {t('nav.myContributions', 'My Contributions')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
                >
                  {t('nav.myProfile', 'My Profile')}
                </button>
                {hasReports && (
                  <button
                    type="button"
                    onClick={() => navigate('/reports')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
                  >
                    {t('nav.myReports', 'My Reports')}
                  </button>
                )}
                {(authUser?.role === 'foundation' || (authUser?.role as string) === 'organization') && (
                  <button
                    type="button"
                    onClick={() => navigate('/foundation')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#1E4D38] dark:text-[#52B788] hover:underline"
                  >
                    {t('nav.orgDashboard', 'Organization Hub')}
                  </button>
                )}
                {authUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#9A7432] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
                  >
                    {t('nav.adminPortal', 'Admin Console')}
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 transition-colors cursor-pointer text-[#201C18] dark:text-[#E8DEC8] hover:text-[#1E4D38] dark:hover:text-[#52B788]"
              >
                {t('nav.signUpLogIn', 'Sign Up / Log In')}
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
              title={t('nav.speakVoxide', 'Speak with Voxide Voice Assistant')}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className={`${showPersonalNavigation ? 'font-mono text-[10px] font-bold uppercase' : 'hidden xl:inline font-mono text-[10px] font-bold uppercase'}`}>{t('home.voxide.title', 'Voxide')}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              title={t('nav.toggleTheme', 'Toggle Parchment / Midnight Ink')}
              className="p-2 border border-[#9A7432]/50 hover:bg-[#9A7432]/15 text-[#201C18] dark:text-[#D8B066] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {showPersonalNavigation && authUser && (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  aria-label={t('nav.openProfileMenu', 'Open profile menu')}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  title={t('nav.profileMenuTitle', 'Profile: {{name}}', { name: authUser.name })}
                  className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-[#9A7432]/60 bg-[#F2ECE1] text-[#1E4D38] transition-colors hover:border-[#1E4D38] dark:bg-[#1C1814] dark:text-[#52B788]"
                >
                  {authUser.avatarUrl
                    ? <img src={authUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                    : <span className="font-mono text-[10px] font-black">{authUser.name.trim().slice(0, 2).toUpperCase() || <UserRound className="h-4 w-4" />}</span>}
                </button>
                {isProfileMenuOpen && (
                  <div
                    role="menu"
                    aria-label={t('nav.profileOptions', 'Profile options')}
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
                      {t('nav.myProfile', 'My Profile')}
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
                      {t('nav.editMyProfile', 'Edit My Profile')}
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
                      {t('nav.logout', 'Logout')}
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
                <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9A7432]">{t('profile.localDemoProfile', 'Patron Profile')}</p>
                <h2 id="profile-editor-title" className="mt-1 font-serif text-2xl font-black">{t('profile.editTitle', 'Edit My Profile')}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileEditorOpen(false)}
                aria-label={t('profile.closeEditorAria', 'Close profile editor')}
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
                {t('profile.name', 'Name')}
                <input
                  required
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  className="border border-[#26211C]/20 bg-white px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                />
              </label>
              <label className="grid gap-1.5 font-mono text-xs font-bold">
                {t('profile.email', 'Email')}
                <input
                  required
                  type="email"
                  value={profileEmail}
                  onChange={(event) => setProfileEmail(event.target.value)}
                  className="border border-[#26211C]/20 bg-white px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                />
              </label>
              <label className="grid gap-1.5 font-mono text-xs font-bold">
                {t('profile.phone', 'Phone')}
                <input
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  className="border border-[#26211C]/20 bg-white px-3 py-2.5 font-sans text-sm dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                />
              </label>
              <p className="text-xs text-zinc-500">{t('profile.changesNote', 'Profile details are synced across your active session.')}</p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsProfileEditorOpen(false)}
                  className="border border-[#9A7432]/50 px-4 py-2.5 font-mono text-xs font-bold uppercase hover:bg-[#9A7432]/10"
                >
                  {t('profile.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-black uppercase text-white hover:bg-[#163E2C]"
                >
                  {t('profile.saveProfile', 'Save Profile')}
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
            VIEW 1: OVERVIEW (OPEN COMPOSITION ON THE LIVING BANKNOTE CANVAS)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'overview' && (
          <div className="w-full">
            {/* ── SECTION 1: FULL-BLEED HERO (NO BORDER BOX, SITS DIRECTLY ON GUILLOCHÉ CANVAS) ── */}
            <section
              id="home-hero"
              className="scroll-mt-20 w-full border-b border-[#26211C]/15 dark:border-[#9A7432]/25 px-6 sm:px-12 lg:px-24 pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-24 lg:pb-28 animate-banknote-reveal"
            >
              <div className="w-full max-w-4xl mx-auto text-center">
                <div className="relative space-y-7 sm:space-y-8 flex flex-col items-center">
                  <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 border border-[#9A7432]/40 bg-[#F2EADA]/90 dark:bg-[#0E0D0B]/90 text-[10px] font-mono font-bold tracking-[0.25em] text-[#9A7432] uppercase">
                    <span>{t('home.tenderBadgeLine1', 'የኢትዮጵያ ሕዝባዊ አንድነት ትብብር')}</span>
                    <span>·</span>
                    <span>{t('home.tenderBadgeLine2', 'NATIONAL CITIZEN SOLIDARITY TENDER')}</span>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#201C18] dark:text-[#F4EFE6] tracking-tight leading-none banknote-engraved-text">
                      LEWEGENE
                    </h1>

                    <p className="font-serif font-bold text-2xl sm:text-4xl text-[#1E4D38] dark:text-[#52B788] tracking-wide uppercase">
                      {t('home.tagline', "SUPPORTING ETHIOPIA'S PEOPLE & PURPOSE")}
                    </p>

                    <p className="font-ethiopic text-lg sm:text-xl text-[#201C18]/80 dark:text-[#E8DEC8]/80 italic pt-0.5">
                      {t('home.motto', '« ለወገን ደራሽ ወገን ነው። »')}
                    </p>

                    <p className="font-sans text-xs sm:text-[13px] text-[#5A4E3E]/75 dark:text-[#9E9383]/75 max-w-lg mx-auto leading-relaxed">
                      {t(
                        'home.hero.description',
                        'Lewegene brings people and trusted community causes closer. Find a story that moves you, and help make its next chapter possible.'
                      )}
                    </p>
                  </div>

                  {/* Single Primary Hero CTA + Lower-Emphasis Secondary Link */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigateToMode('discover')}
                      className="w-full sm:w-auto justify-center py-3.5 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs sm:text-sm font-black tracking-widest uppercase hover:bg-[#163E2C] transition-colors cursor-pointer shadow-sm flex items-center gap-3 active:translate-y-px"
                    >
                      <span>{t('home.exploreCauses', 'Explore causes')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={openFoundationDesk}
                      className="py-2 font-mono text-xs font-bold tracking-wider uppercase text-[#5A4E3E] dark:text-[#9E9383] hover:text-[#1E4D38] dark:hover:text-[#52B788] underline underline-offset-4 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <span>{t('home.forFoundations', 'For foundations')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <HomeLanding
              campaigns={campaigns}
              organizations={organizations}
              totalRaised={totalRaised}
              totalDonations={totalDonations}
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
                <span>← BACK TO HOME</span>
              </button>

              <div className="text-center">
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#201C18] dark:text-[#F4EFE6] leading-tight">
                  DISCOVER CAUSES
                </h2>
                <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  Accredited Ethiopian civil society projects ready for direct citizen underwriting
                </p>
              </div>

              <span className="font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
                {filteredCampaigns.length} CAUSES AVAILABLE
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
                  placeholder="Search causes by title, organization, location, or serial number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#26211C]/30 dark:border-[#4A3E33] bg-[#EAE1CF] dark:bg-[#161411] font-mono text-xs text-[#201C18] dark:text-[#F4EFE6] placeholder:text-zinc-500 focus:outline-none focus:border-[#1E4D38]"
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
                    STATUS &amp; LOCATION:
                  </span>
                  {[
                    { id: 'all', label: 'ALL' },
                    { id: 'ending_soon', label: 'ENDING SOON' },
                    { id: 'started_now', label: 'STARTED NOW' },
                    { id: 'ongoing', label: 'ONGOING' },
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
                    <span className="sr-only">Filter by location</span>
                    <select
                      value={selectedLocation}
                      onChange={(event) => setSelectedLocation(event.target.value)}
                      className="px-2.5 py-1.5 border border-[#26211C]/25 bg-[#EAE1CF] dark:bg-[#161411] text-[10px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <option value="all">ALL LOCATIONS</option>
                      {ETHIOPIAN_REGIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                    </select>
                  </label>
                </div>
              </div>

            </div>

            {/* Widescreen 3-Column Causes Grid (Breathable Banknote Plates) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((camp) => (
                <BanknotePlateCard
                  key={camp.id}
                  campaign={camp}
                  onSelect={handleOpenDetail}
                  onQuickPledge={handleOpenPledge}
                />
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="p-16 text-center border border-dashed border-[#26211C]/30 bg-[#F2EADA]/80 dark:bg-[#0E0D0B]/80 font-mono space-y-4">
                <p className="text-base font-bold text-[#1E4D38] dark:text-[#52B788]">
                  NO CAUSE PLATES MATCH YOUR CRITERIA
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Try adjusting your search terms, changing the sector filter, or clearing all active filters.
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
                  RESET ALL FILTERS
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
                <span>← BACK TO CAUSES</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black text-[#1E4D38] dark:text-[#52B788]">
                  № {selectedCampaign.serialCode || 'LW-0421'}
                </span>
                <span className="px-2.5 py-0.5 border border-[#26211C]/40 text-[10px] font-mono font-bold uppercase">
                  {selectedCampaign.category.toUpperCase()}
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

                {/* Escrow & Settlement Credentials */}
                <div className="p-6 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FCF9F2]/80 dark:bg-[#1E1A17]/80 space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-[#201C18] dark:text-[#F4EFE6] uppercase flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
                    <span>CIVIL SOCIETY ESCROW &amp; SETTLEMENT</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="block text-zinc-400">CHARTER SERIAL:</span>
                      <span className="font-bold text-[#201C18] dark:text-[#F4EFE6]">ET-58291/2026</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400">DISBURSEMENT ESCROW:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">TELEBIRR &amp; CBE CLEARING</span>
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
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase">PATRONS</span>
                      <span className="text-lg font-black">{selectedCampaign.donationsCount || 0}</span>
                    </div>
                    <div className="p-3 border border-[#26211C]/20 bg-[#EAE1CF] dark:bg-[#161411]">
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase">TARGET GOAL</span>
                      <span className="text-lg font-black">{selectedCampaign.goalAmount.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* UNMISSABLE PRIMARY ACTION: SUPPORT THIS CAUSE */}
                  <button
                    type="button"
                    onClick={() => handleOpenPledge(selectedCampaign)}
                    className="w-full py-4 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-sm font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:translate-y-px"
                  >
                    <span>SUPPORT THIS CAUSE (PLEDGE BIRR)</span>
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
                  <h3 className="font-serif text-lg font-bold text-[#201C18] dark:text-[#F4EFE6]">Keep this cause close</h3>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                    Saved causes appear in your Donor Profile for easy tracking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSavedCause(selectedCampaign)}
                  aria-pressed={savedCauseIds.includes(selectedCampaign.id)}
                  className="inline-flex items-center gap-2 border border-[#9A7432]/50 bg-[#F2EADA] px-4 py-2 font-mono text-xs font-bold uppercase text-[#201C18] transition hover:bg-[#E6D9C1] dark:bg-[#161411] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${savedCauseIds.includes(selectedCampaign.id) ? 'fill-current' : ''}`} />
                  {savedCauseIds.includes(selectedCampaign.id) ? 'Saved cause' : 'Save cause'}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#201C18] dark:text-[#F4EFE6]">Report a cause</h3>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                    Think something is wrong with this cause? Let us know.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsReportFormOpen(true);
                    setReportFeedback('');
                  }}
                  className="inline-flex items-center gap-2 border border-[#9A7432]/50 bg-[#F2EADA] px-4 py-2 font-mono text-xs font-bold uppercase text-[#201C18] transition hover:bg-[#E6D9C1] dark:bg-[#161411] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
                  aria-haspopup="dialog"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Report this cause
                </button>
              </div>
              {isReportFormOpen && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-4">
                  <button
                    type="button"
                    aria-label="Close report dialog"
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
                          <p className="font-mono text-[9px] font-black uppercase tracking-[.18em] text-[#9A7432]">Cause safety</p>
                          <h3 id="report-cause-title" className="mt-1 font-serif text-xl font-black text-[#201C18] dark:text-[#F4EFE6]">Report a cause</h3>
                          <p className="mt-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">{selectedCampaign.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsReportFormOpen(false)}
                          aria-label="Close report dialog"
                          className="border border-[#9A7432]/40 p-2 text-[#201C18] hover:bg-[#E6D9C1] dark:text-[#F4EFE6] dark:hover:bg-[#201B16]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <form onSubmit={handleReportSubmit} className="grid gap-4">
                  <label className="grid gap-1.5 font-mono text-xs font-bold text-[#201C18] dark:text-[#F4EFE6]">
                    Reason for reporting
                    <select
                      required
                      value={reportReason}
                      onChange={(event) => setReportReason(event.target.value)}
                      className="w-full border border-[#26211C]/25 bg-[#FFFDF9] px-3 py-2.5 font-mono text-xs dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                    >
                      <option value="">Choose a reason</option>
                      <option value="misleading_information">Misleading information</option>
                      <option value="suspected_fraud">Suspected fraud</option>
                      <option value="duplicate">Duplicate cause</option>
                      <option value="inappropriate_content">Inappropriate content</option>
                      <option value="other">Other concern</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5 font-mono text-xs font-bold text-[#201C18] dark:text-[#F4EFE6]">
                    Additional details <span className="font-normal text-zinc-500">(optional)</span>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={(event) => setReportDetails(event.target.value)}
                      placeholder="Share any details that may help explain your concern."
                      className="w-full resize-y border border-[#26211C]/25 bg-[#FFFDF9] px-3 py-2.5 font-sans text-sm font-normal dark:border-[#9A7432]/30 dark:bg-[#0E0D0B]"
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-xl font-mono text-[10px] text-zinc-500">
                      Your report will be reviewed by our platform moderation team.
                    </p>
                    <button
                      type="submit"
                      className="border-2 border-[#1E4D38] bg-[#1E4D38] px-4 py-2.5 font-mono text-xs font-black uppercase text-white transition hover:bg-[#163E2C]"
                    >
                      Submit report
                    </button>
                  </div>
                  {reportFeedback && (
                    <p role="status" className="font-mono text-xs text-[#1E4D38] dark:text-[#52B788]">
                      {reportFeedback}
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

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 5: MY CONTRIBUTIONS (PATRON VAULT / DONATION HISTORY)
        ══════════════════════════════════════════════════════════════════════════ */}
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
                    <span className="text-[#1E4D38] dark:text-[#52B788]">DIRECT DISBURSEMENT</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#201C18] dark:text-[#F4EFE6]">{c.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">{c.impactMetric}</p>
                  <div className="text-[10px] text-zinc-500 flex justify-between pt-2 border-t border-[#26211C]/10">
                    <span>LOCATION: {c.location}</span>
                    <span>BENEFICIARIES: {c.beneficiariesTarget} CITIZENS</span>
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
                      ? 'PENDING ADMINISTRATIVE REVIEW'
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
                REGISTER &amp; ENGRAVE NEW CAUSE PLATE
              </h3>
              
              <form onSubmit={handleCreateCauseSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-600 dark:text-zinc-400 mb-1">PROJECT TITLE:</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#EAE1CF] dark:bg-[#161411] text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">SECTOR CATEGORY:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                    >
                      <option value="water">CLEAN WATER</option>
                      <option value="education">EDUCATION</option>
                      <option value="medical">MEDICAL</option>
                      <option value="emergency">EMERGENCY</option>
                      <option value="environment">ENVIRONMENT</option>
                      <option value="community">COMMUNITY</option>
                      <option value="other">OTHER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">FUNDING GOAL (ETB):</label>
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
                    <label className="block font-bold text-zinc-600 mb-1">GEOGRAPHIC LOCATION:</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#1E4D38]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">TARGET BENEFICIARIES:</label>
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
                  <label className="block font-bold text-zinc-600 mb-1">PROJECT STORY &amp; MILESTONE PLAN:</label>
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
              LEWEGENE CIVIC BANKNOTE · NATIONAL SOLIDARITY REPOSITORY
            </span>
            <span>ALL RIGHTS RESERVED 2026 / ፳፻፲፰</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onOpenScholarxiv}
              className="hover:text-[#1E4D38] dark:hover:text-[#52B788] cursor-pointer"
            >
              ACADEMIC ARCHIVE
            </button>
            <span className="text-[#1E4D38] dark:text-[#52B788] font-bold">100% COMMUNITY OWNED</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
