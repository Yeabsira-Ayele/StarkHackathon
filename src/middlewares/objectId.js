const AppError = require('../utils/AppError');
const { isObjectId } = require('../utils/objectId');

/**
 * Rejects route params that are not Mongo ObjectIds.
 * @param {string} paramName
 */
function validateObjectId(paramName) {
  return function objectIdParam(req, res, next) {
    const value = req.params[paramName];
    if (!isObjectId(value)) {
      next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        [paramName]: 'Must be a valid id',
      }));
      return;
    }
    next();
  };
}

module.exports = { validateObjectId };
