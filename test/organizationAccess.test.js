const test = require('node:test');
const assert = require('node:assert/strict');
const organizationRoutes = require('../src/routes/organizationRoutes');
const { requireAuth } = require('../src/middleware/authMiddleware');
const { requireOrganization } = require('../src/middleware/roleMiddleware');
const { validateOrganizationSignup } = require('../src/validators/authValidators');

test('organization self-lookup is authenticated and available to accounts with pending applications', () => {
  const route = organizationRoutes.stack.find(
    (layer) => layer.route?.path === '/organizations/me' && layer.route.methods.get,
  );

  assert.ok(route, 'GET /organizations/me must be registered');
  const handlers = route.route.stack.map((layer) => layer.handle);
  assert.ok(handlers.includes(requireAuth), 'self-lookup must require authentication');
  assert.ok(!handlers.includes(requireOrganization), 'self-lookup must also work before the organization role is assigned');
});

test('organization self-updates remain restricted to organization accounts', () => {
  const route = organizationRoutes.stack.find(
    (layer) => layer.route?.path === '/organizations/me' && layer.route.methods.patch,
  );

  assert.ok(route, 'PATCH /organizations/me must be registered');
  const handlers = route.route.stack.map((layer) => layer.handle);
  assert.ok(handlers.includes(requireAuth), 'self-updates must require authentication');
  assert.ok(handlers.includes(requireOrganization), 'self-updates must require the organization role');
});

test('organization signup accepts the registration form payload and its review details', () => {
  assert.doesNotThrow(() => validateOrganizationSignup({
    name: 'Community Health Foundation',
    registrationNo: 'ACSO/ET/2026/8920',
    officialEmail: 'contact@example.org',
    phone: '0912345678',
    organizationType: 'ngo',
    location: 'Addis Ababa',
    description: 'Community health services.',
    website: 'https://example.org',
    authorizedRepresentative: {
      name: 'Aster Example',
      phone: '0912345678',
      role: 'Executive Director',
      email: 'aster@example.org',
    },
    verificationDocuments: [{ name: 'ACSO certificate', url: 'https://example.org/acso.pdf' }],
    payoutAccounts: [{
      bankName: 'Commercial Bank of Ethiopia',
      accountNumber: '1000123456789',
      accountHolderName: 'Community Health Foundation',
    }],
  }));
});

test('organization signup rejects missing verification-document links', () => {
  assert.throws(
    () => validateOrganizationSignup({
      name: 'Community Health Foundation',
      officialEmail: 'contact@example.org',
      phone: '0912345678',
      organizationType: 'ngo',
      location: 'Addis Ababa',
      description: 'Community health services.',
      authorizedRepresentative: { name: 'Aster Example', phone: '0912345678' },
      verificationDocuments: [],
      payoutAccounts: [{
        bankName: 'Commercial Bank of Ethiopia',
        accountNumber: '1000123456789',
        accountHolderName: 'Community Health Foundation',
      }],
    }),
    (error) => error.status === 400 && error.code === 'VALIDATION_ERROR',
  );
});
