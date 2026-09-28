import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Mic, Sun, Moon, Globe, Heart } from 'lucide-react';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  onOpenVoice?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  language?: 'am' | 'en' | 'om';
  onLanguageChange?: (lng: 'am' | 'en' | 'om') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'overview',
  onNavigate,
  onOpenVoice,
  isDark = false,
  onToggleTheme,
  language = 'am',
  onLanguageChange,
}) => {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (lng: 'am' | 'en' | 'om') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lewegene_language', lng);
    onLanguageChange?.(lng);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF6EE]/85 dark:bg-[#12100E]/85 border-b border-[#D5C8B2]/50 dark:border-[#2E2822]/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div
          onClick={() => onNavigate?.('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E4D38] to-[#123023] flex items-center justify-center text-white shadow-md shadow-[#1E4D38]/20 group-hover:scale-105 transition-transform">
            <span className="font-serif font-bold text-lg text-[#F4EFE6]">ለ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg tracking-tight text-[#14110E] dark:text-[#F4EFE6]">
                {t('common.appName', 'ለወገን')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#9A7432]/15 text-[#9A7432] dark:bg-[#C9A24D]/15 dark:text-[#C9A24D]">
                ET
              </span>
            </div>
            <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] -mt-0.5 line-clamp-1">
              {t('common.appTagline', 'የኢትዮጵያ የሕዝብ ትብብርና ድጋፍ ሰነድ')}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => onNavigate?.('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'overview'
                ? 'bg-[#E5DCCB] dark:bg-[#25201A] text-[#14110E] dark:text-[#FAF6EE] font-semibold'
                : 'text-[#5A5046] dark:text-[#B8AEA0] hover:text-[#14110E] dark:hover:text-white'
            }`}
          >
            {t('nav.overview', 'ዋና ገጽ')}
          </button>
          <button
            onClick={() => onNavigate?.('explore')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'explore'
                ? 'bg-[#E5DCCB] dark:bg-[#25201A] text-[#14110E] dark:text-[#FAF6EE] font-semibold'
                : 'text-[#5A5046] dark:text-[#B8AEA0] hover:text-[#14110E] dark:hover:text-white'
            }`}
          >
            {t('nav.explore', 'ምክንያቶች')}
          </button>
          <button
            onClick={() => onNavigate?.('create')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'create'
                ? 'bg-[#E5DCCB] dark:bg-[#25201A] text-[#14110E] dark:text-[#FAF6EE] font-semibold'
                : 'text-[#5A5046] dark:text-[#B8AEA0] hover:text-[#14110E] dark:hover:text-white'
            }`}
          >
            {t('common.create', 'አዲስ ምክንያት ይጀምሩ')}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Voice Assistant Button */}
          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1E4D38] hover:bg-[#153828] text-white shadow-sm transition-all cursor-pointer"
              title="Voxide Voice"
            >
              <Mic className="w-3.5 h-3.5 text-[#52B788]" />
              <span className="hidden sm:inline">Voxide</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-[#EBE3D3]/70 dark:bg-[#1E1A16] p-0.5 border border-[#D5C8B2]/50 dark:border-[#2E2822]">
            {(['am', 'en', 'om'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => handleLanguageSelect(lng)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer uppercase ${
                  i18n.language === lng || language === lng
                    ? 'bg-[#FAF6EE] dark:bg-[#2D2620] text-[#14110E] dark:text-[#FAF6EE] shadow-xs'
                    : 'text-[#73685B] dark:text-[#A89E90] hover:text-[#14110E]'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>

          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-[#EBE3D3]/70 dark:bg-[#1E1A16] text-[#5A5046] dark:text-[#B8AEA0] hover:text-[#14110E] dark:hover:text-white border border-[#D5C8B2]/50 dark:border-[#2E2822] transition-colors cursor-pointer"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
