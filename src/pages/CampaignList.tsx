import React, { useState } from 'react';
import { Campaign } from '../types/index.ts';
import { LivingBanknoteHero } from '../components/banknote/LivingBanknoteHero.tsx';
import { BanknoteVignetteCard } from '../components/banknote/BanknoteVignetteCard.tsx';
import { LoadingState } from '../components/ui/LoadingState.tsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.tsx';
import {
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

export interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartCampaign: () => void;
  onForOrganizations?: () => void;
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
  onForOrganizations,
  onOpenVoice,
  onRetry,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [fundingStatus, setFundingStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'funded' | 'goal'>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonations = campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  const activeCount = campaigns.length;

  const categories = [
    { id: 'all', num: '፩', label: language === 'am' ? 'ሁሉም' : 'All Causes' },
    { id: 'education', num: '፪', label: language === 'am' ? 'ትምህርት' : 'Education' },
    { id: 'medical', num: '፫', label: language === 'am' ? 'ህክምና' : 'Healthcare' },
    { id: 'emergency', num: '፬', label: language === 'am' ? 'አደጋ ጊዜ' : 'Emergency' },
    { id: 'water', num: '፭', label: language === 'am' ? 'ንፁህ ውሃ' : 'Clean Water' },
    { id: 'business', num: '፮', label: language === 'am' ? 'የባህል ሙያተኞች' : 'Artisans' },
  ];

  const locations = [
    { id: 'all', label: 'All Regions' },
    { id: 'Addis Ababa', label: 'Addis Ababa' },
    { id: 'Hawassa', label: 'Hawassa / Sidama' },
    { id: 'East Shewa', label: 'East Shewa / Mojo' },
    { id: 'Woliso', label: 'Woliso / Oromia' },
  ];

  const filteredCampaigns = campaigns
    .filter((camp) => {
      const matchesCategory = selectedCategory === 'all' || camp.category === selectedCategory;
      const matchesLocation =
        selectedLocation === 'all' || (camp.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
      
      const percentFunded = (camp.raisedAmount / camp.goalAmount) * 100;
      let matchesFunding = true;
      if (fundingStatus === 'almost_funded') {
        matchesFunding = percentFunded >= 70;
      } else if (fundingStatus === 'urgent') {
        matchesFunding = camp.category === 'emergency' || percentFunded < 40;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        camp.title.toLowerCase().includes(q) ||
        camp.story.toLowerCase().includes(q) ||
        camp.creatorName.toLowerCase().includes(q) ||
        (camp.location || '').toLowerCase().includes(q) ||
        (camp.serialCode || '').toLowerCase().includes(q);

      return matchesCategory && matchesLocation && matchesFunding && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'funded') {
        return (b.raisedAmount / b.goalAmount) - (a.raisedAmount / a.goalAmount);
      }
      if (sortBy === 'goal') {
        return b.goalAmount - a.goalAmount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleScrollToCauses = () => {
    const el = document.getElementById('engraved-causes-registry');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-200">
      
      {/* ─── LIVING BANKNOTE HERO CENTERPIECE ─── */}
      <LivingBanknoteHero
        totalRaised={totalRaised}
        totalDonations={totalDonations}
        activeCount={activeCount}
        onExplore={handleScrollToCauses}
        onForOrganizations={onForOrganizations}
        onOpenVoice={onOpenVoice}
      />

      {/* ─── ENGRAVED CAUSES REGISTRY ─── */}
      <section id="engraved-causes-registry" className="space-y-6 pt-4">
        
        {/* Section Header styled as Banknote Ledger Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#173C32] dark:border-[#B08A45]/60 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded border border-[#B08A45] bg-[#F7F4EB] dark:bg-[#1B221E] text-xs font-mono font-bold text-[#173C32] dark:text-[#C5A059]">
              <Award className="w-3.5 h-3.5 text-[#B08A45]" />
              <span>OFFICIAL CAUSE REGISTRY · 2026 ISSUE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-primary tracking-tight">
              Underwritten Community Causes
            </h2>
            <p className="text-xs font-mono text-zinc-500">
              Showing {filteredCampaigns.length} verified promissory notes currently accepting citizen underwritings
            </p>
          </div>

          {/* Quick Issue / Start Fundraiser */}
          <button
            onClick={onStartCampaign}
            className="px-4 py-2 rounded-lg border-2 border-[#173C32] dark:border-[#C5A059] bg-[#FAF7F0] dark:bg-[#181D1A] text-xs font-mono font-bold text-primary hover:bg-[#F0EAD8] dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-2 shadow-xs self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-[#B08A45]" />
            <span>ENGRAVE NEW CAUSE</span>
          </button>
        </div>

        {/* ─── BANKNOTE FILTER BAR (Denomination Pills & Criteria) ─── */}
        <div className="p-4 sm:p-5 rounded-xl border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F7F4EB]/90 dark:bg-[#161B18] shadow-xs space-y-4 font-mono text-xs">
          
          {/* Row 1: Category Denomination Buttons & Search */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'border-[#173C32] dark:border-[#C5A059] bg-[#173C32] dark:bg-[#C5A059] text-white dark:text-[#1C1A17] font-bold shadow-xs'
                      : 'border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1B221E] text-zinc-600 dark:text-zinc-400 hover:border-[#B08A45]'
                  }`}
                >
                  <span className="font-ethiopic text-accent font-black text-sm leading-none">{cat.num}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search note by title, serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1B221E] text-primary focus:ring-1 focus:ring-accent text-xs font-mono"
              />
            </div>
          </div>

          {/* Row 2: Location, Status & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8CEBA] dark:border-[#2C3831] text-[11px]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-zinc-500 font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#B08A45]" />
                <span>LOCATION:</span>
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-2.5 py-1 rounded border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1B221E] text-primary focus:ring-1 focus:ring-accent"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 text-zinc-500 font-bold ml-2">
                <Filter className="w-3.5 h-3.5 text-[#B08A45]" />
                <span>STAGE:</span>
              </div>
              <select
                value={fundingStatus}
                onChange={(e) => setFundingStatus(e.target.value)}
                className="px-2.5 py-1 rounded border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1B221E] text-primary focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Note Stages</option>
                <option value="almost_funded">Almost Underwritten (&gt;70%)</option>
                <option value="urgent">Urgent Intervention</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-bold">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 rounded border border-[#D8CEBA] dark:border-[#2C3831] bg-[#FAF7F0] dark:bg-[#1B221E] text-primary focus:ring-1 focus:ring-accent"
              >
                <option value="recent">Most Recent</option>
                <option value="funded">Highest Funded (%)</option>
                <option value="goal">Highest Target</option>
              </select>
            </div>
          </div>

        </div>

        {/* Loading / Error States */}
        {isLoading && <LoadingState text="Examining living banknote cause registry..." />}
        {error && <ErrorMessage message={error} onRetry={onRetry} />}

        {/* ─── VIGNETTES GRID (Authentic Currency Section Panels) ─── */}
        {!isLoading && !error && (
          <div>
            {filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((camp) => (
                  <BanknoteVignetteCard
                    key={camp.id}
                    campaign={camp}
                    onSelect={onSelectCampaign}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl border-2 border-dashed border-[#B08A45]/40 bg-[#FAF7F0] dark:bg-[#161B18] space-y-3 font-mono">
                <Award className="w-10 h-10 text-[#B08A45] mx-auto opacity-60" />
                <h3 className="text-sm font-bold text-primary uppercase">No Promissory Notes Found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  No causes currently match this specific criteria. Clear your filters to examine all active notes.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setFundingStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 rounded border border-[#B08A45] text-xs font-bold text-[#173C32] dark:text-[#C5A059] hover:bg-[#F0EAD8]"
                >
                  RESET CRITERIA
                </button>
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  );
};
