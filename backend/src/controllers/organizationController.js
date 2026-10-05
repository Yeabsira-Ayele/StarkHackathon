const orgService = require('../services/organizationService');
const v = require('../validators/authValidators');
const { sendSuccess } = require('../utils/response');

const signup = async (req, res) => {
  v.validateOrganizationSignup(req.body);
  const data = await orgService.signupOrganization(req.body);
  sendSuccess(res, 'Application submitted. An admin will review it.', data, 201);
};

const getMine = async (req, res) => {
  const organization = await orgService.getMyOrganization(req.user._id);
  sendSuccess(res, 'Organization loaded', { organization });
};

const updateMine = async (req, res) => {
  v.validateOrganizationUpdate(req.body);
  const organization = await orgService.updateMyOrganization(req.user._id, req.body);
  sendSuccess(res, 'Organization updated', { organization });
};

const getPublic = async (req, res) => {
  const organization = await orgService.getPublicOrganization(req.params.id);
  sendSuccess(res, 'Organization loaded', { organization });
};

const list = async (req, res) => {
  const data = await orgService.listOrganizations(req.query);
  sendSuccess(res, 'Organizations loaded', data);
};

const listPublic = async (req, res) => {
  const data = await orgService.listPublicOrganizations(req.query);
  sendSuccess(res, 'Organizations loaded', data);
};

const setVerification = async (req, res) => {
  const organization = await orgService.setVerificationStatus(req.params.id, req.body || {}, req.user);
  sendSuccess(res, `Organization is now ${organization.verificationStatus}`, { organization });
};

module.exports = { signup, getMine, updateMine, getPublic, list, listPublic, setVerification };
