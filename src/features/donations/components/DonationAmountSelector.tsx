import React from 'react';
import { useTranslation } from 'react-i18next';
import { toGeezNumber } from '../api/donation.api';

interface DonationAmountSelectorProps {
  selectedAmount: number;
  customAmount: string;
  onSelectPreset: (amount: number) => void;
  onChangeCustom: (value: string) => void;
}

export const DonationAmountSelector: React.FC<DonationAmountSelectorProps> = ({
  selectedAmount,
  customAmount,
  onSelectPreset,
  onChangeCustom,
}) => {
  const { t } = useTranslation();
  const presets = [100, 500, 1000, 5000];

  return (
    <div className="space-y-6">
      {/* Preset Denominations with High-Contrast Typography & Distinct Theme States */}
      <div>
        <label className="block font-mono text-xs font-black uppercase text-[#14110E] dark:text-[#F4EFE6] mb-3">
          {t('donations.selectAmount')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          {presets.map((amt) => {
            const isSelected = selectedAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => onSelectPreset(amt)}
                className={`p-4 border-2 font-black text-base sm:text-lg cursor-pointer transition-all rounded-[1px] ${
                  isSelected
                    ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] shadow-md ring-2 ring-[#9A7432]/60 scale-[1.02]'
                    : 'border-[#26211C]/50 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] hover:border-[#1E4D38] dark:hover:border-[#52B788] hover:bg-[#E5DAC4] dark:hover:bg-[#221E19] shadow-xs'
                }`}
              >
                <span className="block font-black tracking-tight text-inherit">
                  {amt.toLocaleString()} ETB
                </span>
                <span
                  className={`block text-xs font-ethiopic font-bold mt-1 ${
                    isSelected
                      ? 'text-white/90 dark:text-[#080706]/90'
                      : 'text-[#1E4D38] dark:text-[#52B788]'
                  }`}
                >
                  {toGeezNumber(amt)} ብር
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="space-y-2">
        <label className="block font-mono text-xs font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          {t('donations.customAmount')}
        </label>
        <input
          type="number"
          min="50"
          max="1000000"
          value={customAmount}
          onChange={(e) => onChangeCustom(e.target.value)}
          placeholder="e.g. 2500"
          className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] font-mono text-lg font-black text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788]"
        />
      </div>
    </div>
  );
};
