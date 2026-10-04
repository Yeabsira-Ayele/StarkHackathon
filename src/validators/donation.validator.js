const { z } = require('zod');
const { isObjectId } = require('../utils/objectId');
const {
  IDENTITY_MODES,
  MIN_DONATION,
  MAX_DONATION,
  MAX_MESSAGE_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  CURRENCY,
  MAX_PAGE_LIMIT,
  DEFAULT_PAGE_LIMIT,
} = require('../config/constants');
const { hasAtMostTwoDecimals } = require('../utils/money');

const objectIdSchema = z.string().trim().refine(isObjectId, 'Must be a valid id');

const initializeDonationSchema = z.object({
  campaignId: objectIdSchema,
  amount: z.number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .refine(hasAtMostTwoDecimals, 'Amount supports at most 2 decimal places')
    .refine(
      (value) => value >= MIN_DONATION && value <= MAX_DONATION,
      `Amount must be between ${MIN_DONATION} and ${MAX_DONATION} ${CURRENCY}`
    ),
  identityMode: z.enum(IDENTITY_MODES),
  displayName: z.string().trim().min(1).max(MAX_DISPLAY_NAME_LENGTH).optional(),
  message: z.string().trim().max(MAX_MESSAGE_LENGTH).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.identityMode === 'identified' && !value.displayName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['displayName'],
      message: 'Display name is required for identified donations',
    });
  }
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
});

module.exports = {
  objectIdSchema,
  initializeDonationSchema,
  paginationQuerySchema,
};
