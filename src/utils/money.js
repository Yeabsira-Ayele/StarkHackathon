/**
 * ETB amounts are rounded to the santim (2 decimal places) and compared in cents
 * so 10.00 and 10.0000001 do not drift apart.
 */

/**
 * @param {number} amount
 * @returns {number}
 */
function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

/**
 * @param {number} amount
 * @returns {number} ETB rounded to 2 decimal places
 */
function normalizeAmount(amount) {
  return toCents(amount) / 100;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
function sameMoney(a, b) {
  if (!Number.isFinite(Number(a)) || !Number.isFinite(Number(b))) return false;
  return toCents(a) === toCents(b);
}

/**
 * True when the value has at most 2 decimal places.
 * @param {number} amount
 * @returns {boolean}
 */
function hasAtMostTwoDecimals(amount) {
  if (!Number.isFinite(amount)) return false;
  return Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6;
}

module.exports = {
  toCents,
  normalizeAmount,
  sameMoney,
  hasAtMostTwoDecimals,
};
