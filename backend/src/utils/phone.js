// Ethiopian mobile numbers. All of these mean the same phone:
//   0912345678   +251912345678   251912345678   091 234 5678
// We always SAVE it in one form (+251912345678) so the same phone is never saved twice.
const PHONE_RE = /^(?:\+251|251|0)?([79]\d{8})$/;

const clean = (p) => String(p == null ? '' : p).trim().replace(/[\s()-]/g, '');

const isValidPhone = (p) => typeof p === 'string' && PHONE_RE.test(clean(p));

const normalizePhone = (p) => {
  if (typeof p !== 'string') return p;
  const match = clean(p).match(PHONE_RE);
  return match ? `+251${match[1]}` : clean(p);
};

module.exports = { isValidPhone, normalizePhone };
