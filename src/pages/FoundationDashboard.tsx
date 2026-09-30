import React, { useState } from 'react';
import { Campaign, Donation, Organization } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import {
  Building2,
  ShieldCheck,
  Plus,
  TrendingUp,
  Users,
  Bell,
  ArrowRight,
  FileText,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';

export interface FoundationDashboardProps {
  organization: Organization;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
  onManageCampaign: (campaign: Campaign) => void;
  onViewContributions: () => void;
  onViewImpact: () => void;
  onViewProfile: () => void;
}

export const FoundationDashboard: React.FC<FoundationDashboardProps> = ({
  organization,
  campaigns,
  onSelectCampaign,
  onCreateCampaign,
  onManageCampaign,
  onViewContributions,
  onViewImpact,
  onViewProfile,
}) => {
  // Aggregate foundation totals
  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + c.goalAmount, 0);
  const totalSupporters = campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  const activeCount = campaigns.filter((c) => c.status === 'approved').length;

  // Flatten all donations for recent stream
  const allRecentDonations: Array<{ donation: Donation; campaign: Campaign }> = [];
  campaigns.forEach((c) => {
    (c.donations || []).forEach((d) => {
      allRecentDonations.push({ donation: d, campaign: c });
    });
  });
  allRecentDonations.sort(
    (a, b) => new Date(b.donation.createdAt).getTime() - new Date(a.donation.createdAt).getTime()
  );

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* Top Banknote-Style Foundation Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#B08A45]/40 bg-gradient-to-br from-[#173C32] via-[#102B23] to-[#0A1A15] text-[#F7F4EB] p-6 sm:p-10 shadow-lg">
        {/* Subtle Banknote Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #C5A059 0, #C5A059 2px, transparent 0, transparent 8px)`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#B08A45]/50 bg-[#173C32]/80 text-[#C5A059] text-xs font-semibold tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>{organization.registrationNo || 'ACSO/ET/2024/9021'} · Verified NGO</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                HQ: {organization.location || 'Addis Ababa'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-white">
              {organization.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Institutional Operations Console · Audited disbursement, milestone reporting, and donor transparency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="accent"
              size="md"
              onClick={onCreateCampaign}
              icon={<Plus className="w-4 h-4 text-[#1C1A17]" />}
            >
              Create New Cause
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onViewProfile}
              className="text-[#F7F4EB] border-[#B08A45]/60 hover:bg-[#1A4338]"
              icon={<ExternalLink className="w-4 h-4 text-[#C5A059]" />}
            >
              Public Profile
            </Button>
          </div>
        </div>

        {/* Overview Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#B08A45]/30">
          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Total Raised</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">የተሰበሰበ ድምር</p>
          </div>

          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Active Causes</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {activeCount}
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">ንቁ ዘመቻዎች</p>
          </div>

          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Total Supporters</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {totalSupporters}
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">ደጋፊዎች</p>
          </div>

          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Funding Progress</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">የዕቅድ አፈፃፀም</p>
          </div>
        </div>
      </section>

      {/* Secondary Quick Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewContributions}
            icon={<DollarSign className="w-3.5 h-3.5 text-accent" />}
          >
            Donation Ledger ({allRecentDonations.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onViewImpact}
            icon={<FileText className="w-3.5 h-3.5 text-accent" />}
          >
            Impact Reporting
          </Button>
        </div>

        {/* Milestone Alert Badge */}
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Next milestone audit: Hawassa STEM Lab milestone pending review</span>
        </div>
      </div>

      {/* Main Grid: Causes Management + Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Projects (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Managed Causes &amp; Interventions</h2>
              <p className="text-xs text-zinc-500">
                Track funding, publish updates to donors, and manage disbursement
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onCreateCampaign}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Cause
            </Button>
          </div>

          <div className="space-y-4">
            {campaigns.map((camp) => (
              <Card
                key={camp.id}
                className="p-5 border-border hover:border-accent/60 transition-all bg-surface shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-accent">{camp.serialCode || 'LW-0421'}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="capitalize text-zinc-500">{camp.category}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-zinc-500">{camp.location}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    camp.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : camp.status === 'pending'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div>
                  <h3 
                    onClick={() => onSelectCampaign(camp)}
                    className="text-base font-bold text-primary hover:text-accent cursor-pointer transition-colors"
                  >
                    {camp.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {camp.story}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <ProgressBar
                    value={camp.raisedAmount}
                    max={camp.goalAmount}
                    size="sm"
                    color="accent"
                    showLabel
                  />
                  
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <span className="text-zinc-500">
                      {camp.donationsCount || 0} verified contributions
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onManageCampaign(camp)}
                      >
                        Manage &amp; Post Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectCampaign(camp)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                      >
                        Donor View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Live Recent Donations Feed */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-primary">Live Contribution Stream</h2>
            <p className="text-xs text-zinc-500">Real-time Telebirr &amp; CBE Birr verified receipts</p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 space-y-3 shadow-xs">
            {allRecentDonations.slice(0, 7).map((item) => (
              <div
                key={item.donation.id}
                className="p-3 rounded-lg border border-border/70 hover:border-accent/40 bg-surface-alt/40 dark:bg-zinc-800/40 text-xs space-y-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary truncate max-w-[140px]">
                    {item.donation.donorName}
                  </span>
                  <span className="font-bold text-accent tabular-nums">
                    +{item.donation.amount.toLocaleString()} ETB
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 truncate">
                  {item.campaign.title}
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                  <span>{item.donation.paymentRail?.toUpperCase() || 'TELEBIRR'}</span>
                  <span>{new Date(item.donation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold mt-2"
              onClick={onViewContributions}
            >
              View Full Contribution Ledger →
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
