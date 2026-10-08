export type UserRole = 'donor' | 'foundation' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isSuperAdmin?: boolean;
  avatarUrl?: string;
  verified: boolean;
  organizationId?: string;
  organizationName?: string;
  totalDonated?: number;
  certificatesCount?: number;
  createdAt: string;
  preferredLanguage?: 'am' | 'en';
}

export interface AuthResponse {
  user: User;
  token: string;
}
