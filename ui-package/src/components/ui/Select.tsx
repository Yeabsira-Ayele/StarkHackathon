import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
  curve?: 'default' | 'pill' | 'subtle';
  leftIcon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      fullWidth = true,
      curve = 'default',
      leftIcon,
      className = '',
      id,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const curves = {
      default: 'rounded-[9px]',
      pill: 'rounded-full px-4',
      subtle: 'rounded-md',
    };

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} space-y-1.5`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-text-muted">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-subtle pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            className={`
              w-full h-9.5 bg-surface text-text text-[13px] border appearance-none transition-all duration-150
              px-3 pr-9 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
              disabled:bg-surface-subtle disabled:text-text-subtle disabled:cursor-not-allowed
              ${curves[curve]}
              ${leftIcon ? 'pl-9' : 'pl-3'}
              ${error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border hover:border-border-strong shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
              ${className}
            `.trim()}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          <div className="absolute right-3 text-text-subtle pointer-events-none flex items-center">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 text-xs text-error font-medium mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-text-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
