const AppError = require('../utils/AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Ethiopian mobile numbers: 09..., 07..., +2519..., +2517...
const PHONE_RE = /^(\+251|251|0)?[79]\d{8}$/;

const ORG_TYPES = ['ngo', 'charity', 'community', 'religious', 'school', 'hospital', 'other'];

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const cleanPhone = (v) => v.trim().replace(/\s|-/g, '');

const fail = (fields) => {
  if (Object.keys(fields).length) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', fields);
  }
};

const checkEmail = (fields, value, key = 'email') => {
  if (!isText(value) || !EMAIL_RE.test(value.trim())) fields[key] = 'A valid email is required';
};

const checkPassword = (fields, value, key = 'password') => {
  if (typeof value !== 'string' || value.length < 8) {
    fields[key] = 'Password must be at least 8 characters';
  } else if (value.length > 100) {
    fields[key] = 'Password is too long';
  }
};

const checkPhone = (fields, value, key = 'phone') => {
  if (!isText(value) || !PHONE_RE.test(cleanPhone(value))) {
    fields[key] = 'A valid Ethiopian phone number is required (for example 0912345678)';
  }
};

const checkCode = (fields, value) => {
  if (!isText(value) || !/^\d{6}$/.test(value.trim())) fields.code = 'The code must be 6 digits';
};

const validateSignup = (body = {}) => {
  const fields = {};
  if (!isText(body.name)) fields.name = 'Name is required';
  checkEmail(fields, body.email);
  checkPassword(fields, body.password);
  if (body.phone !== undefined && body.phone !== '') checkPhone(fields, body.phone);
  fail(fields);
};

const validateLogin = (body = {}) => {
  const fields = {};
  checkEmail(fields, body.email);
  if (!isText(body.password)) fields.password = 'Password is required';
  fail(fields);
};

const validateEmailOnly = (body = {}) => {
  const fields = {};
  checkEmail(fields, body.email);
  fail(fields);
};

const validateEmailAndCode = (body = {}) => {
  const fields = {};
  checkEmail(fields, body.email);
  checkCode(fields, body.code);
  fail(fields);
};

const validateResetPassword = (body = {}) => {
  const fields = {};
  checkEmail(fields, body.email);
  checkCode(fields, body.code);
  checkPassword(fields, body.newPassword, 'newPassword');
  fail(fields);
};

const validateChangePassword = (body = {}) => {
  const fields = {};
  checkPassword(fields, body.newPassword, 'newPassword');
  fail(fields);
};

const validateProfileUpdate = (body = {}) => {
  const fields = {};
  if (body.name !== undefined && !isText(body.name)) fields.name = 'Name cannot be empty';
  if (body.phone !== undefined && body.phone !== '') checkPhone(fields, body.phone);
  if (body.profilePhoto !== undefined && typeof body.profilePhoto !== 'string') {
    fields.profilePhoto = 'Profile photo must be a link (URL)';
  }
  fail(fields);
};

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
  if (!rep || !isText(rep.phone) || !PHONE_RE.test(cleanPhone(rep.phone))) {
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
  checkPassword(fields, body.password);
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
  validateSignup,
  validateLogin,
  validateEmailOnly,
  validateEmailAndCode,
  validateResetPassword,
  validateChangePassword,
  validateProfileUpdate,
  validateOrganizationSignup,
  validateOrganizationUpdate,
};
