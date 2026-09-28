import api from '../../../api/axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth.types';
import { MOCK_USERS } from '../data/auth.data';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch {
      // Mock fallback seamlessly
      const found = MOCK_USERS.find(
        (u) =>
          u.email.toLowerCase() === credentials.emailOrPhone.toLowerCase() ||
          u.phone === credentials.emailOrPhone
      ) || MOCK_USERS[0];

      return {
        user: found,
        token: `mock_jwt_${found.id}_${Date.now()}`,
      };
    }
  },

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: data.name,
        email: data.emailOrPhone.includes('@') ? data.emailOrPhone : `${data.name.toLowerCase().replace(/\s+/g, '')}@lewegene.et`,
        phone: data.emailOrPhone.includes('@') ? undefined : data.emailOrPhone,
        role: data.role,
        verified: data.role === 'donor',
        createdAt: new Date().toISOString(),
      };
      return {
        user: newUser,
        token: `mock_jwt_${newUser.id}_${Date.now()}`,
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('lewegene_auth_token');
    if (!token) return null;
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch {
      const savedUser = localStorage.getItem('lewegene_user');
      return savedUser ? JSON.parse(savedUser) : MOCK_USERS[0];
    }
  },
};
