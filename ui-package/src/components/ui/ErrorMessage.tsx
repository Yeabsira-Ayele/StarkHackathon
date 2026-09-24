import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  icon?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  icon = true,
  className = '',
  ...props
}) => {
  if (!children) return null;

  return (
    <p
      role="alert"
      className={`flex items-center gap-1.5 text-xs text-error font-medium ${className}`.trim()}
      {...props}
    >
      {icon && <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </p>
  );
};

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  title,
  children,
  onDismiss,
  action,
  className = '',
  ...props
}) => {
  const variantStyles: Record<AlertVariant, { container: string; icon: React.ReactNode; text: string; titleText: string }> = {
    error: {
      container: 'bg-error-light/60 border-l-4 border-error text-error-hover',
      icon: <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />,
      text: 'text-error-hover',
      titleText: 'text-error font-semibold',
    },
    warning: {
      container: 'bg-warning-light/60 border-l-4 border-warning text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />,
      text: 'text-amber-800',
      titleText: 'text-amber-900 font-semibold',
    },
    success: {
      container: 'bg-success-light/60 border-l-4 border-success text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />,
      text: 'text-emerald-800',
      titleText: 'text-emerald-900 font-semibold',
    },
    info: {
      container: 'bg-info-light/60 border-l-4 border-info text-blue-900',
      icon: <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />,
      text: 'text-blue-800',
      titleText: 'text-blue-900 font-semibold',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`p-3.5 rounded border border-transparent flex items-start gap-3 transition-all ${style.container} ${className}`.trim()}
      {...props}
    >
      {style.icon}
      <div className="flex-1 text-xs">
        {title && <h5 className={`mb-0.5 ${style.titleText}`}>{title}</h5>}
        <div className={`leading-relaxed ${style.text}`}>{children}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-text-subtle hover:text-text p-1 rounded transition-colors -mr-1 -mt-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
