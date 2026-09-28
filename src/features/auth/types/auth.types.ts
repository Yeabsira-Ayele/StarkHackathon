export type UserRole = 'donor' | 'foundation' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  verified: boolean;
  organizationId?: string;
  totalDonated?: number;
  certificatesCount?: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  emailOrPhone: string;
  passcode: string;
}

export interface RegisterCredentials {
  name: string;
  emailOrPhone: string;
  passcode: string;
  role: UserRole;
  organizationName?: string;
}
