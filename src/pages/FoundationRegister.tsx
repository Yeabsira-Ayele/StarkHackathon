import React, { useEffect, useState } from 'react';
import { APP_NAME } from '../data/content.ts';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Organization } from '../types/index.ts';
import { organizationService } from '../services/organizationService.ts';
import { useAuth } from '../features/auth/hooks/useAuth.ts';
import { GoogleAuthButton } from '../features/auth/components/GoogleAuthButton.tsx';
import { mockBanks } from '../features/donations/data/banks.data.ts';
import {
  ShieldCheck,
  Building2,
  FileCheck,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User as UserIcon,
  Landmark,
  FileText,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export interface FoundationRegisterProps {
  onSuccess: (org: Organization) => void;
  onCancel: () => void;
  onOpenExisting: () => void;
}

const PRESET_LOGOS = [
  { id: 'logo-pediatrics', label: 'Health & Care', url: '/src/assets/images/ethiopia_medical_care_1790266416218.jpg' },
  { id: 'logo-stem', label: 'Education & STEM', url: '/src/assets/images/ethiopia_school_stem_1790266427111.jpg' },
  { id: 'logo-water', label: 'Clean Water', url: '/src/assets/images/ethiopia_clean_water_1790266442202.jpg' },
  { id: 'logo-craft', label: 'Heritage & Craft', url: '/src/assets/images/ethiopia_artisan_craft_1790266455378.jpg' },
];

export const FoundationRegister: React.FC<FoundationRegisterProps> = ({
  onSuccess,
  onCancel,
  onOpenExisting,
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [existingOrganization, setExistingOrganization] = useState<Organization | null>(null);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);
  const [checkedAccountId, setCheckedAccountId] = useState<string | null>(null);
  const [applicationLookupError, setApplicationLookupError] = useState<string | null>(null);
  const [lookupRetryKey, setLookupRetryKey] = useState(0);

  // 1. Organization Information
  const [name, setName] = useState('');
  const [type, setType] = useState<Organization['type']>('registered_ngo');
  const [registrationNo, setRegistrationNo] = useState('');
  const [location, setLocation] = useState('Addis Ababa, Ethiopia');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(PRESET_LOGOS[0].url);

  // 2. Authorized Representative
  const [repName, setRepName] = useState(user?.name || '');
  const [repRole, setRepRole] = useState('Executive Director');
  const [repPhone, setRepPhone] = useState(user?.phone || '');
  const [repEmail, setRepEmail] = useState(user?.email || '');

  // 3. Receiving Bank Account
  const [bankName, setBankName] = useState(mockBanks[0]?.name.en || 'Commercial Bank of Ethiopia (CBE)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // 4. Supporting Documents (Optional, max 3 files)
  const [documents, setDocuments] = useState<string[]>([]);
  const [documentUrlInput, setDocumentUrlInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrg, setSubmittedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    let active = true;
    setIsCheckingApplication(true);
    setApplicationLookupError(null);
    organizationService.getByUserId(user.id, user.email)
      .then((organization) => {
        if (active) setExistingOrganization(organization);
      })
      .catch((error: unknown) => {
        if (active) {
          setApplicationLookupError(
            error instanceof Error ? error.message : 'Unable to check for an existing organization application.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setCheckedAccountId(user.id);
          setIsCheckingApplication(false);
        }
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id, user?.email, lookupRetryKey]);

  useEffect(() => {
    if (!user) return;
    setRepName((current) => current || user.name);
    setRepEmail((current) => current || user.email);
    setContactEmail((current) => current || user.email);
  }, [user]);

  const handleAddDocument = () => {
    const value = documentUrlInput.trim();
    if (!value) return;
    if (documents.length >= 3) {
      setErrorMsg('A maximum of 3 supporting verification documents can be attached.');
      return;
    }
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported document link');
    } catch {
      setErrorMsg('Enter a valid HTTPS or HTTP link to a supporting document.');
      return;
    }
    if (documents.includes(value)) {
      setErrorMsg('This document link has already been added.');
      return;
    }
    setDocuments((current) => [...current, value]);
    setDocumentUrlInput('');
    setErrorMsg(null);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Organization name is required.');
      return;
    }
    if (!contactEmail.trim()) {
      setErrorMsg('Official email address is required.');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMsg('Contact phone number is required.');
      return;
    }
    if (!repName.trim() || !repPhone.trim()) {
      setErrorMsg('Authorized representative name and phone are required.');
      return;
    }
    if (!isAuthenticated || !user?.email) {
      setErrorMsg('Sign in with Google before submitting an organization application.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documents.length === 0) {
      setErrorMsg('Add at least one link to an organization verification document.');
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setErrorMsg('Receiving bank name, account number, and account holder name are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: Partial<Organization> = {
        name: name.trim(),
        type,
        registrationNo: registrationNo.trim(),
        location: location.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim(),
        description: description.trim() || 'Accredited civil society organization dedicated to impactful community work.',
        website: website.trim(),
        logoUrl: selectedLogo,
        verified: false,
        verificationStatus: 'pending',
        foundedYear: new Date().getFullYear(),
        representative: {
          name: repName.trim(),
          role: repRole.trim(),
          phone: repPhone.trim(),
          email: repEmail.trim() || contactEmail.trim(),
        },
        bank: {
          bank: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        },
        documents,
        userId: user?.id,
      };

      const newOrg = await organizationService.register(payload);
      setSubmittedOrg(newOrg);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit organization registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user?.email) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-6">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} className="gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('nav.backToHome')}</span>
        </Button>
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-4">
          <h1 className="text-xl font-display font-bold text-primary">
            Sign in with Google to register your organization
          </h1>
          <p className="text-sm text-zinc-500">
            Your verified Google email will be used for your account. Organization contact details are collected separately.
          </p>
          <GoogleAuthButton />
        </Card>
      </div>
    );
  }

  if (isAuthLoading || isCheckingApplication || (isAuthenticated && user?.id && checkedAccountId !== user.id)) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card className="p-6 border-border bg-surface text-center text-sm text-zinc-500">
          Checking for an organization application associated with your account…
        </Card>
      </div>
    );
  }

  if (applicationLookupError) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-4">
        <Card className="p-6 border-border bg-surface space-y-4">
          <h1 className="text-lg font-display font-bold text-primary">Unable to check your application</h1>
          <p role="alert" className="text-sm text-zinc-500">{applicationLookupError}</p>
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={onCancel}>Back to home</Button>
            <Button variant="accent" type="button" onClick={() => setLookupRetryKey((key) => key + 1)}>
              Try again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (existingOrganization) {
    const statusLabel: Record<Organization['verificationStatus'], string> = {
      pending: 'Pending review',
      under_review: 'Under review',
      approved: 'Approved',
      verified: 'Verified',
      needs_changes: 'Changes requested',
      rejected: 'Rejected',
    };
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12">
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-5">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {statusLabel[existingOrganization.verificationStatus]}
            </span>
            <h1 className="text-2xl font-display font-bold text-primary">
              An organization is already registered
            </h1>
            <p className="text-sm text-zinc-500">
              This account is associated with the following Lewegene organization. You can’t submit a duplicate application.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-alt p-4 space-y-2 text-sm">
            <p><span className="font-semibold text-primary">Organization:</span> {existingOrganization.name}</p>
            <p><span className="font-semibold text-primary">Contact email:</span> {existingOrganization.contactEmail}</p>
            <p><span className="font-semibold text-primary">Location:</span> {existingOrganization.location}</p>
            {existingOrganization.decisionNote && (
              <p className="border-t border-border pt-2">
                <span className="font-semibold text-primary">Review note:</span> {existingOrganization.decisionNote}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="accent" type="button" onClick={onOpenExisting} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              View organization workspace
            </Button>
            <Button variant="outline" type="button" onClick={onCancel}>Back to home</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Top Return Navigation Bar (accessible on every step) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onCancel}
          className="gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('nav.backToHome')}</span>
        </Button>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {t('organization.signupTitle')}
        </span>
      </div>

      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#B08A45]/40 bg-surface text-accent text-xs font-semibold uppercase tracking-wider font-mono">
          <Building2 className="w-3.5 h-3.5" />
          <span>Institutional Accreditation &amp; Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">
          Register Your Organization on {APP_NAME}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
          Submit official ACSO/NGO registration credentials, representative contact, and settlement account for administrative review.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 text-xs font-semibold font-mono">
        <span className={`px-3 py-1 rounded-full transition-colors ${step >= 1 ? 'bg-accent text-[#1C1A17]' : 'bg-surface-alt text-zinc-400'}`}>
          1. Org &amp; Representative
        </span>
        <span className="text-zinc-300">→</span>
        <span className={`px-3 py-1 rounded-full transition-colors ${step >= 2 ? 'bg-accent text-[#1C1A17]' : 'bg-surface-alt text-zinc-400'}`}>
          2. Bank &amp; Documents
        </span>
        <span className="text-zinc-300">→</span>
        <span className={`px-3 py-1 rounded-full transition-colors ${step === 3 ? 'bg-amber-600 text-white' : 'bg-surface-alt text-zinc-400'}`}>
          3. Pending Review
        </span>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Organization & Representative Information */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-6">
          <form onSubmit={handleNextToStep2} className="space-y-6 text-xs">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-primary font-display uppercase tracking-wider">
                1. Institutional Details
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Official legal registry identity under Ethiopian Civil Society Organizations Proclamation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-primary mb-1">
                  Organization Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethiopian Health & Education Trust"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Organization Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                  >
                    <option value="registered_ngo">Registered NGO (ACSO)</option>
                    <option value="charity_foundation">Charity / Public Foundation</option>
                    <option value="community_coop">Community Cooperative</option>
                    <option value="faith_based">Faith-Based Initiative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">
                    ACSO / Legal Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACSO/ET/2026/8920"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary font-mono focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Headquarters / Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bole Subcity, Addis Ababa"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Official Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.org.et"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">
                  Mission &amp; Scope of Work *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your organization's mission, target beneficiaries, and core activities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent leading-relaxed"
                />
              </div>

              {/* Logo Selection */}
              <div>
                <label className="block font-semibold text-primary mb-1.5">
                  Organization Logo / Emblem
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      type="button"
                      key={logo.id}
                      onClick={() => setSelectedLogo(logo.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        selectedLogo === logo.url
                          ? 'border-accent bg-accent/10 ring-1 ring-accent'
                          : 'border-border hover:border-accent/40 bg-surface'
                      }`}
                    >
                      <img src={logo.url} alt={logo.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] font-semibold text-primary truncate">{logo.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Representative Contact Section */}
            <div className="pt-4 border-t border-border space-y-4">
              <div>
                <h2 className="text-sm font-bold text-primary font-display uppercase tracking-wider">
                  2. Authorized Representative &amp; Contact Details
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  The primary contact person authorized by board resolution or power of attorney.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Representative Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Solomon Desta"
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      className="w-full px-3.5 py-2.5 pl-10 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                    />
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Institutional Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Director / Board Secretary"
                    value={repRole}
                    onChange={(e) => setRepRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Official Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="rep@organization.org.et"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        if (!repEmail) setRepEmail(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 pl-10 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+251 9XX XXX XXX"
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        setRepPhone(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 pl-10 rounded-lg border border-border bg-surface text-primary font-mono focus:ring-1 focus:ring-accent"
                    />
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Signed in with verified Google email: {user.email}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="md">
                Continue to Bank &amp; Documents <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: Receiving Bank & Supporting Documents */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-6">
          <form onSubmit={handleSubmitRegistration} className="space-y-6 text-xs">
            <div className="border-b border-border pb-3">
              <h2 className="text-sm font-bold text-primary font-display uppercase tracking-wider">
                2. Settlement Bank &amp; Supporting Documents
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Designate the official institutional bank account for milestone-audited donor disbursements.
              </p>
            </div>

            {/* Bank details */}
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-primary mb-1">
                  Receiving Bank *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                >
                  {mockBanks.map((b) => (
                    <option key={b.id} value={b.name.en}>
                      {b.name.en} ({b.shortName})
                    </option>
                  ))}
                  <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Telebirr (Ethio Telecom)">Telebirr (Ethio Telecom)</option>
                  <option value="Bank of Abyssinia (BOA)">Bank of Abyssinia (BOA)</option>
                  <option value="Awash Bank">Awash Bank</option>
                  <option value="Cooperative Bank of Oromia (Coop)">Cooperative Bank of Oromia (Coop)</option>
                  <option value="Dashen Bank">Dashen Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Account Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter the account number you own"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 pl-10 rounded-lg border border-border bg-surface text-primary font-mono focus:ring-1 focus:ring-accent"
                    />
                    <Landmark className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-primary mb-1">
                    Account Name (Must match legal entity) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hope for Horn Children Trust"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Verification Documents (Optional, max 3) */}
            <div className="pt-4 border-t border-border space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-primary font-display uppercase tracking-wider">
                    Supporting Verification Documents
                  </h2>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {documents.length}/3 links added (Required)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Add shareable links to your ACSO certificate, TIN certificate, or board resolution. Make sure reviewers can access them.
                </p>
              </div>

              {/* Add document input */}
              {documents.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/…"
                    value={documentUrlInput}
                    onChange={(e) => setDocumentUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDocument}
                    icon={<UploadCloud className="w-3.5 h-3.5" />}
                  >
                    Add Link
                  </Button>
                </div>
              )}

              {/* Document list */}
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border bg-surface-alt/40 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-accent shrink-0" />
                        <a href={doc} target="_blank" rel="noreferrer" className="truncate text-accent underline underline-offset-2">
                          {doc}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Remove document link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400 italic">At least one verification document link is required.</p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back to Details
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="md"
                isLoading={isSubmitting}
                icon={<ShieldCheck className="w-4 h-4 text-[#1C1A17]" />}
              >
                Submit Application for Review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 3: Submission Confirmation (Status: PENDING REVIEW) */}
      {step === 3 && submittedOrg && (
        <Card className="p-8 border-[#B08A45]/50 bg-gradient-to-br from-[#F7F4EB] to-[#EFE7D8] dark:from-[#181D1A] dark:to-[#111413] shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-500/40 shadow-sm">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold border border-amber-300">
              STATUS: PENDING ADMINISTRATIVE REVIEW
            </span>
            <h2 className="text-2xl font-display font-bold text-primary mt-3">
              Application Submitted: {submittedOrg.name}
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Your organizational credentials have been recorded and routed directly to the {APP_NAME} compliance review desk.
            </p>
          </div>

          {/* Review Details Card */}
          <div className="max-w-lg mx-auto p-4 rounded-xl border border-border bg-surface text-left text-xs font-mono space-y-2">
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-zinc-500">Registration ID:</span>
              <span className="font-bold text-primary">{submittedOrg.registrationNo}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-zinc-500">Representative:</span>
              <span className="text-primary">{submittedOrg.representative?.name}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-zinc-500">Settlement Bank:</span>
              <span className="text-primary">{submittedOrg.bank?.bank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Documents Attached:</span>
              <span className="text-primary">{submittedOrg.documents?.length || 0} file(s)</span>
            </div>
          </div>

          {/* Protection Notice */}
          <div className="max-w-lg mx-auto p-3.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Institutional Features Locked</p>
              <p className="text-[11px] leading-relaxed mt-0.5">
                In compliance with regulatory standards, public cause creation, fundraising, and donor disbursements will be activated once an administrator approves your application.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="accent"
              size="lg"
              onClick={() => onSuccess(submittedOrg)}
              icon={<ArrowRight className="w-4 h-4 text-[#1C1A17]" />}
              iconPosition="right"
            >
              View Application Status
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FoundationRegister;
