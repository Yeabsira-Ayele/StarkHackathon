/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

export default function App() {
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

  // Multi-language state
  const [language, setLanguage] = useState<'en' | 'am' | 'om'>('en');

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

  return (
    <div className={`min-h-screen bg-[#F6F1E5] dark:bg-[#141210] text-[#201C18] dark:text-[#F4EFE6] font-sans selection:bg-[#9A7432]/30 selection:text-[#8B2626] transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Living Ethiopian Banknote Master Sheet */}
      <BanknoteMasterCanvas
        campaigns={campaigns}
        pendingCampaigns={pendingCampaigns}
        currentOrganization={currentOrganization}
        onDonate={handleDonate}
        onApproveCampaign={handleAdminApprove}
        onRejectCampaign={handleAdminReject}
        onCreateCampaign={async (data) => handleCreateCampaign(data as any, true)}
        onOpenVoice={() => setIsVoiceBarOpen(true)}
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
        onClose={() => setIsVoiceBarOpen(false)}
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
