import React from 'react';

/**
 * Building blocks for the fundraising pages, styled like the donations-branch design:
 * forest green (#1E4D38 / #52B788 in dark mode), gold accents, cream cards, mono uppercase labels, 2px borders.
 * Same props as the shared ui kit (Button, Card, Input, Select, Badge).
 */
const cx = (...p: (string | false | undefined)[]) => p.filter(Boolean).join(' ');

export const BORDER = 'border-2 border-[#26211C]/40 dark:border-[#9A7432]/50';
const FIELD = `w-full p-3 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-white font-mono text-xs focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788] disabled:opacity-60 disabled:cursor-not-allowed`;
export const fieldClass = (error?: boolean) => `${FIELD} ${error ? 'border-2 border-red-700 dark:border-red-400' : BORDER}`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', isLoading, icon, iconPosition = 'left', className, children, disabled, type = 'button', ...rest
}) => {
  const look = {
    primary: 'border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:border-[#52B788] dark:bg-[#52B788] dark:text-[#080706] hover:bg-[#163E2C] dark:hover:bg-[#6CCB9F] shadow-md',
    secondary: 'border-2 border-[#9A7432] bg-[#9A7432]/10 text-[#14110E] dark:text-[#F4EFE6] hover:bg-[#9A7432]/25',
    outline: `${BORDER} bg-[#FFFDF9] dark:bg-[#12100E] text-[#14110E] dark:text-[#F4EFE6] hover:bg-[#F2ECE1] dark:hover:bg-[#1B1814]`,
  }[variant];
  const pad = { sm: 'py-1.5 px-3 text-[10px]', md: 'py-2.5 px-5 text-xs', lg: 'py-3 px-8 text-xs' }[size];
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cx('inline-flex items-center justify-center gap-2 font-mono font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed', look, pad, className)}
      {...rest}
    >
      {icon && iconPosition === 'left' && !isLoading && icon}
      {isLoading ? 'Working…' : children}
      {icon && iconPosition === 'right' && !isLoading && icon}
    </button>
  );
};

export const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <div className={cx('border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] rounded-[1px] shadow-lg overflow-hidden', className)}>{children}</div>
);

export const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block font-mono text-xs font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">{children}</label>
);

export const FieldError: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
  children ? <p className="mt-1 font-mono text-[11px] font-bold text-red-700 dark:text-red-400">{children}</p> : null;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, suffix, id, className, ...rest }) => (
  <div id={id}>
    {label && <Label htmlFor={`${id}-input`}>{label}:</Label>}
    <div className="relative">
      <input id={`${id}-input`} className={cx(fieldClass(!!error), suffix && 'pr-14', className)} {...rest} />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-zinc-500">{suffix}</span>}
    </div>
    {helperText && !error && <p className="mt-1 font-mono text-[11px] text-zinc-500">{helperText}</p>}
    <FieldError>{error}</FieldError>
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, id, className, ...rest }) => (
  <div id={id}>
    {label && <Label htmlFor={`${id}-select`}>{label}:</Label>}
    <select id={`${id}-select`} className={cx(fieldClass(!!error), className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <FieldError>{error}</FieldError>
  </div>
);

export const Badge: React.FC<{ variant?: 'neutral' | 'warning' | 'success' | 'danger' | 'accent'; size?: string; children?: React.ReactNode }> = ({ variant = 'neutral', children }) => {
  const look = {
    neutral: 'border-[#26211C]/40 text-zinc-600 dark:text-zinc-300 dark:border-zinc-500',
    warning: 'border-[#9A7432] text-[#9A7432]',
    success: 'border-[#1E4D38] text-[#1E4D38] dark:border-[#52B788] dark:text-[#52B788]',
    danger: 'border-red-700 text-red-700 dark:border-red-400 dark:text-red-400',
    accent: 'border-[#14110E] text-[#14110E] dark:border-[#F4EFE6] dark:text-[#F4EFE6]',
  }[variant];
  return <span className={cx('inline-block border-2 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider', look)}>{children}</span>;
};
