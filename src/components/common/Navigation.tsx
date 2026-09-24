import React, { useState, useRef, useEffect } from 'react';
import { Mic, Plus, Menu, X, Globe, Sun, Moon, ChevronDown, Check } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

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
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onOpenVoice,
  language,
  onLanguageChange,
  isDark = false,
  onToggleDark,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real consumer navigation items (no admin clutter in primary header)
  const navItems = [
    {
      id: 'campaigns',
      label: language === 'am' ? 'ዘመቻዎች' : language === 'om' ? 'Duulaalee' : 'Explore Campaigns',
    },
    {
      id: 'create',
      label: language === 'am' ? 'ዘመቻ ጀምር' : language === 'om' ? 'Duula Jalqabi' : 'Start a Campaign',
    },
  ];

  const languageOptions = [
    { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'am', label: 'አማርኛ', native: 'Amharic', flag: '🇪🇹' },
    { code: 'om', label: 'Afaan Oromoo', native: 'Oromo', flag: '🇪🇹' },
  ] as const;

  const currentLanguageOption = languageOptions.find((l) => l.code === language) || languageOptions[0];

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/90 dark:bg-surface/90 backdrop-blur-md border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('campaigns')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-base tracking-tighter shadow-xs group-hover:opacity-90 transition-opacity">
                ለ
              </div>
              <span className="text-xl font-bold tracking-tight text-primary font-sans">
                Lewegene
              </span>
            </button>
          </div>

          {/* Zone 2: Clean, uncluttered user navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-1.5 transition-colors cursor-pointer text-sm font-medium ${
                    isActive
                      ? 'text-accent font-semibold'
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

          {/* Zone 3: Primary interactive controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Night & Day View Toggle Button */}
            <button
              onClick={onToggleDark}
              type="button"
              aria-label={isDark ? 'Switch to Day view' : 'Switch to Night view'}
              title={isDark ? 'Switch to Day view' : 'Switch to Night view'}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-surface hover:bg-zinc-100 dark:hover:bg-zinc-800 text-primary transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-accent shrink-0" />
              )}
            </button>

            {/* Language Dropdown (Clean, modern, user-friendly) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-zinc-100 dark:hover:bg-zinc-800 text-primary transition-colors cursor-pointer shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{currentLanguageOption.label}</span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                    langDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-surface shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Select Language
                  </div>
                  {languageOptions.map((opt) => {
                    const isSelected = language === opt.code;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          onLanguageChange(opt.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-accent font-bold'
                            : 'text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt.flag}</span>
                          <div>
                            <p className="leading-tight">{opt.label}</p>
                            <p className="text-[10px] text-zinc-400 font-normal">{opt.native}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Voxide Voice Fast Trigger */}
            <button
              onClick={onOpenVoice}
              aria-label="Activate Voxide Voice Assistant"
              title="Voice Assistant"
              className="w-8 h-8 rounded-full flex items-center justify-center text-accent bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/70 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <Mic className="w-3.5 h-3.5 text-accent animate-pulse" />
            </button>

            {/* Start Campaign CTA */}
            <button
              onClick={() => onNavigate('create')}
              title="Start a Fundraiser"
              className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-accent text-white hover:opacity-90 active:scale-95 shadow-xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'ጀምር' : 'Start'}</span>
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 pt-3 pb-5 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 flex items-center justify-between border-t border-border">
            <span className="text-xs text-zinc-500">Theme Mode:</span>
            <button
              onClick={() => {
                if (onToggleDark) onToggleDark();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-primary font-medium cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-accent" />}
              <span>{isDark ? 'Day View' : 'Night View'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              size="sm"
              variant="accent"
              onClick={() => {
                onNavigate('create');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-center"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              {language === 'am' ? 'ዘመቻ ጀምር' : 'Start a Fundraiser'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
