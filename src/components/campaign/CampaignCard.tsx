import React, { useState } from 'react';
import { Campaign } from '../../types/index.ts';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { Card } from '../ui/Card.tsx';
import { ShieldCheck, Heart, ArrowRight, MapPin, Award } from 'lucide-react';

export interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onQuickDonate?: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);

  const formattedDate = new Date(campaign.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const categoryLabels: Record<string, string> = {
    medical: 'Medical',
    education: 'Education',
    emergency: 'Emergency',
    water: 'Clean Water',
    business: 'Artisans',
    environment: 'Environment',
    other: 'Initiative',
  };

  if (!campaign) return null;

  const raised = campaign.raisedAmount || 0;
  const goal = campaign.goalAmount || 1;
  const percent = Math.min(Math.round((raised / goal) * 100), 100);

  return (
    <Card
      hoverable
      className="flex flex-col h-full group cursor-pointer border border-[#D8CEBA] dark:border-[#313C36] hover:border-[#B08A45] dark:hover:border-[#C5A059] transition-all duration-300 rounded-xl overflow-hidden bg-surface shadow-xs hover:shadow-md"
      onClick={() => onSelect(campaign)}
    >
      {/* Top Banknote Framing Header */}
      <div className="px-4 py-2 bg-[#F7F4EB]/80 dark:bg-[#181D1A]/80 border-b border-[#D8CEBA]/60 dark:border-[#313C36]/60 flex items-center justify-between text-[11px] font-mono select-none">
        <span className="font-bold text-[#173C32] dark:text-[#C5A059] flex items-center gap-1">
          <Award className="w-3 h-3 text-accent" />
          <span>№ {campaign.serialCode || 'LW-0421'}</span>
        </span>
        <span className="font-semibold text-accent uppercase tracking-wider text-[10px]">
          {categoryLabels[campaign.category] || campaign.category}
        </span>
      </div>

      {/* Visual Slot */}
      <div className="relative aspect-16/10 w-full bg-surface-alt dark:bg-zinc-800 overflow-hidden">
        {campaign.imageUrl && !imgError ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-alt dark:bg-zinc-800 text-zinc-400 p-4 text-center">
            <Heart className="w-8 h-8 text-[#B08A45] mb-1" />
            <span className="text-xs font-semibold text-primary capitalize">
              {campaign.category}
            </span>
          </div>
        )}

        {/* Quiet Trust Verification Indicator */}
        {campaign.verifiedOrganization && (
          <div className="absolute top-2.5 right-2.5 bg-surface/95 backdrop-blur-xs text-primary border border-[#B08A45]/40 rounded-md px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Verified Foundation</span>
          </div>
        )}

        {/* Percentage Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#173C32]/90 text-white rounded px-2 py-0.5 text-[10px] font-bold tracking-wider font-mono">
          {percent}% FUNDED
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent" />
              {campaign.location || 'Ethiopia'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-primary mt-2 line-clamp-2 group-hover:text-accent transition-colors font-display tracking-tight leading-snug">
            {campaign.title}
          </h3>

          {/* Short story excerpt */}
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {campaign.story}
          </p>

          {/* Impact Metric Snippet */}
          {campaign.impactMetric && (
            <div className="mt-2.5 p-2 rounded-lg bg-[#F7F4EB]/70 dark:bg-zinc-800/50 border border-[#D8CEBA]/50 dark:border-[#313C36]/50 text-[11px] text-zinc-700 dark:text-zinc-300 line-clamp-1">
              <span className="font-semibold text-accent">Impact: </span>
              {campaign.impactMetric}
            </div>
          )}
        </div>

        {/* Financial Progress Section */}
        <div className="pt-3 border-t border-[#D8CEBA]/70 dark:border-[#313C36]/70 space-y-2">
          <ProgressBar
            value={campaign.raisedAmount}
            max={campaign.goalAmount}
            size="sm"
            color="accent"
          />

          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="text-sm font-bold text-primary tabular-nums font-display">
                {campaign.raisedAmount.toLocaleString()} ETB
              </span>
              <span className="text-zinc-400 text-[10px] ml-1">raised</span>
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-right">
              <span className="tabular-nums font-medium">
                {campaign.goalAmount.toLocaleString()} ETB
              </span>
              <span className="text-zinc-400 text-[10px] ml-1">goal</span>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex justify-between items-center pt-2 text-[11px] text-zinc-500">
            <span className="truncate max-w-[150px] font-medium text-zinc-600 dark:text-zinc-400">
              {campaign.organizationName || campaign.creatorName}
            </span>

            <span className="text-accent font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Support Cause <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
