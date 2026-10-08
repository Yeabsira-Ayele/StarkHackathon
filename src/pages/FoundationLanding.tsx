import React from 'react';
import { APP_NAME } from '../data/content.ts';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  FileText,
  Lock,
} from 'lucide-react';

export interface FoundationLandingProps {
  onRegister: () => void;
  onGoToDashboard: () => void;
  onExploreCauses: () => void;
}

export const FoundationLanding: React.FC<FoundationLandingProps> = ({
  onRegister,
  onGoToDashboard,
  onExploreCauses,
}) => {
  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-200">
      
      {/* Hero: For Organizations & Foundations */}
      <section className="relative overflow-hidden rounded-3xl border border-[#B08A45]/40 bg-gradient-to-br from-[#173C32] via-[#102922] to-[#0A1A16] text-[#F7F4EB] p-8 sm:p-14 shadow-2xl">
        {/* Subtle Banknote Guilloché Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #C5A059 0, #C5A059 2px, transparent 0, transparent 8px), repeating-linear-gradient(-45deg, #173C32 0, #173C32 2px, transparent 0, transparent 8px)`,
          }}
        />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B08A45]/50 bg-[#173C32]/90 text-[#C5A059] text-xs font-semibold tracking-wider uppercase font-mono">
            <Building2 className="w-4 h-4" />
            <span>{APP_NAME} Foundation Portal · Verified Philanthropy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            Empower Your Cause with Transparent Tech.
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-sans">
            Connect directly with compassionate local donors and the global Ethiopian diaspora. Receive zero-fee Birr disbursements, issue archival contribution certificates, and build lasting institutional trust.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="accent"
              size="lg"
              onClick={onRegister}
              icon={<ShieldCheck className="w-5 h-5 text-[#1C1A17]" />}
            >
              Register Organization
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onGoToDashboard}
              className="text-[#F7F4EB] border-[#B08A45]/60 hover:bg-[#1A4338]"
              icon={<ArrowRight className="w-4 h-4 text-[#C5A059]" />}
              iconPosition="right"
            >
              Access Foundation Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Institutional Trust */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary">
            Designed for Credibility, Speed, &amp; Impact
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Everything your foundation needs to finance verified interventions without intermediaries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-6 border-border hover:border-accent/60 transition-all bg-surface">
            <div className="w-10 h-10 rounded-lg bg-[#173C32]/10 dark:bg-[#173C32]/40 text-[#173C32] dark:text-[#C5A059] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-base font-bold text-primary mb-1">ACSO &amp; Legal Verification</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Showcase verified NGO licenses, civil society credentials, and board oversight to give donors complete confidence.
            </p>
          </Card>

          <Card className="p-6 border-border hover:border-accent/60 transition-all bg-surface">
            <div className="w-10 h-10 rounded-lg bg-[#173C32]/10 dark:bg-[#173C32]/40 text-[#173C32] dark:text-[#C5A059] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-base font-bold text-primary mb-1">Direct Birr Settlement</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Receive funds instantly through Telebirr and CBE Birr with transparent milestone disbursement triggers.
            </p>
          </Card>

          <Card className="p-6 border-border hover:border-accent/60 transition-all bg-surface">
            <div className="w-10 h-10 rounded-lg bg-[#173C32]/10 dark:bg-[#173C32]/40 text-[#173C32] dark:text-[#C5A059] flex items-center justify-center mb-4">
              <Award className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-base font-bold text-primary mb-1">Archival Donor Certificates</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Automated commemorative digital certificates sent to every supporter with official serial numbers and Ge'ez denomination.
            </p>
          </Card>

          <Card className="p-6 border-border hover:border-accent/60 transition-all bg-surface">
            <div className="w-10 h-10 rounded-lg bg-[#173C32]/10 dark:bg-[#173C32]/40 text-[#173C32] dark:text-[#C5A059] flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-base font-bold text-primary mb-1">Donor Engagement Ledger</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Post real-time project updates, photos from the field, and audited expense receipts to nurture repeat diaspora donors.
            </p>
          </Card>
        </div>
      </section>

      {/* Onboarding Steps Visual Guide */}
      <section className="bg-surface rounded-2xl border border-border p-8 sm:p-12 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-primary">
            How Foundations Launch on {APP_NAME}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            A frictionless, 3-step pathway from registration to campaign publication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="space-y-3 p-5 rounded-xl border border-border bg-[#F7F4EB]/50 dark:bg-zinc-800/40">
            <div className="w-8 h-8 rounded-full bg-accent text-[#1C1A17] font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-primary">Register &amp; Verify</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Submit your organization name, legal registration number (ACSO/TIN), and contact details for swift verification.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-xl border border-border bg-[#F7F4EB]/50 dark:bg-zinc-800/40">
            <div className="w-8 h-8 rounded-full bg-accent text-[#1C1A17] font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-primary">Publish Cause &amp; Budget</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Use our multi-step campaign builder to articulate the problem, expected beneficiaries, and transparent itemized budget.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-xl border border-border bg-[#F7F4EB]/50 dark:bg-zinc-800/40">
            <div className="w-8 h-8 rounded-full bg-accent text-[#1C1A17] font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-bold text-primary">Disburse &amp; Report Impact</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Receive direct contributions in Birr, publish live milestone updates to supporters, and generate verified impact reports.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>0% platform deduction · 100% of donor funding goes directly to verified causes</span>
          </div>

          <Button variant="accent" size="md" onClick={onRegister}>
            Create Organization Account
          </Button>
        </div>
      </section>

    </div>
  );
};
