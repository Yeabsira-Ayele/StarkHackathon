import React, { useState } from 'react';
import { Campaign, PaymentRail } from '../types/index.ts';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { DonateForm } from '../components/campaign/DonateForm.tsx';
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
  Check,
  Heart,
  Users,
} from 'lucide-react';

export interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onDonate: (payload: {
    amount: number;
    donorName: string;
    message?: string;
    paymentRail: PaymentRail;
  }) => Promise<any>;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onBack,
  onDonate,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formattedDate = new Date(campaign.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top back button & share */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to campaigns</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-border bg-surface px-3 py-1.5 rounded-lg shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Visual & Story Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-border shadow-xs">
            {campaign.imageUrl && !imgError ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 p-6 text-center">
                <Heart className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
                <span className="text-sm font-semibold text-zinc-500 capitalize">
                  {campaign.category} Campaign
                </span>
              </div>
            )}

            {campaign.verifiedOrganization && (
              <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-xs text-primary border border-border rounded-md px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Verified Fundraiser</span>
              </div>
            )}
          </div>

          {/* Title & Organizer */}
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="text-accent font-semibold uppercase tracking-wider">
                {campaign.category}
              </span>
              <span aria-hidden="true">·</span>
              <span>{campaign.location || 'Ethiopia'}</span>
              <span aria-hidden="true">·</span>
              <span>Started {formattedDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mt-2 leading-tight">
              {campaign.title}
            </h1>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-zinc-600 dark:text-zinc-400">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-accent font-bold flex items-center justify-center text-xs">
                {campaign.creatorName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Fundraiser Organizer</span>
                <span className="font-semibold text-primary">{campaign.creatorName}</span>
              </div>
            </div>
          </div>

          {/* Story Body */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
              About This Campaign
            </h3>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3 whitespace-pre-line">
              {campaign.story}
            </div>
          </div>

          {/* Recent Donations List */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Recent Supporters ({campaign.donations?.length || 0})</span>
              </h3>
            </div>

            {(!campaign.donations || campaign.donations.length === 0) ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic py-4 text-center">
                Be the first person to support this fundraiser.
              </p>
            ) : (
              <div className="space-y-3 divide-y divide-border">
                {campaign.donations.map((don, idx) => (
                  <div key={don.id || idx} className={`pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-primary">
                        {don.donorName || 'Anonymous'}
                      </span>
                      <span className="text-xs font-bold text-accent tabular-nums">
                        {don.amount.toLocaleString()} ETB
                      </span>
                    </div>
                    {don.message && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 italic leading-relaxed">
                        &ldquo;{don.message}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                      <span className="capitalize">{don.paymentRail?.replace('_', ' ') || 'Telebirr'}</span>
                      <span>·</span>
                      <span>{new Date(don.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Sticky Funding Progress & Donation Form */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-5">
            <div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-3xl font-extrabold text-primary tabular-nums">
                    {campaign.raisedAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500 ml-1.5">ETB raised</span>
                </div>
                <div className="text-right text-xs text-zinc-500">
                  <span>Goal: </span>
                  <span className="font-bold text-primary tabular-nums">
                    {campaign.goalAmount.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar
                  value={campaign.raisedAmount}
                  max={campaign.goalAmount}
                  showLabel
                  size="md"
                  color="accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border text-center">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-border">
                  <span className="text-base font-bold text-primary tabular-nums">
                    {campaign.donationsCount || 0}
                  </span>
                  <span className="block text-[11px] text-zinc-500">Donations</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-border">
                  <span className="text-base font-bold text-accent tabular-nums">
                    Verified
                  </span>
                  <span className="block text-[11px] text-zinc-500">Secure Rail</span>
                </div>
              </div>
            </div>

            {/* Direct Donation Form */}
            <div className="pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                Make a Contribution
              </h4>
              <DonateForm
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                onSubmit={onDonate}
                onDonationSuccess={() => {}}
              />
            </div>
          </div>

          {/* Guarantee card */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-border rounded-xl p-4 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-primary">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Transparent Fund Transfer</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Every contribution directly routes to beneficiary accounts through Ethiopian payment systems (Telebirr and CBE Birr).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
