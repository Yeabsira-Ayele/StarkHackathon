const mongoose = require('mongoose');

/**
 * True only for a 24-character hex ObjectId string.
 * `mongoose.Types.ObjectId.isValid` also accepts any 12-character string.
 * @param {unknown} value
 * @returns {boolean}
 */
function isObjectId(value) {
  if (typeof value !== 'string' || !mongoose.Types.ObjectId.isValid(value)) return false;
  return new mongoose.Types.ObjectId(value).toString() === value;
}

module.exports = { isObjectId };
