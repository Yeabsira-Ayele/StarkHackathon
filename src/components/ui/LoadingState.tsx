import React from 'react';

export interface LoadingStateProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  text = 'Loading campaigns...',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-slate-200 border-t-emerald-600 ${sizeMap[size]}`}
      />
      {text && <p className="mt-3 text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
};
