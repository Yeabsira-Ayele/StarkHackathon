import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Campaign, Organization } from '../types/index.ts';
import { BanknotePlateCard } from '../components/banknote/BanknotePlateCard.tsx';
import { AcsoCircularSeal } from '../components/banknote/BanknoteArtwork.tsx';
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
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
  const { t } = useTranslation();
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  const orgCampaigns = campaigns.filter(
    (c) => c.organizationId === organization.id || c.creatorName.includes(organization.name)
  );

  const totalRaised = orgCampaigns.reduce(
    (sum, c) => sum + (c.raisedAmount || 0),
    organization.totalRaised || 0
  );
  const isApproved = organization.verificationStatus === 'approved' || organization.verified;
  const registrationSerial = (organization.registrationNo || 'ET-58291').replace(/^ACSO[-/]?/i, '');

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 space-y-10 font-sans text-[#201C18] dark:text-[#F4EFE6]">
      {/* Top Intaglio Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#0E0D0B] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] hover:bg-[#EAE1CF] dark:hover:bg-[#161411] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
          <span>{t('nav.backToHome', 'Back to Home')}</span>
        </button>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="banknote-serial-red font-black">№ {registrationSerial}</span>
          <span className="text-zinc-400">·</span>
          <span className="uppercase tracking-widest text-[#5A4E3E] dark:text-[#9E9383] font-bold">
            INSTITUTIONAL CHARTER
          </span>
        </div>
      </div>

      {/* Engraved Organization Charter Plate */}
      <section className="relative border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] p-6 sm:p-8 lg:p-10 space-y-8 banknote-shadow">
        <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />

        {/* Plate Top Serial & Accreditation Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#5A4E3E] dark:text-[#9E9383]">
            <span className="font-bold text-[#201C18] dark:text-[#F4EFE6]">
              {registrationSerial}
            </span>
            <span>·</span>
            <span className="uppercase">{organization.type?.replace('_', ' ') || 'NGO'}</span>
            <span>·</span>
            <span>EST. {organization.foundedYear || 2024}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            {isApproved ? null : organization.verificationStatus === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] text-[#9A7432]">
                <Clock className="w-3.5 h-3.5" />
                <span>{t('organization.statusPending', 'Verification Pending Review')}</span>
              </span>
            ) : organization.verificationStatus === 'needs_changes' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] text-[#9A7432]">
                <span>{t('organization.statusNeedsChanges', 'Action Required')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#26211C]/40 bg-[#FAF6EC] dark:bg-[#161411] text-[#5A4E3E]">
                <span>{t('organization.statusRejected', 'Unverified / Not Approved')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Identity & Seal Lockup */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {organization.logoUrl && !logoLoadFailed ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                referrerPolicy="no-referrer"
                onError={() => setLogoLoadFailed(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-[#26211C] dark:border-[#9A7432] intaglio-image shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#26211C] dark:border-[#9A7432] bg-[#1E4D38] text-[#F4EFE6] flex items-center justify-center font-serif font-bold text-2xl sm:text-3xl shrink-0">
                {organization.name.charAt(0)}
              </div>
            )}

            <div className="space-y-2">
              <h1 className="type-headline text-[#201C18] dark:text-[#F4EFE6]">
                {organization.name}
              </h1>

              {organization.location && (
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#9A7432] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1E4D38] dark:text-[#52B788]" />
                  <span>{organization.location}</span>
                </p>
              )}
            </div>
          </div>

          {isApproved && (
            <div className="hidden lg:block shrink-0">
              <AcsoCircularSeal />
            </div>
          )}
        </div>

        {/* Mission Statement Prose (< 75ch) */}
        <div className="relative z-10 border-t border-[#26211C]/15 dark:border-[#9A7432]/25 pt-6">
          <p className="type-body text-[#201C18]/90 dark:text-[#F4EFE6]/90">
            {organization.description}
          </p>
        </div>

        {/* Engraved 3-Cell Ledger Metrics */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <span className="type-caption text-[#5A4E3E] dark:text-[#9E9383] flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#9A7432]" />
              <span>Total Underwritten</span>
            </span>
            <p className="font-mono font-black text-xl sm:text-2xl text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </p>
          </div>

          <div className="p-4 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <span className="type-caption text-[#5A4E3E] dark:text-[#9E9383] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#9A7432]" />
              <span>Active Cause Plates</span>
            </span>
            <p className="font-mono font-black text-xl sm:text-2xl text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {orgCampaigns.length}
            </p>
          </div>

          <div className="p-4 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <span className="type-caption text-[#5A4E3E] dark:text-[#9E9383] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788]" />
              <span>Escrow Clearance</span>
            </span>
            <p className="font-mono font-bold text-sm text-[#1E4D38] dark:text-[#52B788] pt-1 uppercase">
              {isApproved ? '100% Direct Escrow' : 'Review In Progress'}
            </p>
          </div>
        </div>

        {/* Contact & Representative Registry Strip */}
        <div className="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-[#26211C]/20 dark:border-[#9A7432]/30 font-mono text-xs text-[#5A4E3E] dark:text-[#9E9383]">
          {organization.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#9A7432]" />
              <a
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#1E4D38] dark:hover:text-[#52B788] underline underline-offset-4"
              >
                {organization.website}
              </a>
            </span>
          )}
          {organization.contactEmail && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#9A7432]" />
              <a
                href={`mailto:${organization.contactEmail}`}
                className="hover:text-[#1E4D38] dark:hover:text-[#52B788]"
              >
                {organization.contactEmail}
              </a>
            </span>
          )}
          {organization.contactPhone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#9A7432]" />
              <a
                href={`tel:${organization.contactPhone.replace(/\s/g, '')}`}
                className="hover:text-[#1E4D38] dark:hover:text-[#52B788]"
              >
                {organization.contactPhone}
              </a>
            </span>
          )}
          {organization.representative?.name && (
            <span className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#9A7432]" />
              <span>
                Rep: {organization.representative.name} ({organization.representative.role || 'Director'})
              </span>
            </span>
          )}
        </div>
      </section>

      {/* Active Cause Plates By This Organization */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#26211C]/20 dark:border-[#9A7432]/30 pb-3">
          <div>
            <p className="type-caption text-[#9A7432]">
              ENGRAVED PROJECT LEDGER
            </p>
            <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6] mt-1">
              ACTIVE CAUSES ({orgCampaigns.length})
            </h2>
          </div>
          {!isApproved && (
            <span className="font-mono text-xs font-bold uppercase text-[#9A7432]">
              Cause publishing locked until approval
            </span>
          )}
        </div>

        {orgCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgCampaigns.map((camp) => (
              <BanknotePlateCard
                key={camp.id}
                campaign={camp}
                onSelect={onSelectCampaign}
              />
            ))}
          </div>
        ) : (
          <div className="relative p-10 text-center border-2 border-dashed border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#0E0D0B] space-y-2">
            <Building2 className="w-7 h-7 mx-auto text-[#9A7432]" />
            <p className="font-serif font-bold text-lg text-[#201C18] dark:text-[#F4EFE6]">
              No published cause plates yet
            </p>
            <p className="font-sans text-sm text-[#5A4E3E] dark:text-[#9E9383] max-w-md mx-auto">
              {isApproved
                ? 'This organization has not published any active causes yet.'
                : 'Causes will appear here once the organization completes accreditation review.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrganizationProfile;

