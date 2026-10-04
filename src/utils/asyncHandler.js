/**
 * Forwards async rejections to the central error handler (Express 4 does not do this).
 * @param {import('express').RequestHandler} fn
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
