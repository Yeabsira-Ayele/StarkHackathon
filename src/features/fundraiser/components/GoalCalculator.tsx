import React from 'react';
import { Calculator, Users, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GoalCalculatorProps {
  goalAmount: number;
  onGoalChange: (val: number) => void;
  beneficiaries?: number;
  onBeneficiariesChange?: (val: number) => void;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  goalAmount,
  onGoalChange,
  beneficiaries = 100,
  onBeneficiariesChange,
}) => {
  const { t } = useTranslation();
  const perBeneficiary = beneficiaries > 0 ? Math.round(goalAmount / beneficiaries) : 0;

  return (
    <div className="p-4 rounded-xl bg-[#FAF6EE]/80 dark:bg-[#15120F] border border-[#D5C8B2]/50 dark:border-[#2E2822] space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#14110E] dark:text-[#F4EFE6]">
        <span className="flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-[#9A7432]" />
          የበጀትና የተጠቃሚ ስሌት (Budget Impact Calc)
        </span>
        <span className="text-[#9A7432] font-mono">
          ~{perBeneficiary.toLocaleString()} {t('common.currency', 'ብር')}/ሰው
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-medium text-[#73685B] dark:text-[#A89E90] mb-1">
            የሚፈለገው ግብ (ብር)
          </label>
          <input
            type="number"
            min={1000}
            step={5000}
            value={goalAmount || ''}
            onChange={(e) => onGoalChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/60 dark:border-[#2E2822] font-mono font-medium text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
          />
        </div>

        {onBeneficiariesChange && (
          <div>
            <label className="block text-[11px] font-medium text-[#73685B] dark:text-[#A89E90] mb-1">
              የታለመው ተጠቃሚ ዜጎች ቁጥር
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                step={10}
                value={beneficiaries || ''}
                onChange={(e) => onBeneficiariesChange(Number(e.target.value))}
                className="w-full px-3 py-2 pr-8 rounded-lg bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/60 dark:border-[#2E2822] font-mono font-medium text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <Users className="w-3.5 h-3.5 text-[#73685B] absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#1E4D38] dark:text-[#52B788] pt-1">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>100% የልገሳ ሂሳብ ያለ ምንም አላስፈላጊ ኮሚሽን ለዜጎች እንዲደርስ ይደረጋል።</span>
      </div>
    </div>
  );
};

export default GoalCalculator;
