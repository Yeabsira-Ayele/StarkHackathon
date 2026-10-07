import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Plus, Users, Wallet, ShieldCheck } from 'lucide-react';
import { useCampaigns } from '../../campaigns/hooks/useCampaigns';
import { Campaign } from '../../campaigns/types/campaign.types';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface FoundationDashboardPageProps {
  onCreateProject: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export const FoundationDashboardPage: React.FC<FoundationDashboardPageProps> = ({
  onCreateProject,
  onSelectCampaign,
}) => {
  const { t } = useTranslation();
  const { campaigns, isLoading, isFetching, isError, error, refetch } = useCampaigns();

  const totalRaisedAll = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonorsAll = campaigns.reduce((acc, c) => acc + (c.donationsCount || 0), 0);
  const hasCampaignData = !isLoading && !isFetching && !isError;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E4D38]/20 dark:border-[#9A7432]/30 pb-4">
        <div>
          <span className="px-2.5 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-[9px] font-black uppercase tracking-widest shadow-xs">
            FOUNDATION DESK
          </span>
          <h2 className="font-serif font-black text-3xl text-[#14110E] dark:text-[#FFFFFF] mt-1.5">
            {t('nav.foundations')}
          </h2>
          <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
            Accredited civil society project management, live transparent escrow ledger & project publishing.
          </p>
        </div>

        {(isLoading || isFetching) && (
          <p role="status" className="font-mono text-xs text-zinc-500">
            {t('common.loading')}
          </p>
        )}
        {isError && (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
          />
        )}

        <button
          type="button"
          onClick={onCreateProject}
          className="py-2.5 px-6 border-2 border-[#1E4D38] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-xs font-black uppercase cursor-pointer hover:bg-[#163E2C] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('common.create')}</span>
        </button>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-center">
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">
            {hasCampaignData ? `${totalRaisedAll.toLocaleString()} ${t('common.currency')}` : '—'}
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">TOTAL DISBURSED ESCROW</span>
        </div>
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#14110E] dark:text-[#FFFFFF]">
            {hasCampaignData ? campaigns.length : '—'}
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">ACTIVE CAUSE PLATES</span>
        </div>
        <div className="p-6 border-2 border-[#26211C]/20 dark:border-[#9A7432]/35 bg-[#FFFDF9] dark:bg-[#12100E] space-y-1 rounded-[1px]">
          <span className="text-3xl font-black text-[#1E4D38] dark:text-[#52B788]">
            {hasCampaignData ? totalDonorsAll : '—'}
          </span>
          <span className="block text-[10px] text-zinc-500 uppercase font-bold">{t('common.patrons')}</span>
        </div>
      </div>

      {/* Projects Table */}
      <div className="p-6 sm:p-8 border-2 border-[#1E4D38]/30 dark:border-[#9A7432]/40 bg-[#FFFDF9] dark:bg-[#12100E] space-y-6 rounded-[1px] shadow-sm">
        <h3 className="font-serif font-black text-xl text-[#14110E] dark:text-[#FFFFFF] border-b border-[#26211C]/15 pb-2">
          Registered Social Causes
        </h3>

        {campaigns.length === 0 ? (
          <EmptyState
            title={t('common.empty')}
            description={t('campaigns.emptyDescription')}
          />
        ) : (
          <div className="space-y-4">
            {campaigns.map((camp) => {
            const pct = camp.goalAmount
              ? Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100))
              : 0;

            return (
              <div
                key={camp.id}
                onClick={() => onSelectCampaign(camp)}
                className="p-4 border-2 border-[#26211C]/20 dark:border-[#9A7432]/30 bg-[#F7F2E7] dark:bg-[#181512] font-mono text-xs flex flex-wrap items-center justify-between gap-4 hover:border-[#1E4D38] cursor-pointer rounded-[1px]"
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#1E4D38] dark:text-[#52B788]">
                      № {camp.serialCode || 'LW-0421'}
                    </span>
                    <span className="px-2 py-0.5 border border-[#26211C]/20 text-[9px] uppercase font-bold">
                      {camp.category}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#14110E] dark:text-[#FFFFFF] truncate">
                    {camp.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500">
                    Coordinator: {camp.creatorName} · {camp.location}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-sm font-black text-[#1E4D38] dark:text-[#52B788] block">
                    {camp.raisedAmount.toLocaleString()} / {camp.goalAmount.toLocaleString()} ETB
                  </span>
                  <div className="w-32 h-2 bg-[#EAE2D3] dark:bg-[#201B16] rounded-[1px] overflow-hidden">
                    <div
                      className="h-full bg-[#1E4D38] dark:bg-[#52B788]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 block">{pct}% of fundraising goal</span>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
