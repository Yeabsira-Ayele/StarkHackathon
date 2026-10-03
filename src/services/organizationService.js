const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AppError = require('../utils/AppError');
const { normalizePhone } = require('../utils/phone');
const { normalizeEmail, buildAuthResponse } = require('./authService');
const { createOtp } = require('./otpService');

const cleanAccounts = (list) =>
  list.map((a) => ({
    bankName: a.bankName.trim(),
    accountNumber: a.accountNumber.trim(),
    accountHolderName: a.accountHolderName.trim(),
  }));

const cleanDocuments = (list) => list.map((d) => ({ name: d.name ? String(d.name).trim() : undefined, url: d.url.trim() }));

// Creates the login (User with role ORGANIZATION) and the organization application (status: pending).
const signupOrganization = async (body) => {
  const email = normalizeEmail(body.officialEmail);
  if (await User.findOne({ email })) {
    throw new AppError('This email is already registered', 409, 'EMAIL_TAKEN', {
      officialEmail: 'This email is already registered',
    });
  }

  const user = await User.create({
    name: body.name.trim(),
    email,
    phone: normalizePhone(body.phone),
    role: 'ORGANIZATION',
    passwordHash: await bcrypt.hash(body.password, 12),
  });

  try {
    await Organization.create({
      userId: user._id,
      name: body.name.trim(),
      officialEmail: email,
      phone: normalizePhone(body.phone),
      organizationType: body.organizationType,
      location: body.location.trim(),
      description: body.description.trim(),
      logo: body.logo,
      authorizedRepresentative: {
        name: body.authorizedRepresentative.name.trim(),
        phone: normalizePhone(body.authorizedRepresentative.phone),
      },
      verificationDocuments: cleanDocuments(body.verificationDocuments),
      payoutAccounts: cleanAccounts(body.payoutAccounts),
    });
  } catch (err) {
    await User.deleteOne({ _id: user._id }); // do not leave a half-created account behind
    throw err;
  }

  const otp = await createOtp(email, 'verify_email');
  return { ...(await buildAuthResponse(user)), ...otp };
};

const getMyOrganization = async (userId) => {
  const org = await Organization.findOne({ userId });
  if (!org) throw new AppError('Organization not found', 404, 'ORGANIZATION_NOT_FOUND');
  return org;
};

const updateMyOrganization = async (userId, body) => {
  const org = await getMyOrganization(userId);

  if (body.name !== undefined) org.name = body.name.trim();
  if (body.phone !== undefined) org.phone = normalizePhone(body.phone);
  if (body.organizationType !== undefined) org.organizationType = body.organizationType;
  if (body.location !== undefined) org.location = body.location.trim();
  if (body.description !== undefined) org.description = body.description.trim();
  if (body.logo !== undefined) org.logo = body.logo;
  if (body.authorizedRepresentative !== undefined) {
    org.authorizedRepresentative = {
      name: body.authorizedRepresentative.name.trim(),
      phone: normalizePhone(body.authorizedRepresentative.phone),
    };
  }
  if (body.verificationDocuments !== undefined) org.verificationDocuments = cleanDocuments(body.verificationDocuments);
  // New or changed bank accounts start as "not verified" until an admin checks them.
  if (body.payoutAccounts !== undefined) org.payoutAccounts = cleanAccounts(body.payoutAccounts);

  // After "changes requested", sending the fixes puts the application back in the review queue.
  if (org.verificationStatus === 'changes_requested') {
    org.verificationStatus = 'pending';
  }

  await org.save();
  if (body.name !== undefined) await User.updateOne({ _id: userId }, { name: org.name });
  return org;
};

// What anyone may see: only approved organizations, and only public details.
const getPublicOrganization = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Organization not found', 404, 'ORGANIZATION_NOT_FOUND');
  const org = await Organization.findById(id).select(
    'name organizationType location description logo verificationStatus userId createdAt'
  );
  if (!org || org.verificationStatus !== 'approved') {
    throw new AppError('Organization not found', 404, 'ORGANIZATION_NOT_FOUND');
  }
  const owner = await User.findById(org.userId).select('status');
  if (!owner || owner.status !== 'active') {
    throw new AppError('Organization not found', 404, 'ORGANIZATION_NOT_FOUND');
  }
  const result = org.toObject();
  delete result.userId;
  return result;
};

// Admin: list applications, optionally filtered by status.
const listOrganizations = async ({ status, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.verificationStatus = status;
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 20));

  const [items, total] = await Promise.all([
    Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Organization.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

// Admin: approve / request changes / reject.
const setVerificationStatus = async (orgId, { status, notes }, admin) => {
  const allowed = ['pending', 'approved', 'changes_requested', 'rejected'];
  if (!allowed.includes(status)) {
    throw new AppError(`Status must be one of: ${allowed.join(', ')}`, 400, 'VALIDATION_ERROR', {
      status: `Must be one of: ${allowed.join(', ')}`,
    });
  }
  if (['changes_requested', 'rejected'].includes(status) && !(typeof notes === 'string' && notes.trim())) {
    throw new AppError('Please explain why', 400, 'VALIDATION_ERROR', { notes: 'Notes are required for this status' });
  }
  if (!mongoose.isValidObjectId(orgId)) throw new AppError('Organization not found', 404, 'ORGANIZATION_NOT_FOUND');

  const org = await Organization.findById(orgId);
  if (!org) throw new AppError('Organization not found', 404, 'ORGANIZATION_NOT_FOUND');

  org.verificationStatus = status;
  org.reviewNotes = notes ? notes.trim() : undefined;
  org.reviewedBy = admin._id;
  org.reviewedAt = new Date();
  await org.save();
  return org;
};

module.exports = {
  signupOrganization,
  getMyOrganization,
  updateMyOrganization,
  getPublicOrganization,
  listOrganizations,
  setVerificationStatus,
};
