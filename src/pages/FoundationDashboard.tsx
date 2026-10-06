import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Campaign, Donation, Organization } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { organizationService } from '../services/organizationService.ts';
import {
  Building2,
  ShieldCheck,
  Plus,
  TrendingUp,
  Users,
  Bell,
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
  Phone,
  Mail,
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
  const [resubmitError, setResubmitError] = useState<string | null>(null);

  const status = org.verificationStatus || (org.verified ? 'approved' : 'pending');

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResubmitting(true);
    setResubmitError(null);
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
      setResubmitSuccess('Application updated and resubmitted for admin verification.');
      setTimeout(() => setResubmitSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setResubmitError(err.message || 'Failed to resubmit the organization application. Please try again.');
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
  // PENDING / REJECTED / NEEDS_CHANGES STATUS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (status !== 'approved') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200 font-sans">
        {/* Top Navigation Return Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => (onBack ? onBack() : navigate('/'))}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('nav.backToHome', 'Back to Home')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => navigate('/discover')}
            >
              {t('nav.backToExplore', 'Back to Explore')}
            </Button>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {t('nav.orgDashboard', 'Organization Hub')}
          </span>
        </div>

        {/* Status Header Banner */}
        <section
          className={`relative overflow-hidden rounded-2xl border p-6 sm:p-10 shadow-lg text-[#F7F4EB] ${
            status === 'pending'
              ? 'border-amber-500/40 bg-gradient-to-br from-[#2A2312] via-[#1E190E] to-[#120F08]'
              : status === 'needs_changes'
              ? 'border-amber-600/50 bg-gradient-to-br from-[#2F210A] via-[#201607] to-[#150F05]'
              : 'border-red-500/40 bg-gradient-to-br from-[#2A1010] via-[#1E0B0B] to-[#120707]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono uppercase ${
                    status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : status === 'needs_changes'
                      ? 'bg-amber-600/20 text-amber-200 border border-amber-500/50'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {status === 'pending' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                  {status === 'needs_changes' && <MessageSquareWarning className="w-3.5 h-3.5" />}
                  {status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                  <span>
                    {status === 'pending'
                      ? 'STATUS: PENDING ACSO COMPLIANCE REVIEW'
                      : status === 'needs_changes'
                      ? 'STATUS: ACTION REQUIRED / CHANGES REQUESTED'
                      : 'STATUS: APPLICATION DECLINED'}
                  </span>
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Submitted: {org.submittedAt ? new Date(org.submittedAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {org.name}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                {status === 'pending' &&
                  'Your organization registration is currently queued for regulatory and identity verification. Cause publishing and fundraising actions are temporarily held.'}
                {status === 'needs_changes' &&
                  'The review administrator has requested clarifying changes before this organization can be approved.'}
                {status === 'rejected' &&
                  'This organization application was not approved. Institutional privileges and campaign publishing remain restricted.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={onViewProfile}
                className="text-[#F7F4EB] border-border hover:bg-surface/20"
                icon={<ExternalLink className="w-4 h-4 text-accent" />}
              >
                Profile Preview
              </Button>
            </div>
          </div>
        </section>

        {resubmitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resubmitSuccess}</span>
          </div>
        )}
        {resubmitError && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">{resubmitError}</p>
        )}

        {/* Admin Decision Note Banner if needs_changes or rejected */}
        {org.decisionNote && (
          <Card className="p-6 border-amber-500/50 bg-amber-500/10 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider font-mono">
              <MessageSquareWarning className="w-4 h-4" />
              <span>Note from Administrator / ACSO Auditor:</span>
            </div>
            <p className="text-sm text-primary leading-relaxed italic bg-surface/50 p-3 rounded-lg border border-border">
              &ldquo;{org.decisionNote}&rdquo;
            </p>
            {status === 'needs_changes' && !isEditingForResubmit && (
              <div className="pt-2">
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setIsEditingForResubmit(true)}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Edit Application &amp; Resubmit
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Resubmit Form when needs_changes */}
        {isEditingForResubmit && (
          <Card className="p-6 border-accent bg-surface space-y-4">
            <div className="border-b border-border pb-2">
              <h3 className="font-bold text-sm text-primary font-display uppercase tracking-wider">
                Update Organization Details &amp; Resubmit
              </h3>
              <p className="text-xs text-zinc-500">
                Address the reviewer&apos;s feedback above and resubmit for verification.
              </p>
            </div>

            <form onSubmit={handleResubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-primary mb-1">
                  Registration / ACSO Number
                </label>
                <input
                  type="text"
                  required
                  value={resubmitRegistrationNo}
                  onChange={(e) => setResubmitRegistrationNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary font-mono focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">
                  Description / Mission Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={resubmitDescription}
                  onChange={(e) => setResubmitDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-primary">
                  Attached Documents ({resubmitDocuments.length}/3)
                </label>
                {resubmitDocuments.length < 3 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. updated_acso_license.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface font-mono"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddResubmitDoc}>
                      Add
                    </Button>
                  </div>
                )}
                <ul className="space-y-1">
                  {resubmitDocuments.map((d, i) => (
                    <li key={i} className="flex items-center justify-between p-2 rounded bg-surface-alt font-mono text-[11px]">
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => setResubmitDocuments(resubmitDocuments.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingForResubmit(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" isLoading={isResubmitting}>
                  Resubmit for Review
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Protection Alert Card */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-bold">Fundraising &amp; Cause Publishing Locked</p>
            <p className="text-[11px] leading-relaxed">
              Per Lewegene platform governance and regulatory guidelines, foundations cannot create live cause plates, initiate public fundraisers, or accept donor funds until official ACSO accreditation is verified.
            </p>
          </div>
        </div>

        {/* Application Credentials Summary Card */}
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-base font-bold text-primary font-display uppercase tracking-wider">
              Submitted Application Credentials
            </h2>
            <p className="text-xs text-zinc-500">
              The details below are currently under review by our moderation team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Legal Entity */}
            <div className="p-4 rounded-xl border border-border bg-surface-alt/40 space-y-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Legal Entity
              </p>
              <div className="space-y-1.5">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Legal Name</span>
                  <span className="font-semibold text-primary">{org.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Category</span>
                  <span className="font-mono capitalize text-primary">{org.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Registration / ACSO No.</span>
                  <span className="font-mono text-primary">{org.registrationNo || 'ACSO Pending'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Location / Address</span>
                  <span className="text-primary">{org.location}</span>
                </div>
              </div>
            </div>

            {/* Representative */}
            <div className="p-4 rounded-xl border border-border bg-surface-alt/40 space-y-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                Authorized Representative
              </p>
              <div className="space-y-1.5">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Name</span>
                  <span className="font-semibold text-primary">{org.representative?.name || 'Representative on file'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Role</span>
                  <span className="text-primary">{org.representative?.role || 'Executive Officer'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Verified Phone</span>
                  <span className="font-mono text-primary">{org.representative?.phone || org.contactPhone}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Email</span>
                  <span className="font-mono text-primary">{org.representative?.email || org.contactEmail}</span>
                </div>
              </div>
            </div>

            {/* Receiving Bank Account */}
            <div className="p-4 rounded-xl border border-border bg-surface-alt/40 space-y-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                Receiving Bank Account
              </p>
              <div className="space-y-1.5">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Bank Institution</span>
                  <span className="font-semibold text-primary">{org.bank?.bank || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Account Number</span>
                  <span className="font-mono text-primary">{org.bank?.accountNumber || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Account Holder Name</span>
                  <span className="text-primary">{org.bank?.accountName || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="p-4 rounded-xl border border-border bg-surface-alt/40 space-y-2.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Verification Documents ({org.documents?.length || 0})
              </p>
              {org.documents && org.documents.length > 0 ? (
                <ul className="space-y-1.5 font-mono text-[11px]">
                  {org.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-primary truncate">
                      <FileCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-400 italic text-[11px]">No external documents attached.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIVE / APPROVED OPERATIONAL CONSOLE (Full Existing Features)
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Top Navigation Return Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => (onBack ? onBack() : navigate('/'))}
            className="gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('nav.backToHome', 'Back to Home')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => navigate('/discover')}
          >
            {t('nav.backToExplore', 'Back to Explore')}
          </Button>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {t('nav.orgDashboard', 'Organization Hub')}
        </span>
      </div>

      {/* Top Banknote-Style Foundation Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#B08A45]/40 bg-gradient-to-br from-[#173C32] via-[#102B23] to-[#0A1A15] text-[#F7F4EB] p-6 sm:p-10 shadow-lg">
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #C5A059 0, #C5A059 2px, transparent 0, transparent 8px)`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#B08A45]/50 bg-[#173C32]/80 text-[#C5A059] text-xs font-semibold tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>{org.registrationNo || 'ACSO/ET/2024/9021'} · Verified NGO</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                HQ: {org.location || 'Addis Ababa'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-white">
              {org.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Institutional Operations Console · Audited disbursement, milestone reporting, and donor transparency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="accent"
              size="md"
              onClick={onCreateCampaign}
              icon={<Plus className="w-4 h-4 text-[#1C1A17]" />}
            >
              Create New Cause
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onViewProfile}
              className="text-[#F7F4EB] border-[#B08A45]/60 hover:bg-[#1A4338]"
              icon={<ExternalLink className="w-4 h-4 text-[#C5A059]" />}
            >
              Public Profile
            </Button>
          </div>
        </div>

        {/* Overview Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#B08A45]/30">
          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Total Raised</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">የተሰበሰበ ድምር</p>
          </div>

          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Active Causes</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {activeCount}
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">ንቁ ዘመቻዎች</p>
          </div>

          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Total Supporters</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {totalSupporters}
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">ደጋፊዎች</p>
          </div>

          <div className="bg-[#1A4338]/60 backdrop-blur-xs rounded-xl p-4 border border-[#B08A45]/20">
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-medium">Funding Progress</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-1 tabular-nums">
              {totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%
            </p>
            <p className="text-[11px] text-[#C5A059] font-ethiopic mt-0.5">የዕቅድ አፈፃፀም</p>
          </div>
        </div>
      </section>

      {/* Secondary Quick Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewContributions}
            icon={<DollarSign className="w-3.5 h-3.5 text-accent" />}
          >
            Donation Ledger ({allRecentDonations.length})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onViewImpact}
            icon={<FileText className="w-3.5 h-3.5 text-accent" />}
          >
            Impact Reporting
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Next milestone audit: Hawassa STEM Lab milestone pending review</span>
        </div>
      </div>

      {/* Main Grid: Causes Management + Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Projects */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Managed Causes &amp; Interventions</h2>
              <p className="text-xs text-zinc-500">
                Track funding, publish updates to donors, and manage disbursement
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onCreateCampaign}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Cause
            </Button>
          </div>

          <div className="space-y-4">
            {campaigns.map((camp) => (
              <Card
                key={camp.id}
                className="p-5 border-border hover:border-accent/60 transition-all bg-surface shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-accent">{camp.serialCode || 'LW-0421'}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="capitalize text-zinc-500">{camp.category}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-zinc-500">{camp.location}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      camp.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : camp.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <div>
                  <h3
                    onClick={() => onSelectCampaign(camp)}
                    className="text-base font-bold text-primary hover:text-accent cursor-pointer transition-colors"
                  >
                    {camp.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {camp.story}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <ProgressBar
                    value={camp.raisedAmount}
                    max={camp.goalAmount}
                    size="sm"
                    color="accent"
                    showLabel
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    <span className="text-zinc-500">
                      {camp.donationsCount || 0} verified contributions
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onManageCampaign(camp)}
                      >
                        Manage &amp; Post Update
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectCampaign(camp)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                      >
                        Donor View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Live Recent Donations Feed */}
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-primary">Live Contribution Stream</h2>
            <p className="text-xs text-zinc-500">Real-time Telebirr &amp; CBE Birr verified receipts</p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4 space-y-3 shadow-xs">
            {allRecentDonations.slice(0, 7).map((item) => (
              <div
                key={item.donation.id}
                className="p-3 rounded-lg border border-border/70 hover:border-accent/40 bg-surface-alt/40 dark:bg-zinc-800/40 text-xs space-y-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary truncate max-w-[140px]">
                    {item.donation.donorName}
                  </span>
                  <span className="font-bold text-accent tabular-nums">
                    +{item.donation.amount.toLocaleString()} ETB
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 truncate">{item.campaign.title}</p>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-1">
                  <span>{item.donation.paymentRail?.toUpperCase() || 'TELEBIRR'}</span>
                  <span>{new Date(item.donation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold mt-2"
              onClick={onViewContributions}
            >
              View Full Contribution Ledger →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationDashboard;
