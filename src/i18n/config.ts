import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './locales/am.json';
import en from './locales/en.json';

/** Languages supported across the whole platform. */
export type AppLanguage = 'am' | 'en';

/** Single source of truth for the language persistence key. */
export const LANGUAGE_STORAGE_KEY = 'lewegene_language';

/** Event fired on window whenever the active language changes. */
export const LANGUAGE_CHANGED_EVENT = 'lewegene:language-changed';

type TranslationShape<T> = {
  [K in keyof T]: T[K] extends string ? string : TranslationShape<T[K]>;
};

const amTranslation: TranslationShape<typeof en> = am;

const resources = {
  am: { translation: amTranslation },
  en: { translation: en },
};

function readSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'am';
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'en' || stored === 'am' ? stored : 'am';
  } catch {
    return 'am';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: readSavedLanguage(),
    fallbackLng: false,
    supportedLngs: ['am', 'en'],
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

/**
 * Keep persistence in one place: whichever navbar/page switches the language,
 * the choice is saved, the document language is updated and every listener
 * (e.g. App.tsx) is notified. This makes switching work on *every* page.
 */
i18n.on('languageChanged', (language) => {
  const resolved: AppLanguage = language === 'en' ? 'en' : 'am';

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolved);
  } catch {
    // ignore storage failures (private mode, etc.)
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = resolved;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: resolved }));
  }
});

// Reflect the initial language on the <html> element as well.
if (typeof document !== 'undefined') {
  document.documentElement.lang = (i18n.language as AppLanguage) || 'am';
}

export default i18n;
