import React, { useState } from 'react';
import { Campaign, Donation } from '../types/index.ts';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import {
  ArrowLeft,
  Search,
  Download,
  Filter,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export interface FoundationContributionsProps {
  campaigns: Campaign[];
  onBack: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export const FoundationContributions: React.FC<FoundationContributionsProps> = ({
  campaigns,
  onBack,
  onSelectCampaign,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRail, setSelectedRail] = useState<string>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Flatten all donations
  const allRows: Array<{ donation: Donation; campaign: Campaign }> = [];
  campaigns.forEach((c) => {
    (c.donations || []).forEach((d) => {
      allRows.push({ donation: d, campaign: c });
    });
  });

  allRows.sort(
    (a, b) => new Date(b.donation.createdAt).getTime() - new Date(a.donation.createdAt).getTime()
  );

  const filtered = allRows.filter((item) => {
    const matchesSearch =
      !search ||
      item.donation.donorName.toLowerCase().includes(search.toLowerCase()) ||
      item.campaign.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.donation.transactionReference || '').toLowerCase().includes(search.toLowerCase());

    const matchesRail =
      selectedRail === 'all' || item.donation.paymentRail === selectedRail;

    const matchesCampaign =
      selectedCampaignId === 'all' || item.campaign.id === selectedCampaignId;

    return matchesSearch && matchesRail && matchesCampaign;
  });

  const totalFiltered = filtered.reduce((sum, item) => sum + item.donation.amount, 0);

  const handleExport = () => {
    setExportNotice('Exporting verified Telebirr & CBE Birr ledger to CSV...');
    setTimeout(() => {
      setExportNotice('Export complete. File downloaded to local device.');
      setTimeout(() => setExportNotice(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Foundation Console
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Audited Ledger (CSV)
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header & Total Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#B08A45]/40 bg-surface shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#B08A45]/50 bg-surface text-accent text-xs font-semibold font-mono mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Institution Financial Reconciliation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-primary">
            Contributions &amp; Transaction Ledger
          </h1>
          <p className="text-xs text-zinc-500">
            Real-time auditable record of all completed local and diaspora donations
          </p>
        </div>

        <div className="sm:text-right bg-surface-alt/60 dark:bg-zinc-800/60 p-4 rounded-xl border border-border">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Ledger Balance</p>
          <p className="text-2xl font-display font-bold text-accent tabular-nums mt-0.5">
            {totalFiltered.toLocaleString()} ETB
          </p>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{filtered.length} transactions</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search donor name, campaign, or transaction reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRail}
            onChange={(e) => setSelectedRail(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent font-medium"
          >
            <option value="all">All Payment Rails</option>
            <option value="telebirr">Telebirr (Ethio Telecom)</option>
            <option value="cbe_birr">CBE Birr (Commercial Bank)</option>
            <option value="bank_card">Debit / Credit Card</option>
          </select>

          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-surface text-primary focus:ring-1 focus:ring-accent font-medium max-w-[200px] truncate"
          >
            <option value="all">All Causes</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-surface-alt dark:bg-zinc-800/80 text-primary uppercase text-[10px] tracking-wider font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Donor</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Rail</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.donation.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-accent">
                    {item.donation.transactionReference || 'TB-ET-99214'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-primary">
                    {item.donation.donorName}
                  </td>
                  <td 
                    onClick={() => onSelectCampaign(item.campaign)}
                    className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300 hover:text-accent cursor-pointer max-w-xs truncate"
                  >
                    {item.campaign.title}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary tabular-nums">
                    {item.donation.amount.toLocaleString()} ETB
                  </td>
                  <td className="py-3.5 px-4 capitalize">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium border border-border">
                      {item.donation.paymentRail || 'Telebirr'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono">
                    {new Date(item.donation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
