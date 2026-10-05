import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../components/bn.tsx';
import { ArrowRight, AlertCircle, ShieldAlert, Clock } from 'lucide-react';
import { useMyFundraisers } from '../hooks/useMyFundraisers.ts';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { useAuthStore } from '../../auth/store/auth.store.ts';
import { organizationService } from '../../../services/organizationService.ts';
import type { OrganizationVerificationStatus } from '../../../types/index.ts';

const NEEDS = [
  ['fundraiser.start.needs.storyTitle', 'fundraiser.start.needs.storyDescription'],
  ['fundraiser.start.needs.donationsTitle', 'fundraiser.start.needs.donationsDescription'],
  ['fundraiser.start.needs.proofTitle', 'fundraiser.start.needs.proofDescription'],
];

const ACTIVE_INCOMPLETE_STATUSES: FundraiserStatus[] = ['pending', 'changes_requested', 'approved', 'paused'];

export const StartFundraising: React.FC<PageProps> = ({ go }) => {
  const { t } = useTranslation();
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
          {t('fundraiser.start.title')}
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl">
          {t('fundraiser.start.description')}
        </p>
      </div>

      {/* Organization Verification Guard */}
      {isOrgRestricted && (
        <div className="p-4 border-2 border-amber-600/60 bg-[#FAF6EC] dark:bg-[#161411] space-y-2 font-mono">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            {orgStatus === 'pending' ? <Clock className="w-4 h-4 animate-pulse" /> : <ShieldAlert className="w-4 h-4" />}
            <span className="font-serif font-bold text-sm text-[#14110E] dark:text-[#F4EFE6] uppercase">
              {t('fundraiser.start.organizationRequired')}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {t('fundraiser.start.organizationRestriction', {
              name: orgName,
              status: t(
                orgStatus === 'pending'
                  ? 'fundraiser.start.organizationStatus.pending'
                  : orgStatus === 'needs_changes'
                  ? 'fundraiser.start.organizationStatus.needsChanges'
                  : 'fundraiser.start.organizationStatus.notApproved'
              ),
            })}
          </p>
        </div>
      )}

      {/* Active Fundraiser Rule (Phase 2 constraint) */}
      {!isOrgRestricted && activeFundraiser && (
        <div className="p-4 border-2 border-[#9A7432]/50 bg-[#FAF6EC] dark:bg-[#161411] space-y-2">
          <div className="flex items-center gap-2 text-[#9A7432]">
            <AlertCircle className="w-4 h-4" />
            <span className="font-serif font-bold text-sm text-[#14110E] dark:text-[#F4EFE6]">
              {t('fundraiser.start.activeTitle')}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {t('fundraiser.start.activeDescription', { title: activeFundraiser.title })}
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => go({ name: 'manage', id: activeFundraiser.id })}>
              {t('fundraiser.start.manageActive')}
            </Button>
          </div>
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6] mb-3">
          {t('fundraiser.start.readyTitle')}
        </h2>
        <ul className="space-y-3">
          {NEEDS.map(([titleKey, descriptionKey]) => (
            <li key={titleKey}>
              <p className="text-sm font-semibold text-[#14110E] dark:text-[#F4EFE6]">{t(titleKey)}</p>
              <p className="text-xs text-zinc-500">{t(descriptionKey)}</p>
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
            ? t('fundraiser.start.locked')
            : activeFundraiser
            ? t('fundraiser.start.createDraft')
            : t('fundraiser.start.startButton')}
        </Button>
        {drafts > 0 && !isOrgRestricted && (
          <Button size="lg" variant="outline" onClick={() => go({ name: 'drafts' })}>
            {t('fundraiser.start.continueDraft', { count: drafts })}
          </Button>
        )}
      </div>
    </div>
  );
};
