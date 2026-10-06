/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Campaign, CampaignCategory, ContributionCertificate, Organization, PaymentRail } from './types/index.ts';
import { campaignApi } from './services/api/campaignApi.ts';
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
import MyReportsPage from './features/profile/MyReportsPage.tsx';
import { useAuthStore } from './features/auth/store/auth.store.ts';
import { LANGUAGE_CHANGED_EVENT } from './i18n/config.ts';
import { FoundationRegister } from './pages/FoundationRegister.tsx';
import { FoundationDashboard } from './pages/FoundationDashboard.tsx';
import { OrganizationProfile } from './pages/OrganizationProfile.tsx';
import { organizationService } from './services/organizationService.ts';
import { localizeErrorMessage } from './i18n/errorMessage.ts';
import { ErrorState } from './components/ErrorState.tsx';

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

type ToastMessage =
  | { key: string; values?: Record<string, string | number> }
  | { error: unknown; fallbackKey: string }
  | { text: string };

interface PlatformAppProps {
  initialMode?: 'overview' | 'discover' | 'detail' | 'pledge' | 'vault' | 'impact' | 'treasury' | 'engrave' | 'audit' | 'profile' | 'fundraising';
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
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('campaigns');
  const [userRole, setUserRole] = useState<'donor' | 'foundation'>('donor');
  const [causeActionSignIn, setCauseActionSignIn] = useState<'report' | 'save' | null>(null);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

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
  const [toast, setToast] = useState<{ message: ToastMessage; type: 'success' | 'info' } | null>(null);

  const showToast = (message: ToastMessage, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [publicCampaigns, orgList] = await Promise.all([
        campaignApi.getCampaigns(),
        campaignApi.getOrganizations(),
      ]);
      const pendingList = user?.role === 'admin'
        ? await campaignApi.getAdminCampaigns()
        : [];
      setCampaigns(publicCampaigns);
      setPendingCampaigns(pendingList);
      setOrganizations(orgList);
      if (user?.role === 'foundation') {
        setCurrentOrganization(await organizationService.getByUserId(user.id, user.email));
      } else {
        setCurrentOrganization(null);
      }
      if (initialMode === 'pledge' && !initialCampaignId && publicCampaigns.length > 0) {
        setSelectedCampaign(publicCampaigns[0]);
      }
    } catch (err: any) {
      setError(localizeErrorMessage(t, err, 'notifications.campaignLoadFailed'));
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
    showToast({
      key: 'notifications.donationReceived',
      values: {
        amount: payload.amount.toLocaleString(),
        rail: payload.paymentRail.toUpperCase(),
      },
    });
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
      showToast({
        key: 'notifications.voiceDonationReceived',
        values: { amount: payload.amount.toLocaleString() },
      });

      const updated = await campaignApi.getCampaignById(payload.campaignId);
      setSelectedCampaign(updated);
      setCurrentView('detail');
    } catch (err: any) {
      showToast(
        { error: err, fallbackKey: 'notifications.paymentFailed' },
        'info'
      );
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
    if (currentOrganization && currentOrganization.verificationStatus !== 'approved') {
      showToast({ key: 'notifications.organizationPending' }, 'info');
      throw new Error('Organization must be verified before publishing a cause.');
    }

    const created = await campaignApi.createCampaign(
      {
        ...payload,
        organizationId: currentOrganization?.id,
        organizationName: currentOrganization?.name,
      },
      autoApprove
    );

    await loadData();

    showToast({ key: 'notifications.causePublished', values: { title: created.title } });
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
      showToast({ key: 'notifications.voiceCausePublished', values: { title: created.title } });
      setSelectedCampaign(created);
      setCurrentView('detail');
    } catch (err: any) {
      showToast(
        { error: err, fallbackKey: 'notifications.creationFailed' },
        'info'
      );
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Quick Demo Tour Switcher for Judges / Reviewers
  // Admin moderation handlers
  const handleAdminApprove = async (id: string) => {
    await campaignApi.updateCampaignStatus(id, 'approved');
    await loadData();
    showToast({ key: 'notifications.causeApproved' });
  };

  const handleAdminReject = async (id: string) => {
    await campaignApi.updateCampaignStatus(id, 'rejected');
    await loadData();
    showToast({ key: 'notifications.causeRejected' });
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
        isDataLoading={isLoading}
        dataError={error}
        onRetryData={loadData}
        onRequireLogin={(action) => {
          if (action === 'report' || action === 'save') {
            setCauseActionSignIn(action);
            return;
          }
          navigate('/login');
        }}
        onFoundationAccessDenied={() => navigate('/organizations/register')}
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

      <AuthModal
        isOpen={causeActionSignIn !== null}
        defaultMode="login"
        description={
          causeActionSignIn === 'save'
            ? 'Sign in to save this cause.'
            : 'Sign in to report this cause.'
        }
        onClose={() => setCauseActionSignIn(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-surface text-primary rounded-xl p-4 shadow-2xl border border-[#B08A45]/40 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-1 bg-[#173C32]/10 text-accent rounded-md shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-primary">{t('notifications.platformUpdate')}</p>
            <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {'key' in toast.message
                ? t(toast.message.key, toast.message.values)
                : 'error' in toast.message
                  ? localizeErrorMessage(t, toast.message.error, toast.message.fallbackKey)
                  : toast.message.text}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            aria-label={t('common.dismiss', 'Dismiss notification')}
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

function SignInRequiredRoute({
  children,
  description,
}: {
  children: React.ReactNode;
  description: string;
}) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div className="min-h-screen bg-[#F2ECE1] dark:bg-[#080706]" aria-hidden="true" />
      )}
      <AuthModal
        isOpen={!isAuthenticated}
        defaultMode="login"
        description={description}
        closeOnSuccess={false}
        onClose={() => navigate('/')}
      />
    </>
  );
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

function OrganizationRegisterRoute() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F2ECE1] dark:bg-[#080706] text-[#201C18] dark:text-[#F4EFE6] px-4 py-8">
      <FoundationRegister
        onSuccess={(org) => navigate(`/organizations/${org.id}`)}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}

function OrganizationProfileRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [org, setOrg] = useState<Organization | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      organizationService.getById(id || ''),
      campaignApi.getAllCampaigns(),
    ]).then(([foundOrg, allCampaigns]) => {
      if (!active) return;
      setOrg(foundOrg);
      setCampaigns(allCampaigns);
    }).catch((cause: unknown) => {
      if (active) setError(localizeErrorMessage(t, cause, 'notifications.campaignLoadFailed'));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, retryKey, t]);

  if (loading) {
    return <div className="p-12 text-center font-mono text-xs">{t('notifications.loadingOrganization')}</div>;
  }

  if (error) {
    return <div className="min-h-screen px-4 py-8"><ErrorState message={error} onRetry={() => setRetryKey((key) => key + 1)} /></div>;
  }

  if (!org) {
    return (
      <div className="p-12 text-center font-mono text-xs space-y-4">
        <p>{t('notifications.organizationNotFound')}</p>
        <button onClick={() => navigate('/')} className="underline cursor-pointer">{t('notifications.backHome')}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2ECE1] dark:bg-[#080706] text-[#201C18] dark:text-[#F4EFE6] px-4 py-8">
      <OrganizationProfile
        organization={org}
        campaigns={campaigns}
        onBack={() => navigate('/')}
        onSelectCampaign={(c) => navigate(`/causes/${c.id}`)}
      />
    </div>
  );
}

