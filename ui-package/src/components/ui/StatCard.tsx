import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  timeframe?: string;
  icon?: React.ReactNode;
  curve?: 'default' | 'xl';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  timeframe = 'vs last month',
  icon,
  curve = 'default',
  className = '',
  ...props
}) => {
  const curveClass = curve === 'xl' ? 'rounded-2xl' : 'rounded-xl';

  const trendColors = {
    up: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
    down: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40',
    neutral: 'text-text-muted bg-surface-subtle border border-border',
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <div
      className={`p-5 bg-surface border border-border shadow-xs ${curveClass} flex flex-col justify-between ${className}`.trim()}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 pb-3">
        <span className="text-xs font-medium text-text-muted tracking-tight">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold tracking-tight text-text tabular-nums">{value}</div>

        {(change !== undefined || timeframe) && (
          <div className="flex items-center gap-2 text-xs">
            {change !== undefined && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${trendColors[trend]}`}>
                <TrendIcon className="w-3 h-3" />
                <span>{change}</span>
              </span>
            )}
            {timeframe && <span className="text-[11px] text-text-subtle truncate">{timeframe}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
