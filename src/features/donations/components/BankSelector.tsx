import type { CampaignPayoutAccount } from '../types/donation.types';

interface BankSelectorProps {
  accounts: CampaignPayoutAccount[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
}

export default function BankSelector({ accounts, selectedAccountId, onSelect }: BankSelectorProps) {
  return (
    <div className="grid gap-3">
      {accounts.map((account) => (
        <button
          key={account.accountId}
          type="button"
          onClick={() => onSelect(account.accountId)}
          aria-pressed={selectedAccountId === account.accountId}
          className={`rounded-xl border p-4 text-left transition ${
            selectedAccountId === account.accountId
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <span className="block font-semibold">{account.bankName}</span>
          <span className="text-sm text-muted-foreground">{account.accountName}</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            Account {account.accountNumber}
          </span>
        </button>
      ))}
    </div>
  );
}
