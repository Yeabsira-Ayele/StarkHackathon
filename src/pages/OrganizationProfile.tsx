import React from 'react';
import { Campaign, Organization } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  Award,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export interface OrganizationProfileProps {
  organization: Organization;
  campaigns: Campaign[];
  onBack: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export const OrganizationProfile: React.FC<OrganizationProfileProps> = ({
  organization,
  campaigns,
  onBack,
  onSelectCampaign,
}) => {
  const orgCampaigns = campaigns.filter(
    (c) => c.organizationId === organization.id || c.creatorName.includes(organization.name)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* Back button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
      </div>

      {/* Profile Header */}
      <div className="p-8 rounded-2xl border border-[#B08A45]/40 bg-surface shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#173C32] to-[#B08A45] text-white flex items-center justify-center font-display font-bold text-2xl shadow-sm">
              {organization.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-primary">
                  {organization.name}
                </h1>
                {organization.verified && (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" title="Verified NGO">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {organization.registrationNo} · Founded {organization.foundedYear || 2018}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 self-start sm:self-center">
            ACSO Verified Foundation
          </span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {organization.description}
        </p>

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-accent" />
            {organization.website || 'https://lewegene.et/org'}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-accent" />
            {organization.contactEmail}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-accent" />
            {organization.contactPhone}
          </span>
        </div>
      </div>

      {/* Active Causes By This Organization */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary">Initiatives &amp; Causes ({orgCampaigns.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orgCampaigns.map((camp) => (
            <Card
              key={camp.id}
              hoverable
              className="p-5 border-border hover:border-accent/60 transition-all bg-surface flex flex-col justify-between cursor-pointer shadow-xs"
              onClick={() => onSelectCampaign(camp)}
            >
              <div>
                <div className="flex justify-between items-center text-xs text-zinc-500 font-mono mb-2">
                  <span className="text-accent font-semibold">{camp.serialCode || 'LW-0421'}</span>
                  <span className="capitalize">{camp.category}</span>
                </div>
                <h3 className="text-base font-bold text-primary line-clamp-2 hover:text-accent transition-colors">
                  {camp.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                  {camp.story}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border space-y-2">
                <ProgressBar
                  value={camp.raisedAmount}
                  max={camp.goalAmount}
                  size="sm"
                  color="accent"
                  showLabel
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};
