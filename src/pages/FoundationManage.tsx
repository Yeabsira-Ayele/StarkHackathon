import React, { useState } from 'react';
import { Campaign, CampaignUpdate, Donation } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { campaignApi } from '../services/api/campaignApi.ts';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Pause,
  Play,
  Award,
  Users,
  AlertCircle,
} from 'lucide-react';

export interface FoundationManageProps {
  campaign: Campaign;
  onBack: () => void;
  onRefreshCampaign: () => void;
  onSelectDonorView: () => void;
}

export const FoundationManage: React.FC<FoundationManageProps> = ({
  campaign,
  onBack,
  onRefreshCampaign,
  onSelectDonorView,
}) => {
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [authorName, setAuthorName] = useState('Campaign Coordinator');
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) return;

    setIsPostingUpdate(true);
    try {
      await campaignApi.postCampaignUpdate(campaign.id, {
        title: updateTitle,
        content: updateContent,
        authorName,
      });
      setUpdateTitle('');
      setUpdateContent('');
      setStatusMessage('Update broadcasted to all supporters and added to public timeline.');
      onRefreshCampaign();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to post update');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleTogglePause = async () => {
    const newStatus = campaign.status === 'paused' ? 'approved' : 'paused';
    try {
      await campaignApi.updateCampaignStatus(campaign.id, newStatus);
      setStatusMessage(`Campaign marked as ${newStatus}.`);
      onRefreshCampaign();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Foundation Console
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTogglePause}
            icon={campaign.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
          >
            {campaign.status === 'paused' ? 'Resume Campaign' : 'Pause Donations'}
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={onSelectDonorView}
          >
            Preview Donor View
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Campaign Overview Header */}
      <div className="p-6 rounded-2xl border border-[#B08A45]/40 bg-surface shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-accent">{campaign.serialCode || 'LW-0421'}</span>
            <span>·</span>
            <span className="capitalize">{campaign.category}</span>
            <span>·</span>
            <span>{campaign.location}</span>
          </div>

          <span className="font-bold uppercase tracking-wider text-emerald-600">
            Status: {campaign.status}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-display font-bold text-primary">
          {campaign.title}
        </h1>

        <div className="pt-2">
          <ProgressBar
            value={campaign.raisedAmount}
            max={campaign.goalAmount}
            size="md"
            color="accent"
            showLabel
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border text-center text-xs">
          <div>
            <p className="text-zinc-500">Total Raised</p>
            <p className="text-base font-bold text-primary tabular-nums mt-0.5">
              {campaign.raisedAmount.toLocaleString()} ETB
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Funding Goal</p>
            <p className="text-base font-bold text-primary tabular-nums mt-0.5">
              {campaign.goalAmount.toLocaleString()} ETB
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Beneficiaries Target</p>
            <p className="text-base font-bold text-primary tabular-nums mt-0.5">
              {campaign.beneficiariesTarget || 100}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Broadcast Project Update */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-primary">Broadcast Milestone Update</h2>
            <p className="text-xs text-zinc-500">
              Notify donors with progress notes, pharmacy receipts, or delivery updates
            </p>
          </div>

          <Card className="p-5 border-border bg-surface shadow-xs">
            <form onSubmit={handlePostUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-primary mb-1">Update Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surgical equipment cleared from customs"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Author / Title</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Update Details &amp; Milestones *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe recent progress, beneficiary updates, and expenditure..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  isLoading={isPostingUpdate}
                  icon={<Send className="w-3.5 h-3.5 text-[#1C1A17]" />}
                >
                  Publish Update to Donors
                </Button>
              </div>
            </form>
          </Card>

          {/* Past Updates Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Published Timeline ({campaign.updates?.length || 0})
            </h3>
            
            {campaign.updates && campaign.updates.length > 0 ? (
              campaign.updates.map((upd) => (
                <div key={upd.id} className="p-4 rounded-xl border border-border bg-surface text-xs space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-zinc-400">
                    <span className="font-semibold text-primary">{upd.authorName}</span>
                    <span>{new Date(upd.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-primary">{upd.title}</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{upd.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 italic">No updates published yet.</p>
            )}
          </div>
        </div>

        {/* Right: Itemized Supporter Ledger */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-primary">Cause Donors &amp; Certificates</h2>
            <p className="text-xs text-zinc-500">
              Verified contributions received directly via Telebirr, CBE Birr, and Cards
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
            <div className="divide-y divide-border">
              {(campaign.donations || []).length > 0 ? (
                campaign.donations?.map((don) => (
                  <div key={don.id} className="p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{don.donorName}</span>
                      <span className="font-bold text-accent tabular-nums">
                        {don.amount.toLocaleString()} ETB
                      </span>
                    </div>

                    {don.message && (
                      <p className="text-[11px] italic text-zinc-500">"{don.message}"</p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                      <span>{don.paymentRail?.toUpperCase() || 'TELEBIRR'} · {don.transactionReference || 'REF'}</span>
                      <span>{new Date(don.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No contributions recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Transparent Itemized Budget Preview */}
          {campaign.budgetBreakdown && campaign.budgetBreakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Audited Budget Breakdown
              </h3>
              <div className="bg-surface rounded-xl border border-border p-4 divide-y divide-border text-xs">
                {campaign.budgetBreakdown.map((item, i) => (
                  <div key={i} className="py-2 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-primary">{item.item}</p>
                      {item.description && <p className="text-[10px] text-zinc-400">{item.description}</p>}
                    </div>
                    <span className="font-bold tabular-nums text-primary">
                      {item.cost.toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
