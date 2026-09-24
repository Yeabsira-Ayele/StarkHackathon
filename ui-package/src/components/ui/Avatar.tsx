import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  curve?: 'circle' | 'squircle';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  curve = 'circle',
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9.5 h-9.5 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base font-semibold',
  };

  const curveClasses = {
    circle: 'rounded-full',
    squircle: 'rounded-[9px]',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  const getInitials = (n?: string) => {
    if (!n) return '?';
    return n
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const hasImage = src && !imageError;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`.trim()} {...props}>
      <div
        className={`
          flex items-center justify-center font-medium overflow-hidden border border-border shadow-2xs select-none
          ${sizeClasses[size]}
          ${curveClasses[curve]}
          ${hasImage ? 'bg-surface' : 'bg-surface-muted text-text font-semibold'}
        `}
      >
        {hasImage ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${statusColors[status]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  children: React.ReactNode;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  className = '',
  ...props
}) => {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={`flex items-center -space-x-2 overflow-hidden ${className}`.trim()} {...props}>
      {visible.map((child, idx) => (
        <div key={idx} className="ring-2 ring-surface rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full ring-2 ring-surface bg-surface-muted text-text text-[11px] font-semibold flex items-center justify-center">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
