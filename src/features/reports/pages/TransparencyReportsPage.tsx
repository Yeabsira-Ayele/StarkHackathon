import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, FileSpreadsheet, Download } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { ImpactSummaryCard } from '../components/ImpactSummaryCard';
import { FinancialBreakdownChart } from '../components/FinancialBreakdownChart';
import { TransparencyAuditTable } from '../components/TransparencyAuditTable';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface TransparencyReportsPageProps {
  onSelectRecord?: (recordId: string) => void;
}

export const TransparencyReportsPage: React.FC<TransparencyReportsPageProps> = ({
  onSelectRecord,
}) => {
  const { t } = useTranslation();
  const { overview, isLoading, error, refetch, selectedSector, setSelectedSector, setSelectedRecord } = useReports();

  const filteredRecords = overview
    ? selectedSector
      ? overview.auditRecords.filter((r) => r.campaignTitle.toLowerCase().includes(selectedSector))
      : overview.auditRecords
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              100% የህዝብ ግልጽነትና ኦዲት (Public Escrow Transparency)
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
            የፋይናንስና የማኅበራዊ ተጽዕኖ ሪፖርት
          </h1>
          <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1">
            በለወገን መድረክ በህዝብ የተሰበሰበ እና ለተጠቃሚዎች የተላለፈ የገንዘብ ዝውውር መዝገብ
          </p>
        </div>
      </div>

      {isLoading && (
        <p role="status" className="font-mono text-xs text-zinc-500">
          የግልጽነትና ኦዲት መረጃዎችን በመጫን ላይ...
        </p>
      )}
      {error && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Transparency reports are unavailable.'}
          onRetry={() => void refetch()}
        />
      )}

      {overview && (
        <>
          {/* Top Metrics Cards */}
          <ImpactSummaryCard overview={overview} />

          {/* Sector Breakdown Chart */}
          <FinancialBreakdownChart
            breakdowns={overview.sectorBreakdowns}
            selectedSector={selectedSector}
            onSelectSector={(s) => setSelectedSector(selectedSector === s ? null : s)}
          />
        </>
      )}

      {/* Audit Table */}
      {overview && filteredRecords.length > 0 ? (
        <TransparencyAuditTable
          records={filteredRecords}
          onSelectRecord={(rec) => {
            setSelectedRecord(rec);
            onSelectRecord?.(rec.id);
          }}
        />
      ) : overview ? (
        <EmptyState
          title={selectedSector ? 'ለተመረጠው ዘርፍ የኦዲት መዝገብ አልተገኘም' : 'ምንም የኦዲት መዝገብ የለም'}
          description={selectedSector ? undefined : 'የኦዲት መዝገቦች ሲገኙ እዚህ ይታያሉ።'}
          actionLabel={selectedSector ? 'ማጣሪያዎችን ዳግም አስጀምር' : undefined}
          onAction={selectedSector ? () => setSelectedSector(null) : undefined}
        />
      ) : !isLoading && !error ? (
        <EmptyState
          title="የኦዲት መዝገቦች የሉም"
          description="የግልጽነት መረጃ ሲገኝ እዚህ ይታያል።"
        />
      ) : null}
    </div>
  );
};

export default TransparencyReportsPage;
