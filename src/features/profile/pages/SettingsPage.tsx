import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Loader2, User, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { ProfileUpdateFormData } from '../schemas/profile.schema';
import { changeLanguage } from '../../../i18n/index.ts';
import { ErrorState } from '../../../components/ErrorState';

interface SettingsPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { profile, updateProfile, isUpdating, isLoading, error, refetch } = useProfile();
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      preferredLanguage: profile?.preferredLanguage || 'am',
    },
  });

  React.useEffect(() => {
    if (!profile) return;
    reset({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio || '',
      location: profile.location || '',
      preferredLanguage: profile.preferredLanguage,
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setErrorMsg(null);
    if (!profile) {
      setErrorMsg(t('settings.loadError'));
      return;
    }
    try {
      await updateProfile(data);
      if (data.preferredLanguage !== i18n.language) {
        await changeLanguage(data.preferredLanguage);
      }
      setSuccessMsg('settings.saved');
      setTimeout(() => {
        setSuccessMsg(null);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : t('settings.saveError'));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#73685B] hover:text-[#14110E] dark:hover:text-[#FAF6EE] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      )}

      <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] shadow-sm">
        <h1 className="text-xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-1">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] mb-6">
          {t('settings.description')}
        </p>

        {isLoading && (
          <p role="status" className="text-xs text-zinc-500 mb-4">
            {t('common.loading')}
          </p>
        )}
        {error && (
          <div className="mb-4">
            <ErrorState
              message={error instanceof Error ? error.message : t('settings.loadError')}
              onRetry={() => void refetch()}
            />
          </div>
        )}
        {!isLoading && !error && !profile && (
          <p role="status" className="text-xs text-zinc-500 mb-4">
            {t('settings.loadError')}
          </p>
        )}

        {successMsg && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
            {t(successMsg)}
          </div>
        )}
        {errorMsg && (
          <div role="alert" className="p-3 mb-4 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('settings.fullName')}
            </label>
            <div className="relative">
              <input
                {...register('name', { required: t('settings.nameRequired') })}
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
              />
              <User className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
                {t('settings.email')}
              </label>
              <div className="relative">
                <input
                  {...register('email', { required: t('settings.emailRequired') })}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
                {t('settings.phone')}
              </label>
              <div className="relative">
                <input
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
                />
                <Phone className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
                {t('settings.location')}
              </label>
              <div className="relative">
                <input
                  {...register('location')}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
                {t('settings.preferredLanguage')}
              </label>
              <div className="relative">
                <select
                  {...register('preferredLanguage')}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
                >
                  <option value="am">{t('settings.amharic')}</option>
                  <option value="en">{t('settings.english')}</option>
                </select>
                <Globe className="w-4 h-4 text-[#73685B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#26211C] dark:text-[#F4EFE6] mb-1.5">
              {t('settings.bio')}
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-xs text-[#14110E] dark:text-[#FAF6EE] focus:ring-1 focus:ring-[#9A7432] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating || !profile}
              className="px-6 py-2.5 rounded-xl bg-[#1E4D38] hover:bg-[#163829] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('settings.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('settings.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
