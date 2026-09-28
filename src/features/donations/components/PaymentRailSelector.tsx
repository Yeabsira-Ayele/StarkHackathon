import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentRail } from '../types/donation.types';

interface PaymentRailSelectorProps {
  selectedRail: PaymentRail;
  onSelectRail: (rail: PaymentRail) => void;
}

export const PaymentRailSelector: React.FC<PaymentRailSelectorProps> = ({
  selectedRail,
  onSelectRail,
}) => {
  const { t } = useTranslation();

  const rails: { id: PaymentRail; name: string }[] = [
    { id: 'telebirr', name: 'TELEBIRR' },
    { id: 'cbe_birr', name: 'CBE BIRR' },
    { id: 'bank_card', name: 'BANK CARD' },
    { id: 'chapa', name: 'CHAPA PAY' },
  ];

  return (
    <div>
      <label className="block font-mono text-xs font-black uppercase text-[#14110E] dark:text-[#F4EFE6] mb-2">
        {t('donations.clearingRail')}:
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {rails.map((rail) => (
          <button
            key={rail.id}
            type="button"
            onClick={() => onSelectRail(rail.id)}
            className={`p-3 border-2 font-black text-center cursor-pointer uppercase transition-all ${
              selectedRail === rail.id
                ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] shadow-xs'
                : 'border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] hover:border-[#1E4D38] dark:hover:border-[#52B788]'
            }`}
          >
            {rail.name}
          </button>
        ))}
      </div>
    </div>
  );
};
