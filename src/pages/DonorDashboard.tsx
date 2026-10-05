import React, { useState } from 'react';
import { Campaign, ContributionCertificate, Donation } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import {
  Heart,
  Award,
  Download,
  Calendar,
  ShieldCheck,
  TrendingUp,
  User,
  Bell,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { toGeezNumber } from '../services/utils/currencyUtils.ts';

export interface DonorDashboardProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onExploreCauses: () => void;
  onViewCertificate: (cert: ContributionCertificate) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  campaigns,
  onSelectCampaign,
  onExploreCauses,
  onViewCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'settings'>('overview');
  const [isAnonymousDefault, setIsAnonymousDefault] = useState(false);
  const [notifyUpdates, setNotifyUpdates] = useState(true);

  // Flatten all completed donations across causes
  const allDonations: Array<{ donation: Donation; campaign: Campaign }> = [];
  campaigns.forEach((c) => {
    (c.donations || []).forEach((d) => {
      allDonations.push({ donation: d, campaign: c });
    });
  });

  allDonations.sort(
    (a, b) => new Date(b.donation.createdAt).getTime() - new Date(a.donation.createdAt).getTime()
  );

  const totalContributed = allDonations.reduce((sum, item) => sum + item.donation.amount, 0);
  const supportedCausesCount = new Set(allDonations.map((item) => item.campaign.id)).size;
  const estimatedLivesImpacted = Math.round(totalContributed / 350) + 120;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* ─── REVERSE OF THE BANKNOTE: PATRON LEDGER COMPOSITION ─── */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-[#173C32] dark:border-[#B08A45] bg-[#FAF7F0] dark:bg-[#151917] p-6 sm:p-10 shadow-xl banknote-shadow select-none">
        
        {/* Intaglio Crosshatch Overlay */}
        <div className="absolute inset-0 pointer-events-none intaglio-crosshatch opacity-30" />

        {/* Top Serial & Denomination Vignettes */}
        <div className="flex items-center justify-between border-b-2 border-[#173C32] dark:border-[#B08A45]/60 pb-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="banknote-serial-red font-black">№ ET-PATRON-2026</span>
            <span className="text-zinc-500">·</span>
            <span className="font-bold text-[#173C32] dark:text-[#C5A059]">DOCUMENT REVERSE (ተቃራኒ ገፅ)</span>
          </div>

          <div className="flex items-center gap-1 font-bold text-accent">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ACSO VERIFIED ESCROW RECORD</span>
          </div>
        </div>
      
        {/* Monumental Currency Stats Compartment */}
        <div className="relative z-10 py-6 text-center space-y-3">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#B08A45] font-bold">
            NATIONAL CIVIC PATRON IMPACT VAULT
          </p>

          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-[#173C32] dark:text-[#E8DEC8] leading-none">
            {totalContributed.toLocaleString()} ETB
          </h1>

          <p className="text-xs font-ethiopic font-bold text-[#B08A45]">
            የተበረከተ አጠቃላይ ድምር ({toGeezNumber(totalContributed)} : ብር)
          </p>

          <p className="text-xs font-serif italic text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            "Every Birr minted into this promissory ledger directly subsidizes medical consumables, educational materials, and clean water restoration."
          </p>
        </div>

        {/* 4 Banknote Information Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t-2 border-[#D8CEBA] dark:border-[#2C3831] font-mono text-center">
          
          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F4EFE6]/80 dark:bg-[#1B221E]">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Causes Backed</p>
            <p className="text-2xl font-display font-bold text-[#173C32] dark:text-[#C5A059] mt-1 tabular-nums">
              {supportedCausesCount}
            </p>
            <p className="text-[10px] font-ethiopic text-[#B08A45]">የተደገፉ ዘመቻዎች</p>
          </div>

          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F4EFE6]/80 dark:bg-[#1B221E]">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Beneficiaries Reached</p>
            <p className="text-2xl font-display font-bold text-[#173C32] dark:text-[#C5A059] mt-1 tabular-nums">
              {estimatedLivesImpacted}+
            </p>
            <p className="text-[10px] font-ethiopic text-[#B08A45]">የተደረሰላቸው ወገኖች</p>
          </div>

          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F4EFE6]/80 dark:bg-[#1B221E]">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Archival Certificates</p>
            <p className="text-2xl font-display font-bold text-[#173C32] dark:text-[#C5A059] mt-1 tabular-nums">
              {allDonations.length}
            </p>
            <p className="text-[10px] font-ethiopic text-[#B08A45]">የምስክር ወረቀቶች</p>
          </div>

          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F4EFE6]/80 dark:bg-[#1B221E]">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Escrow Verification</p>
            <p className="text-2xl font-display font-bold text-emerald-600 mt-1">
              100%
            </p>
            <p className="text-[10px] font-ethiopic text-[#B08A45]">የተረጋገጠ አፈፃፀም</p>
          </div>

        </div>
      </section>

      {/* ─── ENGRAVED TABS ─── */}
      <div className="flex border-b-2 border-[#173C32] dark:border-[#B08A45]/60 gap-4 font-mono text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-0.5 ${
            activeTab === 'overview'
              ? 'border-accent text-accent'
              : 'border-transparent text-zinc-500 hover:text-primary'
          }`}
        >
          [ ፩ · SUPPORTED CAUSES PROGRESS ]
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-0.5 ${
            activeTab === 'contributions'
              ? 'border-accent text-accent'
              : 'border-transparent text-zinc-500 hover:text-primary'
          }`}
        >
          [ ፪ · ARCHIVAL CERTIFICATES ({allDonations.length}) ]
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 -mb-0.5 ${
            activeTab === 'settings'
              ? 'border-accent text-accent'
              : 'border-transparent text-zinc-500 hover:text-primary'
          }`}
        >
          [ ፫ · PATRON REGISTRY PREFERENCES ]
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              ACTIVE CAUSES IN YOUR PATRON VAULT
            </h2>
            <button
              onClick={onExploreCauses}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
            >
              UNDERWRITE MORE CAUSES <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 3).map((camp) => (
              <div
                key={camp.id}
                onClick={() => onSelectCampaign(camp)}
                className="p-5 rounded-xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#161B18] shadow-sm hover:shadow-md hover:border-[#B08A45] transition-all cursor-pointer flex flex-col justify-between space-y-4 font-mono text-xs"
              >
                <div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-2">
                    <span className="banknote-serial-red font-bold">№ {camp.serialCode || 'LW-0421'}</span>
                    <span className="uppercase text-accent font-bold">{camp.category}</span>
                  </div>

                  <h3 className="text-base font-display font-bold text-primary line-clamp-2 hover:text-accent transition-colors">
                    {camp.title}
                  </h3>

                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 font-sans">
                    {camp.story}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D8CEBA] dark:border-[#2C3831] space-y-2">
                  <ProgressBar
                    value={camp.raisedAmount}
                    max={camp.goalAmount}
                    size="sm"
                    color="accent"
                    showLabel
                  />
                  <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1">
                    <span>{camp.donationsCount || 0} Backers</span>
                    <span className="text-accent font-bold">EXAMINE NOTE →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CERTIFICATES VAULT */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              ARCHIVAL BANKNOTE CERTIFICATES VAULT
            </h2>
            <p className="text-xs text-zinc-500">
              Click any certificate to inspect in high-resolution or print
            </p>
          </div>

          <div className="rounded-xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#161B18] overflow-hidden shadow-xs font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F3ECE0] dark:bg-[#181E1B] text-primary uppercase text-[10px] tracking-wider font-bold border-b border-[#D8CEBA] dark:border-[#2C3831]">
                  <tr>
                    <th className="py-3 px-4">Certificate №</th>
                    <th className="py-3 px-4">Cause Underwritten</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Rail</th>
                    <th className="py-3 px-4">Issued Date</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8CEBA] dark:divide-[#2C3831]">
                  {allDonations.map((item, idx) => {
                    const certId = item.donation.certificateId || `LW-ETB-${100000 + idx}`;
                    const certData: ContributionCertificate = {
                      certificateId: certId,
                      donationId: item.donation.id,
                      campaignId: item.campaign.id,
                      campaignTitle: item.campaign.title,
                      organizationName: item.campaign.organizationName || item.campaign.creatorName,
                      donorName: item.donation.donorName,
                      amount: item.donation.amount,
                      currency: 'ETB',
                      impactSummary: item.campaign.impactMetric || 'Direct civic assistance',
                      location: item.campaign.location || 'Ethiopia',
                      issuedAt: item.donation.createdAt,
                      transactionRef: item.donation.transactionReference || 'LN-ETB',
                      paymentRail: item.donation.paymentRail || 'telebirr',
                    };

                    return (
                      <tr key={item.donation.id} className="hover:bg-[#F4EFE6]/60 dark:hover:bg-[#1B221E] transition-colors">
                        <td className="py-3.5 px-4 banknote-serial-red font-black">
                          № {certId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-primary max-w-xs truncate font-display">
                          {item.campaign.title}
                        </td>
                        <td className="py-3.5 px-4 font-black tabular-nums text-[#173C32] dark:text-[#C5A059]">
                          {item.donation.amount.toLocaleString()} ETB ({toGeezNumber(item.donation.amount)}:ብር)
                        </td>
                        <td className="py-3.5 px-4 uppercase text-zinc-500">
                          {item.donation.paymentRail || 'Telebirr'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          {new Date(item.donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onViewCertificate(certData)}
                            className="px-3 py-1 rounded border border-[#B08A45] text-[11px] font-bold text-accent hover:bg-[#F0EAD8] cursor-pointer"
                          >
                            OPEN CERTIFICATE ❖
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#FAF7F0] dark:bg-[#161B18] rounded-xl border border-[#D8CEBA] dark:border-[#2C3831] p-6 space-y-4 shadow-xs font-mono text-xs">
          <h2 className="text-sm font-bold text-primary uppercase">Patron Registry Preferences</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-zinc-500 mb-1 font-bold">BENEFACTOR REGISTRY NAME</label>
              <input
                type="text"
                defaultValue="Dawit Alemayehu"
                className="w-full px-3 py-2 rounded border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1A201D] text-primary"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-1 font-bold">ELECTRONIC RECEIPT EMAIL</label>
              <input
                type="email"
                defaultValue="dawit.diaspora@lewegene.et"
                className="w-full px-3 py-2 rounded border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1A201D] text-primary"
              />
            </div>

            <div className="pt-3 border-t border-[#D8CEBA] dark:border-[#2C3831] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymousDefault}
                  onChange={(e) => setIsAnonymousDefault(e.target.checked)}
                />
                <span>Default to anonymous endorsement on public bill</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyUpdates}
                  onChange={(e) => setNotifyUpdates(e.target.checked)}
                />
                <span>Notify me when funded projects post audited milestone evidence</span>
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
