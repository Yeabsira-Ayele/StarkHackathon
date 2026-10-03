// A quick automatic check of everything in Person 1.
// 1) Start your server in one terminal:   npm run dev
// 2) In a second terminal run:            node scripts/smoke-test.js
// Tip: put DISABLE_RATE_LIMIT=true and OTP_DEV_ECHO=true in your .env while testing.

const BASE = process.env.API_URL || 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

const check = (name, ok, extra = '') => {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
};

const call = async (method, path, body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try {
    json = await res.json();
  } catch (e) {}
  return { status: res.status, json };
};

(async () => {
  const stamp = Date.now();
  const email = `test${stamp}@example.com`;
  const orgEmail = `org${stamp}@example.com`;

  console.log('\nIndividual user');
  let r = await call('POST', '/auth/signup', { name: 'Test User', email, password: 'secret123' });
  check('signup works', r.status === 201 && r.json.success && r.json.data.token, JSON.stringify(r.json));
  let token = r.json.data && r.json.data.token;
  const devOtp = r.json.data && r.json.data.devOtp;

  r = await call('POST', '/auth/signup', { name: 'Test User', email, password: 'secret123' });
  check('same email again is rejected (409)', r.status === 409);

  r = await call('POST', '/auth/signup', { name: '', email: 'bad', password: '1' });
  check('bad signup data is rejected (400 + fields)', r.status === 400 && r.json.error.fields.email);

  if (devOtp) {
    r = await call('POST', '/auth/verify-email', { email, code: '000000' });
    check('wrong verification code is rejected', r.status === 400);
    r = await call('POST', '/auth/verify-email', { email, code: devOtp });
    check('correct verification code works', r.status === 200 && r.json.data.user.emailVerified === true, JSON.stringify(r.json));
  } else {
    console.log('  SKIP  email code test (set OTP_DEV_ECHO=true in .env to include it)');
  }

  r = await call('GET', '/auth/me', null, token);
  check('GET /auth/me with token works', r.status === 200 && r.json.data.user.email === email);
  check('password is never returned', !JSON.stringify(r.json).includes('passwordHash'));

  r = await call('GET', '/auth/me');
  check('GET /auth/me without token is 401', r.status === 401);

  r = await call('GET', '/auth/me', null, 'not-a-real-token');
  check('GET /auth/me with fake token is 401', r.status === 401);

  r = await call('PATCH', '/users/me', { name: 'New Name', phone: '0912345678' }, token);
  check('edit profile works', r.status === 200 && r.json.data.user.name === 'New Name');

  r = await call('PATCH', '/users/me', { phone: '123' }, token);
  check('bad phone is rejected', r.status === 400);

  r = await call('POST', '/auth/login', { email, password: 'wrongpass1' });
  check('wrong password is 401', r.status === 401);

  r = await call('POST', '/auth/login', { email, password: 'secret123' });
  check('login works', r.status === 200 && r.json.data.token);
  token = r.json.data.token;

  r = await call('GET', '/organizations', null, token);
  check('normal user cannot open admin list (403)', r.status === 403);

  r = await call('PATCH', '/users/me/password', { currentPassword: 'secret123', newPassword: 'newsecret456' }, token);
  check('change password works', r.status === 200 && r.json.data.token);
  const oldToken = token;
  token = r.json.data.token;

  r = await call('GET', '/auth/me', null, oldToken);
  check('old token stops working after password change', r.status === 401);

  r = await call('POST', '/auth/logout', null, token);
  check('logout works', r.status === 200);
  r = await call('GET', '/auth/me', null, token);
  check('token stops working after logout', r.status === 401);

  r = await call('POST', '/auth/login', { email, password: 'newsecret456' });
  token = r.json.data && r.json.data.token;
  check('login with new password works', r.status === 200 && token);

  console.log('\nOrganization');
  const orgBody = {
    name: 'Helping Hands',
    officialEmail: orgEmail,
    password: 'orgsecret123',
    phone: '0911223344',
    organizationType: 'charity',
    location: 'Addis Ababa',
    description: 'We help families in need.',
    authorizedRepresentative: { name: 'Abebe Kebede', phone: '0922334455' },
    verificationDocuments: [{ name: 'Registration', url: 'https://example.com/doc.pdf' }],
    payoutAccounts: [{ bankName: 'CBE', accountNumber: '1000123456789', accountHolderName: 'Helping Hands' }],
  };
  r = await call('POST', '/organizations/signup', orgBody);
  check('organization signup works (201)', r.status === 201 && r.json.data.organization.verificationStatus === 'pending', JSON.stringify(r.json));
  const orgToken = r.json.data && r.json.data.token;
  const orgId = r.json.data && r.json.data.organization && r.json.data.organization._id;

  r = await call('POST', '/organizations/signup', { ...orgBody, payoutAccounts: [] });
  check('organization without bank account is rejected', r.status === 400);

  r = await call('GET', '/organizations/me', null, orgToken);
  check('organization can see its own profile', r.status === 200 && r.json.data.organization.name === 'Helping Hands');

  r = await call('GET', '/organizations/me', null, token);
  check('normal user cannot use organization routes (403)', r.status === 403);

  r = await call('GET', `/organizations/${orgId}`);
  check('pending organization is NOT public (404)', r.status === 404);

  r = await call('PATCH', `/organizations/${orgId}/verification`, { status: 'approved' }, orgToken);
  check('organization cannot approve itself (403)', r.status === 403);

  console.log('\nDelete account');
  r = await call('DELETE', '/users/me', { password: 'wrong' }, token);
  check('delete with wrong password is rejected', r.status === 401);
  r = await call('DELETE', '/users/me', { password: 'newsecret456' }, token);
  check('delete account works', r.status === 200);
  r = await call('POST', '/auth/login', { email, password: 'newsecret456' });
  check('deleted account cannot log in', r.status === 401);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('\nCould not reach the server. Is it running (npm run dev)?\n', e.message);
  process.exit(1);
});
