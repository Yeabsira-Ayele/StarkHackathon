import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, logout } = useAuthStore();

  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const googleLoginMutation = useMutation({
    mutationFn: (credential: string) => authApi.loginWithGoogle(credential),
    onSuccess: (data) => {
      setUser(data.user, data.token);
    },
  });

  return {
    user: user || userQuery.data || null,
    token,
    isAuthenticated,
    isLoading: userQuery.isLoading || googleLoginMutation.isPending,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    logout,
  };
};
