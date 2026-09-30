import React, { useState } from 'react';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Organization } from '../types/index.ts';
import { campaignApi } from '../services/api/campaignApi.ts';
import {
  ShieldCheck,
  Building2,
  FileCheck,
  CheckCircle2,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export interface FoundationRegisterProps {
  onSuccess: (org: Organization) => void;
  onCancel: () => void;
}

export const FoundationRegister: React.FC<FoundationRegisterProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('Hope for Horn Children Foundation');
  const [type, setType] = useState<Organization['type']>('charity_foundation');
  const [registrationNo, setRegistrationNo] = useState('ACSO/ET/2024/9021');
  const [location, setLocation] = useState('Addis Ababa, Ethiopia');
  const [contactEmail, setContactEmail] = useState('director@hopeforhorn.et');
  const [contactPhone, setContactPhone] = useState('+251 91 144 8820');
  const [description, setDescription] = useState(
    'Dedicated to funding critical pediatric surgeries and nutrition support for orphaned and displaced children across Ethiopia.'
  );
  const [website, setWebsite] = useState('https://hopeforhorn.et');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedOrg, setVerifiedOrg] = useState<Organization | null>(null);

  const handleNextToDocs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registrationNo.trim()) return;
    setStep(2);
  };

  const handleCompleteVerification = async () => {
    setIsSubmitting(true);
    try {
      const org = await campaignApi.registerOrganization({
        name,
        type,
        registrationNo,
        location,
        contactEmail,
        contactPhone,
        description,
        website,
        verified: true,
        verificationStatus: 'verified',
        foundedYear: 2024,
      });
      setVerifiedOrg(org);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#B08A45]/40 bg-surface text-accent text-xs font-semibold uppercase tracking-wider font-mono">
          <Building2 className="w-3.5 h-3.5" />
          <span>Institutional Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary">
          Register Your Foundation on Lewegene
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
          Join accredited Ethiopian foundations creating transparent, community-funded solutions
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 text-xs font-semibold">
        <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-accent text-[#1C1A17]' : 'bg-surface-alt text-zinc-400'}`}>
          1. Organization Details
        </span>
        <span className="text-zinc-300">→</span>
        <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-accent text-[#1C1A17]' : 'bg-surface-alt text-zinc-400'}`}>
          2. ACSO Verification
        </span>
        <span className="text-zinc-300">→</span>
        <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-surface-alt text-zinc-400'}`}>
          3. Verified &amp; Active
        </span>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs">
          <form onSubmit={handleNextToDocs} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-primary mb-1">Organization Legal Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-primary mb-1">Organization Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                >
                  <option value="charity_foundation">Charity / Foundation</option>
                  <option value="registered_ngo">Registered NGO (ACSO)</option>
                  <option value="community_coop">Community Cooperative</option>
                  <option value="faith_based">Faith-Based Initiative</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Registration / ACSO No. *</label>
                <input
                  type="text"
                  required
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-primary mb-1">Headquarters / Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Official Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourfoundation.org"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-primary mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-primary mb-1">Official Phone</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-primary mb-1">Mission &amp; Core Activities</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent leading-relaxed"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="md">
                Continue to Verification
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: Verification Documents */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 border-border bg-surface shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-primary">Simulated Legal Credential Verification</h2>
            <p className="text-xs text-zinc-500">
              For this hackathon demo, legal documents are automatically verified against the national civil society registry
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-dashed border-[#B08A45]/70 bg-[#F7F4EB]/70 dark:bg-zinc-800/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#B08A45]/20 text-[#B08A45] flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-primary">ACSO Certificate of Registration</p>
                <p className="text-zinc-500 font-mono mt-0.5">{registrationNo} · Verified against Federal Registry</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                Ready
              </span>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-[#B08A45]/70 bg-[#F7F4EB]/70 dark:bg-zinc-800/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#B08A45]/20 text-[#B08A45] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-primary">Bank &amp; Telebirr Merchant Settlement</p>
                <p className="text-zinc-500 font-mono mt-0.5">Commercial Bank of Ethiopia · Trust escrow connected</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                Connected
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="accent"
              size="md"
              isLoading={isSubmitting}
              onClick={handleCompleteVerification}
              icon={<ShieldCheck className="w-4 h-4 text-[#1C1A17]" />}
            >
              Confirm &amp; Finalize Verification
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Success Confirmation */}
      {step === 3 && verifiedOrg && (
        <Card className="p-8 border-[#B08A45]/50 bg-gradient-to-br from-[#F7F4EB] to-[#EFE7D8] dark:from-[#181D1A] dark:to-[#111413] shadow-lg text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300">
              STATUS: VERIFIED
            </span>
            <h2 className="text-2xl font-display font-bold text-primary mt-2">
              Welcome, {verifiedOrg.name}!
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Your organization account is fully activated. You can now publish causes, manage milestones, and receive direct contributions in Ethiopian Birr.
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <Button
              variant="accent"
              size="lg"
              onClick={() => onSuccess(verifiedOrg)}
              icon={<ArrowRight className="w-4 h-4 text-[#1C1A17]" />}
              iconPosition="right"
            >
              Enter Foundation Dashboard
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};
