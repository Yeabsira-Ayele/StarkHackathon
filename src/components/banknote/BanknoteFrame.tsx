import React, { useState } from 'react';
import { GuillocheCanvas } from './GuillocheCanvas.tsx';
import { APP_NAME } from '../../data/content.ts';
import {
  Mic,
  Moon,
  Sun,
  Globe,
  ShieldCheck,
  Award,
  Heart,
  Building2,
  Sparkles,
  ChevronDown,
  Check,
  FileText,
} from 'lucide-react';

export interface BanknoteFrameProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenVoice: () => void;
  onOpenScholarxiv?: () => void;
  pendingCount?: number;
  userRole: 'donor' | 'foundation';
  onRoleChange: (role: 'donor' | 'foundation') => void;
  language: 'en' | 'am';
  onLanguageChange: (lang: 'en' | 'am') => void;
  isDark: boolean;
  onToggleDark: () => void;
  onTriggerDemoTour?: (tourType: 'donor' | 'foundation' | 'connected') => void;
}

export const BanknoteFrame: React.FC<BanknoteFrameProps> = ({
  children,
  currentView,
  onNavigate,
  onOpenVoice,
  onOpenScholarxiv,
  pendingCount = 0,
  userRole,
  onRoleChange,
  language,
  onLanguageChange,
  isDark,
  onToggleDark,
  onTriggerDemoTour,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  // Navigation Items engraved into the banknote border
  const donorItems = [
    { id: 'campaigns', num: '፩', en: 'EXPLORE CAUSES', am: 'ዘመቻዎች' },
    { id: 'donor_dashboard', num: '፪', en: 'PATRON IMPACT & VAULT', am: 'የእኔ ድጋፍ' },
    { id: 'foundation_landing', num: '፫', en: 'INSTITUTIONAL TRUST', am: 'ለድርጅቶች' },
  ];

  const foundationItems = [
    { id: 'foundation_dashboard', num: '፩', en: 'TREASURY CONSOLE', am: 'መድረክ' },
    { id: 'create', num: '፪', en: 'ENGRAVE NEW CAUSE', am: 'አዲስ ዘመቻ' },
    { id: 'foundation_contributions', num: '፫', en: 'CASH LEDGER', am: 'የገንዘብ ዝርዝር' },
    { id: 'foundation_impact', num: '፬', en: 'FIELD IMPACT AUDIT', am: 'ሪፖርት' },
    { id: 'campaigns', num: '፭', en: 'PUBLIC NOTE FEED', am: 'የህዝብ ገፅ' },
  ];

  const activeNavItems = userRole === 'donor' ? donorItems : foundationItems;

  return (
    <div className="relative min-h-screen bg-[#F4EFE6] dark:bg-[#0E1210] text-[#1C1A17] dark:text-[#F4EFE6] p-2 sm:p-4 md:p-6 transition-colors duration-300">
      
      {/* Living Guilloché Canvas Layer */}
      <GuillocheCanvas opacity={isDark ? 0.08 : 0.07} color={isDark ? '#C5A059' : '#173C32'} />

      {/* The Outer Intaglio Banknote Border Framing the entire application */}
      <div className="relative z-10 max-w-[1520px] mx-auto rounded-2xl border-4 border-[#173C32] dark:border-[#2C4A40] bg-[#FAF7F0] dark:bg-[#141816] shadow-2xl overflow-hidden banknote-inner-border">
        
        {/* Fine Intaglio Screen Overlay */}
        <div className="absolute inset-0 pointer-events-none intaglio-crosshatch opacity-30 select-none" />

        {/* ─── BANKNOTE TOP ORNAMENTAL RIBBON ─── */}
        <header className="relative z-20 border-b-2 border-[#173C32] dark:border-[#2C4A40] bg-[#F3ECE0] dark:bg-[#181E1B] p-3 sm:p-4 select-none">
          
          {/* Banknote Micro-Print Header Line */}
          <div className="flex items-center justify-between text-[10px] tracking-[0.25em] font-mono uppercase text-[#173C32]/70 dark:text-[#C5A059]/75 border-b border-[#D8CEBA] dark:border-[#2E3A34] pb-1.5 mb-2">
            <span>የኢትዮጵያ የሕዝብ ትብብር ሰነድ</span>
            <span className="hidden sm:inline">NATIONAL PHILANTHROPIC TENDER OF ETHIOPIA · ACSO VERIFIED</span>
            <span>LEGAL TENDER IN ETHIOPIA</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Top-Left: Corner Rosette & Serial Number Stamp */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border-2 border-[#B08A45] bg-[#F7F4EB] dark:bg-[#1B221E] flex flex-col items-center justify-center font-display shadow-xs text-center">
                <span className="text-base font-black text-[#173C32] dark:text-[#C5A059] leading-none">100</span>
                <span className="text-[10px] font-ethiopic font-bold text-[#B08A45] leading-none mt-0.5">፻ · ብር</span>
              </div>

              <div>
                <span className="banknote-serial-red text-xs block">№ FE8372490</span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider">SERIES 2026 / ETB</span>
              </div>
            </div>

            {/* Center: Monumental Banknote Title & Emblem */}
            <div className="text-center space-y-0.5 cursor-pointer" onClick={() => onNavigate('campaigns')}>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-serif text-[#B08A45] tracking-[0.3em] uppercase">ለወገን ደራሽ ወገን ነው</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-[#173C32] dark:text-[#E8DEC8] leading-none">
                {APP_NAME.toUpperCase()} · ለወገን
              </h1>
              <p className="text-[11px] font-serif italic text-zinc-500 dark:text-zinc-400">
                The Living Ethiopian Banknote for Civic Solidarity &amp; Transparent Philanthropy
              </p>
            </div>

            {/* Top-Right: Role Switcher & Controls */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              
              {/* Banknote Mode Switcher (Patron / Treasury) */}
              <div className="inline-flex p-1 rounded-lg border border-[#B08A45]/60 bg-[#F7F4EB] dark:bg-[#1B221E] text-xs font-mono shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('donor');
                    onNavigate('campaigns');
                  }}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    userRole === 'donor'
                      ? 'bg-[#173C32] text-white shadow-xs'
                      : 'text-zinc-500 hover:text-primary'
                  }`}
                >
                  <Heart className="w-3 h-3 text-[#C5A059]" />
                  <span>PATRON</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('foundation');
                    onNavigate('foundation_dashboard');
                  }}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    userRole === 'foundation'
                      ? 'bg-[#B08A45] text-[#1C1A17] shadow-xs'
                      : 'text-zinc-500 hover:text-primary'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>TREASURY</span>
                </button>
              </div>

              {/* Scholarxiv Archives Trigger */}
              {onOpenScholarxiv && (
                <button
                  type="button"
                  onClick={onOpenScholarxiv}
                  title="Scholarxiv Research Archive & Architecture Trail"
                  className="px-2.5 py-1.5 rounded-lg border border-[#B08A45]/60 bg-[#F7F4EB] dark:bg-[#1B221E] text-xs font-mono font-bold text-primary hover:border-accent transition-all cursor-pointer shadow-xs hidden lg:flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#B08A45]" />
                  <span>ARCHIVES</span>
                </button>
              )}

              {/* Moderation / Audit Desk */}
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                title="Banknote Moderation & Audit Desk"
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'border-[#173C32] bg-[#173C32] text-white dark:border-[#C5A059] dark:bg-[#C5A059] dark:text-[#1C1A17]'
                    : 'border-[#B08A45]/60 bg-[#F7F4EB] dark:bg-[#1B221E] text-primary hover:border-accent'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">AUDIT</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-black">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Guided Tour Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#B08A45]/60 bg-[#F7F4EB] dark:bg-[#1B221E] text-xs font-mono font-bold text-[#B08A45] hover:border-accent transition-all cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">GUIDED TOURS</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border-2 border-[#B08A45] bg-[#FBF9F3] dark:bg-[#1B221E] shadow-2xl p-2 z-50 text-xs font-sans">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                      Examine Banknote Flow
                    </p>
                    <button
                      onClick={() => {
                        setDemoMenuOpen(false);
                        onTriggerDemoTour?.('donor');
                      }}
                      className="w-full text-left p-2 rounded hover:bg-[#F0EAD8] dark:hover:bg-zinc-800 transition-colors"
                    >
                      <p className="font-bold text-[#173C32] dark:text-[#C5A059]">1. Patron Journey</p>
                      <p className="text-[10px] text-zinc-500">Examine Cause → Underwrite 500 ETB → Mint Certificate</p>
                    </button>
                    <button
                      onClick={() => {
                        setDemoMenuOpen(false);
                        onTriggerDemoTour?.('foundation');
                      }}
                      className="w-full text-left p-2 rounded hover:bg-[#F0EAD8] dark:hover:bg-zinc-800 transition-colors"
                    >
                      <p className="font-bold text-[#173C32] dark:text-[#C5A059]">2. Treasury Desk</p>
                      <p className="text-[10px] text-zinc-500">Foundation Console → Issue Cause → Manage Milestones</p>
                    </button>
                    <button
                      onClick={() => {
                        setDemoMenuOpen(false);
                        onTriggerDemoTour?.('connected');
                      }}
                      className="w-full text-left p-2 rounded hover:bg-[#F0EAD8] dark:hover:bg-zinc-800 transition-colors"
                    >
                      <p className="font-bold text-[#173C32] dark:text-[#C5A059]">3. Real-time Connected State</p>
                      <p className="text-[10px] text-zinc-500">Publish Cause → Backed immediately in public bill</p>
                    </button>
                  </div>
                )}
              </div>

              {/* Voxide Living Voice Rosette Trigger */}
              <button
                type="button"
                onClick={onOpenVoice}
                title="Voxide Voice Seal"
                className="w-9 h-9 rounded-full border-2 border-[#B08A45] bg-[#F7F4EB] dark:bg-[#1B221E] text-accent flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer relative group"
              >
                <Mic className="w-4 h-4 text-accent animate-pulse" />
                <span className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono uppercase bg-black text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                  Voice Seal
                </span>
              </button>

              {/* Theme Toggle (Daylight Ivory / Midnight Slate) */}
              <button
                type="button"
                onClick={onToggleDark}
                title={isDark ? 'Switch to Daylight Paper' : 'Switch to Midnight Ink'}
                className="w-8 h-8 rounded-lg border border-[#B08A45]/40 bg-[#F7F4EB] dark:bg-[#1B221E] flex items-center justify-center hover:bg-[#EFE7D8] text-primary transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-accent" />}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-2 py-1 rounded-lg border border-[#B08A45]/40 bg-[#F7F4EB] dark:bg-[#1B221E] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  <span className="uppercase">{language}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 rounded-xl border border-border bg-surface shadow-xl p-1 z-50 text-xs">
                    <button
                      onClick={() => {
                        onLanguageChange('en');
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-surface-alt flex justify-between"
                    >
                      <span>English</span>
                      {language === 'en' && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                    <button
                      onClick={() => {
                        onLanguageChange('am');
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-surface-alt flex justify-between"
                    >
                      <span>አማርኛ</span>
                      {language === 'am' && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ─── ENGRAVED NAVIGATION RIBBON ─── */}
          <nav className="flex items-center justify-center gap-2 sm:gap-6 pt-3 mt-2 border-t border-[#D8CEBA] dark:border-[#2E3A34] text-xs font-mono font-bold tracking-wider overflow-x-auto py-1">
            {activeNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-md border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#173C32] dark:border-[#C5A059] bg-[#173C32] dark:bg-[#C5A059] text-white dark:text-[#1C1A17] shadow-xs'
                      : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:border-[#B08A45]/40 hover:text-primary'
                  }`}
                >
                  <span className="font-ethiopic text-accent font-black">{item.num}</span>
                  <span>{language === 'am' ? item.am : item.en}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* ─── MAIN BANKNOTE CENTRAL PRINTING COMPARTMENT ─── */}
        <main className="relative z-10 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-240px)]">
          {children}
        </main>

        {/* ─── BANKNOTE BOTTOM MARGIN & ENDORSEMENT BAND ─── */}
        <footer className="relative z-20 border-t-2 border-[#173C32] dark:border-[#2C4A40] bg-[#F3ECE0] dark:bg-[#181E1B] p-4 select-none text-xs font-mono">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-[#B08A45] bg-[#F7F4EB] dark:bg-[#1B221E] flex flex-col items-center justify-center font-display shadow-xs text-center">
                <span className="text-xs font-bold text-[#173C32] dark:text-[#C5A059]">100</span>
                <span className="text-[9px] font-ethiopic text-[#B08A45]">፻:ብር</span>
              </div>
              <div>
                <p className="font-bold text-[#173C32] dark:text-[#E8DEC8]">PAYABLE TO THE BEARER ON DEMAND</p>
                <p className="text-[10px] text-zinc-500">100% AUDITED LOCAL DISBURSEMENT VIA TELEBIRR &amp; CBE BIRR</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="border-b border-zinc-400 dark:border-zinc-600 inline-block px-4 pb-0.5 font-serif italic text-xs text-[#173C32] dark:text-[#C5A059]">
                Board of Philanthropic Oversight
              </div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">GOVERNOR &amp; TRUSTEE</p>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
};
