/**
 * Operational error that the central handler turns into the API error shape.
 */
class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=400]
   * @param {string} [code='APP_ERROR']
   * @param {Record<string, string>} [fields]
   */
  constructor(message, statusCode = 400, code = 'APP_ERROR', fields = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields && typeof fields === 'object' ? fields : {};
    this.isOperational = true;
  }
}

module.exports = AppError;
