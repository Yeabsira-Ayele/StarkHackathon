export function getCampaignFundedPercentage(raisedAmount: number, goalAmount: number): number {
  if (!Number.isFinite(raisedAmount) || !Number.isFinite(goalAmount) || goalAmount <= 0) return 0;
  return Math.min(Math.max((raisedAmount / goalAmount) * 100, 0), 100);
}
