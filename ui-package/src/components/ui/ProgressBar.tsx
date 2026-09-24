import React from 'react';

export type ProgressVariant = 'primary' | 'accent' | 'success' | 'error';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  isIndeterminate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  isIndeterminate = false,
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses: Record<ProgressSize, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const barVariants: Record<ProgressVariant, string> = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
    error: 'bg-error',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`.trim()} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-text-muted">{label || 'Progress'}</span>
          <span className="font-mono tabular-nums font-semibold text-text">
            {isIndeterminate ? 'Processing...' : `${percentage}%`}
          </span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full bg-border-subtle rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        {isIndeterminate ? (
          <div
            className={`h-full w-1/3 rounded-full animate-pulse ${barVariants[variant]}`}
            style={{
              animation: 'indeterminate 1.5s infinite ease-in-out',
            }}
          />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${barVariants[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
