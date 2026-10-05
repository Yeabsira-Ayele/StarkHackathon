const crypto = require('crypto');

const adminAuth = (req, res, next) => {
  const expectedKey = process.env.ADMIN_KEY;
  if (!expectedKey) {
    return res.status(503).json({ message: 'Admin access is not configured' });
  }

  const providedKey = req.headers['x-admin-key'];
  if (typeof providedKey !== 'string') {
    return res.status(401).json({ message: 'Invalid admin key' });
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return res.status(401).json({ message: 'Invalid admin key' });
  }

  next();
};

module.exports = adminAuth;
