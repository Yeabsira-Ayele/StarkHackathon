import React from 'react';
import { Campaign } from '../types/campaign.types';
import { CampaignCard } from './CampaignCard';
import { CampaignSkeleton } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';

interface CampaignGridProps {
  campaigns: Campaign[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onResetFilters?: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
  onQuickPledge: (campaign: Campaign) => void;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  isLoading,
  isError,
  error,
  onRetry,
  onResetFilters,
  onSelectCampaign,
  onQuickPledge,
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CampaignSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error State
  if (isError) {
    return <ErrorState message={error?.message} onRetry={onRetry} />;
  }

  // Empty State
  if (campaigns.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  // Success State
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onSelect={onSelectCampaign}
          onQuickPledge={onQuickPledge}
        />
      ))}
    </div>
  );
};
