import { useTranslation } from 'react-i18next';
import { mockBanks } from '../../../mock-data/banks/banks.data.ts';

// Reads Member 4's bank list and keeps only { id, name }. Ids look like 'bank_cbe'.
// Later: swap for Member 4's bank API here — components stay unchanged.
export function useBanks() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('am') ? 'am' : 'en';
  return { data: mockBanks.map((b) => ({ id: b.id, name: b.name[language] })), isLoading: false };
}
