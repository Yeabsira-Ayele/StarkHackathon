import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'link';
export type ButtonSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg';
export type ButtonCurve = 'squircle' | 'default' | 'pill' | 'subtle';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  curve?: ButtonCurve;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      curve = 'squircle',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base layout with Apple/Linear tactile spring feedback
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.985] cursor-pointer tracking-tight';

    // Curvature matrix: Balanced geometric proportions
    // Squircle: Apple/Linear sweet spot (8px sm, 10px md, 12px lg)
    // Pill: Full organic capsule (rounded-full)
    // Subtle: Crisp technical 6px (rounded-md)
    const curveMap: Record<ButtonCurve, Record<ButtonSize, string>> = {
      squircle: {
        sm: 'rounded-md',     // 6px
        md: 'rounded-[9px]',  // 9px (Apple/Linear standard)
        lg: 'rounded-xl',     // 12px
      },
      default: {
        sm: 'rounded-md',
        md: 'rounded-[9px]',
        lg: 'rounded-xl',
      },
      pill: {
        sm: 'rounded-full',
        md: 'rounded-full',
        lg: 'rounded-full',
      },
      subtle: {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
      },
    };

    // Sophisticated, tactile variants
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-text-inverse hover:opacity-90 active:opacity-95 shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.16)] border border-black/10 dark:border-white/10',
      secondary: 'bg-surface text-text border border-border hover:bg-surface-subtle hover:border-border-strong active:bg-surface-muted shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
      accent: 'bg-accent text-white hover:opacity-92 active:opacity-95 shadow-[0_1px_3px_rgba(79,70,229,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] border border-accent/20',
      outline: 'bg-transparent text-text border border-border hover:bg-surface-subtle hover:border-border-strong active:bg-surface-muted',
      ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface-subtle active:bg-surface-muted shadow-none',
      danger: 'bg-error text-white hover:bg-error-hover active:bg-error-hover/90 shadow-[0_1px_2px_rgba(225,29,72,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border border-error/30',
      link: 'bg-transparent text-accent hover:underline underline-offset-4 p-0 h-auto font-normal shadow-none border-0 active:scale-100',
    };

    // Height-anchored optical sizes with 1:2.2 proportion
    const sizes: Record<ButtonSize, string> = {
'2xs': 'text-[10px] h-6 px-2 gap-1',
xs: 'text-[11px] h-7 px-2.5 gap-1',
sm: 'text-xs h-8 px-3 gap-1.5',
md: 'text-[13px] h-9.5 px-4 gap-2',
lg: 'text-sm h-11 px-5 gap-2.5',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const sizeClass = variant === 'link' ? '' : sizes[size];
    const curveClass = variant === 'link' ? '' : curveMap[curve][size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${curveClass} ${variants[variant]} ${sizeClass} ${widthClass} ${className}`.trim()}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
