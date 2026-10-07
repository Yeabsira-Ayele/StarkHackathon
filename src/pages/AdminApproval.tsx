import React, { useState } from 'react';
import { APP_NAME } from '../data/content.ts';
import { Campaign } from '../types/index.ts';
import { Button } from '../components/ui/Button.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Shield, CheckCircle, XCircle, ArrowLeft, RefreshCw, Eye, ShieldCheck } from 'lucide-react';

export interface AdminApprovalProps {
  pendingCampaigns: Campaign[];
  allCampaigns: Campaign[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onBack: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
  onRefresh: () => void;
}

export const AdminApproval: React.FC<AdminApprovalProps> = ({
  pendingCampaigns,
  allCampaigns,
  onApprove,
  onReject,
  onBack,
  onSelectCampaign,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const displayedCampaigns = activeTab === 'pending' ? pendingCampaigns : allCampaigns;

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      if (action === 'approve') {
        await onApprove(id);
      } else {
        await onReject(id);
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to campaigns</span>
        </button>
      </div>

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent text-white rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Campaign Moderation Console
            </h1>
          </div>
          <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
            Review fundraisers to verify legitimacy and maintain trust for the {APP_NAME} community.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh List
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'border-accent text-accent'
              : 'border-transparent text-zinc-500 hover:text-primary'
          }`}
        >
          Pending Review ({pendingCampaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-accent text-accent'
              : 'border-transparent text-zinc-500 hover:text-primary'
          }`}
        >
          All Campaigns ({allCampaigns.length})
        </button>
      </div>

      {/* Table of campaigns */}
      {displayedCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border p-8">
          <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-primary">
            {activeTab === 'pending' ? 'No pending campaigns' : 'No campaigns registered'}
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'All submitted campaigns have been audited and approved.'
              : 'Create a campaign to see it listed here.'}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Goal (ETB)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedCampaigns.map((camp) => (
              <TableRow key={camp.id}>
                <TableCell className="max-w-md">
                  <div className="font-semibold text-primary text-xs">{camp.title}</div>
                  <div className="text-zinc-500 text-[11px] line-clamp-1 mt-0.5">{camp.story}</div>
                </TableCell>
                <TableCell>
                  <span className="text-xs capitalize text-zinc-600 dark:text-zinc-400 font-medium">
                    {camp.category}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {camp.goalAmount.toLocaleString()} ETB
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      camp.status === 'approved'
                        ? 'success'
                        : camp.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {camp.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {camp.creatorName}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectCampaign(camp)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>
                    {camp.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleAction(camp.id, 'approve')}
                        isLoading={processingId === camp.id}
                        icon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Approve
                      </Button>
                    )}
                    {camp.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleAction(camp.id, 'reject')}
                        isLoading={processingId === camp.id}
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
