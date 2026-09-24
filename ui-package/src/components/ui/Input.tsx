import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isClearable?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
  curve?: 'default' | 'pill' | 'subtle';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isClearable = false,
      onClear,
      fullWidth = true,
      type = 'text',
      curve = 'default',
      className = '',
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const hasValue = value !== undefined && value !== '';

    const curves = {
      default: 'rounded-[9px]',
      pill: 'rounded-full px-4',
      subtle: 'rounded-md',
    };

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} space-y-1.5`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text-muted"
          >
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

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            value={value}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`
              w-full h-9.5 bg-surface text-text text-[13px] border transition-all duration-150
              px-3 placeholder:text-text-subtle/70
              focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus:bg-surface
              disabled:bg-surface-subtle disabled:text-text-subtle disabled:cursor-not-allowed
              ${curves[curve]}
              ${leftIcon ? 'pl-9' : 'pl-3'}
              ${rightIcon || isPassword || (isClearable && hasValue) ? 'pr-9' : 'pr-3'}
              ${error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border hover:border-border-strong shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
              ${className}
            `.trim()}
            {...props}
          />

          {/* Right Action Icons */}
          <div className="absolute right-2.5 flex items-center gap-1 text-text-subtle">
            {isClearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear input"
                className="p-1 hover:text-text rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {isPassword && !disabled && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 hover:text-text rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}

            {!isPassword && rightIcon && <span>{rightIcon}</span>}
          </div>
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1.5 text-xs text-error font-medium mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className = '', id, disabled, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'} space-y-1.5`}>
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-text-muted">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={!!error}
          className={`
            w-full bg-surface text-text text-[13px] rounded-[9px] border transition-all duration-150
            p-3 placeholder:text-text-subtle/70 min-h-[90px]
            focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
            disabled:bg-surface-subtle disabled:text-text-subtle disabled:cursor-not-allowed
            ${error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border hover:border-border-strong shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
            ${className}
          `.trim()}
          {...props}
        />
        {error ? (
          <p className="flex items-center gap-1 text-xs text-error font-medium mt-1">
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
Textarea.displayName = 'Textarea';

export default Input;
