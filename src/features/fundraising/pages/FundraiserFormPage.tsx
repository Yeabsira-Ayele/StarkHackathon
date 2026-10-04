import React, { useEffect, useState } from 'react';
import { FundraiserForm } from '../components/FundraiserForm.tsx';
import { emptyValues } from '../schemas/fundraiser.schema.ts';
import { fundraisingApi } from '../api/fundraising.api.ts';
import type { PageProps } from '../FundraisingApp.tsx';
import { useAuthStore } from '../../auth/store/auth.store.ts';
import { organizationService } from '../../../services/organizationService.ts';
import { Clock, ShieldAlert } from 'lucide-react';
import { Button } from '../components/bn.tsx';

export const FundraiserFormPage: React.FC<PageProps> = ({ go, toast }) => {
  const user = useAuthStore((state) => state.user);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');

  useEffect(() => {
    if (user?.role === 'foundation') {
      organizationService.list().then((orgs) => {
        const myOrg = orgs.find(
          (o) =>
            o.id === user.organizationId ||
            (user.email && o.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
            o.userId === user.id
        );
        if (myOrg && myOrg.verificationStatus !== 'approved') {
          setIsBlocked(true);
          setBlockReason(
            `Your organization (${myOrg.name}) is currently ${
              myOrg.verificationStatus === 'pending'
                ? 'pending verification'
                : myOrg.verificationStatus
            }. Organizations must be approved by an administrator before publishing causes.`
          );
        }
      });
    }
  }, [user]);

  if (isBlocked) {
    return (
      <div className="space-y-6 font-mono">
        <div className="p-6 border-2 border-amber-600/60 bg-[#FAF6EC] dark:bg-[#161411] space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
            <h2 className="font-serif font-black text-lg text-[#14110E] dark:text-[#F4EFE6] uppercase">
              Fundraiser Creation Restricted
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {blockReason}
          </p>
          <div className="pt-2">
            <Button size="sm" onClick={() => go({ name: 'start' })}>
              Return to Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-serif font-black uppercase text-[#14110E] dark:text-[#F4EFE6]">
        Create your fundraiser
      </h1>
      <FundraiserForm
        initial={emptyValues}
        onBack={() => go({ name: 'start' })}
        onSaveDraft={async (values) => {
          await fundraisingApi.save(values);
          toast('Draft saved.');
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
