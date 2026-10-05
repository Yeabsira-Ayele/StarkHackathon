import { useAuthStore } from '../features/auth/store/auth.store.ts';
import type { User } from '../features/auth/types/auth.types.ts';

export const userService = {
  getCurrentUser: (): User | null => useAuthStore.getState().user,
  setCurrentUser: (user: User | null, token?: string): void =>
    useAuthStore.getState().setUser(user, token),
};
