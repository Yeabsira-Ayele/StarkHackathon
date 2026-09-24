import React, { useState } from 'react';
import { Campaign } from '../types/index.ts';
import { CampaignCard } from '../components/campaign/CampaignCard.tsx';
import { Tabs } from '../components/ui/Tabs.tsx';
import { StatCard } from '../components/ui/StatCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { LoadingState } from '../components/ui/LoadingState.tsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.tsx';
import {
  Heart,
  Mic,
  Plus,
  ShieldCheck,
  Search,
  TrendingUp,
} from 'lucide-react';

export interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartCampaign: () => void;
  onOpenVoice: () => void;
  onRetry: () => void;
  language: 'en' | 'am' | 'om';
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  isLoading,
  error,
  onSelectCampaign,
  onStartCampaign,
  onOpenVoice,
  onRetry,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate high-level platform stats
  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonations = campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  const activeCount = campaigns.length;

  const categories = [
    { id: 'all', label: language === 'am' ? 'ሁሉም' : language === 'om' ? 'Hundaa' : 'All Causes', count: campaigns.length },
    { id: 'medical', label: language === 'am' ? 'ህክምና' : language === 'om' ? 'Fayyaa' : 'Medical', count: campaigns.filter((c) => c.category === 'medical').length },
    { id: 'education', label: language === 'am' ? 'ትምህርት' : language === 'om' ? 'Barnoota' : 'Education', count: campaigns.filter((c) => c.category === 'education').length },
    { id: 'emergency', label: language === 'am' ? 'አደጋ ጊዜ' : language === 'om' ? 'Balaasaa' : 'Emergency', count: campaigns.filter((c) => c.category === 'emergency').length },
    { id: 'business', label: language === 'am' ? 'ስራ ፈጠራ' : language === 'om' ? 'Daldala' : 'Community', count: campaigns.filter((c) => c.category === 'business').length },
  ];

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesCategory = selectedCategory === 'all' || camp.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Clean, authentic Hero Section */}
      <section className="pt-6 sm:pt-10 pb-2">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-accent tracking-tight leading-tight">
            ለወገን ደራሽ ወገን ነው።
            <span className="block text-primary font-medium text-lg sm:text-xl md:text-2xl mt-3 tracking-normal">
              Transparent Giving for Urgent Needs.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Support verified healthcare, emergency relief, and education initiatives across Ethiopia. Direct payments in Birr via Telebirr and CBE Birr.
          </p>

          {/* Clean User Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="accent"
              size="lg"
              onClick={onStartCampaign}
              icon={<Plus className="w-4 h-4" />}
            >
              Start a Fundraiser
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onOpenVoice}
              icon={<Mic className="w-4 h-4 text-accent" />}
            >
              Voice Assistant
            </Button>
          </div>
        </div>
      </section>

      {/* Real Platform Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
        <StatCard
          title="Total Raised"
          value={`${totalRaised.toLocaleString()} ETB`}
          subtitle="Processed via Telebirr & CBE Birr"
          icon={<TrendingUp className="w-4 h-4 text-accent" />}
        />
        <StatCard
          title="Donations"
          value={totalDonations}
          subtitle="Direct community supporters"
          icon={<Heart className="w-4 h-4 text-rose-500" />}
        />
        <StatCard
          title="Verified Causes"
          value={activeCount}
          subtitle="Active community fundraisers"
          icon={<ShieldCheck className="w-4 h-4 text-accent" />}
        />
      </section>

      {/* Search & Category Filter Section */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <Tabs
            tabs={categories}
            activeTab={selectedCategory}
            onChange={(id) => setSelectedCategory(id)}
            variant="segmented"
          />

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-border bg-surface pl-9 pr-3.5 py-2 text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {isLoading ? (
          <LoadingState text="Fetching active fundraisers..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={onRetry} />
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-xl border border-border p-8">
            <Heart className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-primary">No campaigns found</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              There are no fundraisers matching your criteria. Try adjusting your search or category.
            </p>
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => setSelectedCategory('all')}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onSelect={onSelectCampaign}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
