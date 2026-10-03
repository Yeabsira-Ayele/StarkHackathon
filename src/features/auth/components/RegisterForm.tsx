import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Lock, Phone, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { createRegisterSchema, RegisterFormData } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { t, i18n } = useTranslation();
  const { register: registerAuth, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const schema = React.useMemo(() => createRegisterSchema(), [i18n.language]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      emailOrPhone: '',
      passcode: '',
      role: 'donor',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    try {
      await registerAuth(data);
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.errors.registerFailed', 'Could not register'));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Role Picker */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#EBE3D3]/70 dark:bg-[#1A1714] rounded-xl border border-[#D5C8B2]/50 dark:border-[#2E2822]">
        <label className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
          selectedRole === 'donor'
            ? 'bg-[#FAF6EE] dark:bg-[#26211C] text-[#14110E] dark:text-[#FAF6EE] shadow-sm'
            : 'text-[#73685B] dark:text-[#A89E90]'
        }`}>
          <input
            type="radio"
            value="donor"
            {...register('role')}
            className="sr-only"
          />
          <UserIcon className="w-3.5 h-3.5" />
          {t('auth.donorRole', 'Donor citizen')}
        </label>
        <label className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
          selectedRole === 'foundation'
            ? 'bg-[#FAF6EE] dark:bg-[#26211C] text-[#14110E] dark:text-[#FAF6EE] shadow-sm'
            : 'text-[#73685B] dark:text-[#A89E90]'
        }`}>
          <input
            type="radio"
            value="foundation"
            {...register('role')}
            className="sr-only"
          />
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
            {...register('name')}
            placeholder={t('auth.fullNamePlaceholder', 'e.g. Solomon Tesfaye')}
            className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
          />
          <UserIcon className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        {errors.name && (
          <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {selectedRole === 'foundation' && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6]">
            {t('auth.orgNameLabel', 'Organization name')}
          </label>
          <div className="relative">
            <input
              {...register('organizationName')}
              placeholder={t('auth.orgNamePlaceholder', 'Registered organization name')}
              className="w-full rounded-xl border border-[#D5C8B2]/70 bg-[#EFE7D5] px-3.5 py-2.5 pl-10 text-xs text-[#14110E] focus:outline-none focus:ring-1 focus:ring-[#9A7432] dark:border-[#2E2822] dark:bg-[#1E1A16] dark:text-[#FAF6EE]"
            />
            <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#73685B]" />
          </div>
          {errors.organizationName && (
            <p className="mt-1 text-[11px] text-red-500">{errors.organizationName.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
          {t('auth.phoneOrEmailLabel', 'Phone number or email')}
        </label>
        <div className="relative">
          <input
            {...register('emailOrPhone')}
            placeholder="+251 9XX XXX XXX"
            className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
          />
          <Phone className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        {errors.emailOrPhone && (
          <p className="text-[11px] text-red-500 mt-1">{errors.emailOrPhone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
          {t('auth.createPasscodeLabel', 'Create passcode')}
        </label>
        <div className="relative">
          <input
            {...register('passcode')}
            type="password"
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
          />
          <Lock className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        {errors.passcode && (
          <p className="text-[11px] text-red-500 mt-1">{errors.passcode.message}</p>
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
    </form>
  );
};

export default RegisterForm;
