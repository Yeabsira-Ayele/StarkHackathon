export interface Bank {
  id: string;
  code: string;
  name: {
    en: string;
    am: string;
  };
  shortName: string;
}

export const mockBanks: Bank[] = [
  {
    id: 'bank_cbe',
    code: 'CBE',
    name: { en: 'Commercial Bank of Ethiopia (CBE)', am: 'የኢትዮጵያ ንግድ ባንክ (CBE)' },
    shortName: 'CBE',
  },
  {
    id: 'bank_telebirr',
    code: 'TELEBIRR',
    name: { en: 'Telebirr (Ethio Telecom)', am: 'ቴሌብር (ኢትዮ ቴሌኮም)' },
    shortName: 'Telebirr',
  },
  {
    id: 'bank_abyssinia',
    code: 'BOA',
    name: { en: 'Bank of Abyssinia (BOA)', am: 'የአቢሲንያ ባንክ (BOA)' },
    shortName: 'Abyssinia',
  },
  {
    id: 'bank_awash',
    code: 'AWASH',
    name: { en: 'Awash Bank', am: 'አዋሽ ባንክ' },
    shortName: 'Awash',
  },
  {
    id: 'bank_coop',
    code: 'COOP',
    name: { en: 'Cooperative Bank of Oromia', am: 'የኦሮሚያ ህብረት ስራ ባንክ' },
    shortName: 'Coop',
  },
  {
    id: 'bank_dashen',
    code: 'DASHEN',
    name: { en: 'Dashen Bank', am: 'ዳሽን ባንክ' },
    shortName: 'Dashen',
  },
  {
    id: 'bank_cbe_birr',
    code: 'CBE_BIRR',
    name: { en: 'CBE Birr', am: 'ሲቢኢ ብር' },
    shortName: 'CBE Birr',
  },
  {
    id: 'bank_hibret',
    code: 'HIBRET',
    name: { en: 'Hibret Bank', am: 'ህብረት ባንክ' },
    shortName: 'Hibret',
  },
];

export function getBankById(id: string): Bank | undefined {
  return mockBanks.find((bank) => bank.id === id || bank.code.toLowerCase() === id.toLowerCase());
}
