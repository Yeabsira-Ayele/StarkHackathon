import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { Campaign } from '../../types/index.ts';
import { ShieldCheck, Mic, AlertCircle } from 'lucide-react';

export interface VoiceDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationData: {
    matchedCampaignId?: string;
    matchedCampaignTitle?: string;
    amount: number;
    donorName?: string;
    message?: string;
  } | null;
  campaigns: Campaign[];
  onConfirmDonation: (payload: {
    campaignId: string;
    amount: number;
    donorName: string;
    message: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const VoiceDonationModal: React.FC<VoiceDonationModalProps> = ({
  isOpen,
  onClose,
  donationData,
  campaigns,
  onConfirmDonation,
  isLoading = false,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [amount, setAmount] = useState<number>(500);
  const [donorName, setDonorName] = useState('Anonymous');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (donationData) {
      if (donationData.matchedCampaignId) {
        setSelectedCampaignId(donationData.matchedCampaignId);
      } else if (campaigns.length > 0) {
        setSelectedCampaignId(campaigns[0].id);
      }

      setAmount(donationData.amount || 500);
      setDonorName(donationData.donorName || 'Anonymous');
      setMessage(donationData.message || '');
      setError(null);
    }
  }, [donationData, campaigns]);

  if (!donationData) return null;

  const matchedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const campaignOptions = campaigns.map((c) => ({
    value: c.id,
    label: `${c.title.slice(0, 48)}... (${c.category})`,
  }));

  const handleAuthorize = async () => {
    if (!selectedCampaignId) {
      setError('Please select a verified campaign for this donation.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Donation amount must be greater than 0 ETB.');
      return;
    }
    setError(null);

    await onConfirmDonation({
      campaignId: selectedCampaignId,
      amount: Number(amount),
      donorName: donorName || 'Anonymous',
      message: message || '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-accent rounded-lg">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">
              Prepare Donation
            </h3>
            <span className="text-xs text-zinc-500 font-normal">
              Review the campaign and amount. You will provide payment and receipt details next.
            </span>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleAuthorize}
            isLoading={isLoading}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Continue to payment details
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-border p-3 rounded-xl flex items-center gap-2 text-xs text-error">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-border rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">
              Campaign:
            </label>
            <Select
              options={campaignOptions}
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <Input
                label="Amount (ETB)"
                type="number"
                min={1}
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                suffix="ETB"
              />
            </div>
            <div>
              <Input
                label="Donor Name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Anonymous"
              />
            </div>
          </div>

          <div>
            <Input
              label="Note / Message (Optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Words of encouragement..."
            />
          </div>
        </div>

        {matchedCampaign && (
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Recipient:</span>
              <span className="font-semibold text-primary line-clamp-1 max-w-[220px]">
                {matchedCampaign.title}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Rail:</span>
              <span className="font-semibold text-accent">Links.et verified</span>
            </div>
            <div className="flex justify-between text-base font-bold text-primary pt-1.5 border-t border-indigo-200/60 dark:border-indigo-900/50">
              <span>Total Contribution:</span>
              <span className="tabular-nums text-accent">
                {Number(amount).toLocaleString()} ETB
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
