import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, suffix, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full text-sm rounded-lg border bg-surface px-3.5 py-2 text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 ${
              icon ? 'pl-9' : ''
            } ${suffix ? 'pr-12' : ''} ${
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-border focus:border-accent'
            } ${className}`}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-error font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
