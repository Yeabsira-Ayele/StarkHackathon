import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Campaign, Donation, Organization } from '../types/index.ts';
import { BanknoteRulerGauge } from '../components/banknote/BanknoteArtwork.tsx';
import { organizationService } from '../services/organizationService.ts';
import {
  Building2,
  ShieldCheck,
  Plus,
  ArrowRight,
  ArrowLeft,
  FileText,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Clock,
  XCircle,
  MessageSquareWarning,
  CheckCircle2,
  FileCheck,
  Landmark,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react';

export interface FoundationDashboardProps {
  organization: Organization;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
  onManageCampaign: (campaign: Campaign) => void;
  onViewContributions: () => void;
  onViewImpact: () => void;
  onViewProfile: () => void;
  onOrganizationUpdated?: (updated: Organization) => void;
  onBack?: () => void;
}

export const FoundationDashboard: React.FC<FoundationDashboardProps> = ({
  organization: initialOrg,
  campaigns,
  onSelectCampaign,
  onCreateCampaign,
  onManageCampaign,
  onViewContributions,
  onViewImpact,
  onViewProfile,
  onOrganizationUpdated,
  onBack,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization>(initialOrg);
  const [isEditingForResubmit, setIsEditingForResubmit] = useState(false);
  const [resubmitDescription, setResubmitDescription] = useState(org.description || '');
  const [resubmitRegistrationNo, setResubmitRegistrationNo] = useState(org.registrationNo || '');
  const [resubmitDocuments, setResubmitDocuments] = useState<string[]>(org.documents || []);
  const [newDocName, setNewDocName] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  const status = org.verificationStatus || (org.verified ? 'approved' : 'pending');

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResubmitting(true);
    try {
      const updated = await organizationService.update(org.id, {
        description: resubmitDescription,
        registrationNo: resubmitRegistrationNo,
        documents: resubmitDocuments,
        verificationStatus: 'pending',
        decisionNote: undefined,
      });
      setOrg(updated);
      onOrganizationUpdated?.(updated);
      setIsEditingForResubmit(false);
      setResubmitSuccess('Application updated and resubmitted for review.');
      setTimeout(() => setResubmitSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleAddResubmitDoc = () => {
    if (!newDocName.trim() || resubmitDocuments.length >= 3) return;
    const clean = newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`;
    setResubmitDocuments([...resubmitDocuments, clean]);
    setNewDocName('');
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PENDING / REJECTED / NEEDS_CHANGES STATUS VIEW (BANKNOTE INTAGLIO PLATE)
  // ══════════════════════════════════════════════════════════════════════════
  if (status !== 'approved') {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 space-y-8 font-sans text-[#201C18] dark:text-[#F4EFE6]">
        {/* Top Intaglio Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate('/'))}
              className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#0E0D0B] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] hover:bg-[#EAE1CF] dark:hover:bg-[#161411] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
              <span>{t('nav.backToHome', 'Back to Home')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#5A4E3E] dark:text-[#9E9383] hover:text-[#1E4D38] dark:hover:text-[#52B788] transition-colors cursor-pointer"
            >
              {t('nav.backToExplore', 'Explore Causes')}
            </button>
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#9A7432]">
            {t('nav.orgDashboard', 'Organization Hub')}
          </span>
        </div>

        {/* Status Header Plate */}
        <section className="relative border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] p-6 sm:p-8 lg:p-10 space-y-6 banknote-shadow">
          <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] text-[#9A7432] font-bold uppercase tracking-wider">
                  {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                  {status === 'needs_changes' && <MessageSquareWarning className="w-3.5 h-3.5" />}
                  {status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                  <span>
                    {status === 'pending'
                      ? 'STATUS: PENDING ADMINISTRATIVE REVIEW'
                      : status === 'needs_changes'
                      ? 'STATUS: ACTION REQUIRED / CHANGES REQUESTED'
                      : 'STATUS: APPLICATION DECLINED'}
                  </span>
                </span>
                <span className="text-[#5A4E3E] dark:text-[#9E9383]">
                  SUBMITTED: {org.submittedAt ? new Date(org.submittedAt).toLocaleDateString() : 'RECENT'}
                </span>
              </div>

              <h1 className="type-headline text-[#201C18] dark:text-[#F4EFE6]">
                {org.name}
              </h1>

              <p className="type-body text-[#5A4E3E] dark:text-[#9E9383]">
                {status === 'pending' &&
                  'Your organization registration is queued for administrative review. Cause publishing and fundraising actions remain held until approval.'}
                {status === 'needs_changes' &&
                  'The review administrator has requested clarifying updates before this organization can be accredited.'}
                {status === 'rejected' &&
                  'This organization application was not approved. Institutional privileges and cause publishing remain restricted.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onViewProfile}
                className="px-5 py-3 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase tracking-widest hover:bg-[#163E2C] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Preview Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {resubmitSuccess && (
          <div className="p-4 border-2 border-[#1E4D38] bg-[#FAF6EC] dark:bg-[#161411] text-[#1E4D38] dark:text-[#52B788] font-mono text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resubmitSuccess}</span>
          </div>
        )}

        {/* Admin Decision Note Plate */}
        {org.decisionNote && (
          <section className="relative p-6 border-2 border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
            <div className="flex items-center gap-2 text-[#9A7432] font-mono font-bold text-xs uppercase tracking-wider">
              <MessageSquareWarning className="w-4 h-4" />
              <span>Note from Administrator:</span>
            </div>
            <p className="font-serif text-base text-[#201C18] dark:text-[#F4EFE6] italic p-4 border border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#F2EADA] dark:bg-[#0E0D0B] max-w-[68ch]">
              &ldquo;{org.decisionNote}&rdquo;
            </p>
            {status === 'needs_changes' && !isEditingForResubmit && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingForResubmit(true)}
                  className="px-5 py-2.5 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase tracking-wider hover:bg-[#163E2C] transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Edit Application &amp; Resubmit</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* Resubmit Form when needs_changes */}
        {isEditingForResubmit && (
          <section className="relative p-6 sm:p-8 border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] space-y-5">
            <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />
            <div className="relative z-10 border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-3">
              <h2 className="font-display font-black text-lg text-[#201C18] dark:text-[#F4EFE6] uppercase tracking-wider">
                Update Organization Details &amp; Resubmit
              </h2>
              <p className="font-sans text-xs text-[#5A4E3E] dark:text-[#9E9383] mt-1">
                Address the reviewer&apos;s feedback above and resubmit for verification.
              </p>
            </div>

            <form onSubmit={handleResubmit} className="relative z-10 space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold text-[#201C18] dark:text-[#F4EFE6] uppercase mb-1.5">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={resubmitRegistrationNo}
                  onChange={(e) => setResubmitRegistrationNo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#201C18] dark:text-[#F4EFE6] uppercase mb-1.5">
                  Description / Mission Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={resubmitDescription}
                  onChange={(e) => setResubmitDescription(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] font-sans text-sm text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-[#201C18] dark:text-[#F4EFE6] uppercase">
                  Attached Documents ({resubmitDocuments.length}/3)
                </label>
                {resubmitDocuments.length < 3 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. updated_license.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddResubmitDoc}
                      className="px-4 py-2 border border-[#26211C] dark:border-[#9A7432] bg-[#EAE1CF] dark:bg-[#161411] font-mono text-xs font-bold uppercase cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}
                <ul className="space-y-1.5">
                  {resubmitDocuments.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between p-2.5 border border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#FAF6EC] dark:bg-[#161411] font-mono text-xs"
                    >
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => setResubmitDocuments(resubmitDocuments.filter((_, idx) => idx !== i))}
                        className="text-red-700 dark:text-red-400 font-bold uppercase cursor-pointer"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 flex gap-3 justify-end border-t border-[#26211C]/20 dark:border-[#9A7432]/30">
                <button
                  type="button"
                  onClick={() => setIsEditingForResubmit(false)}
                  className="px-4 py-2.5 border border-[#26211C]/40 dark:border-[#9A7432]/50 font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResubmitting}
                  className="px-5 py-2.5 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase tracking-wider hover:bg-[#163E2C] cursor-pointer"
                >
                  {isResubmitting ? 'Submitting...' : 'Resubmit for Review'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Governance Notice */}
        <div className="p-5 border border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#9A7432]" />
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold uppercase text-[#201C18] dark:text-[#F4EFE6]">
              Fundraising &amp; Cause Publishing Locked
            </p>
            <p className="font-sans text-sm text-[#5A4E3E] dark:text-[#9E9383] leading-relaxed max-w-[68ch]">
              Under Lewegene platform governance, organizations cannot publish active cause plates or collect citizen contributions until institutional accreditation is approved.
            </p>
          </div>
        </div>

        {/* Application Credentials Summary Plate */}
        <section className="relative p-6 sm:p-8 border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] space-y-6">
          <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />

          <div className="relative z-10 border-b border-[#26211C]/20 dark:border-[#9A7432]/30 pb-3">
            <h2 className="font-display font-black text-lg sm:text-xl text-[#201C18] dark:text-[#F4EFE6] uppercase tracking-wider">
              Submitted Application Credentials
            </h2>
            <p className="font-sans text-xs text-[#5A4E3E] dark:text-[#9E9383] mt-1">
              The registration records below are on file with our moderation desk.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Legal Entity */}
            <div className="p-5 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9A7432] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Legal Entity</span>
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Legal Name</span>
                  <span className="font-serif font-bold text-base text-[#201C18] dark:text-[#F4EFE6]">{org.name}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Category</span>
                  <span className="font-mono uppercase text-[#201C18] dark:text-[#F4EFE6]">{org.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Registration No.</span>
                  <span className="font-mono font-bold text-[#1E4D38] dark:text-[#52B788]">{(org.registrationNo || 'Pending').replace(/^ACSO[-/]?/i, '')}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Location</span>
                  <span className="font-sans text-[#201C18] dark:text-[#F4EFE6]">{org.location}</span>
                </div>
              </div>
            </div>

            {/* Representative */}
            <div className="p-5 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9A7432] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Authorized Representative</span>
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Name</span>
                  <span className="font-serif font-bold text-base text-[#201C18] dark:text-[#F4EFE6]">{org.representative?.name || 'Representative on file'}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Role</span>
                  <span className="font-sans text-[#201C18] dark:text-[#F4EFE6]">{org.representative?.role || 'Executive Officer'}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Verified Phone</span>
                  <span className="font-mono text-[#201C18] dark:text-[#F4EFE6]">{org.representative?.phone || org.contactPhone}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Email</span>
                  <span className="font-mono text-[#201C18] dark:text-[#F4EFE6]">{org.representative?.email || org.contactEmail}</span>
                </div>
              </div>
            </div>

            {/* Receiving Bank Account */}
            <div className="p-5 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9A7432] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                <span>Receiving Bank Account</span>
              </p>
              <div className="space-y-2">
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Bank Institution</span>
                  <span className="font-serif font-bold text-base text-[#201C18] dark:text-[#F4EFE6]">{org.bank?.bank || 'Commercial Bank of Ethiopia (CBE)'}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Account Number</span>
                  <span className="font-mono font-bold text-[#201C18] dark:text-[#F4EFE6] tabular-nums">{org.bank?.accountNumber || '1000284920194'}</span>
                </div>
                <div>
                  <span className="text-[#5A4E3E] dark:text-[#9E9383] block font-mono text-[10px] uppercase">Account Holder Name</span>
                  <span className="font-sans text-[#201C18] dark:text-[#F4EFE6]">{org.bank?.accountName || org.name}</span>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="p-5 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9A7432] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Verification Documents ({org.documents?.length || 0})</span>
              </p>
              {org.documents && org.documents.length > 0 ? (
                <ul className="space-y-2 font-mono text-xs">
                  {org.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[#201C18] dark:text-[#F4EFE6] truncate">
                      <FileCheck className="w-3.5 h-3.5 text-[#1E4D38] dark:text-[#52B788] shrink-0" />
                      <span className="truncate">{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-sans text-xs text-[#5A4E3E] dark:text-[#9E9383] italic">
                  No external documents attached.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIVE / APPROVED OPERATIONAL CONSOLE (BANKNOTE INTAGLIO PLATE SYSTEM)
  // ══════════════════════════════════════════════════════════════════════════
  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + c.goalAmount, 0);
  const totalSupporters = campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  const activeCount = campaigns.filter((c) => c.status === 'approved').length;

  const allRecentDonations: Array<{ donation: Donation; campaign: Campaign }> = [];
  campaigns.forEach((c) => {
    (c.donations || []).forEach((d) => {
      allRecentDonations.push({ donation: d, campaign: c });
    });
  });
  allRecentDonations.sort(
    (a, b) => new Date(b.donation.createdAt).getTime() - new Date(a.donation.createdAt).getTime()
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 py-8 lg:py-12 space-y-10 font-sans text-[#201C18] dark:text-[#F4EFE6]">
      {/* Top Intaglio Navigation Return Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#26211C]/20 dark:border-[#9A7432]/30 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : navigate('/'))}
            className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#0E0D0B] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] hover:bg-[#EAE1CF] dark:hover:bg-[#161411] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#1E4D38] dark:text-[#52B788]" />
            <span>{t('nav.backToHome', 'Back to Home')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#5A4E3E] dark:text-[#9E9383] hover:text-[#1E4D38] dark:hover:text-[#52B788] transition-colors cursor-pointer"
          >
            {t('nav.backToExplore', 'Explore Causes')}
          </button>
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#9A7432]">
          {t('nav.orgDashboard', 'Organization Hub')}
        </span>
      </div>

      {/* Engraved Foundation Treasury Header Plate */}
      <section className="relative border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] p-6 sm:p-8 lg:p-10 space-y-8 banknote-shadow">
        <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#1E4D38] bg-[#1E4D38] text-white font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{(org.registrationNo || 'ET/2024/9021').replace(/^ACSO[-/]?/i, '')}</span>
              </span>
              <span className="text-[#5A4E3E] dark:text-[#9E9383] font-bold uppercase">
                · HQ: {org.location || 'Addis Ababa'}
              </span>
            </div>

            <h1 className="type-headline text-[#201C18] dark:text-[#F4EFE6]">
              {org.name}
            </h1>
            <p className="type-body text-[#5A4E3E] dark:text-[#9E9383]">
              Institutional Operations Console · Audited Birr disbursement, milestone verification, and patron transparency.
            </p>
          </div>

          {/* Single Primary CTA + Lower-Emphasis Link */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={onCreateCampaign}
              className="w-full sm:w-auto justify-center px-6 py-3.5 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase tracking-widest hover:bg-[#163E2C] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Cause</span>
            </button>
            <button
              type="button"
              onClick={onViewProfile}
              className="w-full sm:w-auto justify-center px-4 py-3 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] text-[#201C18] dark:text-[#F4EFE6] font-mono text-xs font-bold uppercase tracking-wider hover:border-[#1E4D38] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Public Charter</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9A7432]" />
            </button>
          </div>
        </div>

        {/* 4-Cell Engraved Treasury Metric Ledger */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[#26211C]/20 dark:border-[#9A7432]/30">
          <div className="p-4 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              Total Underwritten
            </p>
            <p className="font-mono font-black text-xl sm:text-2xl text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </p>
            <p className="text-[11px] text-[#9A7432] font-ethiopic">የተሰበሰበ ድምር</p>
          </div>

          <div className="p-4 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              Active Cause Plates
            </p>
            <p className="font-mono font-black text-xl sm:text-2xl text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {activeCount}
            </p>
            <p className="text-[11px] text-[#9A7432] font-ethiopic">ንቁ ምክንያቶች</p>
          </div>

          <div className="p-4 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              Community Patrons
            </p>
            <p className="font-mono font-black text-xl sm:text-2xl text-[#201C18] dark:text-[#D8B066] tabular-nums">
              {totalSupporters.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#9A7432] font-ethiopic">ለጋሾች</p>
          </div>

          <div className="p-4 border border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FAF6EC] dark:bg-[#161411] space-y-1">
            <p className="type-caption text-[#5A4E3E] dark:text-[#9E9383]">
              Goal Fulfillment
            </p>
            <p className="font-mono font-black text-xl sm:text-2xl text-[#1E4D38] dark:text-[#52B788] tabular-nums">
              {totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%
            </p>
            <p className="text-[11px] text-[#9A7432] font-ethiopic">የዕቅድ አፈፃፀም</p>
          </div>
        </div>
      </section>

      {/* Secondary Operational Utility Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FAF6EC] dark:bg-[#141210]">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onViewContributions}
            className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#0E0D0B] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] transition-colors cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#9A7432]" />
            <span>Contribution Ledger ({allRecentDonations.length})</span>
          </button>

          <button
            type="button"
            onClick={onViewImpact}
            className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#F2EADA] dark:bg-[#0E0D0B] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#9A7432]" />
            <span>Field Impact Reports</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#1E4D38] dark:text-[#52B788] font-bold">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>NEXT AUDIT: HAWASSA STEM LAB MILESTONE VERIFICATION</span>
        </div>
      </div>

      {/* Main Two-Column Ledger: Managed Cause Plates + Live Contribution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Managed Cause Plates */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#26211C]/20 dark:border-[#9A7432]/30 pb-3">
            <div>
              <p className="type-caption text-[#9A7432]">
                INSTITUTIONAL CAUSE LEDGER
              </p>
              <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6] mt-1">
                MANAGED CAUSES ({campaigns.length})
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            {campaigns.map((camp) => {
              const percent = camp.goalAmount
                ? Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100))
                : 0;
              return (
                <article
                  key={camp.id}
                  className="relative p-5 sm:p-6 border-2 border-[#26211C]/80 dark:border-[#2F261E] bg-[#F2EADA] dark:bg-[#0E0D0B] hover:border-[#1E4D38] dark:hover:border-[#52B788] transition-colors space-y-4"
                >
                  <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/30" />

                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#26211C]/20 dark:border-[#4A3E33] pb-2.5 font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
                        № {camp.serialCode || 'LW-0421'}
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="uppercase font-bold text-[#201C18] dark:text-[#E8DEC8]">
                        {camp.category}
                      </span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-[#5A4E3E] dark:text-[#9E9383]">{camp.location}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 border font-mono text-[10px] font-black uppercase tracking-wider ${
                        camp.status === 'approved'
                          ? 'border-[#1E4D38] bg-[#1E4D38] text-white'
                          : 'border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] text-[#9A7432]'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-1.5">
                    <h3
                      onClick={() => onSelectCampaign(camp)}
                      className="type-subhead text-[#201C18] dark:text-[#F4EFE6] hover:text-[#1E4D38] dark:hover:text-[#52B788] cursor-pointer transition-colors"
                    >
                      {camp.title}
                    </h3>
                    <p className="type-body text-[#5A4E3E] dark:text-[#9E9383] line-clamp-2">
                      {camp.story}
                    </p>
                  </div>

                  <div className="relative z-10 pt-1">
                    <BanknoteRulerGauge
                      percent={percent}
                      raised={camp.raisedAmount}
                      goal={camp.goalAmount}
                    />
                  </div>

                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#26211C]/20 dark:border-[#4A3E33] font-mono text-xs">
                    <span className="text-[#5A4E3E] dark:text-[#9E9383] font-bold uppercase tabular-nums">
                      {camp.donationsCount || 0} PATRONS RECORDED
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onManageCampaign(camp)}
                        className="px-3.5 py-2 border border-[#26211C] dark:border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] text-[#201C18] dark:text-[#F4EFE6] font-mono text-xs font-bold uppercase hover:border-[#1E4D38] transition-colors cursor-pointer"
                      >
                        Manage &amp; Post Update
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectCampaign(camp)}
                        className="px-3.5 py-2 border border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black uppercase hover:bg-[#163E2C] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View Cause</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right 4 Columns: Live Contribution Stream */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b-2 border-[#26211C]/20 dark:border-[#9A7432]/30 pb-3">
            <p className="type-caption text-[#9A7432]">
              TELEBIRR &amp; CBE CLEARING
            </p>
            <h2 className="type-section-title text-[#201C18] dark:text-[#F4EFE6] mt-1">
              CONTRIBUTION STREAM
            </h2>
          </div>

          <div className="relative border-2 border-[#26211C] dark:border-[#9A7432] bg-[#F2EADA] dark:bg-[#0E0D0B] p-5 space-y-3">
            <div className="pointer-events-none absolute inset-1.5 border border-[#9A7432]/35" />

            <div className="relative z-10 divide-y divide-[#26211C]/15 dark:divide-[#9A7432]/25">
              {allRecentDonations.slice(0, 7).map((item) => (
                <div
                  key={item.donation.id}
                  className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif font-bold text-sm text-[#201C18] dark:text-[#F4EFE6] truncate">
                      {item.donation.donorName}
                    </span>
                    <span className="font-mono font-black text-[#1E4D38] dark:text-[#52B788] tabular-nums shrink-0">
                      +{item.donation.amount.toLocaleString()} ETB
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#5A4E3E] dark:text-[#9E9383] truncate">
                    {item.campaign.title}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#5A4E3E] dark:text-[#9E9383] font-mono pt-0.5 uppercase">
                    <span>{item.donation.paymentRail || 'TELEBIRR'}</span>
                    <span className="tabular-nums">
                      {new Date(item.donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {allRecentDonations.length === 0 && (
                <p className="py-6 text-center font-mono text-xs text-[#5A4E3E] dark:text-[#9E9383]">
                  No contributions recorded yet.
                </p>
              )}
            </div>

            <div className="relative z-10 pt-3 border-t border-[#26211C]/20 dark:border-[#9A7432]/30">
              <button
                type="button"
                onClick={onViewContributions}
                className="w-full py-2.5 px-4 border border-[#26211C] dark:border-[#9A7432] bg-[#FAF6EC] dark:bg-[#161411] text-[#201C18] dark:text-[#F4EFE6] font-mono text-xs font-bold uppercase tracking-wider hover:border-[#1E4D38] transition-colors cursor-pointer"
              >
                View Full Contribution Ledger →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationDashboard;

