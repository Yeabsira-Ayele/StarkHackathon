import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button.tsx';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
  className = '',
}) => {
  const { t } = useTranslation();
  const heading = title || t('errors.generic');

  return (
    <div
      className={`rounded-xl border border-rose-200 bg-rose-50/50 p-5 text-left text-slate-800 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="text-rose-600 mt-0.5 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-900">{heading}</h4>
          <p className="mt-1 text-xs text-rose-700 leading-relaxed">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={onRetry}>
                {t('common.retry')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
