import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, AlertCircle, Upload } from 'lucide-react';
import { fundraiserSchema, FundraiserSchemaData } from '../schemas/fundraiser.schema';
import { fundraiserApi } from '../api/fundraiser.api';
import { CAMPAIGN_CATEGORIES } from '../../campaigns/data/categories.data';
import { CampaignCategory, Campaign } from '../../campaigns/types/campaign.types';

interface CreateCampaignPageProps {
  onBack: () => void;
  onCreated: (campaign: Campaign) => void;
}

export const CreateCampaignPage: React.FC<CreateCampaignPageProps> = ({
  onBack,
  onCreated,
}) => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FundraiserSchemaData>({
    resolver: zodResolver(fundraiserSchema),
    defaultValues: {
      category: 'medical',
      location: 'Addis Ababa, Ethiopia',
      goalAmount: 200000,
      imageUrl: '',
    },
  });
  const imageUrl = watch('imageUrl');

  const handleImageChange = (file?: File) => {
    setImageUploadError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Choose an image file from your computer.');
      return;
    }
    if (file.size > 700 * 1024) {
      setImageUploadError('Choose an image smaller than 700 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setImageUploadError('The selected image could not be read.');
        return;
      }
      setValue('imageUrl', reader.result, { shouldValidate: true });
    };
    reader.onerror = () => setImageUploadError('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FundraiserSchemaData) => {
    setSubmitError(null);
    try {
      const created = await fundraiserApi.publishProject(data);
      onCreated(created);
    } catch (e: any) {
      setSubmitError(e.message || 'Creation failed');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border-2 border-[#26211C]/30 bg-[#FFFDF9] dark:bg-[#12100E] font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#F2ECE1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </button>

        <span className="font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
          ACSO PROJECT ENGRAVING FORM
        </span>
      </div>

      <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-lg">
        <div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#14110E] dark:text-[#FFFFFF]">
            {t('fundraiser.start.title')}
          </h2>
          <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {t('fundraiser.start.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-mono text-xs">
          {submitError && (
            <div role="alert" className="p-3 border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
          <div>
            <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
              Campaign image *
            </label>
            <label className="inline-flex items-center gap-2 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] px-3 py-2 font-bold uppercase cursor-pointer">
              <Upload className="h-4 w-4" />
              Choose image from computer
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  handleImageChange(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            <p className="mt-1 text-xs text-zinc-500">Use a real campaign photo (maximum 700 KB).</p>
            {imageUploadError && <p role="alert" className="mt-1 text-red-600">{imageUploadError}</p>}
            {errors.imageUrl && <p role="alert" className="mt-1 text-red-600">{errors.imageUrl.message}</p>}
            {imageUrl && <img src={imageUrl} alt="Selected campaign photo preview" className="mt-3 h-32 w-48 border border-border object-cover" />}
          </div>
          {/* Title */}
          <div>
            <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
              {t('fundraiser.form.title')} *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={t('fundraiser.form.titlePlaceholder')}
              className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
            />
            {errors.title && <p className="text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          {/* Grid Category & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.form.category')} *
              </label>
              <select
                {...register('category')}
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              >
                {CAMPAIGN_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {t(`categories.${cat.id}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.form.goal')} *
              </label>
              <input
                type="number"
                {...register('goalAmount', { valueAsNumber: true })}
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
              {errors.goalAmount && <p className="text-red-600 mt-1">{errors.goalAmount.message}</p>}
            </div>
          </div>

          {/* Story */}
          <div>
            <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
              {t('fundraiser.form.story')} *
            </label>
            <textarea
              rows={4}
              {...register('story')}
              placeholder={t('fundraiser.form.storyPlaceholder')}
              className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
            />
            {errors.story && <p className="text-red-600 mt-1">{errors.story.message}</p>}
          </div>

          {/* Officer & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.form.coordinator')} *
              </label>
              <input
                type="text"
                {...register('creatorName')}
                placeholder={t('fundraiser.form.coordinatorPlaceholder')}
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
              {errors.creatorName && <p className="text-red-600 mt-1">{errors.creatorName.message}</p>}
            </div>

            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.form.location')} *
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder={t('fundraiser.form.locationPlaceholder')}
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
              {errors.location && <p className="text-red-600 mt-1">{errors.location.message}</p>}
            </div>
          </div>

          {/* Beneficiaries & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('createCause.beneficiariesLabel')}
              </label>
              <input
                type="number"
                {...register('beneficiariesTarget', { valueAsNumber: true })}
                placeholder="e.g. 500"
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.form.impactMetric')}
              </label>
              <input
                type="text"
                {...register('impactMetric')}
                placeholder={t('fundraiser.form.impactMetricPlaceholder')}
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('createCause.submitting') : t('createCause.publish')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
