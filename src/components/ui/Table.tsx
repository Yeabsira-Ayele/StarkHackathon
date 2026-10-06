import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface">
      <table className={`w-full text-left text-sm text-primary ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <thead className={`bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-border text-xs font-semibold text-zinc-500 uppercase tracking-wider ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return <tbody className={`divide-y divide-border ${className}`} {...props}>{children}</tbody>;
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <tr className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <th className={`py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-300 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <td className={`py-3 px-4 text-primary ${className}`} {...props}>
      {children}
    </td>
  );
};
