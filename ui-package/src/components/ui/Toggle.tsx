import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className = '',
}) => {
  const toggleId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex items-start justify-between gap-3 ${className}`.trim()}>
      {(label || description) && (
        <div className="flex-1 cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <label
              htmlFor={toggleId}
              className={`text-sm font-medium select-none ${disabled ? 'text-text-subtle' : 'text-text'}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-text-muted select-none mt-0.5">{description}</p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-primary' : 'bg-border-strong'}
        `.trim()}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
            mt-0.5 ml-0.5
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `.trim()}
        />
      </button>
    </div>
  );
};

export default Toggle;
