// A normal Error plus an HTTP status and a short code the frontend can read.
class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST', fields = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.isAppError = true;
  }
}

module.exports = AppError;
