import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-surface rounded-xl border border-border shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && <div className="text-zinc-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-primary tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium tabular-nums ${
              isPositive ? 'text-accent' : 'text-zinc-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
  );
};
