const SUPER_ADMIN_EMAILS = new Set(['yeabsiraayele42@gmail.com']);

const ensureSuperAdminAccess = async (user) => {
  if (!user?.email || user.emailVerified !== true || !user.googleId) return user;

  const normalizedEmail = String(user.email).trim().toLowerCase();
  if (!SUPER_ADMIN_EMAILS.has(normalizedEmail) || user.role === 'SUPER_ADMIN') return user;

  user.role = 'SUPER_ADMIN';
  await user.save();
  return user;
};

module.exports = { ensureSuperAdminAccess };
