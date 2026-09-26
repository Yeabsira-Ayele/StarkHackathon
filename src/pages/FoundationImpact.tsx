import React from 'react';
import { Campaign } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  FileCheck,
  Download,
  Users,
  Building,
  Heart,
  Calendar,
} from 'lucide-react';

export interface FoundationImpactProps {
  campaigns: Campaign[];
  onBack: () => void;
}

export const FoundationImpact: React.FC<FoundationImpactProps> = ({
  campaigns,
  onBack,
}) => {
  const totalRaised = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalBeneficiaries = campaigns.reduce((acc, c) => acc + (c.beneficiariesTarget || 150), 0);

  const completedMilestones = [
    {
      title: 'Tikur Anbessa Pediatric Cardiac Unit Consumables',
      date: 'March 2026',
      beneficiaries: 'Bethlehem + 4 Pediatric Surgery Patients',
      impact: 'Funded oxygenator packs, specialized pediatric inotropes, and post-discharge cardiac anticoagulants.',
      status: 'Audited & Cleared',
    },
    {
      title: 'Hawassa High School STEM Physics & Biology Books',
      date: 'March 2026',
      beneficiaries: '640 Students',
      impact: '150 advanced biology textbooks delivered; lab optical microscopes cleared for Section 12-A.',
      status: 'In Progress (80%)',
    },
    {
      title: 'East Shewa Solar Pump Replacement Procurement',
      date: 'March 2026',
      beneficiaries: '1,200 Mojo Households',
      impact: 'Purchase order executed for Grundfos 5.5kW solar inverter pump to replace lightning-damaged unit.',
      status: 'Procured & Testing',
    },
  ];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Foundation Console
        </Button>

        <Button
          variant="accent"
          size="sm"
          onClick={() => window.print()}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Print Impact Dossier (PDF)
        </Button>
      </div>

      {/* Main Impact Header */}
      <div className="p-8 rounded-2xl border border-[#B08A45]/40 bg-gradient-to-br from-[#173C32] to-[#0D241E] text-[#F7F4EB] shadow-md space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#B08A45]/50 bg-[#173C32]/80 text-[#C5A059] text-xs font-semibold font-mono">
          <Award className="w-3.5 h-3.5" />
          <span>Audited Philanthropic Returns</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Institutional Impact &amp; Beneficiary Reporting
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
          Tangible evidence of lives impacted, infrastructure restored, and educational access delivered through donor Birr contributions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#B08A45]/30">
          <div>
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-semibold">Total Funds Disbursed</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-0.5 tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-semibold">Beneficiaries Reached</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-[#E8DFC8] mt-0.5 tabular-nums">
              {totalBeneficiaries.toLocaleString()}+ Individuals
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-300 uppercase tracking-wider font-semibold">Audit Status</p>
            <p className="text-xl sm:text-2xl font-display font-bold text-emerald-400 mt-0.5">
              100% Verified
            </p>
          </div>
        </div>
      </div>

      {/* Completed Milestones Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-primary">Milestones &amp; Field Delivery Records</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {completedMilestones.map((m, idx) => (
            <Card key={idx} className="p-5 border-border bg-surface shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-1">
                  <span>{m.date}</span>
                  <span className="text-emerald-600 font-bold">{m.status}</span>
                </div>
                <h3 className="text-sm font-bold text-primary">{m.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {m.impact}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-semibold text-primary">{m.beneficiaries}</span>
                <span className="text-accent font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Audited
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Transparency Guarantee */}
      <div className="p-6 rounded-xl border border-[#B08A45]/30 bg-surface space-y-3">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-accent" />
          <span>The Lewegene Transparency Standard</span>
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Unlike traditional crowdfunding, Lewegene requires foundations to submit itemized receipts and photographic evidence before milestone tranches are unlocked. Donors receive automated notifications and can inspect public audit receipts at any time.
        </p>
      </div>

    </div>
  );
};
