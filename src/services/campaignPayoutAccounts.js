const isValidPayoutAccount = (account) => {
  if (!account || typeof account !== 'object') return false;
  const accountNumber = String(account.accountNumber || '').replace(/\s/g, '');
  return Boolean(
    (account.bankId || account.bankName) &&
    /^\d{8,16}$/.test(accountNumber) &&
    String(account.accountName || account.accountHolderName || '').trim()
  );
};

const normalizePayoutAccount = (account) => ({
  bankId: String(account.bankId || account.bankName).trim(),
  bankName: String(account.bankName || account.bankId).trim(),
  accountNumber: String(account.accountNumber).replace(/\s/g, ''),
  accountName: String(account.accountName || account.accountHolderName).trim(),
});

const getPayoutAccountId = (account) =>
  `${String(account.bankId).trim().toLowerCase()}:${String(account.accountNumber).replace(/\D/g, '')}`;

const getCampaignPayoutAccounts = (campaign, organization) => {
  const explicitAccounts = Array.isArray(campaign.payoutAccounts) ? campaign.payoutAccounts : [];
  const fundraiserData = campaign.fundraiserData || {};
  const legacyAccounts = Array.isArray(fundraiserData.banks)
    ? fundraiserData.banks
    : fundraiserData.bank
      ? [fundraiserData.bank]
      : [];
  const organizationAccounts = organization && Array.isArray(organization.payoutAccounts)
    ? organization.payoutAccounts
    : [];

  const source = explicitAccounts.length
    ? explicitAccounts
    : fundraiserData.beneficiaryType === 'community_org'
      ? organizationAccounts
      : legacyAccounts.some(isValidPayoutAccount)
        ? legacyAccounts
        : organizationAccounts;

  const uniqueAccounts = new Map();
  for (const account of source) {
    if (!isValidPayoutAccount(account)) continue;
    const normalized = normalizePayoutAccount(account);
    uniqueAccounts.set(`${normalized.bankId}:${normalized.accountNumber}`, normalized);
  }
  return [...uniqueAccounts.values()];
};

const stripPayoutAccounts = (campaign) => {
  const publicCampaign = { ...campaign };
  delete publicCampaign.payoutAccounts;
  if (publicCampaign.fundraiserData && typeof publicCampaign.fundraiserData === 'object') {
    publicCampaign.fundraiserData = { ...publicCampaign.fundraiserData };
    delete publicCampaign.fundraiserData.bank;
    delete publicCampaign.fundraiserData.banks;
  }
  return publicCampaign;
};

module.exports = {
  getCampaignPayoutAccounts,
  getPayoutAccountId,
  isValidPayoutAccount,
  stripPayoutAccounts,
};
