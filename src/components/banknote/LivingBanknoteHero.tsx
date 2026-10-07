import React from 'react';
import { APP_NAME } from '../../data/content.ts';
import { Button } from '../ui/Button.tsx';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  Heart,
  Building2,
  Mic,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export interface LivingBanknoteHeroProps {
  totalRaised: number;
  totalDonations: number;
  activeCount: number;
  onExplore: () => void;
  onForOrganizations?: () => void;
  onOpenVoice: () => void;
}

export const LivingBanknoteHero: React.FC<LivingBanknoteHeroProps> = ({
  totalRaised,
  totalDonations,
  activeCount,
  onExplore,
  onForOrganizations,
  onOpenVoice,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-[#173C32] dark:border-[#B08A45]/60 bg-[#FAF6EE] dark:bg-[#151917] p-6 sm:p-10 lg:p-12 shadow-xl banknote-shadow select-none">
      
      {/* Background Guilloché Waves & Intaglio Grid */}
      <div className="absolute inset-0 pointer-events-none intaglio-overlay opacity-40" />

      {/* Top Banknote Framing Corner Medallions */}
      <div className="absolute top-3 left-4 text-xs font-mono font-black text-[#173C32] dark:text-[#C5A059] flex items-center gap-1.5">
        <span className="w-6 h-6 rounded border border-[#B08A45] flex items-center justify-center font-bold text-[10px] bg-[#F7F4EB] dark:bg-zinc-800">
          ፻
        </span>
        <span className="banknote-serial-red text-[11px]">№ ET-2026-001</span>
      </div>

      <div className="absolute top-3 right-4 text-xs font-mono font-black text-[#173C32] dark:text-[#C5A059] flex items-center gap-1.5">
        <span className="banknote-serial-red text-[11px]">№ ET-2026-001</span>
        <span className="w-6 h-6 rounded border border-[#B08A45] flex items-center justify-center font-bold text-[10px] bg-[#F7F4EB] dark:bg-zinc-800">
          ፻
        </span>
      </div>

      {/* Main Central Banknote Engraving Plate */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-4">
        
        {/* National Banknote Script */}
        <div className="space-y-1">
          <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#B08A45] font-bold">
            የኢትዮጵያ የሕዝብ ትብብር ሰነድ · NATIONAL SOLIDARITY TENDER
          </p>

          <p className="text-xl sm:text-2xl font-ethiopic font-bold text-[#173C32] dark:text-[#C5A059] tracking-wider">
            ለወገን ደራሽ ወገን ነው።
          </p>
        </div>

        {/* Central Master Vignette */}
        <div className="p-6 sm:p-8 rounded-xl border-2 border-[#B08A45]/70 bg-gradient-to-b from-[#F7F3E6] via-[#FAF6EF] to-[#F2EAD8] dark:from-[#181E1B] dark:via-[#141816] dark:to-[#101412] shadow-inner space-y-4">
          
          <div className="inline-flex items-center justify-center p-2 rounded-full border border-[#B08A45] bg-[#F3ECE0] dark:bg-zinc-800 text-[#173C32] dark:text-[#C5A059] shadow-xs">
            <Award className="w-6 h-6 text-[#B08A45]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-[#173C32] dark:text-[#E8DEC8] leading-none banknote-engraved-text">
              {APP_NAME.toUpperCase()}
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              "Underwritten by collective compassion, sealed by Ethiopian civil society, settled directly in Birr."
            </p>
          </div>

          {/* Living Denomination Display Ribbon */}
          <div className="inline-block py-2 px-6 rounded-lg border border-[#B08A45]/50 bg-gradient-to-r from-[#173C32]/10 via-[#B08A45]/20 to-[#173C32]/10 dark:from-[#173C32]/30 dark:to-[#B08A45]/30">
            <span className="text-xl sm:text-2xl font-display font-black text-[#173C32] dark:text-[#E8DEC8] tracking-wider">
              {totalRaised.toLocaleString()} ETB
            </span>
            <span className="block text-[10px] font-mono tracking-widest text-[#B08A45] uppercase font-bold">
              VERIFIED TENDER DISTRIBUTED TO URGENT CAUSES
            </span>
          </div>

          {/* Primary Banknote Interactive Actions */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExplore}
              className="px-6 py-3 rounded-lg border-2 border-[#173C32] dark:border-[#C5A059] bg-[#173C32] dark:bg-[#C5A059] text-[#F7F4EB] dark:text-[#1C1A17] font-display font-bold text-sm tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#C5A059] dark:text-[#173C32]" />
              <span>ENTER NOTE · EXAMINE CAUSES</span>
            </button>

            {onForOrganizations && (
              <button
                onClick={onForOrganizations}
                className="px-5 py-3 rounded-lg border-2 border-[#B08A45] bg-[#FAF6EE] dark:bg-[#1B221E] text-primary font-mono font-bold text-xs tracking-wider hover:bg-[#F0EAD8] dark:hover:bg-zinc-800 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#B08A45]" />
                <span>TREASURY CONSOLE (FOUNDATIONS)</span>
              </button>
            )}

            <button
              onClick={onOpenVoice}
              className="px-4 py-3 rounded-lg border border-[#B08A45]/60 bg-[#F7F4EB] dark:bg-[#1B221E] text-accent text-xs font-mono font-bold hover:border-accent transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-accent animate-pulse" />
              <span>VOICE SEAL</span>
            </button>
          </div>

        </div>

        {/* 3 Banknote Engraved Metric Compartments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
          
          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F7F4EB]/80 dark:bg-[#181E1B] text-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              Total Underwritten
            </span>
            <span className="text-xl font-display font-bold text-[#173C32] dark:text-[#C5A059] tabular-nums">
              {totalRaised.toLocaleString()} ETB
            </span>
            <span className="text-[10px] font-ethiopic text-[#B08A45] block">በቴሌብርና ንግድ ባንክ</span>
          </div>

          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F7F4EB]/80 dark:bg-[#181E1B] text-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              Citizen Backers
            </span>
            <span className="text-xl font-display font-bold text-[#173C32] dark:text-[#C5A059] tabular-nums">
              {totalDonations} Supporters
            </span>
            <span className="text-[10px] font-ethiopic text-[#B08A45] block">የተመዘገቡ ዜጎች</span>
          </div>

          <div className="p-3.5 rounded-lg border border-[#D8CEBA] dark:border-[#2C3831] bg-[#F7F4EB]/80 dark:bg-[#181E1B] text-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              Active Interventions
            </span>
            <span className="text-xl font-display font-bold text-[#173C32] dark:text-[#C5A059] tabular-nums">
              {activeCount} Verified Notes
            </span>
            <span className="text-[10px] font-ethiopic text-[#B08A45] block">የፀደቁ ፕሮጀክቶች</span>
          </div>

        </div>

      </div>

    </section>
  );
};
