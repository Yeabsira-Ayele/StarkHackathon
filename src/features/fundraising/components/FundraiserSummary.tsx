import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './bn.tsx';
import type { Fundraiser } from '../types/fundraiser.types.ts';
import { useBanks } from '../hooks/useBanks.ts';
import { useOrganizations } from '../hooks/useOrganizations.ts';
import { formatDate, formatEtb } from './format.ts';

const TYPE_LABEL = {
  myself: 'Myself',
  friend_family: 'Friend or family',
  community_org: 'Community or organization',
  other: 'Another person',
} as const;

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b border-[#26211C]/20 dark:border-[#9A7432]/30 last:border-0 text-sm">
    <dt className="text-zinc-500">{label}</dt>
    <dd className="col-span-2 text-[#14110E] dark:text-[#F4EFE6] break-words">{children || '—'}</dd>
  </div>
);

/** Read-only view of a fundraiser. Used by Preview and Management so they never drift apart. */
export const FundraiserSummary: React.FC<{ fundraiser: Fundraiser }> = ({ fundraiser: f }) => {
  const { t } = useTranslation();
  const banks = useBanks().data;
  const orgs = useOrganizations().data;

  return (
    <div className="space-y-4">
      {f.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {f.images.map((src, i) => (
            <img key={i} src={src} alt={`Fundraiser image ${i + 1}`} className="w-full h-28 object-cover  border border-[#26211C]/20 dark:border-[#9A7432]/30" />
          ))}
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-serif font-black uppercase text-xl text-[#14110E] dark:text-[#F4EFE6]">{f.title}</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {t(`categories.${f.category}`)} · {f.location}
        </p>
        <p className="mt-4 text-sm text-[#14110E] dark:text-[#F4EFE6] whitespace-pre-line leading-relaxed">{f.story}</p>
      </Card>

      <Card className="p-5">
        <dl>
          <Row label="Goal">{f.goalAmount ? formatEtb(f.goalAmount) : ''}</Row>
          <Row label="Deadline">{f.deadline ? formatDate(f.deadline) : 'Ongoing (no deadline)'}</Row>
          <Row label="Raised for">{TYPE_LABEL[f.beneficiaryType]}</Row>
          {(f.beneficiaryType === 'friend_family' || f.beneficiaryType === 'other') && (
            <>
              <Row label="Beneficiary">{f.beneficiary.name}</Row>
              <Row label="Phone">{f.beneficiary.phone}</Row>
              <Row label="About them">{f.beneficiary.info}</Row>
            </>
          )}
          {f.beneficiaryType === 'community_org' && (
            <Row label="Organization">{orgs.find((o) => o.id === f.organizationId)?.name || 'Community Initiative'}</Row>
          )}
          {f.beneficiaryType !== 'community_org' && (
            <>
              {f.banks && f.banks.length > 0 ? (
                <Row label="Receiving banks">
                  <ul className="space-y-1.5">
                    {f.banks.map((b, idx) => (
                      <li key={idx} className="text-xs">
                        <span className="font-semibold text-[#1E4D38] dark:text-[#52B788]">
                          {banks.find((item) => item.id === b.bankId)?.name || b.bankId}
                        </span>
                        : {b.accountNumber} ({b.accountName})
                      </li>
                    ))}
                  </ul>
                </Row>
              ) : (
                <>
                  <Row label="Bank">{banks.find((b) => b.id === f.bank?.bankId)?.name || '—'}</Row>
                  <Row label="Account number">{f.bank?.accountNumber || '—'}</Row>
                  <Row label="Account name">{f.bank?.accountName || '—'}</Row>
                </>
              )}
            </>
          )}
          <Row label="Documents">
            {f.documents.length ? (
              <ul className="space-y-0.5">
                {f.documents.map((d) => (
                  <li key={d.id}>
                    {d.fileName} <span className="text-xs text-zinc-500">({d.kind.replace('_', ' ')})</span>
                  </li>
                ))}
              </ul>
            ) : (
              ''
            )}
          </Row>
        </dl>
      </Card>
    </div>
  );
};
