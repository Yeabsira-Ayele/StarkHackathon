const AppError = require('../utils/AppError');
const Organization = require('../models/Organization');
const requireRole = (...roles) => (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Please log in to continue', 401, 'AUTH_REQUIRED');
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to do this', 403, 'FORBIDDEN');
    }
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
const requireSuperAdmin = requireRole('SUPER_ADMIN');
const requireOrganization = requireRole('ORGANIZATION');

// Organization accounts that an admin has approved.
// Sets req.organization for the next handler.
const requireApprovedOrganization = async (req, res, next) => {
  try {
    if (!req.user) throw new AppError('Please log in to continue', 401, 'AUTH_REQUIRED');
    if (req.user.role !== 'ORGANIZATION') {
      throw new AppError('Only organization accounts can do this', 403, 'FORBIDDEN');
    }
    const org = await Organization.findOne({ userId: req.user._id });
    if (!org || org.verificationStatus !== 'approved') {
      throw new AppError('Your organization is not verified yet', 403, 'ORGANIZATION_NOT_VERIFIED');
    }
    req.organization = org;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireOrganization,
  requireApprovedOrganization,
};