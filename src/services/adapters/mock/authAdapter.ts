import type { User, UserRole, AuthResponse } from '../../../features/auth/types/auth.types.ts';
import type { Organization } from '../../../types/index.ts';
import { campaignApi } from '../../api/campaignApi.ts';
import { DEMO_ACCOUNTS, DEMO_SESSION_TOKEN } from '../../../mock-data/users/users.data.ts';
import { MOCK_USERS } from '../../../features/auth/data/auth.data.ts';

const ACCOUNTS_KEY = 'lewegene_local_accounts';

export interface OtpRequest {
  phone: string;
  purpose: 'login' | 'signup';
}

export interface OtpResponse {
  success: boolean;
  phone: string;
  expiresInSeconds: number;
  message?: string;
  debugCode?: string;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
  purpose?: 'login' | 'signup';
}

export interface OtpVerifyResponse {
  verified: boolean;
  phone: string;
  verificationToken: string;
  user?: User;
  token?: string;
}

export interface RegisterWithPhoneData {
  name: string;
  email: string;
  phone: string;
  passcode: string;
  role: UserRole;
  organizationName?: string;
  verificationToken: string;
}

interface StoredAccount {
  user: User;
  passcodeSalt?: string;
  passcodeHash?: string;
  passcode?: string;
}

interface ActiveOtp {
  phone: string;
  code: string;
  expiresAt: number;
  verified: boolean;
}

interface VerifiedPhoneSession {
  phone: string;
  token: string;
  expiresAt: number;
}

// In-memory mock OTP and verification token storage
const activeOtps = new Map<string, ActiveOtp>();
const verifiedSessions = new Map<string, VerifiedPhoneSession>();

export function normalizePhone(value: string): string {
  const digitsAndPlus = value.trim().replace(/[\s()-]/g, '');
  if (digitsAndPlus.startsWith('0') && digitsAndPlus.length === 10) {
    return `+251${digitsAndPlus.slice(1)}`;
  }
  if (digitsAndPlus.startsWith('251') && !digitsAndPlus.startsWith('+')) {
    return `+${digitsAndPlus}`;
  }
  return digitsAndPlus;
}

export function isValidEthiopianPhone(phone: string): boolean {
  const norm = normalizePhone(phone);
  // Valid formats: +251 9XX XXX XXX or +251 7XX XXX XXX (13 chars total with +251)
  return /^\+251[79]\d{8}$/.test(norm);
}

let inMemoryAccounts: StoredAccount[] = [];

function getStoredAccounts(): StoredAccount[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      if (stored) {
        return JSON.parse(stored) as StoredAccount[];
      }
    }
    return inMemoryAccounts;
  } catch {
    return inMemoryAccounts;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  inMemoryAccounts = accounts;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  } catch {
    // Ignore storage errors in mock environment
  }
}

function findUserByPhone(phone: string): User | null {
  const norm = normalizePhone(phone);
  // 1. Check local accounts
  const local = getStoredAccounts().find(
    (a) => a.user.phone && normalizePhone(a.user.phone) === norm
  );
  if (local) return local.user;

  // 2. Check DEMO_ACCOUNTS
  const demoValues = Object.values(DEMO_ACCOUNTS);
  const demo = demoValues.find((d) => d.phone && normalizePhone(d.phone) === norm);
  if (demo) return demo;

  // 3. Check MOCK_USERS
  const mock = MOCK_USERS.find((m) => m.phone && normalizePhone(m.phone) === norm);
  if (mock) return mock;

  return null;
}

function findUserByEmail(email: string): User | null {
  const normEmail = email.trim().toLowerCase();
  const local = getStoredAccounts().find((a) => a.user.email.toLowerCase() === normEmail);
  if (local) return local.user;

  const demo = Object.values(DEMO_ACCOUNTS).find((d) => d.email.toLowerCase() === normEmail);
  if (demo) return demo;

  const mock = MOCK_USERS.find((m) => m.email.toLowerCase() === normEmail);
  if (mock) return mock;

  return null;
}