function FoundationDeskRoute() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [org, setOrg] = useState<Organization | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const orgList = await organizationService.list();
        const myOrg =
          orgList.find(
            (o) =>
              o.id === user?.organizationId ||
              (user?.email && o.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
              o.userId === user?.id
          ) || orgList[0];
        const camps = await campaignApi.getAllCampaigns();
        if (!active) return;
        setOrg(myOrg || null);
        setCampaigns(camps);
      } catch (cause) {
        if (active) setError(localizeErrorMessage(t, cause, 'notifications.campaignLoadFailed'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, retryKey, t]);

  if (loading) {
    return <div className="p-12 text-center font-mono text-xs">{t('notifications.loadingFoundation')}</div>;
  }

  if (error) {
    return <div className="min-h-screen px-4 py-8"><ErrorState message={error} onRetry={() => setRetryKey((key) => key + 1)} /></div>;
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-[#F2ECE1] dark:bg-[#080706] text-[#201C18] dark:text-[#F4EFE6] px-4 sm:px-6 py-8 text-center font-mono text-xs space-y-4">
        <p>{t('notifications.noOrganization')}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => navigate('/')} className="underline cursor-pointer">
            ← {t('nav.backToHome')}
          </button>
          <button onClick={() => navigate('/organizations/register')} className="underline cursor-pointer">
            {t('notifications.registerOrganization')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2ECE1] dark:bg-[#080706] text-[#201C18] dark:text-[#F4EFE6] px-4 sm:px-6 py-8">
      <FoundationDashboard
        organization={org}
        campaigns={campaigns}
        onSelectCampaign={(c) => navigate(`/causes/${c.id}`)}
        onCreateCampaign={() => navigate('/fundraise')}
        onManageCampaign={(c) => navigate(`/causes/${c.id}`)}
        onViewContributions={() => navigate('/contributions')}
        onViewImpact={() => navigate('/impact')}
        onViewProfile={() => navigate(`/organizations/${org.id}`)}
        onOrganizationUpdated={(updated) => setOrg(updated)}
        onBack={() => navigate('/')}
      />
    </div>
  );
}

export default function App() {
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
          <Route path="/organizations/register" element={<OrganizationRegisterRoute />} />
          <Route path="/organizations/:id" element={<OrganizationProfileRoute />} />
          <Route path="/foundation" element={<FoundationDeskRoute />} />
          <Route
            path="/fundraise"
            element={
              <SignInRequiredRoute description="Sign in to start fundraising and manage your campaigns.">
                <PlatformApp initialMode="fundraising" />
              </SignInRequiredRoute>
            }
          />
          <Route
            path="/fundraising"
            element={
              <SignInRequiredRoute description="Sign in to start fundraising and manage your campaigns.">
                <PlatformApp initialMode="fundraising" />
              </SignInRequiredRoute>
            }
          />
          <Route
            path="/donations"
            element={<PlatformApp initialMode="pledge" />}
          />
          <Route path="/donations/:id" element={<CauseRoute mode="pledge" />} />
          <Route path="/contributions" element={<PlatformApp initialMode="vault" />} />
          <Route path="/my-donations" element={<PlatformApp initialMode="vault" />} />
          <Route path="/profile" element={<PlatformApp initialMode="profile" />} />
          <Route
            path="/reports"
            element={
              <SignInRequiredRoute description="Sign in to view and submit your cause reports.">
                <MyReportsPage />
              </SignInRequiredRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <SignInRequiredRoute description="Sign in to view and submit your cause reports.">
                <MyReportsPage />
              </SignInRequiredRoute>
            }
          />
          <Route path="/impact" element={<PlatformApp initialMode="impact" />} />
          <Route path="/voxide" element={<PlatformApp openVoice />} />
          <Route path="*" element={<PlatformApp />} />
        </Routes>
      </>
    </BrowserRouter>
  );
}
