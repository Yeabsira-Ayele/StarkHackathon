import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { RegisterForm } from '../components/RegisterForm';

interface RegisterPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onBack,
  onSuccess,
  onNavigateToLogin,
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] rounded-3xl p-6 sm:p-8 shadow-xl">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-[#73685B] hover:text-[#14110E] dark:hover:text-[#FAF6EE] mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'ወደ ኋላ')}
          </button>
        )}

        <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            ለወገን የዜግነት መተሳሰብ ፖርታል
          </span>
        </div>

        <h1 className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-2">
          አዲስ የለጋሽ መለያ ይክፈቱ
        </h1>
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] mb-6">
          የተረጋገጡ የሲቪል ማኅበራት ምክንያቶችን በታማኝነትና በግልጽነት ይደግፉ
        </p>

        <RegisterForm
          onSuccess={onSuccess}
          onSwitchToLogin={onNavigateToLogin}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
