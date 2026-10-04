// A quick automatic check of everything in Person 1.
// 1) Start your server in one terminal:   npm run dev
// 2) In a second terminal run:            node scripts/smoke-test.js
// Your .env must contain:  OTP_DEV_ECHO=true  and  DISABLE_RATE_LIMIT=true

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

const randomPhone = () => '09' + String(Math.floor(10000000 + Math.random() * 89999999));

(async () => {
  const stamp = Date.now();
  const phone = randomPhone();
  const phoneIntl = '+251' + phone.slice(1); // same phone, written another way
  const email = `test${stamp}@example.com`;
  const orgPhone = randomPhone();
  const orgEmail = `org${stamp}@example.com`;

  console.log('\nIndividual user: signup with phone + code');
  let r = await call('POST', '/auth/signup/request-otp', { phone });
  check('request a code', r.status === 200, JSON.stringify(r.json));
  const otp = r.json.data && r.json.data.devOtp;
  if (!otp) {
    console.log('\n  STOP  No code was returned. Add OTP_DEV_ECHO=true to your .env, restart the server, and run again.\n');
    process.exit(1);
  }

  r = await call('POST', '/auth/signup/request-otp', { phone: '12345' });
  check('bad phone number is rejected (400)', r.status === 400 && r.json.error.fields.phone);

  r = await call('POST', '/auth/signup', { name: 'Test User', phone, otp: '000000', password: 'secret123' });
  check('signup with a WRONG code is rejected', r.status === 400);

  r = await call('POST', '/auth/signup', { name: '', phone, otp, password: '1' });
  check('bad signup data is rejected (400 + fields)', r.status === 400 && r.json.error.fields.name);

  r = await call('POST', '/auth/signup', { name: 'Test User', phone, otp, password: 'secret123' });
  check('signup with the right code works (201)', r.status === 201 && r.json.data.token, JSON.stringify(r.json));
  let token = r.json.data && r.json.data.token;
  check('phone is saved in standard form', r.json.data && r.json.data.user.phone === phoneIntl);
  check('phone is marked verified', r.json.data && r.json.data.user.phoneVerified === true);

  r = await call('POST', '/auth/signup/request-otp', { phone: phoneIntl });
  check('same phone (written another way) cannot sign up again (409)', r.status === 409);

  console.log('\nIndividual user: session and profile');
  r = await call('GET', '/auth/me', null, token);
  check('GET /auth/me with token works', r.status === 200 && r.json.data.user.phone === phoneIntl);
  check('password is never returned', !JSON.stringify(r.json).includes('passwordHash'));

  r = await call('GET', '/auth/me');
  check('GET /auth/me without token is 401', r.status === 401);

  r = await call('GET', '/auth/me', null, 'not-a-real-token');
  check('GET /auth/me with fake token is 401', r.status === 401);

  r = await call('PATCH', '/users/me', { name: 'New Name', email }, token);
  check('edit profile works', r.status === 200 && r.json.data.user.name === 'New Name', JSON.stringify(r.json));

  r = await call('PATCH', '/users/me', { phone: '0911111111' }, token);
  check('phone cannot be changed here (400)', r.status === 400);

  r = await call('PATCH', '/users/me', { email: 'not-an-email' }, token);
  check('bad email is rejected', r.status === 400);

  console.log('\nIndividual user: login');
  r = await call('POST', '/auth/login', { identifier: phone, password: 'wrongpass1' });
  check('wrong password is 401', r.status === 401);

  r = await call('POST', '/auth/login', { identifier: phone, password: 'secret123' });
  check('login with phone works', r.status === 200 && r.json.data.token);

  r = await call('POST', '/auth/login', { identifier: phoneIntl, password: 'secret123' });
  check('login works when the phone is written as +251...', r.status === 200);

  r = await call('POST', '/auth/login', { identifier: email, password: 'secret123' });
  check('login with the saved email also works', r.status === 200);
  token = r.json.data && r.json.data.token;

  r = await call('GET', '/organizations', null, token);
  check('normal user cannot open admin list (403)', r.status === 403);

  console.log('\nPasswords and logout');
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

  r = await call('POST', '/auth/forgot-password', { phone });
  check('forgot password sends a code', r.status === 200 && r.json.data.devOtp, JSON.stringify(r.json));
  const resetOtp = r.json.data && r.json.data.devOtp;

  r = await call('POST', '/auth/reset-password', { phone, otp: '000000', newPassword: 'resetpass789' });
  check('reset with a wrong code is rejected', r.status === 400);

  r = await call('POST', '/auth/reset-password', { phone, otp: resetOtp, newPassword: 'resetpass789' });
  check('reset password with the right code works', r.status === 200, JSON.stringify(r.json));

  r = await call('POST', '/auth/login', { identifier: phone, password: 'resetpass789' });
  token = r.json.data && r.json.data.token;
  check('login with the reset password works', r.status === 200 && token);

  console.log('\nOrganization');
  const orgBody = {
    name: 'Helping Hands',
    officialEmail: orgEmail,
    password: 'orgsecret123',
    phone: orgPhone,
    organizationType: 'charity',
    location: 'Addis Ababa',
    description: 'We help families in need.',
    authorizedRepresentative: { name: 'Abebe Kebede', phone: '0922334455' },
    verificationDocuments: [{ name: 'Registration', url: 'https://example.com/doc.pdf' }],
    payoutAccounts: [{ bankName: 'CBE', accountNumber: '1000123456789', accountHolderName: 'Helping Hands' }],
  };
  r = await call('POST', '/organizations/signup', orgBody);
  check('organization signup works (201, pending)', r.status === 201 && r.json.data.organization.verificationStatus === 'pending', JSON.stringify(r.json));
  const orgToken = r.json.data && r.json.data.token;
  const orgId = r.json.data && r.json.data.organization && r.json.data.organization._id;

  r = await call('POST', '/organizations/signup', { ...orgBody, payoutAccounts: [] });
  check('organization without bank account is rejected', r.status === 400);

  r = await call('POST', '/organizations/signup', orgBody);
  check('same organization phone cannot sign up twice (409)', r.status === 409);

  r = await call('POST', '/auth/login', { identifier: orgPhone, password: 'orgsecret123' });
  check('organization can log in with its phone', r.status === 200 && r.json.data.user.role === 'ORGANIZATION');

  r = await call('POST', '/auth/login', { identifier: orgEmail, password: 'orgsecret123' });
  check('organization can log in with its official email', r.status === 200);

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
  r = await call('DELETE', '/users/me', { password: 'resetpass789' }, token);
  check('delete account works', r.status === 200);
  r = await call('POST', '/auth/login', { identifier: phone, password: 'resetpass789' });
  check('deleted account cannot log in', r.status === 401);
  r = await call('POST', '/auth/signup/request-otp', { phone });
  check('the deleted phone number can be registered again', r.status === 200);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('\nCould not reach the server. Is it running (npm run dev)?\n', e.message);
  process.exit(1);
});
