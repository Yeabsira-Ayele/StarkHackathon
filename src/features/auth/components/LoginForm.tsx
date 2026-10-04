import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Phone, ArrowRight, ArrowLeft, Loader2, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { createPhoneSchema, createOtpSchema, PhoneFormData, OtpFormData } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

type LoginStep = 'phone_entry' | 'otp_entry' | 'verified';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { t, i18n } = useTranslation();
  const { requestOtp, verifyOtp, isLoading } = useAuth();

  const [step, setStep] = useState<LoginStep>('phone_entry');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  const phoneSchema = React.useMemo(() => createPhoneSchema(), [i18n.language]);
  const otpSchema = React.useMemo(() => createOtpSchema(), [i18n.language]);

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSendOtp = async (data: PhoneFormData) => {
    setErrorMsg(null);
    try {
      const res = await requestOtp({ phone: data.phone, purpose: 'login' });
      setPhone(res.phone || data.phone);
      setSimulatedCode(res.debugCode || '123456');
      setStep('otp_entry');
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.errors.loginFailed', 'Could not sign in'));
    }
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    setErrorMsg(null);
    try {
      const res = await verifyOtp({ phone, otp: data.otp, purpose: 'login' });
      if (res.verified) {
        setStep('verified');
        onSuccess?.();
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.validation.otpMismatch', 'Incorrect verification code. Please check and try again.'));
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    try {
      const res = await requestOtp({ phone, purpose: 'login' });
      setSimulatedCode(res.debugCode || '123456');
      setOtpValue('otp', '');
    } catch (err: any) {
      setErrorMsg(err.message || t('errors.generic', 'Something went wrong'));
    }
  };

  const handleBackToPhone = () => {
    setErrorMsg(null);
    setStep('phone_entry');
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div
          role="alert"
          className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
        >
          {errorMsg}
        </div>
      )}

      {step === 'phone_entry' && (
        <form noValidate onSubmit={handleSubmitPhone(onSendOtp)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('auth.phoneLabel', 'Phone number')}
            </label>
            <div className="relative">
              <input
                {...registerPhone('phone')}
                type="tel"
                placeholder={t('auth.phonePlaceholder', '+251 9XX XXX XXX')}
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <Phone className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {phoneErrors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{phoneErrors.phone.message}</p>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {t('auth.phoneHint', 'We will verify your mobile number with a 6-digit code.')}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#163829] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('auth.sendingOtp', 'Sending code...')}
              </>
            ) : (
              <>
                {t('auth.sendOtp', 'Send verification code')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'otp_entry' && (
        <form noValidate onSubmit={handleSubmitOtp(onVerifyOtp)} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#EFE7D5]/70 dark:bg-[#1E1A16] border border-[#D5C8B2]/60 dark:border-[#2E2822] flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                {t('auth.phoneLabel', 'Phone number')}
              </p>
              <p className="font-semibold text-[#14110E] dark:text-[#FAF6EE]">{phone}</p>
            </div>
            <button
              type="button"
              onClick={handleBackToPhone}
              className="text-[#9A7432] dark:text-[#C9A24D] hover:underline font-semibold text-xs cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('auth.changePhone', 'Change phone number')}
            </button>
          </div>

          {simulatedCode && (
            <div className="p-2.5 rounded-lg bg-[#9A7432]/10 border border-[#9A7432]/30 text-[11px] text-[#9A7432] dark:text-[#C9A24D] font-mono">
              {t('auth.otpSimulationBanner', {
                code: simulatedCode,
                defaultValue: `Prototype simulation: your 6-digit code is ${simulatedCode}`,
              })}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('auth.otpLabel', 'Verification code (OTP)')}
            </label>
            <div className="relative">
              <input
                {...registerOtp('otp')}
                type="text"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-sm tracking-widest font-mono text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {otpErrors.otp && (
              <p className="text-[11px] text-red-500 mt-1">{otpErrors.otp.message}</p>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {t('auth.otpInstructions', {
                phone,
                defaultValue: `Enter the 6-digit code sent to ${phone}`,
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="px-3 py-2.5 rounded-xl border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs font-semibold text-[#73685B] dark:text-[#A89E90] hover:text-[#14110E] dark:hover:text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('auth.resendOtp', 'Resend code')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#163829] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth.verifyingOtp', 'Verifying code...')}
                </>
              ) : (
                <>
                  {t('auth.verifyOtp', 'Verify code')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {step === 'verified' && (
        <div className="text-center py-4 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#1E4D38] dark:text-[#52B788] mx-auto animate-bounce" />
          <p className="text-sm font-semibold text-[#14110E] dark:text-[#FAF6EE]">
            {t('auth.phoneVerified', 'Phone verified')}
          </p>
        </div>
      )}

      {onSwitchToRegister && (
        <p className="text-center text-xs text-[#73685B] dark:text-[#A89E90] pt-2">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#9A7432] dark:text-[#C9A24D] font-bold hover:underline cursor-pointer"
          >
            {t('auth.openAccount', 'Open a new account')}
          </button>
        </p>
      )}
    </div>
  );
};

export default LoginForm;
