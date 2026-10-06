// Start the API, then run: node scripts/smoke-test.js
// Set GOOGLE_TEST_ID_TOKEN to test a real Google sign-in against a test account.

const BASE = process.env.API_URL || 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

const check = (name, ok, details = '') => {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${details ? `: ${details}` : ''}`);
  }
};

const call = async (method, path, body, token) => {
  const response = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try {
    json = await response.json();
  } catch {}
  return { status: response.status, json };
};

(async () => {
  let response = await call('POST', '/auth/google', {});
  check('Google sign-in requires an ID token (400)', response.status === 400);

  for (const path of ['/auth/signup/request-otp', '/auth/signup', '/auth/login']) {
    response = await call('POST', path, {});
    check(`${path} is no longer available (404)`, response.status === 404);
  }

  response = await call('POST', '/organizations/signup', {});
  check('organization registration requires Google authentication (401)', response.status === 401);

  response = await call('GET', '/auth/me');
  check('current-user endpoint requires authentication (401)', response.status === 401);

  if (process.env.GOOGLE_TEST_ID_TOKEN) {
    response = await call('POST', '/auth/google', {
      credential: process.env.GOOGLE_TEST_ID_TOKEN,
    });
    check('verified Google credential signs in (200)', response.status === 200, JSON.stringify(response.json));

    const token = response.json.data?.token;
    check('Google sign-in returns an API token', Boolean(token));
    if (token) {
      response = await call('GET', '/auth/me', undefined, token);
      check('Google sign-in token loads the current user (200)', response.status === 200);
      check('Google-created account has a verified email', response.json.data?.user?.emailVerified === true);
    }
  } else {
    console.log('  SKIP  Real Google sign-in (set GOOGLE_TEST_ID_TOKEN to test it)');
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error('\nCould not reach the API. Is the server running?\n', error.message);
  process.exit(1);
});