function createToken(): string {
  return `lewegene-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const mockAuthAdapter = {
  /**
   * Request a 6-digit OTP code for a phone number
   */
  async requestOtp(req: OtpRequest): Promise<OtpResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const normalized = normalizePhone(req.phone);
    if (!isValidEthiopianPhone(normalized)) {
      throw new Error('Enter a valid Ethiopian phone number (e.g. 0911223344 or +251911223344).');
    }

    if (req.purpose === 'login') {
      const existingUser = findUserByPhone(normalized);
      if (!existingUser) {
        throw new Error('No account found with this phone number. Please create an account.');
      }
    } else if (req.purpose === 'signup') {
      const existingUser = findUserByPhone(normalized);
      if (existingUser) {
        throw new Error('An account with this phone number already exists. Please sign in instead.');
      }
    }

    // Generate a 6-digit OTP
    // Deterministic simulation code for standard test ease: 123456
    const code = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    activeOtps.set(normalized, {
      phone: normalized,
      code,
      expiresAt,
      verified: false,
    });

    return {
      success: true,
      phone: normalized,
      expiresInSeconds: 300,
      debugCode: code,
    };
  },

  /**
   * Verify the 6-digit OTP
   */
  async verifyOtp(req: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const normalized = normalizePhone(req.phone);
    const otp = req.otp ? req.otp.trim() : '';

    if (!otp) {
      throw new Error('Enter the 6-digit verification code.');
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error('Verification code must be exactly 6 digits.');
    }

    const stored = activeOtps.get(normalized);
    const isValidCode = stored ? stored.code === otp : otp === '123456';

    if (!isValidCode) {
      throw new Error('Incorrect verification code. Please check and try again.');
    }

    if (stored && stored.expiresAt < Date.now()) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    // Mark verified and issue a verification token
    if (stored) {
      stored.verified = true;
    }

    const verificationToken = `vt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    verifiedSessions.set(verificationToken, {
      phone: normalized,
      token: verificationToken,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins to complete signup
    });

    // If login, look up existing user and return session immediately
    if (req.purpose === 'login' || !req.purpose) {
      const user = findUserByPhone(normalized);
      if (user) {
        const token = createToken();
        return {
          verified: true,
          phone: normalized,
          verificationToken,
          user,
          token,
        };
      }
    }

    return {
      verified: true,
      phone: normalized,
      verificationToken,
    };
  },

  /**
   * Complete registration with a verified phone
   */
  async registerWithVerifiedPhone(data: RegisterWithPhoneData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Security guard: Ensure phone was actually verified with the token
    const session = verifiedSessions.get(data.verificationToken);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error('Phone verification session has expired. Please verify your phone number again.');
    }

    const normalizedPhone = normalizePhone(data.phone);
    if (session.phone !== normalizedPhone) {
      throw new Error('Phone number does not match verified session.');
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Enter a valid email address.');
    }

    if (findUserByEmail(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    if (findUserByPhone(normalizedPhone)) {
      throw new Error('An account with this phone number already exists.');
    }

    const orgId = data.role === 'foundation' ? `org-${Date.now()}` : undefined;

    const newUser: User = {
      id: `local-user-${crypto.randomUUID()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      role: data.role,
      verified: true, // Phone is verified via OTP
      organizationId: orgId,
      organizationName: data.role === 'foundation' ? data.organizationName?.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    if (data.role === 'foundation' && orgId) {
      const pendingOrg: Organization = {
        id: orgId,
        name: data.organizationName?.trim() || 'New Foundation',
        type: 'registered_ngo',
        registrationNo: `ACSO/ET/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        verified: false,
        verificationStatus: 'pending',
        foundedYear: new Date().getFullYear(),
        location: 'Addis Ababa, Ethiopia',
        description: `Civil society organization registered by ${data.name.trim()}.`,
        contactEmail: normalizedEmail,
        contactPhone: normalizedPhone,
        activeProjectsCount: 0,
        totalRaised: 0,
        totalSupporters: 0,
        representative: {
          name: data.name.trim(),
          role: 'Executive Director',
          phone: normalizedPhone,
          email: normalizedEmail,
        },
        bank: {
          bank: 'Commercial Bank of Ethiopia (CBE)',
          accountNumber: '1000284920194',
          accountName: data.organizationName?.trim() || data.name.trim(),
        },
        documents: [],
        submittedAt: new Date().toISOString(),
        userId: newUser.id,
      };
      try {
        campaignApi.registerOrganization(pendingOrg);
      } catch (err) {
        console.warn('Failed to seed pending org in campaignApi', err);
      }
    }

    const accounts = getStoredAccounts();
    accounts.push({ user: newUser, passcode: data.passcode });
    saveStoredAccounts(accounts);

    // Consume the verification session
    verifiedSessions.delete(data.verificationToken);

    const token = createToken();
    return { user: newUser, token };
  },
};
