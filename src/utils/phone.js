// "091 234-5678" -> "0912345678"
const normalizePhone = (p) => (typeof p === 'string' ? p.trim().replace(/\s|-/g, '') : p);

module.exports = { normalizePhone };
