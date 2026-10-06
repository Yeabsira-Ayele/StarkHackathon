import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface FundraiserStepProps {
  steps: Step[];
  currentStep: number;
  onSelectStep?: (stepId: number) => void;
}

export const FundraiserStep: React.FC<FundraiserStepProps> = ({
  steps,
  currentStep,
  onSelectStep,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#D5C8B2]/50 dark:bg-[#2E2822] w-full -z-0" />
        {steps.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStep && isDone && onSelectStep(step.id)}
              className={`relative z-10 flex flex-col items-center group ${
                isDone ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isDone
                    ? 'bg-[#1E4D38] text-white ring-4 ring-[#1E4D38]/15'
                    : isCurrent
                    ? 'bg-[#9A7432] text-white ring-4 ring-[#9A7432]/25 scale-105'
                    : 'bg-[#E5DCCB] dark:bg-[#26211C] text-[#73685B] dark:text-[#A89E90]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-[11px] mt-2 font-medium tracking-tight text-center max-w-[80px] ${
                  isCurrent
                    ? 'text-[#14110E] dark:text-[#FAF6EE] font-bold'
                    : 'text-[#73685B] dark:text-[#A89E90]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FundraiserStep;
