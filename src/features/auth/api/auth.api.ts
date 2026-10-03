import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth.types';

const ACCOUNTS_KEY = 'lewegene_local_accounts';
const DEMO_ADMIN_EMAIL = 'admin@local.lewegene';
const DEMO_ADMIN_PASSCODE = 'demo-admin-123';

interface LocalAccount {
  user: User;
  passcodeSalt?: string;
  passcodeHash?: string;
  passcode?: string;
}

function getAccounts(): LocalAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]') as LocalAccount[];
  } catch {
    return [];
  }
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[\s()-]/g, '');
}

function createToken(): string {
  return `local-${crypto.randomUUID()}`;
}

async function hashPasscode(passcode: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${passcode}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const identifier = normalizeIdentifier(credentials.emailOrPhone);
    if (identifier === DEMO_ADMIN_EMAIL && credentials.passcode === DEMO_ADMIN_PASSCODE) {
      return {
        user: {
          id: 'local-demo-admin',
          name: 'Local Demo Admin',
          email: DEMO_ADMIN_EMAIL,
          role: 'admin',
          verified: true,
          createdAt: new Date().toISOString(),
        },
        token: createToken(),
      };
    }
    const account = getAccounts().find(
      (entry) => normalizeIdentifier(entry.user.email) === identifier ||
        (!!entry.user.phone && normalizeIdentifier(entry.user.phone) === identifier),
    );
    const accounts = getAccounts();
    if (!account) {
      throw new Error('No matching local account was found. Sign up first, then try again.');
    }
    let validPasscode = account.passcodeHash
      ? account.passcodeHash === await hashPasscode(credentials.passcode, account.passcodeSalt || '')
      : account.passcode === credentials.passcode;
    if (validPasscode && account.passcode) {
      const passcodeSalt = crypto.randomUUID();
      const passcodeHash = await hashPasscode(credentials.passcode, passcodeSalt);
      const migratedAccounts = accounts.map((entry) => entry.user.id === account.user.id
        ? { user: entry.user, passcodeSalt, passcodeHash }
        : entry);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(migratedAccounts));
      validPasscode = true;
    }
    if (!validPasscode) throw new Error('No matching local account was found. Sign up first, then try again.');
    return { user: account.user, token: createToken() };
  },

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const identifier = normalizeIdentifier(data.emailOrPhone);
    const accounts = getAccounts();
    if (accounts.some((entry) => normalizeIdentifier(entry.user.email) === identifier ||
      (!!entry.user.phone && normalizeIdentifier(entry.user.phone) === identifier))) {
      throw new Error('An account with this email or phone number already exists.');
    }

    const isEmail = identifier.includes('@');
    const user: User = {
      id: `local-user-${crypto.randomUUID()}`,
      name: data.name.trim(),
      email: isEmail ? identifier : `${identifier}@local.lewegene`,
      phone: isEmail ? undefined : data.emailOrPhone.trim(),
      role: data.role,
      verified: data.role === 'foundation',
      organizationId: data.role === 'foundation' ? `local-org-${crypto.randomUUID()}` : undefined,
      organizationName: data.role === 'foundation' ? data.organizationName?.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    const passcodeSalt = crypto.randomUUID();
    accounts.push({ user, passcodeSalt, passcodeHash: await hashPasscode(data.passcode, passcodeSalt) });
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return { user, token: createToken() };
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('lewegene_auth_token');
      const user = localStorage.getItem('lewegene_user');
      return token && user ? JSON.parse(user) as User : null;
    } catch {
      return null;
    }
  },
};
