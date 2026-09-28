import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, logout } = useAuthStore();

  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setUser(data.user, data.token);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data) => {
      setUser(data.user, data.token);
    },
  });

  return {
    user: user || userQuery.data || null,
    token,
    isAuthenticated,
    isLoading: userQuery.isLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
  };
};
