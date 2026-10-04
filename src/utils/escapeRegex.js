/**
 * Escapes a user string so it can be placed inside a RegExp as a literal.
 * @param {string} input
 * @returns {string}
 */
function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
