import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { createLoginSchema, LoginFormData } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { t, i18n } = useTranslation();
  const { login, isLoading } = useAuth();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const schema = React.useMemo(() => createLoginSchema(), [i18n.language]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      await login(data);
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || t('auth.errors.loginFailed', 'Could not sign in'));
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          {errorMsg}
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
          {t('auth.passcodeLabel', 'Passcode')}
        </label>
        <div className="relative">
          <input
            {...register('passcode')}
            type="password"
            minLength={8}
            autoComplete="current-password"
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
            {t('auth.signingIn', 'Signing in...')}
          </>
        ) : (
          <>
            {t('auth.signIn', 'Sign in')}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="border border-[#9A7432]/30 bg-[#EFE7D5]/60 p-2.5 text-[10px] font-mono text-[#73685B] dark:bg-[#1E1A16] dark:text-[#A89E90]">
        {t('auth.adminDemo', 'Local admin demo: admin@local.lewegene / demo-admin-123')}
      </p>

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
    </form>
  );
};

export default LoginForm;
