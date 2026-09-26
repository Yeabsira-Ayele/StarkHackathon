import React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  percentage?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'sky' | 'slate' | 'amber';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  percentage,
  showLabel = false,
  size = 'md',
  color = 'accent',
  className = '',
  ...props
}) => {
  let computedPct = 0;
  if (typeof percentage === 'number') {
    computedPct = percentage;
  } else if (typeof value === 'number' && typeof max === 'number' && max > 0) {
    computedPct = (value / max) * 100;
  }

  const displayPct = Math.min(Math.max(computedPct, 0), 100);
  const roundedPct = Math.round(computedPct);

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colorStyles = {
    accent: 'bg-gradient-to-r from-[#173C32] via-[#245D4E] to-[#B08A45]',
    sky: 'bg-[#1E3A5F]', // Prussian Banknote Blue
    slate: 'bg-zinc-800 dark:bg-zinc-200',
    amber: 'bg-[#B08A45]',
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium tabular-nums">
          <span>{roundedPct}% funded</span>
          {typeof value === 'number' && typeof max === 'number' && (
            <span>
              {value.toLocaleString()} / {max.toLocaleString()} ETB
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden ${heightStyles[size]}`}
        role="progressbar"
        aria-valuenow={roundedPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full transition-all duration-500 rounded-full ${colorStyles[color]}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  );
};
