export interface Bank {
  id: string;
  code: string;
  name: {
    en: string;
    am: string;
    om: string;
  };
  shortName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  swiftCode?: string;
  paybillCode?: string;
  logoText: string;
  badge: string;
  isPopular?: boolean;
  color: string;
  instructions: {
    en: string[];
    am: string[];
    om: string[];
  };
}

export { mockBanks, getBankById } from '../../features/donations/data/banks.data.ts';
