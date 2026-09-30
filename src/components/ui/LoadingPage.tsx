import React from 'react';

export interface LoadingPageProps {
  message?: string;
  submessage?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Loading Lewegene...',
  submessage = 'Connecting to community network',
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
          L
        </div>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{message}</h3>
      {submessage && <p className="mt-1 text-xs text-slate-400">{submessage}</p>}
    </div>
  );
};
