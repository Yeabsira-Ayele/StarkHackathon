const AppError = require('../utils/AppError');
const { isValidPhone } = require('../utils/phone');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORG_TYPES = ['ngo', 'charity', 'community', 'religious', 'school', 'hospital', 'other'];

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

const fail = (fields) => {
  if (Object.keys(fields).length) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', fields);
  }
};

const PHONE_MESSAGE = 'A valid Ethiopian phone number is required (for example 0912345678)';

const checkPhone = (fields, value, key = 'phone') => {
  if (!isValidPhone(value)) fields[key] = PHONE_MESSAGE;
};

const checkEmail = (fields, value, key = 'email') => {
  if (!isText(value) || !EMAIL_RE.test(value.trim())) fields[key] = 'A valid email is required';
};

const checkPassword = (fields, value, key = 'password') => {
  if (typeof value !== 'string' || value.length < 8) {
    fields[key] = 'Password must be at least 8 characters';
  } else if (value.length > 72) {
    fields[key] = 'Password must be 72 characters or fewer';
  }
};

const validateChangePassword = (body = {}) => {
  const fields = {};
  checkPassword(fields, body.newPassword, 'newPassword');
  fail(fields);
};

const validateProfileUpdate = (body = {}) => {
  const fields = {};
  if (body.phone !== undefined) fields.phone = 'The phone number cannot be changed here';
  if (body.name !== undefined && !isText(body.name)) fields.name = 'Name cannot be empty';
  if (body.email !== undefined && body.email !== '') checkEmail(fields, body.email);
  if (body.profilePhoto !== undefined && typeof body.profilePhoto !== 'string') {
    fields.profilePhoto = 'Profile photo must be a link (URL)';
  }
  fail(fields);
};

/* ---------- Organizations ---------- */

const checkPayoutAccounts = (fields, list) => {
  if (!Array.isArray(list) || list.length === 0) {
    fields.payoutAccounts = 'At least one receiving bank account is required';
    return;
  }
  if (list.length > 5) {
    fields.payoutAccounts = 'You can add at most 5 receiving accounts';
    return;
  }
  list.forEach((acc, i) => {
    if (!acc || !isText(acc.bankName) || !isText(acc.accountNumber) || !isText(acc.accountHolderName)) {
      fields[`payoutAccounts[${i}]`] = 'bankName, accountNumber and accountHolderName are required';
    }
  });
};

const checkRepresentative = (fields, rep) => {
  if (!rep || !isText(rep.name)) fields['authorizedRepresentative.name'] = 'Representative name is required';
  if (!rep || !isValidPhone(rep.phone)) {
    fields['authorizedRepresentative.phone'] = 'A valid representative phone number is required';
  }
};

const checkDocuments = (fields, docs) => {
  if (!Array.isArray(docs) || docs.length === 0) {
    fields.verificationDocuments = 'At least one verification document is required';
    return;
  }
  if (docs.length > 10) {
    fields.verificationDocuments = 'You can add at most 10 documents';
    return;
  }
  docs.forEach((d, i) => {
    if (!d || !isText(d.url)) fields[`verificationDocuments[${i}]`] = 'Each document needs a url';
  });
};

const validateOrganizationSignup = (body = {}) => {
  const fields = {};
  if (!isText(body.name)) fields.name = 'Organization name is required';
  checkEmail(fields, body.officialEmail, 'officialEmail');
  checkPhone(fields, body.phone);
  if (!ORG_TYPES.includes(body.organizationType)) {
    fields.organizationType = `Organization type must be one of: ${ORG_TYPES.join(', ')}`;
  }
  if (!isText(body.location)) fields.location = 'Location is required';
  if (!isText(body.description)) fields.description = 'Description is required';
  checkRepresentative(fields, body.authorizedRepresentative);
  checkDocuments(fields, body.verificationDocuments);
  checkPayoutAccounts(fields, body.payoutAccounts);
  fail(fields);
};

const validateOrganizationUpdate = (body = {}) => {
  const fields = {};
  if (body.name !== undefined && !isText(body.name)) fields.name = 'Organization name cannot be empty';
  if (body.phone !== undefined) checkPhone(fields, body.phone);
  if (body.organizationType !== undefined && !ORG_TYPES.includes(body.organizationType)) {
    fields.organizationType = `Organization type must be one of: ${ORG_TYPES.join(', ')}`;
  }
  if (body.location !== undefined && !isText(body.location)) fields.location = 'Location cannot be empty';
  if (body.description !== undefined && !isText(body.description)) fields.description = 'Description cannot be empty';
  if (body.authorizedRepresentative !== undefined) checkRepresentative(fields, body.authorizedRepresentative);
  if (body.verificationDocuments !== undefined) checkDocuments(fields, body.verificationDocuments);
  if (body.payoutAccounts !== undefined) checkPayoutAccounts(fields, body.payoutAccounts);
  fail(fields);
};

module.exports = {
  ORG_TYPES,
  validateChangePassword,
  validateProfileUpdate,
  validateOrganizationSignup,
  validateOrganizationUpdate,
};
