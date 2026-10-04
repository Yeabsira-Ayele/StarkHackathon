import { DEMO_ACCOUNTS, DEMO_SESSION_TOKEN, DemoRole } from '../../../mock-data/users/users.data.ts';
import { useAuthStore } from '../../../features/auth/store/auth.store.ts';
import type { User } from '../../../features/auth/types/auth.types.ts';

export const mockUserAdapter = {
  getCurrentUser: (): User | null => {
    return useAuthStore.getState().user;
  },

  setCurrentUser: (user: User | null, token?: string): void => {
    if (user) {
      useAuthStore.getState().setUser(user, token || DEMO_SESSION_TOKEN);
    } else {
      useAuthStore.getState().logout();
    }
  },

  getDemoAccounts: (): Record<DemoRole, User> => {
    return DEMO_ACCOUNTS;
  },

  getSessionToken: (): string => {
    return DEMO_SESSION_TOKEN;
  },
};
