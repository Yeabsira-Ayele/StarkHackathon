import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FundraiserForm } from '../components/FundraiserForm.tsx';
import { emptyValues } from '../schemas/fundraiser.schema.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { useAuthStore } from '../../auth/store/auth.store.ts';
import { organizationService } from '../../../services/organizationService.ts';
import { Clock, ShieldAlert } from 'lucide-react';
import { Button } from '../components/bn.tsx';
import { ErrorState } from '../../../components/ErrorState.tsx';
import { Loading } from '../../../components/Loading.tsx';

export const FundraiserFormPage: React.FC<PageProps> = ({ go, toast }) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [blockedOrganization, setBlockedOrganization] = useState<{ name: string; status: string } | null>(null);
  const [isCheckingOrganization, setIsCheckingOrganization] = useState(user?.role === 'foundation');
  const [organizationError, setOrganizationError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (user?.role !== 'foundation') {
      setIsCheckingOrganization(false);
      setBlockedOrganization(null);
      return;
    }

    setIsCheckingOrganization(true);
    setOrganizationError(null);
    organizationService.list().then((orgs) => {
        if (!active) return;
        const myOrg = orgs.find(
          (o) =>
            o.id === user.organizationId ||
            (user.email && o.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
            o.userId === user.id
        );
        if (myOrg && myOrg.verificationStatus !== 'approved') {
          setBlockedOrganization({ name: myOrg.name, status: myOrg.verificationStatus });
        } else {
          setBlockedOrganization(null);
        }
      }).catch((cause: unknown) => {
        if (active) setOrganizationError(cause instanceof Error ? cause : new Error('Could not load organization details.'));
      }).finally(() => {
        if (active) setIsCheckingOrganization(false);
      });
    return () => {
      active = false;
    };
  }, [user, retryKey]);

  if (isCheckingOrganization) {
    return <Loading variant="full" message={t('common.loading', 'Loading organization details…')} />;
  }

  if (organizationError) {
    return (
      <ErrorState
        message={organizationError.message}
        onRetry={() => setRetryKey((key) => key + 1)}
      />
    );
  }

  if (blockedOrganization) {
    const statusKey = blockedOrganization.status === 'pending'
      ? 'fundraiser.form.organizationPending'
      : blockedOrganization.status === 'needs_changes'
      ? 'fundraiser.form.organizationStatus.needsChanges'
      : 'fundraiser.form.organizationStatus.notApproved';

    return (
      <div className="space-y-6 font-mono">
        <div className="p-6 border-2 border-amber-600/60 bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
            <h2 className="font-serif font-black text-lg text-[#14110E] dark:text-[#F4EFE6] uppercase">
              {t('fundraiser.form.restrictedTitle')}
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('fundraiser.form.blockedMessage', {
              name: blockedOrganization.name,
              status: t(statusKey),
            })}
          </p>
          <div className="pt-2">
            <Button size="sm" onClick={() => go({ name: 'start' })}>
              {t('fundraiser.form.returnOverview')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
        {t('fundraiser.form.createTitle')}
      </h1>
      <FundraiserForm
        initial={emptyValues}
        onBack={() => go({ name: 'start' })}
        onSaveDraft={async (values) => {
          await fundraisingApi.save(values);
          toast(t('fundraiser.form.draftSaved'));
          go({ name: 'drafts' });
        }}
        onContinue={async (values) => {
          const saved = await fundraisingApi.save(values);
          go({ name: 'preview', id: saved.id });
        }}
      />
    </div>
  );
};
