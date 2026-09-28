import { create } from 'zustand';
import { User } from '../types/auth.types';
import { MOCK_USERS } from '../data/auth.data';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser: User = (() => {
    try {
      const saved = localStorage.getItem('lewegene_user');
      if (saved) return JSON.parse(saved);
      return MOCK_USERS[0];
    } catch {
      return MOCK_USERS[0];
    }
  })();

  const initialToken = typeof window !== 'undefined'
    ? localStorage.getItem('lewegene_auth_token') || 'demo_token'
    : 'demo_token';

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialUser,
    setUser: (user, token) => {
      if (user) {
        localStorage.setItem('lewegene_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('lewegene_user');
      }
      if (token) {
        localStorage.setItem('lewegene_auth_token', token);
      } else if (token === null) {
        localStorage.removeItem('lewegene_auth_token');
      }
      set({ user, token: token || null, isAuthenticated: !!user });
    },
    logout: () => {
      localStorage.removeItem('lewegene_user');
      localStorage.removeItem('lewegene_auth_token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
