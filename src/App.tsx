/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router';
import { Campaign, CampaignCategory, ContributionCertificate, Organization, PaymentRail } from './types/index.ts';
import { campaignApi } from './services/api/campaignApi.ts';
import { INITIAL_CAMPAIGNS } from './data/mockCampaigns.ts';
import { INITIAL_ORGANIZATIONS } from './data/mockOrganizations.ts';
import { BanknoteMasterCanvas } from './components/banknote/BanknoteMasterCanvas.tsx';
import { VoxideBar } from './components/voice/VoxideBar.tsx';
import { VoiceCampaignModal } from './components/voice/VoiceCampaignModal.tsx';
import { VoiceDonationModal } from './components/voice/VoiceDonationModal.tsx';
import { ScholarxivDrawer } from './components/research/ScholarxivDrawer.tsx';
import { ContributionCertificateModal } from './components/campaign/ContributionCertificateModal.tsx';

import { VoxideExtraction } from './services/voice/voxideService.ts';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { VoxideAssistant } from './features/voxide';
import { AuthModal } from './features/auth/components/AuthModal.tsx';
import { useAuth } from './features/auth/hooks/useAuth.ts';
import { AdminPortal } from './features/admin/pages/AdminPortal.tsx';
import FundraisingApp from './features/fundraising/FundraisingApp.tsx';
import ProfilePage from './features/profile/ProfilePage.tsx';
import MyReportsPage from './features/profile/MyReportsPage.tsx';
import { DemoRoleSwitcher } from './features/auth/components/DemoRoleSwitcher.tsx';
import { DEMO_ACCOUNTS, DEMO_SESSION_TOKEN, type DemoRole } from './features/auth/data/demoAccounts.ts';
import { useAuthStore } from './features/auth/store/auth.store.ts';
import { LANGUAGE_CHANGED_EVENT } from './i18n/config.ts';

export type AppView =
  | 'campaigns'
  | 'detail'
  | 'create'
  | 'admin'
  | 'donor_dashboard'
  | 'foundation_landing'
  | 'foundation_register'
  | 'foundation_dashboard'
  | 'foundation_manage'
  | 'foundation_contributions'
  | 'foundation_impact'
  | 'organization_profile';

interface PlatformAppProps {
  initialMode?: 'overview' | 'discover' | 'detail' | 'pledge' | 'vault' | 'impact' | 'treasury' | 'engrave' | 'audit';
  initialCampaignId?: string;
  authMode?: 'login' | 'signup';
  openVoice?: boolean;
}

