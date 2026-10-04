const { ZodError } = require('zod');
const { errorBody } = require('../utils/apiResponse');

/**
 * @param {import('zod').ZodError} error
 * @returns {Record<string, string>}
 */
function zodFields(error) {
  const fields = {};
  for (const issue of error.issues || []) {
    const key = issue.path.length ? issue.path.join('.') : 'body';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/**
 * Express error handler. Always responds with the Person 3 error shape.
 * @type {import('express').ErrorRequestHandler}
 */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError || err?.name === 'ZodError') {
    res.status(400).json(errorBody('Validation failed', 'VALIDATION_ERROR', zodFields(err)));
    return;
  }

  if (err?.name === 'CastError') {
    const field = err.path || 'id';
    res.status(400).json(errorBody('Invalid id', 'VALIDATION_ERROR', { [field]: 'Must be a valid id' }));
    return;
  }

  const status = Number(err.statusCode) || 500;
  if (status >= 500) {
    console.error('[error]', err.message);
  }

  const code = status >= 500 ? 'INTERNAL_ERROR' : err.code || 'APP_ERROR';
  const message = status >= 500 ? 'Something went wrong' : err.message || 'Request failed';
  const fields = err.fields && typeof err.fields === 'object' ? err.fields : {};

  res.status(status).json(errorBody(message, code, fields));
}

/**
 * @type {import('express').RequestHandler}
 */
function notFoundHandler(req, res) {
  res.status(404).json(errorBody('Route not found', 'NOT_FOUND', {}));
}

module.exports = {
  errorHandler,
  notFoundHandler,
  zodFields,
};
