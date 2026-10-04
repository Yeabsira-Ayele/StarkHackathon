const AppError = require('../utils/AppError');
const { zodFields } = require('./errorHandler');

/**
 * Validates `req[source]` with a Zod schema and replaces it with the parsed value
 * on `req.validated` (body) or `req.validatedQuery` (query).
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body' | 'query'} [source='body']
 */
function validate(schema, source = 'body') {
  return function validateRequest(req, res, next) {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', zodFields(parsed.error)));
      return;
    }
    if (source === 'query') req.validatedQuery = parsed.data;
    else req.validated = parsed.data;
    next();
  };
}

module.exports = { validate };
