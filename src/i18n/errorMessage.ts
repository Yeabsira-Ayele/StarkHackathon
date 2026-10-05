import type { TFunction } from 'i18next';

const ERROR_TRANSLATION_KEYS: Record<string, string> = {
  ACCOUNT_BANNED: 'errors.accountUnavailable',
  ACCOUNT_SUSPENDED: 'errors.accountUnavailable',
  AUTH_REQUIRED: 'errors.authRequired',
  CAMPAIGN_NOT_FOUND: 'errors.notFound',
  FORBIDDEN: 'errors.forbidden',
  INVALID_CREDENTIALS: 'errors.authRequired',
  INVALID_GOOGLE_CREDENTIAL: 'errors.authRequired',
  INVALID_JSON: 'errors.validation',
  INVALID_TOKEN: 'errors.authRequired',
  NETWORK_ERROR: 'errors.network',
  NOT_FOUND: 'errors.notFound',
  ORGANIZATION_NOT_FOUND: 'errors.notFound',
  ORGANIZATION_NOT_VERIFIED: 'errors.forbidden',
  RATE_LIMITED: 'errors.rateLimited',
  SERVER_ERROR: 'errors.server',
  TOKEN_EXPIRED: 'errors.authRequired',
  USER_NOT_FOUND: 'errors.notFound',
  VALIDATION_ERROR: 'errors.validation',
};

interface ErrorWithCode {
  code?: unknown;
  message?: unknown;
  status?: unknown;
}

export function localizeErrorMessage(
  t: TFunction,
  error: unknown,
  fallbackKey = 'errors.generic',
): string {
  const value = error && typeof error === 'object' ? error as ErrorWithCode : undefined;
  const code = typeof value?.code === 'string' ? value.code : undefined;
  const translationKey = code ? ERROR_TRANSLATION_KEYS[code] : undefined;
  if (translationKey) return t(translationKey);

  const status = typeof value?.status === 'number' ? value.status : undefined;
  if (status !== undefined) {
    if (status >= 500) return t('errors.server');
    if (status === 401) return t('errors.authRequired');
    if (status === 403) return t('errors.forbidden');
    if (status === 404) return t('errors.notFound');
    if (status === 429) return t('errors.rateLimited');
    if (status >= 400) return t('errors.validation');
  }

  if (typeof value?.message === 'string' && value.message) return value.message;
  return t(fallbackKey);
}
