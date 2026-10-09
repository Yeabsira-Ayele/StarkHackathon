const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET ||= 'organization-signup-test-secret';

const User = require('../src/models/User');
const Organization = require('../src/models/Organization');
const { signupOrganization } = require('../src/services/organizationService');

const originalMethods = {
  findUser: User.findById,
  findOrganization: Organization.findOne,
  createOrganization: Organization.create,
  deleteOrganization: Organization.deleteOne,
};

const restoreMethods = () => {
  User.findById = originalMethods.findUser;
  Organization.findOne = originalMethods.findOrganization;
  Organization.create = originalMethods.createOrganization;
  Organization.deleteOne = originalMethods.deleteOrganization;
};

const makeBody = () => ({
  name: 'Community Health Organization',
  officialEmail: 'contact@example.org',
  phone: '0912345678',
  organizationType: 'ngo',
  location: 'Addis Ababa',
  description: 'Community health services.',
  authorizedRepresentative: { name: 'Representative', phone: '0912345678' },
  verificationDocuments: [{ url: 'https://example.org/registration.pdf' }],
  payoutAccounts: [{ bankName: 'CBE', accountNumber: '12345', accountHolderName: 'Community Health Organization' }],
});

const setupSignup = (user) => {
  let lookupCount = 0;
  const organization = {
    _id: 'organization-id',
    name: 'Community Health Organization',
    verificationStatus: 'pending',
  };
  let saveCount = 0;

  user.save = async () => { saveCount += 1; };
  User.findById = async () => user;
  Organization.findOne = () => {
    lookupCount += 1;
    if (lookupCount === 1) return Promise.resolve(null);
    return { select: async () => organization };
  };
  Organization.create = async () => organization;
  Organization.deleteOne = async () => {};

  return { organization, getSaveCount: () => saveCount };
};

test.afterEach(restoreMethods);

test('regular authenticated users can submit an application for admin review', async () => {
  const user = { _id: 'user-id', role: 'USER', tokenVersion: 0 };
  const { organization, getSaveCount } = setupSignup(user);

  const response = await signupOrganization(user._id, makeBody());

  assert.equal(user.role, 'ORGANIZATION');
  assert.equal(getSaveCount(), 1);
  assert.equal(response.organization._id, organization._id);
  assert.equal(response.organization.verificationStatus, 'pending');
});

test('administrator roles can submit an application without losing their privileges', async () => {
  const user = { _id: 'admin-id', role: 'ADMIN', tokenVersion: 0 };
  const { organization, getSaveCount } = setupSignup(user);

  const response = await signupOrganization(user._id, makeBody());

  assert.equal(user.role, 'ADMIN');
  assert.equal(getSaveCount(), 0);
  assert.equal(response.organization._id, organization._id);
  assert.equal(response.organization.verificationStatus, 'pending');
});
