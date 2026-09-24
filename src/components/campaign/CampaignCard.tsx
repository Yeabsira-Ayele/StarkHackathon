import React, { useState } from 'react';
import { Campaign } from '../../types/index.ts';
import { ProgressBar } from '../ui/ProgressBar.tsx';
import { Card } from '../ui/Card.tsx';
import { ShieldCheck, Heart } from 'lucide-react';

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
    business: 'Community',
    other: 'Initiative',
  };

  return (
    <Card
      hoverable
      className="flex flex-col h-full group cursor-pointer border-border hover:border-accent/60 transition-all duration-200"
      onClick={() => onSelect(campaign)}
    >
      {/* Visual Slot */}
      <div className="relative aspect-16/10 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {campaign.imageUrl && !imgError ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 p-4 text-center">
            <Heart className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-1" />
            <span className="text-xs font-semibold text-zinc-500 capitalize">
              {campaign.category}
            </span>
          </div>
        )}

        {/* Quiet Trust Verification Indicator */}
        {campaign.verifiedOrganization && (
          <div className="absolute top-2.5 right-2.5 bg-surface/90 backdrop-blur-xs text-primary border border-border rounded-md px-2 py-0.5 text-[11px] font-semibold flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Static Clean Metadata with Typographic Separator */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="text-accent font-semibold capitalize">
              {categoryLabels[campaign.category] || campaign.category}
            </span>
            <span aria-hidden="true">·</span>
            <span>{campaign.location || 'Ethiopia'}</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-primary mt-2 line-clamp-2 group-hover:text-accent transition-colors tracking-tight">
            {campaign.title}
          </h3>

          {/* Short story excerpt */}
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {campaign.story}
          </p>
        </div>

        {/* Financial Progress Section */}
        <div className="mt-4 pt-3 border-t border-border space-y-2">
          <ProgressBar
            value={campaign.raisedAmount}
            max={campaign.goalAmount}
            size="sm"
            color="accent"
          />

          <div className="flex justify-between items-baseline text-xs">
            <div>
              <span className="text-sm font-bold text-primary tabular-nums">
                {campaign.raisedAmount.toLocaleString()} ETB
              </span>
              <span className="text-zinc-400 text-[11px] ml-1">raised</span>
            </div>
            <div className="text-zinc-500 dark:text-zinc-400 text-right">
              <span className="tabular-nums font-medium">
                {campaign.goalAmount.toLocaleString()} ETB
              </span>
              <span className="text-zinc-400 text-[11px] ml-1">goal</span>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="flex justify-between items-center pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span className="truncate max-w-[170px]">By {campaign.creatorName}</span>
            <span className="tabular-nums font-medium text-zinc-500 dark:text-zinc-400">
              {campaign.donationsCount || 0} donations
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
