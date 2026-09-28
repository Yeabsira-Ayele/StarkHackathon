import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { usePatronCertificates } from '../hooks/useDonations';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ContributionCertificate } from '../types/donation.types';

interface PatronVaultPageProps {
  onSelectCertificate: (cert: ContributionCertificate) => void;
  onExploreCauses: () => void;
}

export const PatronVaultPage: React.FC<PatronVaultPageProps> = ({
  onSelectCertificate,
  onExploreCauses,
}) => {
  const { t } = useTranslation();
  const { data: certificates, isLoading } = usePatronCertificates();

  const totalUnderwritten = (certificates || []).reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
        <div>
          <span className="px-2.5 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-[9px] font-black uppercase tracking-widest shadow-xs">
            PATRON VAULT
          </span>
          <h2 className="font-serif font-black text-3xl text-[#14110E] dark:text-[#FFFFFF] mt-1.5">
            {t('nav.myContributions')}
          </h2>
          <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
            Immutable archive of your minted digital banknote certificates and verified field outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreCauses}
          className="py-2.5 px-5 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black uppercase cursor-pointer hover:bg-[#163E2C]"
        >
          + {t('campaigns.underwrite')}
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-center">
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">
            {totalUnderwritten.toLocaleString()} {t('common.currency')}
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">TOTAL UNDERWRITTEN</span>
        </div>
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#14110E] dark:text-[#FFFFFF]">
            {(certificates || []).length}
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">MINTED CERTIFICATES</span>
        </div>
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">100%</span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">{t('common.directEscrow')}</span>
        </div>
      </div>

      {/* Certificate List */}
      {isLoading ? (
        <Loading message="Opening your secure patron certificate vault..." />
      ) : !certificates || certificates.length === 0 ? (
        <EmptyState
          title="No Certificates Minted Yet"
          description="Contribute to any active cause to receive your signed, immutable digital Birr certificate."
          onReset={onExploreCauses}
          actionText={t('common.explore')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId}
              onClick={() => onSelectCertificate(cert)}
              className="p-6 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-4 font-mono transition-all hover:border-[#1E4D38] dark:hover:border-[#52B788] cursor-pointer shadow-sm rounded-[1px]"
            >
              <div className="flex items-center justify-between text-xs font-bold border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-2">
                <span className="text-[#1E4D38] dark:text-[#52B788] font-black">
                  № {cert.certificateId}
                </span>
                <span className="px-2 py-0.5 bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788] text-[9px] uppercase font-bold">
                  {cert.paymentRail} ESCROW
                </span>
              </div>

              <div>
                <h4 className="font-serif font-black text-lg text-[#14110E] dark:text-[#FFFFFF] line-clamp-1">
                  {cert.campaignTitle}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Issued to: <span className="font-bold text-zinc-700 dark:text-zinc-300">{cert.donorName}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#26211C]/10 dark:border-[#9A7432]/20">
                <div>
                  <span className="text-xl font-black text-[#1E4D38] dark:text-[#52B788]">
                    {cert.amount.toLocaleString()} ETB
                  </span>
                  {cert.amountGeEz && (
                    <span className="text-xs font-ethiopic text-zinc-500 ml-2">
                      ({cert.amountGeEz})
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-[#1E4D38] dark:text-[#52B788] flex items-center gap-1">
                  <span>VIEW CERTIFICATE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
