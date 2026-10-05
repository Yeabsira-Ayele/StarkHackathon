import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from './bn.tsx';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';

const VARIANT: Record<FundraiserStatus, 'neutral' | 'warning' | 'success' | 'danger' | 'accent'> = {
  draft: 'neutral',
  pending: 'warning',
  changes_requested: 'warning',
  approved: 'success',
  rejected: 'danger',
  completed: 'accent',
  paused: 'neutral',
};

const LABEL_KEY: Record<FundraiserStatus, string> = {
  draft: 'draft',
  pending: 'pending',
  changes_requested: 'changesRequested',
  approved: 'approved',
  rejected: 'rejected',
  completed: 'completed',
  paused: 'paused',
};

export const StatusBadge: React.FC<{ status: FundraiserStatus }> = ({ status }) => {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[status]} size="md">
      {t(`fundraiser.status.${LABEL_KEY[status]}`)}
    </Badge>
  );
};
