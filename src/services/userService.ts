import { mockUserAdapter as adapter } from './adapters/mock/userAdapter.ts';
import type { User } from '../features/auth/types/auth.types.ts';
import type { DemoRole } from '../mock-data/users/users.data.ts';

/**
 * User Service
 */
export const userService = {
  getCurrentUser: (): User | null => adapter.getCurrentUser(),
  setCurrentUser: (user: User | null, token?: string): void =>
    adapter.setCurrentUser(user, token),
  getDemoAccounts: (): Record<DemoRole, User> => adapter.getDemoAccounts(),
  getSessionToken: (): string => adapter.getSessionToken(),
};
