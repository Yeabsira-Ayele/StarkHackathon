import React from 'react';

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent' | 'current' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorMap = {
    primary: 'text-primary',
    accent: 'text-accent',
    current: 'text-current',
    white: 'text-white',
  };

  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${colorMap[color]} ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading..."
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  className = '',
  style,
  ...props
}) => {
  const roundedMap = {
    sm: 'rounded-xs',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`bg-border-subtle/80 animate-pulse ${roundedMap[rounded]} ${className}`.trim()}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded border border-border p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height="0.875rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>
      <div className="space-y-2 py-2">
        <Skeleton width="100%" height="0.75rem" />
        <Skeleton width="90%" height="0.75rem" />
        <Skeleton width="75%" height="0.75rem" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton width="30%" height="1.5rem" />
        <Skeleton width="25%" height="2rem" />
      </div>
    </div>
  );
};

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-surface/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 rounded z-10">
          <Spinner size="lg" color="primary" />
          {message && <p className="text-xs font-medium text-text-muted">{message}</p>}
        </div>
      )}
    </div>
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12 px-6 border border-dashed border-border rounded bg-surface-subtle/50 max-w-md mx-auto">
      {icon && <div className="text-text-subtle mb-3 flex justify-center">{icon}</div>}
      <h4 className="text-sm font-semibold text-text mb-1">{title}</h4>
      <p className="text-xs text-text-muted mb-4 max-w-xs mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default Spinner;
