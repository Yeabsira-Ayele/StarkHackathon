import { mockBanks } from '../../donations/data/banks.data.ts'; // Member 4

// Reads Member 4's bank list and keeps only { id, name }. Ids look like 'bank_cbe'.
// Later: swap for Member 4's bank API here — components stay unchanged.
export function useBanks() {
  return { data: mockBanks.map((b) => ({ id: b.id, name: b.name.en })), isLoading: false };
}
