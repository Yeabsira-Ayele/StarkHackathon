import { api } from '../../../api/axios';
import type { AuthResponse, LoginCredentials, User, UserRole } from '../types/auth.types';

export interface BackendUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'ORGANIZATION' | 'ADMIN' | 'SUPER_ADMIN';
  phoneVerified?: boolean;
  profilePhoto?: string;
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
    avatarUrl: user.profilePhoto,
    verified: user.role === 'ORGANIZATION'
      ? organization?.verificationStatus === 'approved'
      : user.role === 'USER'
        ? Boolean(user.phoneVerified)
        : true,
    organizationId: organization?._id,
    organizationName: organization?.name,
    createdAt: user.createdAt,
  };
}

export function mapBackendAuthResponse(data: BackendAuthResponse): AuthResponse {
  return { user: mapBackendUser(data.user, data.organization), token: data.token };
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<BackendEnvelope<BackendAuthResponse>>('/auth/login', {
      identifier: credentials.emailOrPhone,
      password: credentials.passcode,
    });
    return mapBackendAuthResponse(response.data.data);
  },

  async getCurrentUser(): Promise<User | null> {
    const response = await api.get<BackendEnvelope<{ user: BackendUser; organization?: BackendOrganization | null }>>('/auth/me');
    return mapBackendUser(response.data.data.user, response.data.data.organization);
  },
};
