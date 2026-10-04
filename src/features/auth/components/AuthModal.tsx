import React, { useEffect, useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/60 backdrop-blur-sm animate-in fade-in sm:items-center">
      <div className="relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Decorative corner bank lines */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-[#9A7432]/10 to-transparent pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#73685B] hover:text-[#14110E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] mb-1">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {t('auth.portalLabel', 'Lewegene Citizen Solidarity Portal')}
          </span>
        </div>

        <h2 className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-1">
          {mode === 'login'
            ? t('auth.modalLoginTitle', 'Sign in to your account')
            : t('auth.modalRegisterTitle', 'Open a new patron account')}
        </h2>
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] mb-6">
          {mode === 'login'
            ? t('auth.modalLoginDesc', 'Manage your donation certificates and contributions')
            : t('auth.modalRegisterDesc', 'Support accredited civil society donation projects directly')}
        </p>

        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
