import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bank } from '../data/banks.data';
import { Building2, CheckCircle2 } from 'lucide-react';

interface BankSelectorProps {
  banks: Bank[];
  selectedBankId: string;
  onSelectBank: (bankId: string) => void;
  isLoading?: boolean;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  banks,
  selectedBankId,
  onSelectBank,
  isLoading,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'am' | 'om') || 'en';

  if (isLoading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500 border border-[#26211C]/20 bg-[#FFFDF9] dark:bg-[#12100E]">
        Loading demo payment options...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      <div>
        <h3 className="font-serif font-black text-xl text-[#14110E] dark:text-[#FFFFFF]">
          Choose a Demo Payment Option
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Payment options are placeholders only. No transfer can be made from this prototype.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {banks.map((bank) => {
          const isSelected = selectedBankId === bank.id;
          const localizedName = bank.name[currentLang] || bank.name.en;

          return (
            <button
              key={bank.id}
              type="button"
              onClick={() => onSelectBank(bank.id)}
              className={`p-4 border-2 text-left cursor-pointer transition-all rounded-[1px] relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#1E4D38] dark:border-[#52B788] bg-[#1E4D38]/5 dark:bg-[#52B788]/10 shadow-sm ring-1 ring-[#1E4D38]'
                  : 'border-[#26211C]/25 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#181512] hover:border-[#1E4D38] dark:hover:border-[#52B788] hover:bg-[#F2ECE1] dark:hover:bg-[#221E19]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-[1px] flex items-center justify-center font-black text-xs text-white uppercase shrink-0 shadow-xs"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.logoText}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#14110E] dark:text-[#FFFFFF] text-sm leading-tight">
                      {localizedName}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-normal block mt-0.5">
                      DEMO ONLY · NOT PAYABLE
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1E4D38] dark:text-[#52B788] shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-400 shrink-0 mt-1" />
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#26211C]/10 dark:border-[#9A7432]/20 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500 truncate max-w-[170px]">{bank.branch}</span>
                <span className="font-bold text-[#1E4D38] dark:text-[#52B788] uppercase tracking-wider shrink-0">
                  DEMO OPTION
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
