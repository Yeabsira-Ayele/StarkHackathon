/**
 * @param {string} message
 * @param {object} [data]
 */
function successBody(message, data = {}) {
  return { success: true, message, data };
}

/**
 * @param {string} message
 * @param {string} code
 * @param {Record<string, string>} [fields]
 */
function errorBody(message, code, fields = {}) {
  return {
    success: false,
    message,
    error: { code, fields: fields || {} },
  };
}

/**
 * @param {import('express').Response} res
 * @param {{ status?: number, message: string, data?: object }} payload
 */
function sendSuccess(res, { status = 200, message, data = {} }) {
  return res.status(status).json(successBody(message, data));
}

/**
 * @param {import('express').Response} res
 * @param {{ status?: number, message: string, code: string, fields?: Record<string, string> }} payload
 */
function sendError(res, { status = 400, message, code, fields = {} }) {
  return res.status(status).json(errorBody(message, code, fields));
}

module.exports = {
  successBody,
  errorBody,
  sendSuccess,
  sendError,
};
