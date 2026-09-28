import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import am from './locales/am.json';
import en from './locales/en.json';
import om from './locales/om.json';

const resources = {
  am: { translation: am },
  en: { translation: en },
  om: { translation: om },
};

const savedLanguage = typeof window !== 'undefined'
  ? localStorage.getItem('lewegene_language') || 'am'
  : 'am';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'am', // Rule 7: Amharic is the default
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
