import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
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
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'am' | 'en' | 'om') || 'am';
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FundraiserSchemaData>({
    resolver: zodResolver(fundraiserSchema),
    defaultValues: {
      category: 'medical',
      location: 'Addis Ababa, Ethiopia',
      goalAmount: 200000,
    },
  });

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
          <span>← {t('common.back')}</span>
        </button>

        <span className="font-mono text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
          ACSO PROJECT ENGRAVING FORM
        </span>
      </div>

      <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-lg">
        <div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#14110E] dark:text-[#FFFFFF]">
            {t('fundraiser.title')}
          </h2>
          <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {t('fundraiser.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-mono text-xs">
          {submitError && (
            <div role="alert" className="p-3 border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
          {/* Title */}
          <div>
            <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
              {t('fundraiser.projectTitle')} *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Clean Solar Water Borehole for 1,200 Families"
              className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
            />
            {errors.title && <p className="text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          {/* Grid Category & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.category')} *
              </label>
              <select
                {...register('category')}
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              >
                {CAMPAIGN_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.labels[currentLang] || cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.targetGoal')} *
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
              {t('fundraiser.story')} *
            </label>
            <textarea
              rows={4}
              {...register('story')}
              placeholder="Describe the urgent community need, exact execution plan, and budget breakdown..."
              className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
            />
            {errors.story && <p className="text-red-600 mt-1">{errors.story.message}</p>}
          </div>

          {/* Officer & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                Field Coordinator Name *
              </label>
              <input
                type="text"
                {...register('creatorName')}
                placeholder="e.g. Sister Meron Tadesse"
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
              {errors.creatorName && <p className="text-red-600 mt-1">{errors.creatorName.message}</p>}
            </div>

            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.location')} *
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder="e.g. Maychew, Tigray"
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38]"
              />
              {errors.location && <p className="text-red-600 mt-1">{errors.location.message}</p>}
            </div>
          </div>

          {/* Beneficiaries & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('fundraiser.beneficiaries')}
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
                {t('fundraiser.impactMetric')}
              </label>
              <input
                type="text"
                {...register('impactMetric')}
                placeholder="e.g. 140m solar pump for clean water"
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
              <span>{isSubmitting ? t('fundraiser.publishing') : t('fundraiser.publish')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
