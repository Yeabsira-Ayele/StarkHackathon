import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Campaign } from '../../../types/index.ts';
import { useDonationStore } from '../store/donation.store';
import { useBanks, useCreateDonation, useSubmitReceiptVerification, useSubmitReference } from '../hooks/useDonations';
import { getBankById } from '../data/banks.data';
import { DonationAmountSelector } from '../components/DonationAmountSelector';
import { DonorInfoForm } from '../components/DonorInfoForm';
import { BankSelector } from '../components/BankSelector';
import { BankAccountDetails } from '../components/BankAccountDetails';
import { PaymentReferenceForm } from '../components/PaymentReferenceForm';
import { DonationConfirmation } from '../components/DonationConfirmation';
import { ContributionCertificate } from '../types/donation.types';

interface PledgeWizardPageProps {
  campaign: Campaign;
  onBack: () => void;
  onCertificateIssued?: (cert: ContributionCertificate) => void;
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
    data: banks = [],
    isLoading: isLoadingBanks,
    isError: banksUnavailable,
    error: banksError,
  } = useBanks();

  const {
    step,
    amount,
    customAmountStr,
    donorName,
    donorEmail,
    isAnonymous,
    donorMessage,
    selectedBankId,
    receiptUrl,
    reference,
    proofUrl,
    createdDonation,
    setStep,
    setAmount,
    setCustomAmountStr,
    setDonorName,
    setDonorEmail,
    setIsAnonymous,
    setDonorMessage,
    setSelectedBankId,
    setReceiptUrl,
    setReference,
    setProofUrl,
    setCreatedDonation,
    resetWizard,
  } = useDonationStore();

  const [generalError, setGeneralError] = useState<string | null>(null);
  const createDonationMutation = useCreateDonation();
  const submitReceiptMutation = useSubmitReceiptVerification();
  const submitReferenceMutation = useSubmitReference();

  const selectedBank = getBankById(selectedBankId) || banks[0];

  // Advance from Bank Selection to Account Details
  const handleProceedToAccountDetails = async () => {
    if (!selectedBank) return;
    setGeneralError(null);
    try {
      const res = await createDonationMutation.mutateAsync({
        campaignId: campaign.id,
        amount,
        donorName: isAnonymous ? 'Anonymous Patron' : (donorName.trim() || 'Anonymous Patron'),
        donorEmail: donorEmail.trim() || undefined,
        anonymous: isAnonymous,
        bankId: selectedBank.id,
        message: donorMessage.trim() || undefined,
      });

      setCreatedDonation(res);
      setStep(4);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to initialize donation record');
    }
  };

  // Submit payment receipt verification (primary flow)
  const handleSubmitReceiptVerification = async (submittedUrl?: string) => {
    if (!createdDonation) return;
    const targetUrl = (submittedUrl || receiptUrl || '').trim();
    if (!targetUrl) {
      setGeneralError('Please paste your payment receipt link to continue.');
      return;
    }
    setGeneralError(null);
    try {
      const updated = await submitReceiptMutation.mutateAsync({
        donationId: createdDonation.id,
        payload: {
          donationId: createdDonation.id,
          receiptUrl: targetUrl,
          proofUrl,
          reference: reference.trim() || undefined,
        },
      });

      setCreatedDonation(updated);
      setStep(6);

      if (onCertificateIssued && updated.certificateId) {
        onCertificateIssued({
          certificateId: updated.certificateId,
          donationId: updated.id,
          campaignId: updated.campaignId,
          campaignTitle: updated.campaignTitle || campaign.title,
          organizationName: updated.beneficiaryName || campaign.organizationName || 'Civil Society',
          donorName: updated.donorName,
          amount: updated.amount,
          currency: 'ETB',
          impactSummary: campaign.impactMetric || 'Direct civic escrow support',
          location: campaign.location || 'Addis Ababa, Ethiopia',
          issuedAt: new Date().toISOString(),
          transactionRef: updated.reference || updated.verifiedPayment?.railReference || 'TXN-ESCROW',
          paymentRail: updated.bankName || updated.verifiedPayment?.railName || 'Direct Escrow',
          status: updated.status,
        });
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to verify payment receipt link.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div role="note" className="border border-emerald-700/40 bg-emerald-50/70 px-4 py-2.5 font-mono text-xs text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100 flex items-center justify-between gap-3">
        <span>ACSO Verified Escrow: 100% of contributions are protected and disbursed directly to project milestones.</span>
        <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">Zero Platform Cut</span>
      </div>

      {generalError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono">
          {generalError}
        </div>
      )}
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
            UNDERWRITING CAUSE № {campaign.serialCode || 'LW-0421'}
          </span>
        </div>
      </div>

      {/* 6-Phase Progress Ribbon */}
      {step < 6 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs text-center border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-4">
          {[
            { s: 1, label: '1 AMOUNT' },
            { s: 2, label: '2 DONOR INFO' },
            { s: 3, label: '3 CHOOSE BANK' },
            { s: 4, label: '4 PAYMENT PLACEHOLDER' },
            { s: 5, label: '5 REFERENCE' },
          ].map((item) => (
            <div
              key={item.s}
              className={`py-2 border font-bold uppercase transition-colors rounded-[1px] ${
                step === item.s
                  ? 'border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706]'
                  : step > item.s
                  ? 'border-[#1E4D38]/50 bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788]'
                  : 'border-[#26211C]/20 bg-[#FFFDF9]/50 text-zinc-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: AMOUNT SELECTION */}
      {step === 1 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-md">
          <div>
            <h3 className="font-serif font-black text-2xl text-[#14110E] dark:text-[#FFFFFF]">
              {campaign.title}
            </h3>
            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Select or type an amount to simulate a contribution in this browser.
            </p>
          </div>

          <DonationAmountSelector
            selectedAmount={amount}
            customAmount={customAmountStr}
            onSelectPreset={(amt) => {
              setAmount(amt);
              setCustomAmountStr(String(amt));
            }}
            onChangeCustom={(val) => {
              setCustomAmountStr(val);
              const parsed = parseInt(val, 10);
              if (!isNaN(parsed) && parsed > 0) setAmount(parsed);
            }}
          />

          <div className="pt-4 flex justify-end border-t border-[#26211C]/15">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={amount < 50}
              className="py-3 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <span>CONTINUE TO DONOR INFO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DONOR INFORMATION */}
      {step === 2 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-md">
          <DonorInfoForm
            donorName={donorName}
            donorEmail={donorEmail}
            isAnonymous={isAnonymous}
            donorMessage={donorMessage}
            onChangeName={setDonorName}
            onChangeEmail={setDonorEmail}
            onChangeAnonymous={setIsAnonymous}
            onChangeMessage={setDonorMessage}
          />

          <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-[#26211C]/40 bg-[#DFD3BC] dark:bg-[#181512] font-mono text-xs font-bold cursor-pointer"
            >
              ← BACK
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="py-3 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>CHOOSE RECEIVING BANK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE BANK */}
      {step === 3 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-md">
          {banksUnavailable || (!isLoadingBanks && banks.length === 0) ? (
            <div role="alert" className="border border-red-800/30 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200">
              Verified receiver bank accounts are not available from the connected backend. Donations cannot proceed until verified account details are provided.
              {banksError instanceof Error && <p className="mt-2 font-mono text-xs">{banksError.message}</p>}
            </div>
          ) : (
            <BankSelector
              banks={banks}
              selectedBankId={selectedBankId}
              onSelectBank={setSelectedBankId}
              isLoading={isLoadingBanks}
            />
          )}

          <div className="pt-4 flex items-center justify-between border-t border-[#26211C]/15">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-[#26211C]/40 bg-[#DFD3BC] dark:bg-[#181512] font-mono text-xs font-bold cursor-pointer"
            >
              ← BACK
            </button>

            <button
              type="button"
              onClick={handleProceedToAccountDetails}
              disabled={createDonationMutation.isPending || !selectedBank || banksUnavailable}
              className="py-3 px-8 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black tracking-widest uppercase hover:bg-[#163E2C] transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {createDonationMutation.isPending ? (
                <span>INITIALIZING CONTRIBUTION...</span>
              ) : (
                <>
                  <span>PROCEED TO PAYMENT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: BANK ACCOUNT & TRANSFER INSTRUCTIONS */}
      {step === 4 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-md">
          <BankAccountDetails
            bank={selectedBank}
            amount={amount}
            donorName={isAnonymous ? 'Anonymous Patron' : (donorName || 'Anonymous Patron')}
            onProceedToReference={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        </div>
      )}

      {/* STEP 5: SUBMIT RECEIPT LINK (PRIMARY FLOW) */}
      {step === 5 && (
        <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-md">
          <PaymentReferenceForm
            bank={selectedBank}
            amount={amount}
            donorName={isAnonymous ? 'Anonymous Patron' : (donorName || 'Anonymous Patron')}
            receiptUrl={receiptUrl}
            reference={reference}
            proofUrl={proofUrl}
            isSubmitting={submitReceiptMutation.isPending || submitReferenceMutation.isPending}
            onChangeReceiptUrl={setReceiptUrl}
            onChangeReference={setReference}
            onChangeProofUrl={setProofUrl}
            onSubmit={handleSubmitReceiptVerification}
            onBack={() => setStep(4)}
          />
        </div>
      )}

      {/* STEP 6: CONFIRMATION & RECEIPT */}
      {step === 6 && createdDonation && (
        <DonationConfirmation
          donation={createdDonation}
          onExploreMore={() => {
            resetWizard();
            onExploreMore();
          }}
          onViewContributions={() => {
            resetWizard();
            onViewVault();
          }}
          onBackToCause={() => {
            resetWizard();
            onBack();
          }}
        />
      )}
    </div>
  );
};
