import type { CampaignPayoutAccount } from '../types/donation.types';

interface BankSelectorProps {
  accounts: CampaignPayoutAccount[];
  selectedBankId: string;
  onSelect: (bankId: string) => void;
}

export default function BankSelector({ accounts, selectedBankId, onSelect }: BankSelectorProps) {
  return (
    <div className="grid gap-3">
      {accounts.map((account) => (
        <button
          key={account.bankId}
          type="button"
          onClick={() => onSelect(account.bankId)}
          aria-pressed={selectedBankId === account.bankId}
          className={`rounded-xl border p-4 text-left transition ${
            selectedBankId === account.bankId
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <span className="block font-semibold">{account.bankName}</span>
          <span className="text-sm text-muted-foreground">{account.accountName}</span>
        </button>
      ))}
    </div>
  );
}
