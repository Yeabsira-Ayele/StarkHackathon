import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Plus,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  Check,
  ShieldCheck,
  Building2,
  Heart,
  Sparkles,
  Award,
  Play,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { APP_NAME } from '../../data/content.ts';

export interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenVoice: () => void;
  onOpenScholarxiv?: () => void;
  pendingCount?: number;
  language: 'en' | 'am' | 'om';
  onLanguageChange: (lang: 'en' | 'am' | 'om') => void;
  isDark?: boolean;
  onToggleDark?: () => void;
  userRole: 'donor' | 'foundation';
  onRoleChange: (role: 'donor' | 'foundation') => void;
  onTriggerDemoTour?: (tourType: 'donor' | 'foundation' | 'connected') => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onOpenVoice,
  language,
  onLanguageChange,
  isDark = false,
  onToggleDark,
  userRole,
  onRoleChange,
  onTriggerDemoTour,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions = [
    { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'am', label: 'አማርኛ', native: 'Amharic', flag: '🇪🇹' },
  ] as const;

  const currentLanguageOption =
    languageOptions.find((l) => l.code === language) || languageOptions[0];

  // Dynamic Navigation Items based on User Role
  const donorNavItems = [
    {
      id: 'campaigns',
      label: language === 'am' ? 'ዘመቻዎች' : 'Explore Causes',
    },
    {
      id: 'donor_dashboard',
      label: language === 'am' ? 'የእኔ ድጋፍ' : 'My Impact & Receipts',
    },
    {
      id: 'foundation_landing',
      label: language === 'am' ? 'ለድርጅቶች' : 'For Organizations',
    },
  ];

  const foundationNavItems = [
    {
      id: 'foundation_dashboard',
      label: language === 'am' ? 'መድረክ' : 'Foundation Hub',
    },
    {
      id: 'create',
      label: language === 'am' ? 'አዲስ ዘመቻ' : 'Create Cause',
    },
    {
      id: 'foundation_contributions',
      label: language === 'am' ? 'የገንዘብ ዝርዝር' : 'Contribution Ledger',
    },
    {
      id: 'foundation_impact',
      label: language === 'am' ? 'ሪፖርት' : 'Impact Reports',
    },
    {
      id: 'campaigns',
      label: language === 'am' ? 'የህዝብ ገፅ' : 'Public Feed',
    },
  ];

  const currentNavItems = userRole === 'donor' ? donorNavItems : foundationNavItems;

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 dark:bg-[#151917]/90 backdrop-blur-md border-b border-[#D8CEBA]/80 dark:border-[#313C36] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Wordmark & Emblem */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(userRole === 'donor' ? 'campaigns' : 'foundation_dashboard')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#173C32] to-[#B08A45] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-102 transition-transform font-display">
                ለ
              </div>
              <div className="text-left">
                <span className="text-xl font-display font-bold tracking-tight text-primary leading-none block">
                  {APP_NAME.toUpperCase()}
                </span>
                <span className="text-[10px] text-accent font-ethiopic font-semibold tracking-wider">
                  ለወገን ደራሽ
                </span>
              </div>
            </button>
          </div>

          {/* Role-Specific Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
            {currentNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-accent font-bold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Interactive Controls & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Role Switcher Pill */}
            <div className="hidden sm:inline-flex items-center p-0.5 rounded-full border border-[#D8CEBA] dark:border-[#313C36] bg-[#F7F4EB]/70 dark:bg-zinc-800/60 shadow-xs text-xs">
              <button
                type="button"
                onClick={() => {
                  onRoleChange('donor');
                  if (currentView.startsWith('foundation_')) {
                    onNavigate('campaigns');
                  }
                }}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  userRole === 'donor'
                    ? 'bg-[#173C32] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-primary'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>Supporter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRoleChange('foundation');
                  onNavigate('foundation_dashboard');
                }}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  userRole === 'foundation'
                    ? 'bg-accent text-[#1C1A17] font-bold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-primary'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Foundation</span>
              </button>
            </div>

            {/* Guided Tour Trigger for Platform Walkthroughs */}
            <div className="relative" ref={demoRef}>
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#B08A45]/40 bg-[#F7F4EB] dark:bg-zinc-800 text-accent hover:border-accent transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Guided Tours</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Platform Walkthroughs
                  </div>

                  <button
                    onClick={() => {
                      setDemoMenuOpen(false);
                      onRoleChange('donor');
                      onNavigate('campaigns');
                      onTriggerDemoTour?.('donor');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-alt cursor-pointer text-primary"
                  >
                    <Play className="w-3.5 h-3.5 text-accent" />
                    <div>
                      <p className="font-bold">1. Full Donor Journey</p>
                      <p className="text-[10px] text-zinc-400">Discover → Support → Certificate</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setDemoMenuOpen(false);
                      onRoleChange('foundation');
                      onNavigate('foundation_dashboard');
                      onTriggerDemoTour?.('foundation');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-alt cursor-pointer text-primary"
                  >
                    <Play className="w-3.5 h-3.5 text-accent" />
                    <div>
                      <p className="font-bold">2. Foundation Console</p>
                      <p className="text-[10px] text-zinc-400">Hub → Publish Cause → Manage</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setDemoMenuOpen(false);
                      onRoleChange('foundation');
                      onNavigate('create');
                      onTriggerDemoTour?.('connected');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-alt cursor-pointer text-primary"
                  >
                    <Play className="w-3.5 h-3.5 text-accent" />
                    <div>
                      <p className="font-bold">3. Connected Workflow</p>
                      <p className="text-[10px] text-zinc-400">Publish → Backed in real-time</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleDark}
              type="button"
              aria-label={isDark ? 'Switch to Daylight view' : 'Switch to Midnight view'}
              title={isDark ? 'Switch to Daylight view' : 'Switch to Midnight view'}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-surface hover:bg-surface-alt text-primary transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-accent shrink-0" />
              )}
            </button>

            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-expanded={langDropdownOpen}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-surface-alt text-primary transition-colors cursor-pointer shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{currentLanguageOption.label}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-surface shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        onLanguageChange(opt.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                        language === opt.code
                          ? 'bg-surface-alt text-accent font-bold'
                          : 'text-primary hover:bg-surface-alt/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <div>
                          <p className="leading-tight">{opt.label}</p>
                          <p className="text-[10px] text-zinc-400 font-normal">{opt.native}</p>
                        </div>
                      </div>
                      {language === opt.code && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voxide Voice Assistant Fast Trigger */}
            <button
              onClick={onOpenVoice}
              aria-label="Activate Voxide Voice Assistant"
              title="Voice Assistant"
              className="w-8 h-8 rounded-full flex items-center justify-center text-accent bg-[#F7F4EB] dark:bg-zinc-800 hover:border-accent border border-[#B08A45]/40 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <Mic className="w-3.5 h-3.5 text-accent animate-pulse" />
            </button>

            {/* Primary Action Button */}
            {userRole === 'donor' ? (
              <button
                onClick={() => onNavigate('create')}
                title="Start a Cause"
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-accent text-[#1C1A17] hover:opacity-90 active:scale-95 shadow-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#1C1A17]" />
                <span>{language === 'am' ? 'ጀምር' : 'Start'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('create')}
                title="Publish Cause"
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-accent text-[#1C1A17] hover:opacity-90 active:scale-95 shadow-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#1C1A17]" />
                <span>{language === 'am' ? 'አዲስ ዘመቻ' : '+ Cause'}</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-surface-alt cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center gap-2 p-1 rounded-lg border border-border bg-surface-alt text-xs mb-3">
            <button
              onClick={() => {
                onRoleChange('donor');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 rounded-md font-semibold text-center ${
                userRole === 'donor' ? 'bg-[#173C32] text-white' : 'text-zinc-500'
              }`}
            >
              Supporter
            </button>
            <button
              onClick={() => {
                onRoleChange('foundation');
                onNavigate('foundation_dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 rounded-md font-semibold text-center ${
                userRole === 'foundation' ? 'bg-accent text-[#1C1A17]' : 'text-zinc-500'
              }`}
            >
              Foundation
            </button>
          </div>

          {currentNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold ${
                currentView === item.id
                  ? 'bg-surface-alt text-accent'
                  : 'text-primary hover:bg-surface-alt'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
