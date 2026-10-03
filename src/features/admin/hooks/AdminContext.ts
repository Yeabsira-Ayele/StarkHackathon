import { createContext, useContext } from 'react';
import { AdminStore } from './useAdminStore.ts';
import { AdminSection } from '../types/admin.types.ts';

export interface AdminContextValue {
  store: AdminStore;
  go: (section: AdminSection, id?: string) => void;
  focusId: string | null;
  isDark: boolean;
  onExit: () => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminPortal');
  return ctx;
}
