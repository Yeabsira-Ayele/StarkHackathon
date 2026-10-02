import { useAuthStore } from '../../auth/store/auth.store.ts'; // Member 3

/** Reads the logged-in user from Member 3's auth store. */
export function getCurrentUser() {
  const u = useAuthStore.getState().user;
  return { id: u?.id ?? 'guest', name: u?.name ?? 'Guest', phone: u?.phone ?? '' };
}
