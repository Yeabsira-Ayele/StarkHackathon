import {
  mockAuthAdapter as adapter,
  OtpRequest,
  OtpResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RegisterWithPhoneData,
} from './adapters/mock/authAdapter.ts';
import type { AuthResponse } from '../features/auth/types/auth.types.ts';

/**
 * Authentication Service
 * Implements Phone + OTP flow and registration.
 * Clean abstraction layer separating UI components from authentication transport.
 */
export const authService = {
  /**
   * Request a 6-digit OTP to be sent to a phone number.
   */
  requestOtp: async (req: OtpRequest): Promise<OtpResponse> => adapter.requestOtp(req),

  /**
   * Verify the received 6-digit OTP.
   */
  verifyOtp: async (req: OtpVerifyRequest): Promise<OtpVerifyResponse> => adapter.verifyOtp(req),

  /**
   * Complete registration using the verified phone session token.
   */
  registerWithVerifiedPhone: async (data: RegisterWithPhoneData): Promise<AuthResponse> =>
    adapter.registerWithVerifiedPhone(data),
};

export type {
  OtpRequest,
  OtpResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RegisterWithPhoneData,
};
