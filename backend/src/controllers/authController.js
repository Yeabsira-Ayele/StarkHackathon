const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeIdentity = (value) => {
  const trimmed = value.trim();
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed.replace(/[\s()-]/g, '');
};
const isValidIdentity = (value) => {
  const trimmed = value.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const phoneValid = /^\+?[\d\s()-]{7,20}$/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 7;
  return emailValid || phoneValid;
};

function toPublicUser(user) {
  const identity = user.emailOrPhone;
  const isEmail = identity.includes('@');
  return {
    id: user.id,
    name: user.name,
    email: isEmail ? identity : '',
    phone: isEmail ? undefined : identity,
    role: user.role,
    verified: user.verified,
    organizationName: user.organizationName,
    createdAt: user.createdAt,
  };
}

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  const { name, emailOrPhone, passcode, role = 'donor', organizationName } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'Enter your full name (at least 2 characters)' });
  }
  if (typeof emailOrPhone !== 'string' || !isValidIdentity(emailOrPhone)) {
    return res.status(400).json({ message: 'Enter a valid email address or phone number' });
  }
  if (typeof passcode !== 'string' || passcode.length < 8 || Buffer.byteLength(passcode, 'utf8') > 72) {
    return res.status(400).json({ message: 'Passcode must be 8 to 72 bytes long' });
  }
  if (!['donor', 'foundation'].includes(role)) {
    return res.status(400).json({ message: 'Choose an individual or organization account' });
  }
  if (role === 'foundation' && (typeof organizationName !== 'string' || !organizationName.trim())) {
    return res.status(400).json({ message: 'Enter your organization name' });
  }

  const identity = emailOrPhone.trim();
  const normalizedIdentity = normalizeIdentity(identity);
  try {
    const exists = await User.exists({ normalizedIdentity });
    if (exists) return res.status(409).json({ message: 'An account already exists for this email or phone number' });

    const passwordHash = await User.hashPassword(passcode);
    const user = await User.create({
      name: name.trim(),
      emailOrPhone: identity,
      normalizedIdentity,
      passwordHash,
      role,
      organizationName: role === 'foundation' ? organizationName.trim() : undefined,
      verified: false,
    });

    return res.status(201).json({ user: toPublicUser(user), token: createToken(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account already exists for this email or phone number' });
    }
    throw error;
  }
};

exports.login = async (req, res) => {
  const { emailOrPhone, passcode } = req.body || {};
  if (typeof emailOrPhone !== 'string' || !isValidIdentity(emailOrPhone) || typeof passcode !== 'string' || !passcode) {
    return res.status(400).json({ message: 'Enter your email or phone number and passcode' });
  }

  const user = await User.findOne({ normalizedIdentity: normalizeIdentity(emailOrPhone) }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(passcode))) {
    return res.status(401).json({ message: 'Email/phone or passcode is incorrect' });
  }

  return res.json({ user: toPublicUser(user), token: createToken(user) });
};

exports.me = (req, res) => res.json(toPublicUser(req.user));