function PlatformApp({
  initialMode = 'overview',
  initialCampaignId,
  authMode,
  openVoice = false,
}: PlatformAppProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('campaigns');
  const [userRole, setUserRole] = useState<'donor' | 'foundation'>('donor');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    return INITIAL_CAMPAIGNS.filter((c) => c.status === 'approved');
  });
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>(() => {
    return INITIAL_CAMPAIGNS.filter((c) => c.status === 'pending');
  });
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(INITIAL_ORGANIZATIONS[0] || null);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<ContributionCertificate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Voxide Voice Modal states
  const [isVoiceBarOpen, setIsVoiceBarOpen] = useState<boolean>(false);
  const [voiceCampaignData, setVoiceCampaignData] = useState<NonNullable<VoxideExtraction['campaignData']> | null>(null);
  const [voiceDonationData, setVoiceDonationData] = useState<NonNullable<VoxideExtraction['donationData']> | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);

  // Scholarxiv Ideation Trail Drawer
  const [isScholarxivOpen, setIsScholarxivOpen] = useState<boolean>(false);

  // Multi-language state (Rule 7: Amharic is the default display language)
  const [language, setLanguage] = useState<'en' | 'am' | 'om'>(() => {
    try {
      return (localStorage.getItem('lewegene_language') as any) || 'am';
    } catch {
      return 'am';
    }
  });

  // Keep local state in sync whenever any navbar (or Voxide) switches language.
  useEffect(() => {
    const handleLanguageChanged = (event: Event) => {
      const detail = (event as CustomEvent<'am' | 'en' | 'om'>).detail;
      if (detail === 'am' || detail === 'en' || detail === 'om') setLanguage(detail);
    };
    window.addEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChanged);
    return () => window.removeEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChanged);
  }, []);

  // Daylight Ivory / Midnight Dark Slate Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lewegene_theme');
      if (saved) return saved === 'dark';
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('lewegene_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('lewegene_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [approvedList, pendingList, orgList] = await Promise.all([
        campaignApi.getCampaigns({ status: 'approved' }),
        campaignApi.getAdminCampaigns(),
        campaignApi.getOrganizations(),
      ]);
      setCampaigns(approvedList);
      setPendingCampaigns(pendingList);
      setOrganizations(orgList);
      if (orgList.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgList[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setIsVoiceBarOpen(openVoice);
  }, [openVoice]);

  // Handler: Select a single campaign
  const handleSelectCampaign = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Support / Donation flow with Certificate Generation
  const handleDonate = async (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => {
    if (!selectedCampaign) return;

    const res = await campaignApi.submitDonation(selectedCampaign.id, payload);
    setSelectedCampaign(res.campaign);
    setActiveCertificate(res.certificate);
    showToast(
      `Received ${payload.amount.toLocaleString()} ETB via ${payload.paymentRail.toUpperCase()}. Official certificate generated!`
    );
    await loadData();
    return res;
  };

  // Handler: Confirm Voice Donation
  const handleConfirmVoiceDonation = async (payload: {
    campaignId: string;
    amount: number;
    donorName: string;
    message: string;
    paymentRail: PaymentRail;
  }) => {
    setIsProcessingVoice(true);
    try {
      const res = await campaignApi.submitDonation(payload.campaignId, {
        amount: payload.amount,
        donorName: payload.donorName,
        message: payload.message,
        paymentRail: payload.paymentRail,
      });

      setVoiceDonationData(null);
      await loadData();
      setActiveCertificate(res.certificate);
      showToast(
        `Voice-authorized ${payload.amount.toLocaleString()} ETB donation verified! Archival certificate ready.`
      );

      const updated = await campaignApi.getCampaignById(payload.campaignId);
      setSelectedCampaign(updated);
      setCurrentView('detail');
    } catch (err: any) {
      showToast(err.message || 'Payment failed', 'info');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Handler: Create Campaign (Standard / Multi-step Form)
  const handleCreateCampaign = async (
    payload: {
      title: string;
      story: string;
      goalAmount: number;
      category: CampaignCategory;
      creatorName: string;
      location: string;
      imageUrl?: string;
      impactMetric?: string;
      beneficiariesTarget?: number;
    },
    autoApprove: boolean
  ) => {
    const created = await campaignApi.createCampaign(
      {
        ...payload,
        organizationId: currentOrganization?.id,
        organizationName: currentOrganization?.name,
      },
      autoApprove
    );

    await loadData();

    showToast(`Cause "${created.title}" published immediately to the public discovery feed!`);
    setSelectedCampaign(created);
    setCurrentView('detail');
  };

  // Handler: Confirm Voice Campaign Creation
  const handleConfirmVoiceCampaign = async (data: {
    title: string;
    story: string;
    goalAmount: number;
    category: CampaignCategory;
    creatorName: string;
  }) => {
    setIsProcessingVoice(true);
    try {
      const created = await campaignApi.createCampaign(
        {
          title: data.title,
          story: data.story,
          goalAmount: data.goalAmount,
          category: data.category,
          creatorName: data.creatorName,
          imageUrl: '/src/assets/images/ethiopia_school_stem_1790266427111.jpg',
          location: 'Addis Ababa, Ethiopia',
        },
        true
      );

      setVoiceCampaignData(null);
      await loadData();
      showToast(`Voice cause "${created.title}" successfully confirmed & published!`);
      setSelectedCampaign(created);
      setCurrentView('detail');
    } catch (err: any) {
      showToast(err.message || 'Creation failed', 'info');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Quick Demo Tour Switcher for Judges / Reviewers
  const handleTriggerDemoTour = (tourType: 'donor' | 'foundation' | 'connected') => {
    if (tourType === 'donor') {
      setUserRole('donor');
      if (campaigns.length > 0) {
        handleSelectCampaign(campaigns[0]);
        showToast('Demo Tour: Opened Bethlehem Cardiac Surgery cause. Click "Make a Contribution" to see the archival certificate flow!');
      }
    } else if (tourType === 'foundation') {
      setUserRole('foundation');
      setCurrentView('foundation_dashboard');
      showToast('Demo Tour: Entered Foundation Console. Manage active projects, inspect recent donations, and view impact.');
    } else if (tourType === 'connected') {
      setUserRole('foundation');
      setCurrentView('create');
      showToast('Demo Tour: Create a cause in Foundation view → watch it appear instantly in Donor view!');
    }
  };

  // Admin moderation handlers
  const handleAdminApprove = async (id: string) => {
    await campaignApi.updateCampaignStatus(id, 'approved');
    await loadData();
    showToast('Cause approved and published to the public feed.');
  };

  const handleAdminReject = async (id: string) => {
    await campaignApi.updateCampaignStatus(id, 'rejected');
    await loadData();
    showToast('Cause rejected and archived.');
  };

  // Voxide Voice Assistant Capabilities Event Listeners
  useEffect(() => {
    const handleVoxideNav = (e: any) => {
      const page = e.detail?.page?.toLowerCase();
      if (!page) return;
      if (page === 'campaigns' || page === 'explore' || page === 'causes' || page === 'discover') {
        setSelectedCampaign(null);
        setCurrentView('campaigns');
      } else if (page === 'detail' || page === 'pledge') {
        if (!selectedCampaign && campaigns.length > 0) {
          setSelectedCampaign(campaigns[0]);
        }
        setCurrentView('detail');
      } else if (page === 'create' || page === 'start_cause') {
        setCurrentView('create');
      } else if (page === 'admin' || page === 'compliance') {
        setCurrentView('admin');
      } else if (page === 'donor_dashboard' || page === 'vault' || page === 'my_contributions') {
        setUserRole('donor');
        setCurrentView('donor_dashboard');
      } else if (page.startsWith('foundation')) {
        setUserRole('foundation');
        setCurrentView(page as AppView);
      }
    };

    const handleVoxideLang = (e: any) => {
      const newLang = e.detail?.language;
      if (newLang === 'am' || newLang === 'en' || newLang === 'om') {
        setLanguage(newLang);
      }
    };

    const handleVoxideDonation = async (e: any) => {
      const { amount, campaignId, donorName, paymentRail = 'telebirr' } = e.detail || {};
      const target = campaignId
        ? campaigns.find((c) => c.id === campaignId) || campaigns[0]
        : (selectedCampaign || campaigns[0]);
      if (target) {
        setSelectedCampaign(target);
        await handleDonate({
          amount: Number(amount) || 100,
          donorName: donorName || 'Anonymous Patron',
          paymentRail,
          message: 'Voice Pledge via Voxide',
        });
      }
    };

    window.addEventListener('voxide:navigate' as any, handleVoxideNav);
    window.addEventListener('voxide:language' as any, handleVoxideLang);
    window.addEventListener('voxide:start_donation' as any, handleVoxideDonation);
    return () => {
      window.removeEventListener('voxide:navigate' as any, handleVoxideNav);
      window.removeEventListener('voxide:language' as any, handleVoxideLang);
      window.removeEventListener('voxide:start_donation' as any, handleVoxideDonation);
    };
  }, [campaigns, selectedCampaign]);

  return (
    <div className={`min-h-screen bg-[#F2ECE1] dark:bg-[#080706] text-[#201C18] dark:text-[#F4EFE6] font-sans selection:bg-[#9A7432]/30 selection:text-[#1E4D38] transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Living Ethiopian Banknote Master Sheet */}
      <BanknoteMasterCanvas
        campaigns={campaigns}
        pendingCampaigns={pendingCampaigns}
        currentOrganization={currentOrganization}
        organizations={organizations}
        initialMode={initialMode}
        initialCampaignId={initialCampaignId}
        isAuthenticated={isAuthenticated}
        canAccessFoundation={user?.role === 'foundation' || user?.role === 'admin'}
        onRequireLogin={() => navigate('/login')}
        onFoundationAccessDenied={() => navigate('/signup')}
        onDonate={handleDonate}
        onApproveCampaign={handleAdminApprove}
        onRejectCampaign={handleAdminReject}
        onCreateCampaign={async (data) => handleCreateCampaign(data as any, true)}
        onOpenVoice={() => {
          setIsVoiceBarOpen(true);
          navigate('/voxide');
        }}
        onOpenScholarxiv={() => setIsScholarxivOpen(true)}
        language={language}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onDonationCompleted={(cert) => setActiveCertificate(cert)}
      />

      {/* Signature Digital Contribution Certificate Modal */}
      <ContributionCertificateModal
        certificate={activeCertificate}
        isOpen={!!activeCertificate}
        onClose={() => setActiveCertificate(null)}
        onViewDashboard={() => {
          setActiveCertificate(null);
          setUserRole('donor');
          setCurrentView('donor_dashboard');
        }}
        onExploreMore={() => {
          setActiveCertificate(null);
          setSelectedCampaign(null);
          setCurrentView('campaigns');
        }}
      />

      {/* Voxide Voice Assistant Dock */}
      <VoxideBar
        isOpen={isVoiceBarOpen}
        onClose={() => {
          setIsVoiceBarOpen(false);
          if (openVoice) navigate('/');
        }}
        campaigns={campaigns}
        language={language}
        onExtractedCreation={(data) => setVoiceCampaignData(data)}
        onExtractedDonation={(data) => setVoiceDonationData(data)}
      />

      {/* Voice Modals */}
      <VoiceCampaignModal
        isOpen={!!voiceCampaignData}
        onClose={() => setVoiceCampaignData(null)}
        initialData={voiceCampaignData}
        onConfirm={handleConfirmVoiceCampaign}
        isLoading={isProcessingVoice}
      />

      <VoiceDonationModal
        isOpen={!!voiceDonationData}
        onClose={() => setVoiceDonationData(null)}
        donationData={voiceDonationData}
        campaigns={campaigns}
        onConfirmDonation={handleConfirmVoiceDonation}
        isLoading={isProcessingVoice}
      />

      {/* Scholarxiv Ideation Trail Drawer */}
      <ScholarxivDrawer
        isOpen={isScholarxivOpen}
        onClose={() => setIsScholarxivOpen(false)}
      />

      {/* Voxide Official Voice Assistant */}
      <VoxideAssistant />

      <AuthModal
        isOpen={!!authMode}
        defaultMode={authMode === 'signup' ? 'register' : 'login'}
        onClose={() => navigate('/')}
        onSuccess={() => navigate('/')}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-surface text-primary rounded-xl p-4 shadow-2xl border border-[#B08A45]/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-1 bg-[#173C32]/10 text-accent rounded-md shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-primary">Lewegene Platform Update</p>
            <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-zinc-400 hover:text-primary text-xs p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

function CauseRoute({ mode = 'detail' }: { mode?: 'detail' | 'pledge' }) {
  const { id } = useParams();
  return <PlatformApp initialMode={mode} initialCampaignId={id} />;
}

function AdminRoute() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('lewegene_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('lewegene_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <AdminPortal
      isDark={isDark}
      onToggleTheme={() => setIsDark((current) => !current)}
      onExit={() => navigate('/')}
    />
  );
}

function DemoEntryRoute() {
  const { role: roleParam } = useParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const role = roleParam?.toLowerCase() as DemoRole | undefined;
    if (!role || !Object.prototype.hasOwnProperty.call(DEMO_ACCOUNTS, role)) {
      navigate('/profile', { replace: true });
      return;
    }
    setUser(DEMO_ACCOUNTS[role], DEMO_SESSION_TOKEN);
    const destination = role === 'admin' ? '/admin' : role === 'fundraiser' ? '/fundraising' : '/profile';
    navigate(destination, { replace: true });
  }, [navigate, roleParam, setUser]);

  return <div className="grid min-h-screen place-items-center bg-[#F7F2E7] font-mono text-xs uppercase tracking-widest text-[#1E4D38] dark:bg-[#12100E] dark:text-[#52B788]">Opening local demo workspace…</div>;
}

export default function App() {
  const firstCampaign = INITIAL_CAMPAIGNS.find((campaign) => campaign.status === 'approved');

  return (
    <BrowserRouter>
      <>
        <Routes>
          <Route path="/" element={<PlatformApp />} />
          <Route path="/home" element={<PlatformApp />} />
          <Route path="/discover" element={<PlatformApp initialMode="discover" />} />
          <Route path="/causes" element={<PlatformApp initialMode="discover" />} />
          <Route path="/causes/:id" element={<CauseRoute />} />
          <Route path="/campaigns/:id" element={<CauseRoute />} />
          <Route path="/admin/*" element={<AdminRoute />} />
          <Route path="/login" element={<PlatformApp authMode="login" />} />
          <Route path="/signup" element={<PlatformApp authMode="signup" />} />
          <Route path="/fundraise" element={<FundraisingApp />} />
          <Route path="/fundraising" element={<FundraisingApp />} />
          <Route
            path="/donations"
            element={<PlatformApp initialMode="pledge" initialCampaignId={firstCampaign?.id} />}
          />
          <Route path="/donations/:id" element={<CauseRoute mode="pledge" />} />
          <Route path="/contributions" element={<PlatformApp initialMode="vault" />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reports" element={<MyReportsPage />} />
          <Route path="/demo" element={<ProfilePage />} />
          <Route path="/demo/:role" element={<DemoEntryRoute />} />
          <Route path="/impact" element={<PlatformApp initialMode="impact" />} />
          <Route path="/voxide" element={<PlatformApp openVoice />} />
          <Route path="*" element={<PlatformApp />} />
        </Routes>
        <DemoRoleSwitcher />
      </>
    </BrowserRouter>
  );
}
