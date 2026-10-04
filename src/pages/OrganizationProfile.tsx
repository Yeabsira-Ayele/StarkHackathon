import React, { useState } from 'react';
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
  MapPin,
  Clock,
  AlertCircle,
  Coins,
  Layers,
  User as UserIcon,
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
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  const orgCampaigns = campaigns.filter(
    (c) => c.organizationId === organization.id || c.creatorName.includes(organization.name)
  );

  const totalRaised = orgCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), organization.totalRaised || 0);
  const isApproved = organization.verificationStatus === 'approved' || organization.verified;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200 font-sans">
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

      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#B08A45]/40 bg-surface shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo display */}
            {organization.logoUrl && !logoLoadFailed ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                onError={() => setLogoLoadFailed(true)}
                className="w-16 h-16 rounded-2xl object-cover border border-border shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#173C32] to-[#B08A45] text-white flex items-center justify-center font-display font-bold text-2xl shadow-sm">
                {organization.name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-primary">
                  {organization.name}
                </h1>
                {isApproved && (
                  <span
                    className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    title="ACSO Verified NGO"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono mt-1">
                <span>{organization.registrationNo || 'ACSO / National Civil Registry'}</span>
                <span>·</span>
                <span className="capitalize">{organization.type?.replace('_', ' ')}</span>
                <span>·</span>
                <span>Est. {organization.foundedYear || 2024}</span>
              </div>
            </div>
          </div>

          {/* Verification Status Badge */}
          {isApproved ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 self-start sm:self-center flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              ACSO Verified Foundation
            </span>
          ) : organization.verificationStatus === 'pending' ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 self-start sm:self-center flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Verification Pending Review
            </span>
          ) : organization.verificationStatus === 'needs_changes' ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 self-start sm:self-center font-mono">
              Action Required
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 self-start sm:self-center font-mono">
              Unverified / Not Approved
            </span>
          )}
        </div>

        {/* Location & Description */}
        <div className="space-y-2">
          {organization.location && (
            <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{organization.location}</span>
            </p>
          )}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {organization.description}
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-border bg-surface-alt/40 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-accent" />
              Total Funds Raised
            </span>
            <p className="text-lg font-bold font-display text-primary tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface-alt/40 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-accent" />
              Active Causes
            </span>
            <p className="text-lg font-bold font-display text-primary tabular-nums">
              {orgCampaigns.length}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-border bg-surface-alt/40 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Compliance Clearance
            </span>
            <p className="text-xs font-bold text-primary font-mono mt-1">
              {isApproved ? 'ACSO Audited' : 'Review In Progress'}
            </p>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border text-xs text-zinc-500">
          {organization.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent" />
              <a
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary hover:underline"
              >
                {organization.website}
              </a>
            </span>
          )}
          {organization.contactEmail && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent" />
              <a href={`mailto:${organization.contactEmail}`} className="hover:text-primary">
                {organization.contactEmail}
              </a>
            </span>
          )}
          {organization.contactPhone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-accent" />
              <a href={`tel:${organization.contactPhone.replace(/\s/g, '')}`} className="hover:text-primary">
                {organization.contactPhone}
              </a>
            </span>
          )}
          {organization.representative?.name && (
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <UserIcon className="w-3.5 h-3.5 text-accent" />
              Rep: {organization.representative.name} ({organization.representative.role || 'Director'})
            </span>
          )}
        </div>
      </div>

      {/* Active Causes By This Organization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">
            Initiatives &amp; Causes ({orgCampaigns.length})
          </h2>
          {!isApproved && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">
              Cause creation locked until approved
            </span>
          )}
        </div>

        {orgCampaigns.length > 0 ? (
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
        ) : (
          <Card className="p-8 text-center border-border bg-surface text-zinc-500 space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-zinc-400" />
            <p className="text-sm font-semibold text-primary">No published causes yet</p>
            <p className="text-xs">
              {isApproved
                ? 'This organization has not published any public causes yet.'
                : 'Causes will appear here once the organization is officially accredited and verified.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrganizationProfile;
