import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n from '../i18n/config.ts';

export * from './translations/en.ts';
export * from './ui/navigation.ts';
export * from './ui/forms.ts';
export * from './ui/messages.ts';
export * from './ui/status.ts';

/**
 * Standard translation hook for Lewegene components
 */
export function useTranslation() {
  return useI18nTranslation();
}

/**
 * Direct string translator for non-React contexts
 */
export function t(key: string, defaultValue?: string): string {
  return i18n.t(key, defaultValue || key);
}
