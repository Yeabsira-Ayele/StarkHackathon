import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Mail,
  KeyRound,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import {
  createPhoneSchema,
  createOtpSchema,
  createRegisterDetailsSchema,
  PhoneFormData,
  OtpFormData,
  RegisterDetailsFormData,
} from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

type RegisterStep = 'phone_entry' | 'otp_entry' | 'details_entry' | 'completed';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { t, i18n } = useTranslation();
  const { requestOtp, verifyOtp, registerWithVerifiedPhone, isLoading } = useAuth();

  const [step, setStep] = useState<RegisterStep>('phone_entry');
  const [phone, setPhone] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const phoneSchema = React.useMemo(() => createPhoneSchema(), [i18n.language]);
  const otpSchema = React.useMemo(() => createOtpSchema(), [i18n.language]);
  const detailsSchema = React.useMemo(() => createRegisterDetailsSchema(), [i18n.language]);

  const {
    register: registerPhoneField,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const {
    register: registerOtpField,
    handleSubmit: handleSubmitOtp,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const {
    register: registerDetailsField,
    handleSubmit: handleSubmitDetails,
    watch: watchDetails,
    formState: { errors: detailsErrors },
  } = useForm<RegisterDetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: '',
      email: '',
      passcode: '',
      role: 'donor',
      organizationName: '',
    },
  });

  const selectedRole = watchDetails('role');

  const onSendOtp = async (data: PhoneFormData) => {
    setErrorMsg(null);
    try {
      const res = await requestOtp({ phone: data.phone, purpose: 'signup' });
      setPhone(res.phone || data.phone);
      setSimulatedCode(res.debugCode || '123456');
      setStep('otp_entry');
    } catch (err: any) {
      setErrorMsg(err.message || t('errors.generic', 'Something went wrong'));
    }
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    setErrorMsg(null);
    try {
      const res = await verifyOtp({ phone, otp: data.otp, purpose: 'signup' });
      if (res.verified && res.verificationToken) {
        setVerificationToken(res.verificationToken);
        setStep('details_entry');
      } else {
        setErrorMsg(t('auth.validation.otpMismatch', 'Incorrect verification code. Please check and try again.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.validation.otpMismatch', 'Incorrect verification code. Please check and try again.'));
    }
  };

  const onCompleteRegistration = async (data: RegisterDetailsFormData) => {
    if (!verificationToken) {
      setErrorMsg('Phone verification expired. Please verify your phone number again.');
      setStep('phone_entry');
      return;
    }
    setErrorMsg(null);
    try {
      await registerWithVerifiedPhone({
        name: data.name,
        email: data.email,
        phone,
        passcode: data.passcode,
        role: data.role,
        organizationName: data.organizationName,
        verificationToken,
      });
      setStep('completed');
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.errors.registerFailed', 'Could not register'));
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    try {
      const res = await requestOtp({ phone, purpose: 'signup' });
      setSimulatedCode(res.debugCode || '123456');
      setOtpValue('otp', '');
    } catch (err: any) {
      setErrorMsg(err.message || t('errors.generic', 'Something went wrong'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress tracker */}
      <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#D5C8B2]/50 dark:border-[#2E2822] pb-2 text-[#73685B] dark:text-[#A89E90]">
        <span
          className={
            step === 'phone_entry' || step === 'otp_entry'
              ? 'font-bold text-[#1E4D38] dark:text-[#52B788]'
              : 'text-zinc-400'
          }
        >
          {t('auth.stepPhone', '1. Phone verification')}
        </span>
        <span>→</span>
        <span
          className={
            step === 'details_entry' || step === 'completed'
              ? 'font-bold text-[#1E4D38] dark:text-[#52B788]'
              : 'text-zinc-400'
          }
        >
          {t('auth.stepDetails', '2. Account details')}
        </span>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
        >
          {errorMsg}
        </div>
      )}

      {/* Step 1: Phone number */}
      {step === 'phone_entry' && (
        <form noValidate onSubmit={handleSubmitPhone(onSendOtp)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('auth.phoneLabel', 'Phone number')}
            </label>
            <div className="relative">
              <input
                {...registerPhoneField('phone')}
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

      {/* Step 2: OTP verification */}
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
              onClick={() => {
                setErrorMsg(null);
                setStep('phone_entry');
              }}
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
                {...registerOtpField('otp')}
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

      {/* Step 3: Account Details (after phone is verified) */}
      {step === 'details_entry' && (
        <form noValidate onSubmit={handleSubmitDetails(onCompleteRegistration)} className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold">{t('auth.phoneVerified', 'Phone verified')}:</span>{' '}
              <span className="font-mono">{phone}</span>
            </div>
          </div>

          {/* Role Picker */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#EBE3D3]/70 dark:bg-[#1A1714] rounded-xl border border-[#D5C8B2]/50 dark:border-[#2E2822]">
            <label
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedRole === 'donor'
                  ? 'bg-[#FAF6EE] dark:bg-[#26211C] text-[#14110E] dark:text-[#FAF6EE] shadow-sm'
                  : 'text-[#73685B] dark:text-[#A89E90]'
              }`}
            >
              <input type="radio" value="donor" {...registerDetailsField('role')} className="sr-only" />
              <UserIcon className="w-3.5 h-3.5" />
              {t('auth.donorRole', 'Donor citizen')}
            </label>
            <label
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedRole === 'foundation'
                  ? 'bg-[#FAF6EE] dark:bg-[#26211C] text-[#14110E] dark:text-[#FAF6EE] shadow-sm'
                  : 'text-[#73685B] dark:text-[#A89E90]'
              }`}
            >
              <input type="radio" value="foundation" {...registerDetailsField('role')} className="sr-only" />
              <Building2 className="w-3.5 h-3.5" />
              {t('auth.ngoRole', 'Civil society org (NGO)')}
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('auth.fullNameLabel', 'Full name')}
            </label>
            <div className="relative">
              <input
                {...registerDetailsField('name')}
                placeholder={t('auth.fullNamePlaceholder', 'e.g. Solomon Tesfaye')}
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <UserIcon className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {detailsErrors.name && (
              <p className="text-[11px] text-red-500 mt-1">{detailsErrors.name.message}</p>
            )}
          </div>

          {selectedRole === 'foundation' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6]">
                {t('auth.orgNameLabel', 'Organization name')}
              </label>
              <div className="relative">
                <input
                  {...registerDetailsField('organizationName')}
                  placeholder={t('auth.orgNamePlaceholder', 'Registered organization name')}
                  className="w-full rounded-xl border border-[#D5C8B2]/70 bg-[#EFE7D5] px-3.5 py-2.5 pl-10 text-xs text-[#14110E] focus:outline-none focus:ring-1 focus:ring-[#9A7432] dark:border-[#2E2822] dark:bg-[#1E1A16] dark:text-[#FAF6EE]"
                />
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73685B]" />
              </div>
              {detailsErrors.organizationName && (
                <p className="mt-1 text-[11px] text-red-500">{detailsErrors.organizationName.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('auth.emailLabel', 'Email address')}
            </label>
            <div className="relative">
              <input
                {...registerDetailsField('email')}
                type="email"
                placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <Mail className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {detailsErrors.email && (
              <p className="text-[11px] text-red-500 mt-1">{detailsErrors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('auth.createPasscodeLabel', 'Create passcode')}
            </label>
            <div className="relative">
              <input
                {...registerDetailsField('passcode')}
                type="password"
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <Lock className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {detailsErrors.passcode && (
              <p className="text-[11px] text-red-500 mt-1">{detailsErrors.passcode.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#163829] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('auth.registering', 'Registering...')}
              </>
            ) : (
              <>
                {t('auth.createAccount', 'Create account')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'completed' && (
        <div className="text-center py-4 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#1E4D38] dark:text-[#52B788] mx-auto animate-bounce" />
          <p className="text-sm font-semibold text-[#14110E] dark:text-[#FAF6EE]">
            {t('auth.createAccount', 'Account created successfully')}
          </p>
        </div>
      )}

      {onSwitchToLogin && (
        <p className="text-center text-xs text-[#73685B] dark:text-[#A89E90] pt-2">
          {t('auth.haveAccount', 'Already have an account?')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#9A7432] dark:text-[#C9A24D] font-bold hover:underline cursor-pointer"
          >
            {t('auth.goToSignIn', 'Sign in to your account')}
          </button>
        </p>
      )}
    </div>
  );
};

export default RegisterForm;
