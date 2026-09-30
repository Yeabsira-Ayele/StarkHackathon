import React, { useState, useMemo } from 'react';
import { Campaign, ContributionCertificate, PaymentRail, Organization } from '../../types/index.ts';
import {
  CentralMonumentEngraving,
  AcsoCircularSeal,
  VoxideVoiceSeal,
  BanknoteRulerGauge,
} from './BanknoteArtwork.tsx';
import { BanknotePlateCard } from './BanknotePlateCard.tsx';
import { BanknoteLivingBackground } from './BanknoteLivingBackground.tsx';
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
  HelpCircle,
  Info,
  Filter,
} from 'lucide-react';
import { toGeezNumber } from '../../services/utils/currencyUtils.ts';
import { AdminPortal } from '../../features/admin/pages/AdminPortal.tsx';

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
  onDonate: (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => Promise<any>;
  onApproveCampaign?: (id: string) => void | Promise<void>;
  onRejectCampaign?: (id: string) => void | Promise<void>;
  onCreateCampaign?: (campaignData: Partial<Campaign>) => Promise<any>;
  onOpenVoice: () => void;
  onOpenScholarxiv?: () => void;
  language: 'en' | 'am' | 'om';
  isDark: boolean;
  onToggleTheme: () => void;
  onDonationCompleted?: (cert: ContributionCertificate) => void;
}

