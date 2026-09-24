import React from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'success' | 'error';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
  curve?: 'default' | 'pill' | 'subtle';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  withDot = false,
  curve = 'default',
  className = '',
  ...props
}) => {
  const variants: Record<BadgeVariant, { container: string; dot: string }> = {
    neutral: {
      container: 'text-text-muted bg-surface-subtle border border-border',
      dot: 'bg-text-subtle',
    },
    primary: {
      container: 'text-text bg-surface-muted border border-border-strong',
      dot: 'bg-primary',
    },
    accent: {
      container: 'text-accent bg-accent-subtle border border-accent/20',
      dot: 'bg-accent',
    },
    success: {
      container: 'text-emerald-700 bg-emerald-50/80 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40',
      dot: 'bg-emerald-500',
    },
    error: {
      container: 'text-rose-700 bg-rose-50/80 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40',
      dot: 'bg-rose-500',
    },
  };

  const curves = {
    default: 'rounded-md',
    pill: 'rounded-full px-2.5',
    subtle: 'rounded',
  };

  const style = variants[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium tracking-tight ${curves[curve]} ${style.container} ${className}`.trim()}
      {...props}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
