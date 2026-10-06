import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`text-center py-10 px-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 ${className}`}
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
        {title || t('common.error', 'ስህተት ተከስቷል')}
      </h3>
      <p className="text-xs text-red-700 dark:text-red-400 mt-1 max-w-sm mx-auto leading-relaxed">
        {message || 'መረጃዎችን ለመጫን አልተቻለም። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t('common.retry', 'እንደገና ይሞክሩ')}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