export const BanknoteMasterCanvas: React.FC<BanknoteMasterCanvasProps> = ({
  campaigns,
  pendingCampaigns,
  currentOrganization,
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
}) => {
  // Navigation State
  const [zoomMode, setZoomMode] = useState<BanknoteZoomMode>('overview');
  const [activePlateIndex, setActivePlateIndex] = useState<number>(0);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // User Role Switcher
  const [userRole, setUserRole] = useState<'patron' | 'foundation' | 'admin'>('patron');

  // Search & Filters for Causes
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fundingStatusFilter, setFundingStatusFilter] = useState<'all' | 'active' | 'nearly_funded' | 'completed'>('all');

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

  // Active spotlight cause for featured vignette
  const activeSpotlight =
    campaigns && campaigns.length > 0
      ? campaigns[activePlateIndex % campaigns.length] || campaigns[0]
      : null;

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return (campaigns || []).filter((c) => {
      if (!c) return false;
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.serialCode && c.serialCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.organizationName && c.organizationName.toLowerCase().includes(searchQuery.toLowerCase()));

      const percent = c.goalAmount ? (c.raisedAmount / c.goalAmount) * 100 : 0;
      let matchesStatus = true;
      if (fundingStatusFilter === 'active') {
        matchesStatus = percent < 75;
      } else if (fundingStatusFilter === 'nearly_funded') {
        matchesStatus = percent >= 75 && percent < 100;
      } else if (fundingStatusFilter === 'completed') {
        matchesStatus = percent >= 100;
      }

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [campaigns, selectedCategory, searchQuery, fundingStatusFilter]);

  // Aggregate Metrics
  const totalRaised = (campaigns || []).reduce((acc, c) => acc + (c?.raisedAmount || 0), 0);
  const totalDonations = (campaigns || []).reduce((acc, c) => acc + (c?.donationsCount || 0), 0);
  const totalProjects = (campaigns || []).length;

  const categories = [
    { id: 'all', num: '፩', label: 'ALL CAUSES' },
    { id: 'education', num: '፪', label: 'EDUCATION' },
    { id: 'medical', num: '፫', label: 'HEALTHCARE' },
    { id: 'water', num: '፬', label: 'CLEAN WATER' },
    { id: 'emergency', num: '፭', label: 'EMERGENCY' },
    { id: 'business', num: '፮', label: 'ARTISANS' },
  ];

  // Navigation Handlers
  const handleOpenDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setZoomMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPledge = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPledgeStep(1);
    setZoomMode('pledge');
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
      setZoomMode('discover');
    } catch (err) {
      console.error('Failed to engrave cause', err);
    } finally {
      setIsSubmittingCause(false);
    }
  };

  // Admin console: separate management interface with its own sidebar.
  if (userRole === 'admin') {
    return (
      <AdminPortal
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onApproveCampaign={onApproveCampaign}
        onRejectCampaign={onRejectCampaign}
        onExit={() => {
          setUserRole('patron');
          setZoomMode('overview');
        }}
      />
    );
  }

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
      <header className="relative z-20 w-full px-6 sm:px-12 lg:px-20 py-5 border-b border-[#26211C]/15 dark:border-[#9A7432]/25 bg-[#F6F1E5]/80 dark:bg-[#141210]/80 backdrop-blur-xs transition-colors">
        
        {/* Top Micro-Ribbon: Edge Identification & Legal Clearing */}
        <div className="flex items-center justify-between text-[10px] font-mono pb-3 border-b border-[#26211C]/10 dark:border-[#9A7432]/15">
          <div className="flex items-center gap-2">
            <span className="banknote-serial-red font-black tracking-widest text-xs">
              № FE-8372490
            </span>
            <span className="hidden sm:inline text-zinc-500 font-bold">
              · SERIES 2026 / ፳፻፲፰ · ETHIOPIAN CIVIC REPOSITORY
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <span className="hidden md:inline font-bold text-[#8B2626] dark:text-[#D8B066]">
              ★ ACSO REGISTERED · 0% PLATFORM CUT · 100% DIRECT TO CAUSES
            </span>
            
            {/* Patron / Foundation Mode Switcher */}
            <div className="flex items-center border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FCF9F2] dark:bg-[#1E1A17] p-0.5 text-[9px] font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  setUserRole('patron');
                  setZoomMode('overview');
                }}
                className={`px-2.5 py-0.5 cursor-pointer uppercase transition-colors ${
                  userRole === 'patron' && zoomMode !== 'treasury'
                    ? 'bg-[#26211C] text-white dark:bg-[#9A7432] dark:text-[#141210]'
                    : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
                }`}
              >
                PATRON
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserRole('foundation');
                  setZoomMode('treasury');
                }}
                className={`px-2.5 py-0.5 cursor-pointer uppercase transition-colors ${
                  userRole === 'foundation' || zoomMode === 'treasury'
                    ? 'bg-[#8B2626] text-white dark:bg-[#8B2626]'
                    : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
                }`}
              >
                FOUNDATION
              </button>
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className="px-2.5 py-0.5 cursor-pointer uppercase transition-colors text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]"
              >
                ADMIN
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-6">
          
          {/* Lewegene Logotype (Clean, Minimalist, Breathing) */}
          <div
            onClick={() => setZoomMode('overview')}
            className="cursor-pointer group flex flex-col"
          >
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[0.2em] text-[#201C18] dark:text-[#F4EFE6] leading-none transition-colors group-hover:text-[#8B2626]">
              LEWEGENE
            </h1>
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#9A7432] uppercase font-bold mt-1">
              ETHIOPIA · CIVIC TENDER
            </span>
          </div>

          {/* Core Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-3 font-mono text-xs font-black tracking-wider uppercase">
            <button
              type="button"
              onClick={() => setZoomMode('overview')}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                zoomMode === 'overview'
                  ? 'text-[#8B2626] dark:text-[#D8B066] border-b-2 border-[#8B2626] dark:border-[#D8B066]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
              }`}
            >
              HOME
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('discover')}
              className={`px-3 py-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                zoomMode === 'discover'
                  ? 'text-[#8B2626] dark:text-[#D8B066] border-b-2 border-[#8B2626] dark:border-[#D8B066]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
              }`}
            >
              <span>DISCOVER CAUSES</span>
              <span className="px-1.5 py-0.2 bg-[#8B2626] text-white text-[9px] font-bold rounded-xs">
                {campaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('vault')}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                zoomMode === 'vault'
                  ? 'text-[#8B2626] dark:text-[#D8B066] border-b-2 border-[#8B2626] dark:border-[#D8B066]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
              }`}
            >
              MY CONTRIBUTIONS
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('impact')}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                zoomMode === 'impact'
                  ? 'text-[#8B2626] dark:text-[#D8B066] border-b-2 border-[#8B2626] dark:border-[#D8B066]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
              }`}
            >
              FIELD IMPACT
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('treasury')}
              className={`px-3 py-2 transition-colors cursor-pointer ${
                zoomMode === 'treasury'
                  ? 'text-[#8B2626] dark:text-[#D8B066] border-b-2 border-[#8B2626] dark:border-[#D8B066]'
                  : 'text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
              }`}
            >
              FOUNDATION DESK
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Voxide Voice Assistant */}
            <button
              type="button"
              onClick={onOpenVoice}
              className="p-2 border border-[#8B2626]/60 bg-[#8B2626]/5 hover:bg-[#8B2626]/15 text-[#8B2626] dark:text-[#D8B066] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Speak with Voxide Voice Assistant"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline font-mono text-[10px] font-bold uppercase">VOXIDE</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              title="Toggle Parchment / Midnight Ink"
              className="p-2 border border-[#9A7432]/50 hover:bg-[#9A7432]/15 text-[#201C18] dark:text-[#D8B066] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setZoomMode('discover')}
              className="py-2.5 px-5 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#701E1E] transition-all cursor-pointer shadow-xs flex items-center gap-2 active:translate-y-px"
            >
              <span>EXPLORE CAUSES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MAIN CONTENT VIEWPORT: WIDESCREEN & MINIMALIST
          Content sits peacefully inside the wide living banknote paper world.
      ───────────────────────────────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full min-h-[calc(100vh-140px)] flex flex-col justify-between">
        
        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 1: OVERVIEW (HERO CINEMATIC: WIDE, MINIMALIST, HIGH USABILITY)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'overview' && (
          <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 py-12 lg:py-16 space-y-16 animate-in fade-in duration-300">
            
            {/* ── Wide Hero Section: Pure Negative Space & Authority ── */}
            <div className="max-w-4xl mx-auto text-center space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#9A7432]/40 bg-[#FCF9F2]/90 dark:bg-[#1E1A17]/90 text-[10px] font-mono font-bold tracking-[0.25em] text-[#9A7432] uppercase">
                <span>የኢትዮጵያ የሕዝብ ትብብር ሰነድ</span>
                <span>·</span>
                <span>NATIONAL CITIZEN SOLIDARITY TENDER</span>
              </div>

              <div className="space-y-3">
                <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#201C18] dark:text-[#F4EFE6] tracking-tight leading-none banknote-engraved-text">
                  LEWEGENE
                </h1>
                
                <p className="font-serif font-bold text-2xl sm:text-4xl text-[#8B2626] dark:text-[#D8B066] tracking-wide">
                  SUPPORTING ETHIOPIA’S PEOPLE &amp; PURPOSE
                </p>

                <p className="font-ethiopic text-lg sm:text-xl text-[#201C18]/80 dark:text-[#E8DEC8]/80 italic">
                  « ለወገን ደራሽ ወገን ነው። »
                </p>
              </div>

              <p className="font-sans text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                An authentic digital banknote printing direct citizen Birr into verified clean water boreholes,
                rural medical clinics, and school classrooms across Ethiopia. 100% verified by ACSO. Zero platform commissions.
              </p>

              {/* The Two Primary Hero Actions */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setZoomMode('discover')}
                  className="py-3.5 px-8 border-2 border-[#8B2626] bg-[#8B2626] text-white font-mono text-sm font-black tracking-widest uppercase hover:bg-[#701E1E] transition-all cursor-pointer shadow-md flex items-center gap-3 active:translate-y-px"
                >
                  <span>EXPLORE CAUSES</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setZoomMode('treasury')}
                  className="py-3.5 px-6 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FCF9F2]/90 dark:bg-[#1E1A17]/90 text-[#201C18] dark:text-[#F4EFE6] font-mono text-sm font-black tracking-wider uppercase hover:bg-[#EFE8D8] transition-all cursor-pointer"
                >
                  <span>FOR FOUNDATIONS</span>
                </button>
              </div>

            </div>

            {/* ── Delicate Centerpiece Engraving (Widescreen Monument) ── */}
            <div className="w-full max-w-4xl mx-auto relative border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FCF9F2]/70 dark:bg-[#1E1A17]/70 p-4 sm:p-6">
              <div className="absolute inset-1 border border-[#9A7432]/25 pointer-events-none" />
              <CentralMonumentEngraving />
              <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>INTAGLIO STEEL PLATE № 001</span>
                <span>MONUMENT OF SOLIDARITY &amp; MUTUAL AID</span>
                <span>ADDIS ABABA · ፳፻፲፰</span>
              </div>
            </div>

            {/* ── Clean Live Ledger Ticker (Printed Directly Into Paper) ── */}
            <div className="w-full max-w-5xl mx-auto py-6 border-y border-[#26211C]/20 dark:border-[#9A7432]/30 grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-center">
              
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-[#201C18] dark:text-[#D8B066]">
                  {totalRaised.toLocaleString()} ETB
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  TOTAL UNDERWRITTEN BIRR
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-[#201C18] dark:text-[#D8B066]">
                  {totalDonations.toLocaleString()}
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  COMMUNITY PATRONS
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-[#8B2626] dark:text-[#D8B066]">
                  100%
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  DIRECT TO BENEFICIARIES
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-[#201C18] dark:text-[#D8B066]">
                  {totalProjects}
                </p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  VERIFIED CAUSE PLATES
                </p>
              </div>

            </div>

            {/* ── Featured Cause Spotlight Vignette (Breathable, Clean, Unboxed) ── */}
            {activeSpotlight && (
              <div className="w-full max-w-5xl mx-auto p-6 sm:p-8 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FCF9F2]/80 dark:bg-[#1E1A17]/80 space-y-6">
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 border border-[#8B2626] bg-[#8B2626]/10 text-[#8B2626] dark:text-[#D8B066] font-mono text-[10px] font-bold uppercase">
                      FEATURED CAUSE VIGNETTE
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      № {activeSpotlight.serialCode || 'LW-0421'}
                    </span>
                  </div>

                  {/* Flipper Controls */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-500">
                      PLATE {(activePlateIndex % campaigns.length) + 1} OF {campaigns.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePlateIndex((prev) =>
                          campaigns.length > 0 ? (prev === 0 ? campaigns.length - 1 : prev - 1) : 0
                        )
                      }
                      className="p-1 border border-[#26211C]/30 dark:border-[#9A7432]/40 hover:bg-[#EFE8D8] cursor-pointer"
                      title="Previous Cause Plate"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePlateIndex((prev) =>
                          campaigns.length > 0 ? (prev + 1) % campaigns.length : 0
                        )
                      }
                      className="p-1 border border-[#26211C]/30 dark:border-[#9A7432]/40 hover:bg-[#EFE8D8] cursor-pointer"
                      title="Next Cause Plate"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Engraved Plate Artwork */}
                  <div className="lg:col-span-6 aspect-16/10 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE8D8] dark:bg-[#26201B] overflow-hidden relative">
                    {activeSpotlight.imageUrl ? (
                      <img
                        src={activeSpotlight.imageUrl}
                        alt={activeSpotlight.title}
                        className="w-full h-full object-cover filter contrast-110 saturate-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs">
                        ENGRAVED VIGNETTE
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none intaglio-overlay opacity-50" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#FAF6EE] dark:bg-[#141210] border border-[#26211C] text-[10px] font-mono font-bold uppercase text-[#8B2626] dark:text-[#D8B066]">
                      {activeSpotlight.category.toUpperCase()}
                    </div>
                  </div>

                  {/* Right Narrative & Direct Actions */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#201C18] dark:text-[#F4EFE6] leading-snug">
                        {activeSpotlight.title}
                      </h3>
                      <p className="font-mono text-xs text-[#8B2626] dark:text-[#D8B066] font-bold">
                        {activeSpotlight.organizationName || 'Accredited Civil Society Partner'}
                      </p>
                      <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#9A7432]" />
                        <span>{activeSpotlight.location || 'Addis Ababa, Ethiopia'}</span>
                      </p>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                      {activeSpotlight.story}
                    </p>

                    {/* Ruler Gauge */}
                    <div className="pt-2">
                      <BanknoteRulerGauge
                        percent={
                          activeSpotlight.goalAmount
                            ? Math.min(100, Math.round((activeSpotlight.raisedAmount / activeSpotlight.goalAmount) * 100))
                            : 0
                        }
                        raised={activeSpotlight.raisedAmount}
                        goal={activeSpotlight.goalAmount}
                      />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenPledge(activeSpotlight)}
                        className="py-3 px-6 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#701E1E] transition-colors cursor-pointer shadow-xs flex items-center gap-2 active:translate-y-px"
                      >
                        <span>SUPPORT THIS CAUSE</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDetail(activeSpotlight)}
                        className="py-3 px-4 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE8D8] dark:bg-[#26201B] text-[#201C18] dark:text-[#E8DEC8] font-mono text-xs font-bold uppercase hover:bg-[#E5DDCB] transition-colors cursor-pointer"
                      >
                        EXAMINE DETAILS
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            )}

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
                onClick={() => setZoomMode('overview')}
                className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FCF9F2] dark:bg-[#1E1A17] font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#EFE8D8] transition-colors cursor-pointer"
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

              <span className="font-mono text-xs font-black text-[#8B2626] dark:text-[#D8B066]">
                {filteredCampaigns.length} CAUSES AVAILABLE
              </span>
            </div>

            {/* Modern Search & Filters: Clean, Spacious, Usable */}
            <div className="p-6 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FCF9F2]/80 dark:bg-[#1E1A17]/80 space-y-4">
              
              {/* Search Field */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#9A7432] absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search causes by title, organization, location, or serial number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#26211C]/30 dark:border-[#4A3E33] bg-[#F7F2E7] dark:bg-[#26201B] font-mono text-xs text-[#201C18] dark:text-[#F4EFE6] placeholder:text-zinc-500 focus:outline-none focus:border-[#8B2626]"
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
                          ? 'border-[#8B2626] bg-[#8B2626] text-white'
                          : 'border-[#26211C]/25 bg-[#F7F2E7] dark:bg-[#26201B] text-[#201C18] dark:text-[#E8DEC8] hover:border-[#8B2626]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Funding Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">
                    STATUS:
                  </span>
                  {[
                    { id: 'all', label: 'ALL' },
                    { id: 'active', label: 'ACTIVE' },
                    { id: 'nearly_funded', label: 'NEARLY FUNDED' },
                    { id: 'completed', label: 'COMPLETED' },
                  ].map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setFundingStatusFilter(status.id as any)}
                      className={`px-2.5 py-1.5 border text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        fundingStatusFilter === status.id
                          ? 'border-[#26211C] bg-[#26211C] text-white dark:border-[#9A7432] dark:bg-[#9A7432] dark:text-[#141210]'
                          : 'border-[#26211C]/25 bg-[#F7F2E7] dark:bg-[#26201B] text-zinc-700 dark:text-zinc-300 hover:border-[#26211C]'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
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
              <div className="p-16 text-center border border-dashed border-[#26211C]/30 bg-[#FCF9F2]/70 dark:bg-[#1E1A17]/70 font-mono space-y-4">
                <p className="text-base font-bold text-[#8B2626]">
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
                  }}
                  className="px-5 py-2.5 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black uppercase cursor-pointer"
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
                onClick={() => setZoomMode('discover')}
                className="px-4 py-2 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#701E1E] transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← BACK TO CAUSES</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="banknote-serial-red text-sm font-black">
                  № {selectedCampaign.serialCode || 'LW-0421'}
                </span>
                <span className="px-2.5 py-0.5 border border-[#26211C]/40 text-[10px] font-mono font-bold uppercase">
                  {selectedCampaign.category.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 bg-[#8B2626] text-white text-[9px] font-mono font-bold uppercase">
                  ACSO VERIFIED
                </span>
              </div>
            </div>

            {/* Master Vignette Plate Details: 2 Balanced Wide Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left 7 Columns: Grand Engraved Artwork & Narrative */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Grand Engraved Illustration Frame */}
                <div className="relative aspect-16/10 w-full border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE8D8] dark:bg-[#26201B] overflow-hidden">
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
                  
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#FAF6EE]/95 dark:bg-[#141210]/95 border border-[#26211C] font-mono text-xs font-bold text-[#8B2626] dark:text-[#D8B066]">
                    VERIFIED COMMUNITY BENEFICIARIES: {selectedCampaign.beneficiariesTarget || 500} CITIZENS
                  </div>
                </div>

                {/* Narrative & Field Reports */}
                <div className="p-6 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FCF9F2]/80 dark:bg-[#1E1A17]/80 space-y-4">
                  <h3 className="font-serif font-black text-xl text-[#201C18] dark:text-[#F4EFE6] border-b border-[#26211C]/15 pb-2">
                    FIELD DIRECTIVE &amp; PROJECT STORY
                  </h3>
                  
                  <p className="font-sans text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {selectedCampaign.story}
                  </p>

                  <div className="p-4 border border-[#9A7432]/40 bg-[#F7F2E7]/80 dark:bg-[#26201B]/80 font-mono text-xs space-y-1">
                    <p className="font-bold text-[#8B2626] dark:text-[#D8B066] uppercase">
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
                    <ShieldCheck className="w-4 h-4 text-[#8B2626]" />
                    <span>CIVIL SOCIETY ACCREDITATION (ACSO REGISTRY)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="block text-zinc-400">REGISTRATION LICENSE:</span>
                      <span className="font-bold text-[#201C18] dark:text-[#F4EFE6]">ACSO-ET-58291/2026</span>
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
                
                <div className="p-6 sm:p-8 border-2 border-[#26211C] dark:border-[#9A7432] bg-[#FCF9F2] dark:bg-[#1E1A17] space-y-6">
                  
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-bold text-[#8B2626] dark:text-[#D8B066] tracking-wide uppercase">
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
                    <div className="p-3 border border-[#26211C]/20 bg-[#F7F2E7] dark:bg-[#26201B]">
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase">PATRONS</span>
                      <span className="text-lg font-black">{selectedCampaign.donationsCount || 0}</span>
                    </div>
                    <div className="p-3 border border-[#26211C]/20 bg-[#F7F2E7] dark:bg-[#26201B]">
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase">TARGET GOAL</span>
                      <span className="text-lg font-black">{selectedCampaign.goalAmount.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* UNMISSABLE PRIMARY ACTION: SUPPORT THIS CAUSE */}
                  <button
                    type="button"
                    onClick={() => handleOpenPledge(selectedCampaign)}
                    className="w-full py-4 border-2 border-[#8B2626] bg-[#8B2626] text-white font-mono text-sm font-black tracking-widest uppercase hover:bg-[#701E1E] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:translate-y-px"
                  >
                    <span>SUPPORT THIS CAUSE (PLEDGE BIRR)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center font-mono text-[10px] text-zinc-500 uppercase">
                    INSTANT COMMEMORATIVE DIGITAL BANKNOTE CERTIFICATE ISSUED UPON SETTLEMENT
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 4: PLEDGE / UNDERWRITING FLOW (4-STEP WIZARD)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'pledge' && selectedCampaign && (
          <div className="w-full max-w-3xl mx-auto px-6 sm:px-12 py-10 lg:py-16 space-y-8 animate-in fade-in duration-300">
            
            {/* Header with Clear Back Button */}
            <div className="flex items-center justify-between border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4">
              <button
                type="button"
                onClick={() => setZoomMode('detail')}
                className="px-4 py-2 border border-[#26211C]/30 bg-[#FCF9F2] dark:bg-[#1E1A17] font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#EFE8D8] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← BACK</span>
              </button>

              <div className="text-right font-mono">
                <span className="text-xs font-black text-[#8B2626]">
                  UNDERWRITING CAUSE № {selectedCampaign.serialCode || 'LW-0421'}
                </span>
              </div>
            </div>

            {/* 4-Step Progress Indicator (Printed Banknote Styling) */}
            <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center border-b border-[#26211C]/15 pb-4">
              {[
                { step: 1, label: '1 AMOUNT' },
                { step: 2, label: '2 DETAILS' },
                { step: 3, label: '3 REVIEW' },
                { step: 4, label: '4 CERTIFICATE' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`py-2 border font-bold uppercase transition-colors ${
                    pledgeStep === s.step
                      ? 'border-[#8B2626] bg-[#8B2626] text-white'
                      : pledgeStep > s.step
                      ? 'border-[#26211C]/40 bg-[#EFE8D8] text-[#201C18]'
                      : 'border-[#26211C]/20 bg-[#FCF9F2]/50 text-zinc-400'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* Step 1: Amount Selection */}
            {pledgeStep === 1 && (
              <div className="p-8 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FCF9F2] dark:bg-[#1E1A17] space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-2xl text-[#201C18] dark:text-[#F4EFE6]">
                    Select Underwriting Denomination
                  </h3>
                  <p className="font-mono text-xs text-zinc-500">
                    Every Birr underwritten is tracked directly to project milestones.
                  </p>
                </div>

                {/* Preset Denominations */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setPledgeAmount(amt);
                        setCustomAmountStr(String(amt));
                      }}
                      className={`p-4 border-2 font-black text-base cursor-pointer transition-all ${
                        pledgeAmount === amt
                          ? 'border-[#8B2626] bg-[#8B2626] text-white shadow-xs'
                          : 'border-[#26211C]/30 bg-[#F7F2E7] hover:border-[#8B2626]'
                      }`}
                    >
                      <span>{amt.toLocaleString()} ETB</span>
                      <span className="block text-[10px] font-ethiopic font-normal opacity-80">
                        {toGeezNumber(amt)} ብር
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                    OR ENTER CUSTOM AMOUNT (ETB):
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={customAmountStr}
                    onChange={(e) => {
                      setCustomAmountStr(e.target.value);
                      const parsed = parseInt(e.target.value, 10);
                      if (!isNaN(parsed) && parsed > 0) setPledgeAmount(parsed);
                    }}
                    className="w-full p-3 border border-[#26211C]/40 bg-[#F7F2E7] font-mono text-lg font-black focus:outline-none focus:border-[#8B2626]"
                  />
                </div>

                {/* Primary Continue Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPledgeStep(2)}
                    disabled={pledgeAmount <= 0}
                    className="py-3 px-8 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#701E1E] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>CONTINUE TO DETAILS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Patron Details & Payment Rail */}
            {pledgeStep === 2 && (
              <div className="p-8 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FCF9F2] dark:bg-[#1E1A17] space-y-6 font-mono text-xs">
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-2xl text-[#201C18] dark:text-[#F4EFE6]">
                    Patron Registry &amp; Clearing Rail
                  </h3>
                  <p className="text-zinc-500">
                    Specify how your name will appear on the minted commemorative banknote certificate.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      PATRON NAME (OR ANONYMOUS):
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Almaz Bekele"
                      className="w-full p-3 border border-[#26211C]/40 bg-[#F7F2E7] disabled:opacity-50 focus:outline-none focus:border-[#8B2626]"
                    />
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span>Record contribution anonymously in public ledger</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                      SOLIDARITY MESSAGE / NOTE:
                    </label>
                    <textarea
                      rows={2}
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      className="w-full p-3 border border-[#26211C]/40 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-2">
                      PAYMENT CLEARING RAIL:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'telebirr', name: 'TELEBIRR' },
                        { id: 'cbe_birr', name: 'CBE BIRR' },
                        { id: 'awash', name: 'AWASH BANK' },
                        { id: 'boa', name: 'BANK OF ABYSSINIA' },
                      ].map((rail) => (
                        <button
                          key={rail.id}
                          type="button"
                          onClick={() => setSelectedPaymentRail(rail.id as any)}
                          className={`p-3 border font-bold text-center cursor-pointer uppercase ${
                            selectedPaymentRail === rail.id
                              ? 'border-[#8B2626] bg-[#8B2626] text-white'
                              : 'border-[#26211C]/30 bg-[#F7F2E7] hover:border-[#8B2626]'
                          }`}
                        >
                          {rail.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15">
                  <button
                    type="button"
                    onClick={() => setPledgeStep(1)}
                    className="px-4 py-2 border border-[#26211C]/30 bg-[#EFE8D8] cursor-pointer"
                  >
                    ← BACK
                  </button>

                  <button
                    type="button"
                    onClick={() => setPledgeStep(3)}
                    className="py-3 px-8 border border-[#8B2626] bg-[#8B2626] text-white font-black tracking-widest uppercase hover:bg-[#701E1E] cursor-pointer flex items-center gap-2"
                  >
                    <span>REVIEW PLEDGE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {pledgeStep === 3 && (
              <div className="p-8 border-2 border-[#26211C] dark:border-[#9A7432] bg-[#FCF9F2] dark:bg-[#1E1A17] space-y-6 font-mono text-xs">
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-2xl text-[#201C18] dark:text-[#F4EFE6]">
                    Confirm Civic Promissory Underwrite
                  </h3>
                  <p className="text-zinc-500">
                    Review your details before issuing digital Birr into the community escrow.
                  </p>
                </div>

                <div className="p-4 border border-[#26211C]/20 bg-[#F7F2E7] space-y-3">
                  <div className="flex justify-between border-b border-[#26211C]/10 pb-2">
                    <span className="text-zinc-500">CAUSE:</span>
                    <span className="font-bold text-right">{selectedCampaign.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#26211C]/10 pb-2">
                    <span className="text-zinc-500">ORGANIZATION:</span>
                    <span className="font-bold">{selectedCampaign.organizationName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#26211C]/10 pb-2">
                    <span className="text-zinc-500">PATRON RECORD:</span>
                    <span className="font-bold">{isAnonymous ? 'Anonymous Patron' : donorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#26211C]/10 pb-2">
                    <span className="text-zinc-500">PAYMENT RAIL:</span>
                    <span className="font-bold uppercase text-emerald-700">{selectedPaymentRail} (DIRECT ESCROW)</span>
                  </div>
                  <div className="flex justify-between pt-1 text-base">
                    <span className="font-bold">TOTAL PLEDGE:</span>
                    <span className="font-black text-[#8B2626]">{pledgeAmount.toLocaleString()} ETB</span>
                  </div>
                </div>

                <div className="p-3 border border-[#9A7432]/40 bg-[#F7F2E7] text-[11px] text-zinc-600">
                  ★ 100% of your pledge will be transferred directly to verified community procurement. Zero platform fee is deducted.
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15">
                  <button
                    type="button"
                    onClick={() => setPledgeStep(2)}
                    className="px-4 py-2 border border-[#26211C]/30 bg-[#EFE8D8] cursor-pointer"
                  >
                    ← BACK
                  </button>

                  <button
                    type="button"
                    onClick={handleExecutePledge}
                    disabled={isPledging}
                    className="py-3.5 px-8 border-2 border-[#8B2626] bg-[#8B2626] text-white font-black tracking-widest uppercase hover:bg-[#701E1E] transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPledging ? <span>SETTLING ON-CHAIN...</span> : <span>CONFIRM CONTRIBUTION</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Minted Certificate Celebration */}
            {pledgeStep === 4 && (
              <div className="p-8 border-2 border-[#8B2626] bg-[#FCF9F2] dark:bg-[#1E1A17] text-center space-y-6 font-mono">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-[#8B2626] bg-[#8B2626]/10 flex items-center justify-center text-[#8B2626]">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-black text-3xl text-[#201C18] dark:text-[#F4EFE6]">
                    CONTRIBUTION CONFIRMED &amp; SEALED
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    Your promissory underwriting of {pledgeAmount.toLocaleString()} ETB has been cleared and printed into the national civic tender.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setZoomMode('discover')}
                    className="py-3 px-6 border border-[#26211C]/40 bg-[#EFE8D8] font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    EXPLORE MORE CAUSES
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomMode('vault')}
                    className="py-3 px-6 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#701E1E] cursor-pointer"
                  >
                    VIEW MY CONTRIBUTIONS
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            VIEW 5: MY CONTRIBUTIONS (PATRON VAULT)
        ══════════════════════════════════════════════════════════════════════════ */}
        {zoomMode === 'vault' && (
          <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-12 lg:px-20 py-10 lg:py-16 space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#26211C]/20 pb-4">
              <div>
                <h2 className="font-serif font-black text-3xl text-[#201C18] dark:text-[#F4EFE6]">
                  MY CONTRIBUTIONS
                </h2>
                <p className="font-mono text-xs text-zinc-500">
                  Your personal portfolio of minted digital banknote certificates and verified field impacts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setZoomMode('discover')}
                className="py-2.5 px-5 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black uppercase cursor-pointer"
              >
                + UNDERWRITE NEW CAUSE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-center">
              <div className="p-6 border border-[#26211C]/20 bg-[#FCF9F2] space-y-1">
                <span className="text-3xl font-black text-[#8B2626]">3,500 ETB</span>
                <span className="block text-[10px] text-zinc-500 uppercase font-bold">TOTAL UNDERWRITTEN</span>
              </div>
              <div className="p-6 border border-[#26211C]/20 bg-[#FCF9F2] space-y-1">
                <span className="text-3xl font-black">4</span>
                <span className="block text-[10px] text-zinc-500 uppercase font-bold">CAUSES BACKED</span>
              </div>
              <div className="p-6 border border-[#26211C]/20 bg-[#FCF9F2] space-y-1">
                <span className="text-3xl font-black text-emerald-700">100%</span>
                <span className="block text-[10px] text-zinc-500 uppercase font-bold">AUDIT VERIFIED</span>
              </div>
            </div>

            <div className="p-8 border border-dashed border-[#26211C]/30 bg-[#FCF9F2]/70 text-center font-mono space-y-3">
              <p className="font-bold text-sm">ARCHIVE OF MINTED CERTIFICATES</p>
              <p className="text-xs text-zinc-500">
                You can view, print, or download any of your minted contribution certificates at any time.
              </p>
            </div>
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
                <div key={c.id} className="p-6 border border-[#26211C]/25 bg-[#FCF9F2] space-y-4 font-mono">
                  <div className="flex justify-between text-xs font-bold border-b border-[#26211C]/10 pb-2">
                    <span className="text-[#8B2626]">№ {c.serialCode || 'LW-0421'}</span>
                    <span className="text-emerald-700">ACSO CLEARED</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl">{c.title}</h3>
                  <p className="text-xs text-zinc-600 line-clamp-2">{c.impactMetric}</p>
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
                onClick={() => setZoomMode('engrave')}
                className="py-2.5 px-6 border border-[#8B2626] bg-[#8B2626] text-white font-mono text-xs font-black uppercase cursor-pointer"
              >
                + CREATE NEW PROJECT
              </button>
            </div>

            {/* Foundation Project Creation Form */}
            <div className="p-8 border border-[#26211C]/30 bg-[#FCF9F2] space-y-6">
              <h3 className="font-serif font-bold text-2xl text-[#201C18]">
                REGISTER &amp; ENGRAVE NEW CAUSE PLATE
              </h3>
              
              <form onSubmit={handleCreateCauseSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">PROJECT TITLE:</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">SECTOR CATEGORY:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
                    >
                      <option value="water">CLEAN WATER</option>
                      <option value="education">EDUCATION</option>
                      <option value="medical">HEALTHCARE</option>
                      <option value="emergency">EMERGENCY</option>
                      <option value="business">ARTISANS</option>
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
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">GEOGRAPHIC LOCATION:</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-600 mb-1">TARGET BENEFICIARIES:</label>
                    <input
                      type="number"
                      required
                      value={newBeneficiaries}
                      onChange={(e) => setNewBeneficiaries(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
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
                    className="w-full p-2.5 border border-[#26211C]/30 bg-[#F7F2E7] focus:outline-none focus:border-[#8B2626]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingCause}
                    className="py-3 px-8 border border-[#8B2626] bg-[#8B2626] text-white font-black tracking-widest uppercase hover:bg-[#701E1E] cursor-pointer"
                  >
                    {isSubmittingCause ? 'ENGRAVING CAUSE...' : 'PUBLISH PROJECT TO CITIZENS'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MINIMALIST ENDORSEMENT FOOTER (FLOWS SEAMLESSLY OFF SCREEN)
      ───────────────────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full px-6 sm:px-12 lg:px-20 py-8 border-t border-[#26211C]/15 dark:border-[#9A7432]/20 bg-[#F6F1E5]/90 dark:bg-[#141210]/90 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-[#201C18] dark:text-[#F4EFE6] block">
              LEWEGENE CIVIC BANKNOTE · NATIONAL SOLIDARITY REPOSITORY
            </span>
            <span>ACSO ACCREDITATION NO. ET-58291 · ALL RIGHTS RESERVED 2026 / ፳፻፲፰</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setShowAcsoModal(true)}
              className="hover:text-[#8B2626] cursor-pointer"
            >
              ACSO REGULATION
            </button>
            <button
              type="button"
              onClick={onOpenScholarxiv}
              className="hover:text-[#8B2626] cursor-pointer"
            >
              ACADEMIC ARCHIVE
            </button>
            <span className="text-[#8B2626] font-bold">100% COMMUNITY OWNED</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
