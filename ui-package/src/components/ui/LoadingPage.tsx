import React, { useState, useEffect } from 'react';
import { Spinner, Skeleton } from './LoadingState';
import { Button } from './Button';
import { Sparkles, RefreshCw, X, CheckCircle2, Shield, Layers } from 'lucide-react';

export type LoadingPageVariant = 'skeleton' | 'minimal' | 'branded';

export interface LoadingPageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LoadingPageVariant;
  title?: string;
  description?: string;
  progress?: number;
  fullScreen?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  steps?: string[];
  currentStepIndex?: number;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  variant = 'skeleton',
  title = 'Loading Workspace...',
  description = 'Fetching your initiatives, encrypted keys, and teammate activity.',
  progress,
  fullScreen = false,
  onCancel,
  onRetry,
  steps = [
    'Connecting to secure cluster...',
    'Hydrating application cache...',
    'Verifying cryptographic permissions...',
    'Rendering interface...'
  ],
  currentStepIndex,
  className = '',
  ...props
}) => {
  // Auto-progress simulated steps if not provided externally
  const [internalStep, setInternalStep] = useState(0);

  useEffect(() => {
    if (currentStepIndex !== undefined) return;
    const interval = setInterval(() => {
      setInternalStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [currentStepIndex, steps.length]);

  const activeStep = currentStepIndex !== undefined ? currentStepIndex : internalStep;

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-background flex flex-col overflow-auto'
    : 'w-full min-h-[520px] bg-background rounded-xl border border-border flex flex-col overflow-hidden relative shadow-xs';

  // 1. SKELETON VARIANT (App Layout Shimmer)
  if (variant === 'skeleton') {
    return (
      <div className={`${containerClasses} ${className}`.trim()} {...props}>
        {/* Top Navbar Skeleton */}
        <div className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Skeleton width={28} height={28} rounded="md" />
            <Skeleton width={110} height={16} rounded="sm" />
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-border-subtle">
              <Skeleton width={70} height={12} rounded="sm" />
              <Skeleton width={80} height={12} rounded="sm" />
              <Skeleton width={60} height={12} rounded="sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width={140} height={32} rounded="md" className="hidden sm:block" />
            <Skeleton width={32} height={32} rounded="full" />
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto flex-1">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton width={220} height={26} rounded="md" />
              <Skeleton width={320} height={14} rounded="sm" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width={90} height={36} rounded="md" />
              <Skeleton width={120} height={36} rounded="md" />
            </div>
          </div>

          {/* 3 Metric Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 bg-surface rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton width={90} height={12} rounded="sm" />
                  <Skeleton width={24} height={24} rounded="md" />
                </div>
                <Skeleton width={130} height={28} rounded="md" />
                <Skeleton width="70%" height={10} rounded="sm" />
              </div>
            ))}
          </div>

          {/* Table / List Shimmer */}
          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <Skeleton width={160} height={18} rounded="sm" />
              <Skeleton width={80} height={28} rounded="md" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton width={32} height={32} rounded="full" className="shrink-0" />
                    <div className="space-y-1.5 flex-1 max-w-sm">
                      <Skeleton width="85%" height={14} rounded="sm" />
                      <Skeleton width="55%" height={11} rounded="sm" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-8">
                    <Skeleton width={80} height={14} rounded="sm" />
                    <Skeleton width={60} height={20} rounded="full" />
                    <Skeleton width={70} height={14} rounded="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shimmer Floating status pill */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text text-text-inverse px-4 py-2 rounded-full shadow-xl flex items-center gap-2.5 text-xs font-medium border border-white/10">
          <Spinner size="xs" color="accent" />
          <span>Synchronizing components...</span>
        </div>
      </div>
    );
  }

  // 2. BRANDED / PROGRESS VARIANT
  if (variant === 'branded') {
    const computedProgress = progress !== undefined ? progress : Math.min(100, Math.round(((activeStep + 1) / steps.length) * 100));

    return (
      <div className={`${containerClasses} items-center justify-center p-6 text-center ${className}`.trim()} {...props}>
        <div className="w-full max-w-md p-8 bg-surface rounded-2xl border border-border shadow-md space-y-6">
          {/* Logo / Orbital Pulse */}
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping opacity-60" />
            <div className="relative w-14 h-14 rounded-2xl bg-primary text-text-inverse flex items-center justify-center shadow-lg border border-white/10">
              <Sparkles className="w-7 h-7 text-accent" strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold tracking-tight text-text">{title}</h2>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">{description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-text text-[11px] truncate max-w-[240px]">
                {steps[activeStep] || 'Processing...'}
              </span>
              <span className="font-mono text-accent font-semibold">{computedProgress}%</span>
            </div>
            <div className="w-full h-2 bg-surface-subtle border border-border-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${computedProgress}%` }}
              />
            </div>
          </div>

          {/* Steps Trail */}
          <div className="space-y-1.5 text-left pt-2 border-t border-border-subtle">
            {steps.map((s, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : isCurrent
                      ? 'text-text font-semibold'
                      : 'text-text-subtle/60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  ) : isCurrent ? (
                    <Spinner size="xs" color="accent" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-border-strong shrink-0" />
                  )}
                  <span className="truncate">{s}</span>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {(onCancel || onRetry) && (
            <div className="flex items-center justify-center gap-3 pt-2">
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<X className="w-3.5 h-3.5" />}>
                  Cancel
                </Button>
              )}
              {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                  Retry Connection
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. MINIMAL VARIANT (Apple / Linear style)
  return (
    <div className={`${containerClasses} items-center justify-center p-8 text-center ${className}`.trim()} {...props}>
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <div className="relative flex items-center justify-center">
          <Spinner size="xl" color="accent" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text tracking-tight">{title}</h3>
          <p className="text-xs text-text-muted">{steps[activeStep] || description}</p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="mt-2 text-text-muted">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default LoadingPage;
