import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className = '',
}) => {
  if (variant === 'underline') {
    return (
      <div className={`border-b border-border ${className}`}>
        <nav className="flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-accent text-accent font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-primary hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`ml-1 text-xs py-0.5 px-2 rounded-full tabular-nums ${
                      isActive ? 'bg-indigo-50 dark:bg-indigo-950/60 text-accent' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={`inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-border ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-surface text-primary shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-primary hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded font-medium tabular-nums ${
                  isActive ? 'bg-zinc-100 dark:bg-zinc-800 text-primary' : 'text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
