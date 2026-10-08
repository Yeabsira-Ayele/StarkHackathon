// Turns any error into the team's standard error response:
// { "success": false, "message": "...", "error": { "code": "...", "fields": {} } }
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: { code: 'NOT_FOUND', fields: {} },
  });
};

const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let code = err.code && typeof err.code === 'string' ? err.code : 'SERVER_ERROR';
  let message = err.message;
  let fields = err.fields || {};

  // Mongoose: a field broke a rule in the model
  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    fields = {};
    for (const key of Object.keys(err.errors)) fields[key] = err.errors[key].message;
  }

  // MongoDB: a value that must be unique already exists (for example an email)
  if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE_VALUE';
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = `This ${field} is already in use`;
    fields = { [field]: message };
  }

  // The frontend sent broken JSON
  if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  }

  if (err.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request body is too large. Reduce the fundraiser images and try again.';
  }

  if (status >= 500 && !['SMS_NOT_CONFIGURED', 'GOOGLE_AUTH_NOT_CONFIGURED'].includes(code)) {
    console.error(err);
    message = 'Server error';
    code = 'SERVER_ERROR';
  }

  res.status(status).json({ success: false, message, error: { code, fields } });
};

module.exports = { notFound, errorHandler };
