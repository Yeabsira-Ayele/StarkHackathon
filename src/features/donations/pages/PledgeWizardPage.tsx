import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Campaign } from '../../campaigns/types/campaign.types';
import { useDonationStore } from '../store/donation.store';
import { useSubmitDonation } from '../hooks/useDonations';
import { DonationAmountSelector } from '../components/DonationAmountSelector';
import { PaymentRailSelector } from '../components/PaymentRailSelector';
import { ContributionCertificate } from '../types/donation.types';

interface PledgeWizardPageProps {
  campaign: Campaign;
  onBack: () => void;
  onCertificateIssued: (cert: ContributionCertificate) => void;
  onViewVault: () => void;
  onExploreMore: () => void;
}

export const PledgeWizardPage: React.FC<PledgeWizardPageProps> = ({
  campaign,
  onBack,
  onCertificateIssued,
  onViewVault,
  onExploreMore,
}) => {
  const { t } = useTranslation();
  const {
    pledgeStep,
    pledgeAmount,
    customAmountStr,
    donorName,
    isAnonymous,
    donorMessage,
    selectedPaymentRail,
    setPledgeStep,
    setPledgeAmount,
    setCustomAmountStr,
    setDonorName,
    setIsAnonymous,
    setDonorMessage,
    setSelectedPaymentRail,
    resetWizard,
  } = useDonationStore();

  const submitDonationMutation = useSubmitDonation();

  const handleExecutePledge = async () => {
    try {
      const res = await submitDonationMutation.mutateAsync({
        campaignId: campaign.id,
        amount: pledgeAmount,
        donorName: isAnonymous ? 'Anonymous Patron' : donorName || 'Anonymous Patron',
        message: donorMessage,
        paymentRail: selectedPaymentRail,
      });

      setPledgeStep(4);
      onCertificateIssued(res.certificate);
    } catch (err: any) {
      alert(err.message || 'Payment clearing failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border-2 border-[#26211C]/30 bg-[#FFFDF9] dark:bg-[#12100E] font-mono text-xs font-bold uppercase flex items-center gap-2 hover:bg-[#F2ECE1] transition-colors cursor-pointer rounded-[1px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← {t('common.back')}</span>
        </button>

        <div className="text-right font-mono">
          <span className="text-xs font-black text-[#1E4D38] dark:text-[#52B788]">
            № {campaign.serialCode || 'LW-0421'}
          </span>
        </div>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-4">
        {[
          { step: 1, label: t('donations.step1') },
          { step: 2, label: t('donations.step2') },
          { step: 3, label: t('donations.step3') },
          { step: 4, label: t('donations.step4') },
        ].map((s) => (
          <div
            key={s.step}
            className={`py-2 border font-bold uppercase transition-colors rounded-[1px] ${
              pledgeStep === s.step
                ? 'border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706]'
                : pledgeStep > s.step
                ? 'border-[#1E4D38]/50 bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788]'
                : 'border-[#26211C]/20 bg-[#FFFDF9]/50 text-zinc-400'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: AMOUNT SELECTION */}
      {pledgeStep === 1 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-md">
          <div>
            <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
              {campaign.title}
            </h3>
            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Select or type the Birr contribution amount to underwrite into the community escrow.
            </p>
          </div>

          <DonationAmountSelector
            selectedAmount={pledgeAmount}
            customAmount={customAmountStr}
            onSelectPreset={(amt) => {
              setPledgeAmount(amt);
              setCustomAmountStr(String(amt));
            }}
            onChangeCustom={(val) => {
              setCustomAmountStr(val);
              const parsed = parseInt(val, 10);
              if (!isNaN(parsed) && parsed > 0) setPledgeAmount(parsed);
            }}
          />

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setPledgeStep(2)}
              disabled={pledgeAmount <= 0}
              className="py-3 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] dark:bg-[#52B788] dark:text-[#080706] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>{t('donations.step2')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PATRON DETAILS & CLEARING RAIL */}
      {pledgeStep === 2 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 font-mono text-xs rounded-[1px] shadow-md">
          <div>
            <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
              Patron Underwriting Details
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Record your name for the official certificate, or mark as anonymous.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('donations.patronName')}:
              </label>
              <input
                type="text"
                disabled={isAnonymous}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Almaz Bekele"
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] disabled:opacity-50 focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788]"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-[#14110E] dark:text-[#E8DEC8]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="accent-[#1E4D38]"
                />
                <span>{t('donations.anonymous')}</span>
              </label>
            </div>

            <div>
              <label className="block font-bold uppercase text-[#14110E] dark:text-[#F4EFE6] mb-1">
                {t('donations.message')}:
              </label>
              <textarea
                rows={3}
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                placeholder="Write an encouraging note for the community..."
                className="w-full p-3 border-2 border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] focus:outline-none focus:border-[#1E4D38] dark:focus:border-[#52B788]"
              />
            </div>

            <PaymentRailSelector
              selectedRail={selectedPaymentRail}
              onSelectRail={setSelectedPaymentRail}
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15 dark:border-[#9A7432]/30">
            <button
              type="button"
              onClick={() => setPledgeStep(1)}
              className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#DFD3BC] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] font-bold cursor-pointer hover:bg-[#D5C6AC]"
            >
              ← {t('common.back')}
            </button>

            <button
              type="button"
              onClick={() => setPledgeStep(3)}
              className="py-3 px-8 border border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-black tracking-widest uppercase hover:bg-[#163E2C] cursor-pointer flex items-center gap-2"
            >
              <span>{t('donations.step3')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & SETTLEMENT */}
      {pledgeStep === 3 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38] dark:border-[#52B788] bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 font-mono text-xs rounded-[1px] shadow-lg">
          <div>
            <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
              Confirm Civic Promissory Underwrite
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Review your details before issuing digital Birr into the community escrow.
            </p>
          </div>

          <div className="p-4 border-2 border-[#26211C]/30 dark:border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] text-[#14110E] dark:text-[#FFFFFF] space-y-3 rounded-[1px]">
            <div className="flex justify-between border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-bold">CAUSE:</span>
              <span className="font-black text-right">{campaign.title}</span>
            </div>
            <div className="flex justify-between border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-bold">ORGANIZATION:</span>
              <span className="font-bold">{campaign.organizationName}</span>
            </div>
            <div className="flex justify-between border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-bold">PATRON:</span>
              <span className="font-bold">{isAnonymous ? 'Anonymous Patron' : donorName || 'Anonymous Patron'}</span>
            </div>
            <div className="flex justify-between border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-bold">PAYMENT RAIL:</span>
              <span className="font-black uppercase text-[#1E4D38] dark:text-[#52B788]">
                {selectedPaymentRail} (DIRECT ESCROW)
              </span>
            </div>
            <div className="flex justify-between pt-1 text-base">
              <span className="font-black">TOTAL PLEDGE:</span>
              <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
                {pledgeAmount.toLocaleString()} ETB
              </span>
            </div>
          </div>

          <div className="p-3 border border-[#9A7432]/40 bg-[#EFE7D5] dark:bg-[#181512] text-[11px] text-[#14110E] dark:text-[#E8DEC8] font-bold">
            ★ 100% of your pledge will be transferred directly to verified community procurement. Zero platform fee is deducted.
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15 dark:border-[#9A7432]/25">
            <button
              type="button"
              onClick={() => setPledgeStep(2)}
              className="px-4 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#DFD3BC] dark:bg-[#181512] font-bold cursor-pointer"
            >
              ← {t('common.back')}
            </button>

            <button
              type="button"
              onClick={handleExecutePledge}
              disabled={submitDonationMutation.isPending}
              className="py-3.5 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {submitDonationMutation.isPending ? (
                <span>{t('donations.settling')}</span>
              ) : (
                <span>{t('donations.confirmPledge')}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SETTLED & MINTED CERTIFICATE */}
      {pledgeStep === 4 && (
        <div className="p-8 border-2 border-[#1E4D38] bg-[#FFFDF9] dark:bg-[#12100E] text-center space-y-6 font-mono rounded-[1px] shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-black text-3xl text-[#14110E] dark:text-[#FFFFFF]">
              Promissory Contribution Cleared!
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
              Your donation of {pledgeAmount.toLocaleString()} ETB is now held in transparent ACSO direct escrow for {campaign.title}.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                resetWizard();
                onExploreMore();
              }}
              className="py-3 px-6 border-2 border-[#26211C]/40 bg-[#EFE8D8] dark:bg-[#1C1814] font-mono text-xs font-bold uppercase cursor-pointer"
            >
              {t('common.explore')}
            </button>

            <button
              type="button"
              onClick={() => {
                resetWizard();
                onViewVault();
              }}
              className="py-3 px-6 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] cursor-pointer"
            >
              {t('nav.myContributions')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
