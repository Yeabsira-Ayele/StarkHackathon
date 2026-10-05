import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { LoginCredentials } from '../types/auth.types';
import {
  authService,
  OtpRequest,
  OtpResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RegisterWithPhoneData,
} from '../../../services/authService.ts';

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

  const requestOtpMutation = useMutation({
    mutationFn: (req: OtpRequest): Promise<OtpResponse> => authService.requestOtp(req),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (req: OtpVerifyRequest): Promise<OtpVerifyResponse> => {
      const res = await authService.verifyOtp(req);
      if (res.user && res.token) {
        setUser(res.user, res.token);
      }
      return res;
    },
  });

  const registerWithPhoneMutation = useMutation({
    mutationFn: async (data: RegisterWithPhoneData) => {
      const res = await authService.registerWithVerifiedPhone(data);
      setUser(res.user, res.token);
      return res;
    },
  });

  return {
    user: user || userQuery.data || null,
    token,
    isAuthenticated,
    isLoading:
      userQuery.isLoading ||
      loginMutation.isPending ||
      requestOtpMutation.isPending ||
      verifyOtpMutation.isPending ||
      registerWithPhoneMutation.isPending,
    login: loginMutation.mutateAsync,
    requestOtp: requestOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    registerWithVerifiedPhone: registerWithPhoneMutation.mutateAsync,
    logout,
  };
};
