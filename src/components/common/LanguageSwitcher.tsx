import React from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIVE_UI_LANGUAGES, changeLanguage, resolveLanguage, type AppLanguage } from '../../i18n/index.ts';

export interface LanguageSwitcherProps {
  /** Visual flavour so the switcher blends into every navbar. */
  variant?: 'banknote' | 'admin';
  /** Extra classes applied to the wrapper. */
  className?: string;
}

/**
 * Reusable language switcher for English / Amharic.
 * Changing the language is persisted centrally in `i18n/config.ts`, so the
 * selection survives navigation and page reloads on every route.
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'banknote',
  className = '',
}) => {
  const { t, i18n: instance } = useTranslation();
  const active = resolveLanguage(instance.language);

  const selectLanguage = (language: AppLanguage) => {
    void changeLanguage(language);
  };

  if (variant === 'admin') {
    return (
      <div
        role="group"
        aria-label={t('nav.language', 'Language')}
        className={`flex items-center gap-0.5 rounded-md border border-[var(--admin-border)] p-0.5 ${className}`}
      >
        {ACTIVE_UI_LANGUAGES.map((option) => {
          const isActive = active === option.code;
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => selectLanguage(option.code)}
              aria-pressed={isActive}
              title={option.label}
              className={`rounded px-2 py-1 font-mono text-[10px] font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--admin-green)] text-white'
                  : 'text-[var(--admin-muted)] hover:bg-[var(--admin-green)]/10'
              }`}
            >
              {option.short}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('nav.language', 'Language')}
      className={`flex items-center border border-[#9A7432]/40 rounded-[1px] overflow-hidden text-[10px] font-mono font-bold ${className}`}
    >
      {ACTIVE_UI_LANGUAGES.map((option) => {
        const isActive = active === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => selectLanguage(option.code)}
            aria-pressed={isActive}
            title={option.label}
            className={`px-2 py-1 transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706]'
                : 'bg-[#F2ECE1] text-[#201C18] dark:bg-[#1C1814] dark:text-[#E8DEC8]'
            }`}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
