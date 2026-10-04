/**
 * Central internationalisation (i18n) module — the single entry point for all
 * static UI text used across the platform.
 *
 * Every piece of copy (navigation, headings, buttons, form labels, placeholders,
 * tooltips, empty-state messages, validation errors, ...) is defined once in the
 * JSON files inside `src/i18n/locales/` and read through `react-i18next`.
 * Components never hard-code copy — they call `t('some.key')`.
 *
 * Adding a new language:
 *   1. Drop `src/i18n/locales/<code>.json` next to the existing files, copying
 *      the exact same key structure as `en.json`.
 *   2. Register it in `SUPPORTED_LANGUAGES` below (code + labels).
 *   3. Import it in `src/i18n/config.ts` and add it to the `resources` object.
 * Nothing else in the application needs to change.
 */
import i18n, { LANGUAGE_CHANGED_EVENT, LANGUAGE_STORAGE_KEY, type AppLanguage } from './config.ts';

export interface LanguageOption {
  /** Language code used as the i18n key and persisted in localStorage. */
  code: AppLanguage;
  /** Compact label rendered inside the navbar language switcher. */
  short: string;
  /** Full, human-readable label used for tooltips / screen readers. */
  label: string;
}

/** Single source of truth for the languages offered across the platform. */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'am', short: 'አማ', label: 'አማርኛ (Amharic)' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'om', short: 'OM', label: 'Afaan Oromoo' },
];

/** Active user-facing languages for this MVP release (English & Amharic). */
export const ACTIVE_UI_LANGUAGES: LanguageOption[] = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'om');

/** Amharic is the default platform language (see `config.ts`). */
export const DEFAULT_LANGUAGE: AppLanguage = 'am';

/** Resolve any incoming i18n language string to a supported language code. */
export function resolveLanguage(language: string | undefined): AppLanguage {
  const value = (language || DEFAULT_LANGUAGE).toLowerCase();
  const match = SUPPORTED_LANGUAGES.find((option) => value.startsWith(option.code));
  return match ? match.code : DEFAULT_LANGUAGE;
}

/** Change the active language everywhere (persistence handled by `config.ts`). */
export function changeLanguage(language: AppLanguage): Promise<unknown> {
  return i18n.changeLanguage(language);
}

export { i18n, LANGUAGE_CHANGED_EVENT, LANGUAGE_STORAGE_KEY };
export type { AppLanguage };
export default i18n;