import React, { createContext, useCallback, useContext, useState } from 'react';
import { Search, X, Inbox, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal.tsx';

/* Banknote-style admin primitives: hairline borders, square corners, mono labels, serif headings. */

export const fmtETB = (n: number) => `${n.toLocaleString()} ETB`;
export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

export const inputCls =
  'w-full rounded-md p-2.5 border border-[#26211C]/25 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#141210] font-sans text-sm text-[#201C18] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1E4D38]';
export const labelCls = 'mb-1 block font-sans text-sm font-medium text-[#201C18] dark:text-[#F4EFE6]';

/* ── Toast ── */
interface ToastApi { notify: (msg: string, kind?: 'ok' | 'err') => void }
const ToastCtx = createContext<ToastApi>({ notify: () => {} });
export const useAdminToast = () => useContext(ToastCtx);

export const AdminToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [t, setT] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);
  const notify = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    setT({ msg, kind });
    setTimeout(() => setT(null), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      {t && (
        <div className="fixed bottom-6 left-6 z-[60] max-w-sm bg-[#FCF9F2] dark:bg-[#1E1A17] text-[#201C18] dark:text-[#F4EFE6] border border-[#B08A45]/60 p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          {t.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-[#8B2626] mt-0.5" />}
          <p className="text-sm leading-relaxed">{t.msg}</p>
        </div>
      )}
    </ToastCtx.Provider>
  );
};

/* ── Buttons ── */
type BtnTone = 'red' | 'gold' | 'outline' | 'ghost' | 'dark';
export const AdminButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: BtnTone; busy?: boolean; icon?: React.ReactNode }
> = ({ tone = 'outline', busy, icon, children, className = '', disabled, ...p }) => {
  const tones: Record<BtnTone, string> = {
    red: 'bg-[#8B2626] text-white border-[#8B2626] hover:bg-[#701E1E]',
    gold: 'bg-[#9A7432] text-white border-[#9A7432] hover:bg-[#7F5F26]',
    dark: 'bg-[#26211C] text-white border-[#26211C] hover:bg-[#181512] dark:bg-[#9A7432] dark:border-[#9A7432] dark:text-[#141210]',
    outline: 'bg-transparent text-[#201C18] dark:text-[#E8DEC8] border-[#26211C]/40 dark:border-[#9A7432]/50 hover:border-[#8B2626] hover:text-[#8B2626]',
    ghost: 'bg-transparent text-[#201C18] dark:text-[#E8DEC8] border-transparent hover:text-[#8B2626]',
  };
  return (
    <button
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 border font-sans text-sm font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone]} ${className}`}
      {...p}
    >
      {icon}
      <span>{busy ? 'Working…' : children}</span>
    </button>
  );
};

/* ── Layout ── */
export const SectionHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#26211C]/20 dark:border-[#9A7432]/25 pb-4 mb-6">
    <div>
      <h1 className="font-serif font-bold text-3xl text-[#201C18] dark:text-[#F4EFE6]">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 max-w-2xl">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export const Panel: React.FC<{ title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string; flush?: boolean }> = ({
  title, actions, children, className = '', flush,
}) => (
  <div className={`rounded-md border border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#FCF9F2] dark:bg-[#1E1A17] shadow-sm ${className}`}>
    {title && (
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#26211C]/15 dark:border-[#9A7432]/20">
        <h3 className="text-sm font-semibold text-[#201C18] dark:text-[#F4EFE6]">{title}</h3>
        {actions}
      </div>
    )}
    <div className={flush ? '' : 'p-5'}>{children}</div>
  </div>
);

