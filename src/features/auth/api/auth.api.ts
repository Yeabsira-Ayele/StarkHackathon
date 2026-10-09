import { api } from '../../../api/axios';
import type { AuthResponse, User, UserRole } from '../types/auth.types';

export interface BackendUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'ORGANIZATION' | 'ADMIN' | 'SUPER_ADMIN';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profilePhoto?: string;
  preferredLanguage?: 'am' | 'en' | 'om';
  createdAt: string;
}

export interface BackendOrganization {
  _id: string;
  name: string;
  verificationStatus: string;
}

export interface BackendAuthResponse {
  user: BackendUser;
  token: string;
  organization?: BackendOrganization | null;
}

interface BackendEnvelope<T> {
  data: T;
  message: string;
  success: boolean;
}

export function mapBackendUser(user: BackendUser, organization?: BackendOrganization | null): User {
  const roles: Record<BackendUser['role'], UserRole> = {
    USER: 'donor',
    ORGANIZATION: 'foundation',
    ADMIN: 'admin',
    SUPER_ADMIN: 'admin',
  };

  return {
    id: user._id,
    name: user.name,
    email: user.email || '',
    phone: user.phone,
    role: roles[user.role],
    isSuperAdmin: user.role === 'SUPER_ADMIN',
    avatarUrl: user.profilePhoto,
    verified: user.role === 'ORGANIZATION'
      ? organization?.verificationStatus === 'approved'
      : user.role === 'USER'
        ? Boolean(user.emailVerified || user.phoneVerified)
        : true,
    organizationId: organization?._id,
    organizationName: organization?.name,
    createdAt: user.createdAt,
    preferredLanguage: user.preferredLanguage === 'en' ? 'en' : 'am',
  };
}

export function mapBackendAuthResponse(data: BackendAuthResponse): AuthResponse {
  return { user: mapBackendUser(data.user, data.organization), token: data.token };
}

export const authApi = {
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await api.post<BackendEnvelope<BackendAuthResponse>>('/auth/google', { credential });
    return mapBackendAuthResponse(response.data.data);
  },

  async registerOrganization(payload: Record<string, unknown>): Promise<BackendAuthResponse> {
    const response = await api.post<BackendEnvelope<BackendAuthResponse>>('/organizations/signup', payload);
    return response.data.data;
  },

  async getCurrentUser(): Promise<User | null> {
    const response = await api.get<BackendEnvelope<{ user: BackendUser; organization?: BackendOrganization | null }>>('/auth/me');
    return mapBackendUser(response.data.data.user, response.data.data.organization);
  },
};
