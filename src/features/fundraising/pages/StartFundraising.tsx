import React, { useEffect, useState } from 'react';
import { Button, Card } from '../components/bn.tsx';
import { ArrowRight, AlertCircle, ShieldAlert, Clock } from 'lucide-react';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { useAuthStore } from '../../auth/store/auth.store.ts';
import { organizationService } from '../../../services/organizationService.ts';
import type { OrganizationVerificationStatus } from '../../../types/index.ts';

const NEEDS = [
  ['Your story and a goal', 'Who needs help, how much, and by when.'],
  ['Where donations go', 'A bank account in the name of the person or group receiving the money.'],
  ['Proof', 'A supporting letter or document so the team can verify your fundraiser.'],
];

const ACTIVE_INCOMPLETE_STATUSES: FundraiserStatus[] = ['pending', 'changes_requested', 'approved', 'paused'];

export const StartFundraising: React.FC<PageProps> = ({ go }) => {
  const { data } = useMyFundraisers();
  const drafts = data.filter((f) => f.status === 'draft').length;
  const activeFundraiser = data.find((f) => ACTIVE_INCOMPLETE_STATUSES.includes(f.status));

  const user = useAuthStore((state) => state.user);
  const [orgStatus, setOrgStatus] = useState<OrganizationVerificationStatus | null>(null);
  const [orgName, setOrgName] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'foundation') {
      organizationService.list().then((orgs) => {
        const myOrg = orgs.find(
          (o) =>
            o.id === user.organizationId ||
            (user.email && o.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
            o.userId === user.id
        );
        if (myOrg) {
          setOrgStatus(myOrg.verificationStatus);
          setOrgName(myOrg.name);
        } else {
          setOrgStatus('pending');
          setOrgName(user.organizationName || 'Organization');
        }
      });
    }
  }, [user]);

  const isOrgRestricted = user?.role === 'foundation' && orgStatus && orgStatus !== 'approved';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
          Start a fundraiser
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl">
          Tell your story and raise support from people who want to help. We review every fundraiser before it goes live.
        </p>
      </div>

      {/* Organization Verification Guard */}
      {isOrgRestricted && (
        <div className="p-4 border-2 border-amber-600/60 bg-[#FAF6EC] dark:bg-[#161411] space-y-2 font-mono">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            {orgStatus === 'pending' ? <Clock className="w-4 h-4 animate-pulse" /> : <ShieldAlert className="w-4 h-4" />}
            <span className="font-serif font-bold text-sm text-[#14110E] dark:text-[#F4EFE6] uppercase">
              Organization Verification Required
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Your organization (&ldquo;{orgName}&rdquo;) is currently{' '}
            <span className="font-bold underline uppercase">
              {orgStatus === 'pending'
                ? 'pending administrative review'
                : orgStatus === 'needs_changes'
                ? 'awaiting requested changes'
                : 'not approved'}
            </span>
            . Under platform governance, organizations cannot launch fundraisers or collect donor contributions until verified by an administrator.
          </p>
        </div>
      )}

      {/* Active Fundraiser Rule (Phase 2 constraint) */}
      {!isOrgRestricted && activeFundraiser && (
        <div className="p-4 border-2 border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] space-y-2">
          <div className="flex items-center gap-2 text-[#9A7432]">
            <AlertCircle className="w-4 h-4" />
            <span className="font-serif font-bold text-sm text-[#14110E] dark:text-[#F4EFE6]">
              Active fundraiser in progress
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            You currently have an active fundraiser (&ldquo;{activeFundraiser.title}&rdquo;). Lewegene policy permits only one active or incomplete fundraiser at a time.
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => go({ name: 'manage', id: activeFundraiser.id })}>
              Manage active fundraiser
            </Button>
          </div>
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6] mb-3">Have these ready</h2>
        <ul className="space-y-3">
          {NEEDS.map(([title, text]) => (
            <li key={title}>
              <p className="text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">{title}</p>
              <p className="text-xs text-zinc-500">{text}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          disabled={!!isOrgRestricted}
          onClick={() => {
            if (isOrgRestricted) return;
            go({ name: 'form' });
          }}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          {isOrgRestricted
            ? 'Fundraising locked (Org Pending)'
            : activeFundraiser
            ? 'Create draft fundraiser'
            : 'Start a fundraiser'}
        </Button>
        {drafts > 0 && !isOrgRestricted && (
          <Button size="lg" variant="outline" onClick={() => go({ name: 'drafts' })}>
            Continue a draft ({drafts})
          </Button>
        )}
      </div>
    </div>
  );
};
