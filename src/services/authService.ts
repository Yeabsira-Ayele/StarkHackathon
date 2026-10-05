import { api } from '../api/axios.ts';
import { mapBackendAuthResponse } from '../features/auth/api/auth.api.ts';
import type { AuthResponse, User } from '../features/auth/types/auth.types.ts';

type SignupRole = 'donor' | 'foundation';

interface OtpRequest {
  phone: string;
  purpose: 'signup' | 'login' | 'reset';
  role?: SignupRole;
}

interface OtpResponse {
  success: boolean;
  phone: string;
  expiresInSeconds: number;
  message?: string;
  debugCode?: string;
}

interface OtpVerifyRequest extends OtpRequest {
  otp: string;
}

interface OtpVerifyResponse {
  verified: boolean;
  verificationToken?: string;
  user?: User;
  token?: string;
}

interface RegisterWithPhoneData {
  name: string;
  email: string;
  phone: string;
  passcode: string;
  role: SignupRole;
  organizationName?: string;
  verificationToken?: string;
  otp?: string;
}

interface BackendEnvelope<T> {
  data: T;
  message: string;
  success: boolean;
}

interface SignupOtpResponse {
  devOtp?: string;
}

/**
 * Authentication Service
 * Implements Phone + OTP flow and registration.
 * Clean abstraction layer separating UI components from authentication transport.
 */
export const authService = {
  /**
   * Request the OTP from the backend for donor signup.
   */
  requestOtp: async (req: OtpRequest): Promise<OtpResponse> => {
    if (req.role === 'foundation') {
      throw new Error('Organization registration is not connected yet. It requires the full verification application.');
    }

    const response = await api.post<BackendEnvelope<SignupOtpResponse>>('/auth/signup/request-otp', {
      phone: req.phone,
    });
    return {
      success: response.data.success,
      phone: req.phone,
      expiresInSeconds: 300,
      message: response.data.message,
      debugCode: response.data.data.devOtp,
    };
  },

  /**
   * Foundation demo accounts use the local verification adapter. Donor OTPs are
   * verified atomically by the backend when signup is submitted.
   */
  verifyOtp: async (_req: OtpVerifyRequest): Promise<OtpVerifyResponse> => {
    throw new Error('This verification flow is not available. Submit the OTP with donor signup or use the organization application flow.');
  },

  /**
   * Complete donor signup on the backend.
   */
  registerWithVerifiedPhone: async (data: RegisterWithPhoneData): Promise<AuthResponse> => {
    if (data.role === 'foundation') {
      throw new Error('Organization registration is not connected yet. It requires the full verification application.');
    }
    if (!data.otp) throw new Error('Enter the 6-digit verification code.');

    const response = await api.post<BackendEnvelope<Parameters<typeof mapBackendAuthResponse>[0]>>(
      '/auth/signup',
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        otp: data.otp,
        password: data.passcode,
      },
    );
    return mapBackendAuthResponse(response.data.data);
  },
};

export type {
  OtpRequest,
  OtpResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RegisterWithPhoneData,
};
