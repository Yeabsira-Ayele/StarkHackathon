import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Filter,
  DollarSign,
  Heart,
  TrendingUp,
  Share2,
  Printer,
  Eye,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useMyContributions, useConfirmDonation } from '../hooks/useDonations';
import { Loading } from '../../../components/ui/Loading';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ErrorState';
import { Donation, DonationStatus, ContributionCertificate } from '../types/donation.types';
import { toGeezNumber } from '../api/donation.api';
import { DonationDetailsModal } from '../components/DonationDetailsModal';

type StatusFilterValue = 'all' | DonationStatus;

interface PatronVaultPageProps {
  onSelectCertificate?: (cert: ContributionCertificate) => void;
  onExploreCauses: () => void;
}

export const PatronVaultPage: React.FC<PatronVaultPageProps> = ({
  onSelectCertificate,
  onExploreCauses,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useMyContributions();
  const confirmDonationMutation = useConfirmDonation();

  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isError) {
    return (
      <ErrorState
        title="Donation history is unavailable"
        message={error instanceof Error ? error.message : 'Could not load your contribution history.'}
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLoading) {
    return <Loading message="Opening your secure patron contribution ledger..." />;
  }

  if (!data) {
    return (
      <ErrorState
        title="Donation history is unavailable"
        message="Could not load your contribution history."
        onRetry={() => void refetch()}
      />
    );
  }

  const donations = data.donations;
  const stats = data.stats;

  const filteredDonations = donations.filter((d) => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  /**
   * Admin fallback: manually confirm a donation when Links.et verification
   * fails or is inconclusive. This is NOT the default path — it's for edge cases only.
   */
  const handleSimulateVerify = async (id: string) => {
    setActionError(null);
    try {
      const updated = await confirmDonationMutation.mutateAsync(id);
      setSelectedDonation(updated);
    } catch (err: any) {
      setActionError(err.message || 'Verification failed');
    }
  };

  const getStatusBadge = (donation: Donation) => {
    switch (donation.status) {
      case 'confirmed':
        return (
          <>
            <CheckCircle2 className="w-3 h-3" />
            <span>CONFIRMED</span>
          </>
        );
      case 'verifying':
        return (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>VERIFYING</span>
          </>
        );
      case 'failed':
        return (
          <>
            <AlertTriangle className="w-3 h-3" />
            <span>VERIFICATION FAILED</span>
          </>
        );
      case 'pending':
      default:
        return (
          <>
            <Clock className="w-3 h-3" />
            <span>AWAITING RECEIPT</span>
          </>
        );
    }
  };

  const getStatusBadgeColor = (status: DonationStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788]';
      case 'verifying':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'failed':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'pending':
      default:
        return 'bg-[#9A7432]/10 text-[#9A7432]';
    }
  };

  const getFilterCount = (status: StatusFilterValue): number => {
    if (status === 'all') return donations.length;
    if (status === 'confirmed') return stats.confirmedCount;
    if (status === 'pending') return stats.pendingCount;
    if (status === 'verifying') return stats.verifyingCount;
    if (status === 'failed') return stats.failedCount;
    return 0;
  };

  const filterTabs: { value: StatusFilterValue; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'confirmed', label: 'CONFIRMED' },
    { value: 'pending', label: 'PENDING' },
    { value: 'verifying', label: 'VERIFYING' },
    { value: 'failed', label: 'FAILED' },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {actionError && (
        <div role="alert" className="p-3 border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 font-mono text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Top Return Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-3.5 py-2 border border-[#26211C]/40 dark:border-[#9A7432]/50 bg-[#FFFDF9] dark:bg-[#12100E] font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:border-[#1E4D38] hover:text-[#1E4D38] dark:hover:border-[#52B788] dark:hover:text-[#52B788] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('nav.backToHome', 'Back to Home')}</span>
          </button>
          <button
            type="button"
            onClick={onExploreCauses}
            className="px-3.5 py-2 border border-[#26211C]/30 dark:border-[#9A7432]/40 bg-transparent font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:border-[#1E4D38] hover:text-[#1E4D38] dark:hover:border-[#52B788] dark:hover:text-[#52B788] transition-colors cursor-pointer"
          >
            <span>{t('nav.backToExplore', 'Back to Explore')}</span>
          </button>
        </div>
      </div>

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
        <div>
          <span className="px-2.5 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-[9px] font-black uppercase tracking-widest shadow-xs">
            PATRON CITIZEN VAULT
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#14110E] dark:text-[#FFFFFF] mt-1.5">
            {t('nav.myContributions', 'My Contributions')}
          </h2>
          <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
            Audited record of your verified contributions, payment receipts, and commemorative certificates.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreCauses}
          className="py-2.5 px-5 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black uppercase cursor-pointer hover:bg-[#163E2C] shadow-xs"
        >
          + {t('campaigns.underwrite', 'Underwrite New Cause')}
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-center">
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">
            {stats.totalAmount.toLocaleString()} ETB
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">TOTAL CONTRIBUTED</span>
        </div>

        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#14110E] dark:text-[#FFFFFF]">
            {stats.causesSupportedCount}
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">CAUSES SUPPORTED</span>
        </div>

        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">
            {stats.largestDonation.toLocaleString()} ETB
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">LARGEST CONTRIBUTION</span>
        </div>

        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {stats.confirmedCount} ✓
            </span>
            {stats.pendingCount > 0 && (
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                ({stats.pendingCount} Pending)
              </span>
            )}
            {stats.failedCount > 0 && (
              <span className="text-sm font-black text-red-500 dark:text-red-400">
                ({stats.failedCount} Failed)
              </span>
            )}
          </div>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">VERIFICATION STATUS</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <span className="text-zinc-500 uppercase font-bold mr-1">FILTER:</span>
          {filterTabs.map((tab) => {
            const count = getFilterCount(tab.value);
            // Don't show filter tabs that have 0 items (except "all")
            if (count === 0 && tab.value !== 'all') return null;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 font-bold uppercase rounded-[1px] cursor-pointer transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706]'
                    : 'bg-[#FFFDF9] dark:bg-[#181512] border border-[#26211C]/20 text-zinc-600 dark:text-zinc-300 hover:bg-[#F2ECE1]'
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline-block">
          Showing {filteredDonations.length} records
        </span>
      </div>

      {/* Donations List */}
      {filteredDonations.length === 0 ? (
        <EmptyState
          title="No Contributions Found"
          description={
            statusFilter === 'all'
              ? 'You have not recorded any contributions yet. Explore verified causes to make your first contribution.'
              : `No ${statusFilter} contributions at the moment.`
          }
          onReset={onExploreCauses}
          actionText={t('common.explore', 'Explore Causes')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {filteredDonations.map((donation) => {
            return (
              <div
                key={donation.id}
                onClick={() => setSelectedDonation(donation)}
                className="p-6 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-4 transition-all hover:border-[#1E4D38] dark:hover:border-[#52B788] cursor-pointer shadow-sm rounded-[1px] relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-xs font-bold border-b border-[#26211C]/15 dark:border-[#9A7432]/25 pb-2">
                    <span className="text-[#1E4D38] dark:text-[#52B788] font-black">
                      #{donation.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-[1px] flex items-center gap-1 ${getStatusBadgeColor(donation.status)}`}
                    >
                      {getStatusBadge(donation)}
                    </span>
                  </div>

                  {/* Title & Beneficiary */}
                  <div className="mt-3 space-y-1">
                    <h4 className="font-serif font-black text-lg text-[#14110E] dark:text-[#FFFFFF] line-clamp-1">
                      {donation.campaignTitle || 'Campaign title unavailable'}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Beneficiary:{' '}
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {donation.beneficiaryName || 'Beneficiary unavailable'}
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Bank: {donation.bankName || 'Unavailable'} • Ref:{' '}
                      <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
                        {donation.reference || 'Pending'}
                      </span>
                    </p>
                    {/* Show failure reason snippet on card */}
                    {donation.status === 'failed' && donation.verification?.failureReason && (
                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 line-clamp-1">
                        ⚠ {donation.verification.failureReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Financial Figure & Action */}
                <div className="pt-3 border-t border-[#26211C]/10 dark:border-[#9A7432]/20 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-[#1E4D38] dark:text-[#52B788]">
                      {donation.amount.toLocaleString()} ETB
                    </span>
                    <span className="text-xs font-ethiopic text-zinc-500 ml-2">
                      ({toGeezNumber(donation.amount)} ብር)
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#1E4D38] dark:text-[#52B788] flex items-center gap-1">
                    <span>VIEW RECORD DETAILS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Receipt Modal */}
      {selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onSimulateVerify={handleSimulateVerify}
        />
      )}
    </div>
  );
};
