import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full p-8 text-center border-2 border-red-800/30 bg-red-950/10 font-mono space-y-4 rounded-[1px]">
      <div className="w-10 h-10 mx-auto rounded-full bg-red-800/20 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h4 className="font-serif font-black text-base text-red-700 dark:text-red-400">
          {t('common.error')}
        </h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          {message || t('errors.clearingNode', 'Unable to connect to the national civic clearing node.')}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 py-2 px-4 border border-red-800 bg-red-800 text-white text-xs font-bold uppercase hover:bg-red-900 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('common.retry')}</span>
        </button>
      )}
    </div>
  );
};
