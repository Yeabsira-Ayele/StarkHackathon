import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Campaign } from '../../campaigns/types/campaign.types';
import { useDonationStore, SupportFlowStep } from '../store/donation.store';
import {
  useBanks,
  useCreateDonation,
  useSubmitReceiptVerification,
} from '../hooks/useDonations';
import { getBankById } from '../data/banks.data';
import { DonationAmountSelector } from './DonationAmountSelector';
import { DonorInfoForm } from './DonorInfoForm';
import { BankSelector } from './BankSelector';
import { BankAccountDetails } from './BankAccountDetails';
import { PaymentReferenceForm } from './PaymentReferenceForm';
import { DonationConfirmation } from './DonationConfirmation';
import { X, ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Donation } from '../types/donation.types';

interface SupportModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onDonationRecorded?: (donation: Donation) => void;
  onViewContributions?: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onDonationRecorded,
  onViewContributions,
}) => {
  if (!isOpen) return null;

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
    reference,
    receiptUrl,
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
    setReference,
    setReceiptUrl,
    setProofUrl,
    setCreatedDonation,
    resetWizard,
  } = useDonationStore();

  const createDonationMutation = useCreateDonation();
  const submitReceiptMutation = useSubmitReceiptVerification();
  const [flowError, setFlowError] = useState<string | null>(null);

  const selectedBank = getBankById(selectedBankId) || banks[0];

  // Advance from Bank Selection to Account Details
  const handleProceedToAccountDetails = async () => {
    if (!selectedBank) return;
    setFlowError(null);
    try {
      // Create pending donation in backend / state
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
      setFlowError(err.message || 'Failed to initialize donation record');
    }
  };

  // Submit payment receipt link for verification (primary flow)
  const handleSubmitReceiptVerification = async (submittedUrl?: string) => {
    if (!createdDonation) return;
    const targetUrl = (submittedUrl || receiptUrl || '').trim();
    if (!targetUrl) {
      setFlowError('Please paste your payment receipt link to continue.');
      return;
    }
    setFlowError(null);
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
      if (onDonationRecorded) {
        onDonationRecorded(updated);
      }
    } catch (err: any) {
      setFlowError(err.message || 'Failed to verify and record payment receipt');
    }
  };

  const handleClose = () => {
    setFlowError(null);
    resetWizard();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-3xl border-4 border-[#1E4D38] dark:border-[#52B788] bg-[#F2ECE1] dark:bg-[#080706] rounded-[1px] shadow-2xl relative my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-[#FFFDF9] dark:bg-[#12100E] border-b-2 border-[#1E4D38]/30 dark:border-[#52B788]/30 flex items-center justify-between shrink-0">
          <div>
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#1E4D38] dark:text-[#52B788] block">
              SUPPORT THIS CAUSE • № {campaign.serialCode || 'LW-0421'}
            </span>
            <h3 className="font-serif font-black text-lg sm:text-xl text-[#14110E] dark:text-[#FFFFFF] line-clamp-1">
              {campaign.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Phase Progress Ribbon */}
        {step < 6 && (
          <div className="px-4 py-2.5 bg-[#FFFDF9] dark:bg-[#12100E] border-b border-[#26211C]/15 dark:border-[#9A7432]/25 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1 font-mono text-[10px] min-w-[550px]">
              {[
                { s: 1, label: '1. AMOUNT' },
                { s: 2, label: '2. DONOR INFO' },
                { s: 3, label: '3. BANK' },
                { s: 4, label: '4. ACCOUNT' },
                { s: 5, label: '5. RECEIPT LINK' },
                { s: 6, label: '6. CONFIRMED' },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`flex-1 py-1.5 px-2 text-center font-bold uppercase transition-colors rounded-[1px] ${
                    step === item.s
                      ? 'bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706]'
                      : step > item.s
                      ? 'bg-[#1E4D38]/15 text-[#1E4D38] dark:text-[#52B788]'
                      : 'bg-zinc-200/50 dark:bg-zinc-800/40 text-zinc-400'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-[#FFFDF9] dark:bg-[#12100E]">
          {flowError && (
            <div role="alert" className="mb-4 p-3 rounded-[1px] border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{flowError}</span>
            </div>
          )}
          {/* STEP 1: CHOOSE AMOUNT */}
          {step === 1 && (
            <div className="space-y-6">
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

          {/* STEP 2: DONOR INFO & ANONYMOUS */}
          {step === 2 && (
            <div className="space-y-6">
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
            <div className="space-y-6">
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
                    <span>INITIALIZING ESCROW...</span>
                  ) : (
                    <>
                      <span>SEE ACCOUNT DETAILS &amp; PAY</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BANK ACCOUNT & TRANSFER INSTRUCTIONS */}
          {step === 4 && (
            <BankAccountDetails
              bank={selectedBank}
              amount={amount}
              donorName={isAnonymous ? 'Anonymous Patron' : (donorName || 'Anonymous Patron')}
              onProceedToReference={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {/* STEP 5: PAYMENT RECEIPT LINK VERIFICATION */}
          {step === 5 && (
            <PaymentReferenceForm
              bank={selectedBank}
              amount={amount}
              donorName={isAnonymous ? 'Anonymous Patron' : (donorName || 'Anonymous Patron')}
              receiptUrl={receiptUrl}
              reference={reference}
              proofUrl={proofUrl}
              isSubmitting={submitReceiptMutation.isPending}
              onChangeReceiptUrl={setReceiptUrl}
              onChangeReference={setReference}
              onChangeProofUrl={setProofUrl}
              onSubmit={handleSubmitReceiptVerification}
              onBack={() => setStep(4)}
            />
          )}

          {/* STEP 6: CONFIRMATION & RECEIPT */}
          {step === 6 && createdDonation && (
            <DonationConfirmation
              donation={createdDonation}
              onExploreMore={handleClose}
              onViewContributions={() => {
                handleClose();
                if (onViewContributions) {
                  onViewContributions();
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
