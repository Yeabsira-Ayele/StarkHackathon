/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Campaign, CampaignCategory, PaymentRail } from './types/index.ts';
import { campaignApi } from './services/api/campaignApi.ts';
import { Navigation } from './components/common/Navigation.tsx';
import { Footer } from './components/common/Footer.tsx';
import { VoxideBar } from './components/voice/VoxideBar.tsx';
import { VoiceCampaignModal } from './components/voice/VoiceCampaignModal.tsx';
import { VoiceDonationModal } from './components/voice/VoiceDonationModal.tsx';
import { ScholarxivDrawer } from './components/research/ScholarxivDrawer.tsx';
import { CampaignList } from './pages/CampaignList.tsx';
import { CampaignDetail } from './pages/CampaignDetail.tsx';
import { CreateCampaign } from './pages/CreateCampaign.tsx';
import { AdminApproval } from './pages/AdminApproval.tsx';
import { VoxideExtraction } from './services/voice/voxideService.ts';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'campaigns' | 'detail' | 'create' | 'admin'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Voxide Voice Modal states
  const [isVoiceBarOpen, setIsVoiceBarOpen] = useState<boolean>(false);
  const [voiceCampaignData, setVoiceCampaignData] = useState<NonNullable<VoxideExtraction['campaignData']> | null>(null);
  const [voiceDonationData, setVoiceDonationData] = useState<NonNullable<VoxideExtraction['donationData']> | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);

  // Scholarxiv Ideation Trail Drawer
  const [isScholarxivOpen, setIsScholarxivOpen] = useState<boolean>(false);

  // Multi-language state (English baseline, Amharic, Afaan Oromoo)
  const [language, setLanguage] = useState<'en' | 'am' | 'om'>('en');

  // Night and Day View (Dark Mode) State
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lewegene_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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

  // Floating Toast Notification
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
      const [approvedList, pendingList] = await Promise.all([
        campaignApi.getCampaigns({ status: 'approved' }),
        campaignApi.getAdminCampaigns(),
      ]);
      setCampaigns(approvedList);
      setPendingCampaigns(pendingList);
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

  // Handler: Standard / Voice Donation
  const handleDonate = async (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => {
    if (!selectedCampaign) return;

    const res = await campaignApi.submitDonation(selectedCampaign.id, payload);
    setSelectedCampaign(res.campaign);
    showToast(
      `Received ${payload.amount.toLocaleString()} ETB via Links.et (${payload.paymentRail.toUpperCase()}). Progress bar updated!`
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
      showToast(
        `Voice-authorized ${payload.amount.toLocaleString()} ETB donation verified via Links.et!`
      );

      // Transition to updated campaign
      const updated = await campaignApi.getCampaignById(payload.campaignId);
      setSelectedCampaign(updated);
      setCurrentView('detail');
    } catch (err: any) {
      showToast(err.message || 'Payment failed', 'info');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Handler: Create Campaign (Standard Form)
  const handleCreateCampaign = async (
    payload: {
      title: string;
      story: string;
      goalAmount: number;
      category: CampaignCategory;
      creatorName: string;
      location: string;
      imageUrl?: string;
    },
    autoApprove: boolean
  ) => {
    const created = await campaignApi.createCampaign(payload, autoApprove);
    await loadData();

    if (autoApprove) {
      showToast(`Campaign "${created.title}" published immediately to the public feed!`);
      setSelectedCampaign(created);
      setCurrentView('detail');
    } else {
      showToast(
        `Campaign submitted. Marked "Pending" for review in Admin Console (Section 16).`
      );
      setCurrentView('admin');
    }
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
          imageUrl: '/src/assets/images/ethiopia_clean_water_1790266442202.jpg',
          location: 'Addis Ababa, Ethiopia',
        },
        true // Auto-approve voice creation for hackathon live demo flow
      );

      setVoiceCampaignData(null);
      await loadData();
      showToast(`Voice campaign "${created.title}" successfully confirmed & published!`);
      setSelectedCampaign(created);
      setCurrentView('detail');
    } catch (err: any) {
      showToast(err.message || 'Creation failed', 'info');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Admin moderation handlers
  const handleAdminApprove = async (id: string) => {
    await campaignApi.updateCampaignStatus(id, 'approved');
    await loadData();
    showToast('Campaign approved! It is now live in the public feed.');
  };

  const handleAdminReject = async (id: string) => {
    await campaignApi.updateCampaignStatus(id, 'rejected');
    await loadData();
    showToast('Campaign rejected and removed from review queue.');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background text-primary font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Strict Top Bar Navigation */}
      <Navigation
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'campaigns') setSelectedCampaign(null);
          setCurrentView(view as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenVoice={() => setIsVoiceBarOpen(true)}
        onOpenScholarxiv={() => setIsScholarxivOpen(true)}
        pendingCount={pendingCampaigns.length}
        language={language}
        onLanguageChange={setLanguage}
        isDark={isDark}
        onToggleDark={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'campaigns' && (
          <CampaignList
            campaigns={campaigns}
            isLoading={isLoading}
            error={error}
            onSelectCampaign={handleSelectCampaign}
            onStartCampaign={() => setCurrentView('create')}
            onOpenVoice={() => setIsVoiceBarOpen(true)}
            onRetry={loadData}
            language={language}
          />
        )}

        {currentView === 'detail' && selectedCampaign && (
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={() => {
              setSelectedCampaign(null);
              setCurrentView('campaigns');
            }}
            onDonate={handleDonate}
          />
        )}

        {currentView === 'create' && (
          <CreateCampaign
            onBack={() => setCurrentView('campaigns')}
            onSubmit={handleCreateCampaign}
            onOpenVoice={() => setIsVoiceBarOpen(true)}
            language={language}
          />
        )}

        {currentView === 'admin' && (
          <AdminApproval
            pendingCampaigns={pendingCampaigns}
            allCampaigns={[...pendingCampaigns, ...campaigns]}
            onApprove={handleAdminApprove}
            onReject={handleAdminReject}
            onBack={() => setCurrentView('campaigns')}
            onSelectCampaign={handleSelectCampaign}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Voxide Voice Assistant Dock (Voxied Reference) */}
      <VoxideBar
        isOpen={isVoiceBarOpen}
        onClose={() => setIsVoiceBarOpen(false)}
        campaigns={campaigns}
        language={language}
        onExtractedCreation={(data) => {
          setVoiceCampaignData(data);
        }}
        onExtractedDonation={(data) => {
          setVoiceDonationData(data);
        }}
      />

      {/* Mandatory Voxide Confirmation Modals */}
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

      {/* Scholarxiv Ideation Trail Modal */}
      <ScholarxivDrawer
        isOpen={isScholarxivOpen}
        onClose={() => setIsScholarxivOpen(false)}
      />

      {/* Floating Action Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-surface text-primary rounded-xl p-4 shadow-2xl border border-border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-1 bg-indigo-50 dark:bg-indigo-950/60 text-accent rounded-md shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-primary">Notification</p>
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

      {/* Restrained Domain-Native Footer */}
      <Footer
        onNavigateToAdmin={() => setCurrentView('admin')}
        onNavigateToCampaigns={() => {
          setSelectedCampaign(null);
          setCurrentView('campaigns');
        }}
        onNavigateToCreate={() => setCurrentView('create')}
      />
    </div>
  );
}