export const StatTile: React.FC<{ label: string; value: React.ReactNode; sub?: string; icon?: React.ReactNode; onClick?: () => void; alert?: boolean }> = ({
  label, value, sub, icon, onClick, alert,
}) => (
  <div
    onClick={onClick}
    className={`rounded-md border bg-[#FCF9F2] dark:bg-[#1E1A17] p-4 shadow-sm ${alert ? 'border-[#8B2626]' : 'border-[#26211C]/20 dark:border-[#9A7432]/30'} ${onClick ? 'cursor-pointer hover:border-[#1E4D38]' : ''}`}
  >
    <div className="flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300">
      <span>{label}</span>
      {icon}
    </div>
    <div className={`mt-2 font-mono font-bold text-3xl tabular-nums ${alert ? 'text-[#8B2626]' : 'text-[#201C18] dark:text-[#F4EFE6]'}`}>{value}</div>
    {sub && <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">{sub}</div>}
  </div>
);

export const DetailGrid: React.FC<{ items: [string, React.ReactNode][]; cols?: 2 | 3 }> = ({ items, cols = 2 }) => (
  <dl className={`grid grid-cols-1 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-x-6 gap-y-3`}>
    {items.map(([k, v]) => (
      <div key={k}>
        <dt className={labelCls}>{k}</dt>
        <dd className="text-sm text-[#201C18] dark:text-[#F4EFE6] break-words">{v || '—'}</dd>
      </div>
    ))}
  </dl>
);

export const EmptyState: React.FC<{ title: string; text?: string }> = ({ title, text }) => (
  <div className="text-center py-12 px-6">
    <Inbox className="w-7 h-7 mx-auto text-[#9A7432] mb-2" />
    <p className="text-sm font-semibold text-[#201C18] dark:text-[#F4EFE6]">{title}</p>
    {text && <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">{text}</p>}
  </div>
);

/* ── Status badge ── */
const BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  reviewed: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  completed: 'bg-[#9A7432]/15 text-[#7F5F26] border-[#9A7432]/50 dark:text-[#D8B066]',
  needs_changes: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
  rejected: 'bg-rose-100 text-[#8B2626] border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
  dismissed: 'bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  suspended: 'bg-rose-100 text-[#8B2626] border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
  disabled: 'bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  paused: 'bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};
// Fundraiser status names shown to admins (internal values stay unchanged).
const FUNDRAISER_LABELS: Record<string, string> = { pending: 'Pending Review', approved: 'Active', needs_changes: 'Needs Changes' };

export const StatusBadge: React.FC<{ status: string; fundraiser?: boolean }> = ({ status, fundraiser }) => (
  <span className={`admin-status-tag inline-flex items-center px-2 py-0.5 border font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${BADGE[status] || BADGE.dismissed}`}>
    {(fundraiser && FUNDRAISER_LABELS[status]) || status.replace(/_/g, ' ')}
  </span>
);

/* ── Filters ── */
export const FilterTabs: React.FC<{ tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void }> = ({ tabs, value, onChange }) => (
  <div className="flex flex-wrap gap-1 border-b border-[#26211C]/20 dark:border-[#9A7432]/25 mb-4">
    {tabs.map((t) => (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange(t.id)}
        className={`px-3 py-2 font-sans text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors ${
          value === t.id
            ? 'border-[#8B2626] text-[#8B2626] dark:border-[#D8B066] dark:text-[#D8B066]'
            : 'border-transparent text-[#201C18] dark:text-[#E8DEC8] hover:text-[#8B2626]'
        }`}
      >
        {t.label}
        {t.count !== undefined && <span className="ml-1.5 px-1.5 bg-[#26211C]/10 dark:bg-[#9A7432]/25 text-[10px]">{t.count}</span>}
      </button>
    ))}
  </div>
);

export const SearchBox: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative max-w-xs w-full">
    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-9`} />
  </div>
);

/* ── Data table (hairline banknote style) ── */
export const DataTable: React.FC<{ head: string[]; children: React.ReactNode }> = ({ head, children }) => (
  <div className="w-full overflow-x-auto border border-[#26211C]/30 dark:border-[#9A7432]/30 bg-[#FCF9F2] dark:bg-[#1E1A17]">
    <table className="w-full text-left text-sm">
      <thead className="bg-[#EFE8D8] dark:bg-[#26221D] border-b border-[#26211C]/20 dark:border-[#9A7432]/25">
        <tr>
          {head.map((h) => (
            <th key={h} className="py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#26211C]/10 dark:divide-[#9A7432]/15">{children}</tbody>
    </table>
  </div>
);
export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...p }) => (
  <tr className={`hover:bg-[#EFE8D8]/60 dark:hover:bg-[#26221D] transition-colors ${className}`} {...p} />
);
export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...p }) => (
  <td className={`py-3 px-4 align-top text-[#201C18] dark:text-[#F4EFE6] ${className}`} {...p} />
);

/* ── Reason dialog (request changes / reject / dismiss …) ── */
export const ReasonModal: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: 'red' | 'gold';
  required?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}> = ({ open, title, description, confirmLabel, tone = 'red', required = true, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const close = () => { setReason(''); onClose(); };
  const submit = async () => {
    setBusy(true);
    try { await onConfirm(reason.trim()); setReason(''); } finally { setBusy(false); }
  };
  return (
    <Modal
      isOpen={open}
      onClose={close}
      title={title}
      subtitle={description}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2">
          <AdminButton onClick={close}>Cancel</AdminButton>
          <AdminButton tone={tone} busy={busy} disabled={required && !reason.trim()} onClick={submit}>{confirmLabel}</AdminButton>
        </div>
      }
    >
      <label className={labelCls}>{required ? 'Reason (required)' : 'Note (optional)'}</label>
      <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} placeholder="Write a clear message. The user is notified by email." />
    </Modal>
  );
};

/* ── Slide-over detail panel ── */
export const DetailDrawer: React.FC<{ open: boolean; title: string; subtitle?: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }> = ({
  open, title, subtitle, onClose, children, footer,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-[#F6F1E5] dark:bg-[#141210] border-l border-[#26211C]/30 dark:border-[#9A7432]/40 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#26211C]/20 dark:border-[#9A7432]/30">
          <div className="min-w-0">
            <h3 className="font-serif font-black text-2xl text-[#201C18] dark:text-[#F4EFE6] leading-tight">{title}</h3>
            {subtitle && <div className="mt-1.5">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1.5 border border-[#26211C]/30 dark:border-[#9A7432]/40 cursor-pointer hover:text-[#8B2626]" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-[#26211C]/20 dark:border-[#9A7432]/30 flex flex-wrap justify-end gap-2">{footer}</div>}
      </aside>
    </div>
  );
};
