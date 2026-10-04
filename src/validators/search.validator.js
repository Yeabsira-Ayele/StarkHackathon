const { z } = require('zod');
const { objectIdSchema } = require('./donation.validator');
const { SEARCH_SORTS, MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT } = require('../config/constants');

const emptyToUndefined = (value) => (
  typeof value === 'string' && value.trim() === '' ? undefined : value
);

const searchQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
  category: objectIdSchema.optional(),
  location: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(120).optional()),
  verification: z.enum(['verified', 'unverified']).optional(),
  organization: objectIdSchema.optional(),
  status: z.enum(['published', 'completed']).optional(),
  sort: z.enum(SEARCH_SORTS).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
});

module.exports = {
  searchQuerySchema,
};
