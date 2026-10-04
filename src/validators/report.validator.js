const { z } = require('zod');
const { objectIdSchema, paginationQuerySchema } = require('./donation.validator');
const { REPORT_TARGET_TYPES, REPORT_REASONS, MAX_REPORT_DETAILS } = require('../config/constants');

const createReportSchema = z.object({
  targetType: z.enum(REPORT_TARGET_TYPES),
  targetId: objectIdSchema,
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(MAX_REPORT_DETAILS).optional(),
}).strict();

module.exports = {
  createReportSchema,
  paginationQuerySchema,
};
