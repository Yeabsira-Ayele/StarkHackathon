import React from 'react';
import { Badge } from './bn.tsx';
import type { FundraiserStatus } from '../types/fundraiser.types.ts';
import { STATUS_LABELS } from './format.ts';

const VARIANT: Record<FundraiserStatus, 'neutral' | 'warning' | 'success' | 'danger' | 'accent'> = {
  draft: 'neutral',
  pending: 'warning',
  changes_requested: 'warning',
  approved: 'success',
  rejected: 'danger',
  completed: 'accent',
  paused: 'neutral',
};

export const StatusBadge: React.FC<{ status: FundraiserStatus }> = ({ status }) => (
  <Badge variant={VARIANT[status]} size="md">
    {STATUS_LABELS[status]}
  </Badge>
);
