import React from 'react';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  size?: 'sm' | 'md';
  variant?: 'segmented' | 'underline';
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  variant = 'segmented',
  className = '',
}: TabsProps<T>) {
  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        className={`flex items-center gap-6 border-b border-border text-sm ${className}`.trim()}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 pb-3 font-medium transition-colors relative whitespace-nowrap
                ${isActive ? 'text-primary' : 'text-text-muted hover:text-text'}
              `}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-xs px-1.5 py-0.2 bg-surface-subtle border border-border-subtle rounded text-text-muted tabular-nums">
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Segmented control variant
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 bg-surface-subtle border border-border-subtle rounded ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-1.5 rounded transition-all duration-150 font-medium whitespace-nowrap
              ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'}
              ${
                isActive
                  ? 'bg-surface text-text shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text hover:bg-surface/50'
              }
            `}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1 bg-surface-muted/60 rounded tabular-nums ml-1">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
