import React from 'react';
import { useTranslation } from 'react-i18next';
import { toGeezNumber } from '../api/donation.api';
import { PRESET_DONATION_AMOUNTS } from '../data/donations.data';

interface DonationAmountSelectorProps {
  selectedAmount: number;
  customAmount: string;
  onSelectPreset: (amount: number) => void;
  onChangeCustom: (value: string) => void;
  minAmount?: number;
}

export const DonationAmountSelector: React.FC<DonationAmountSelectorProps> = ({
  selectedAmount,
  customAmount,
  onSelectPreset,
  onChangeCustom,
  minAmount = 50,
}) => {
  const { t } = useTranslation();
  const presets = PRESET_DONATION_AMOUNTS;

  return (
    <div className="space-y-6">
      {/* Preset Denominations with Banknote Plate Typography */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block font-mono text-xs font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
            {t('donations.selectAmount', 'Select Contribution Amount')}
          </label>
          <span className="font-mono text-[10px] text-zinc-500 uppercase">
            Currency: ETB (Ethiopian Birr)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
          {presets.map((amt) => {
            const isSelected = selectedAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => onSelectPreset(amt)}
                className={`p-4 border-2 font-black text-left cursor-pointer transition-all rounded-[1px] relative overflow-hidden ${
                  isSelected
                    ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] shadow-md ring-2 ring-[#9A7432]/60 scale-[1.02]'
                    : 'border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] hover:border-[#1E4D38] dark:hover:border-[#52B788] hover:bg-[#F2ECE1] dark:hover:bg-[#221E19] shadow-xs'
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-base sm:text-lg font-black tracking-tight">
                    {amt.toLocaleString()} ETB
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                      ✓ SELECTED
                    </span>
                  )}
                </div>
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

      {/* Custom Amount Field */}
      <div className="space-y-2">
        <label className="block font-mono text-xs font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          {t('donations.customAmount', 'Or Enter Custom Amount (ETB)')}:
        </label>
        <div className="relative">
          <input
            type="number"
            min={minAmount}
            max="1000000"
            step="50"
            value={customAmount ?? ''}
            onChange={(e) => onChangeCustom(e.target.value)}
            placeholder="e.g. 2500"
            className="w-full p-3.5 pr-16 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#181512] font-mono text-lg font-black text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
            ETB
          </span>
        </div>
        <p className="font-mono text-[11px] text-zinc-500">
          Minimum demo contribution is {minAmount} ETB. No funds are transferred or deposited.
        </p>
      </div>
    </div>
  );
};
