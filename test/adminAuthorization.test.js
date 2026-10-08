const test = require('node:test');
const assert = require('node:assert/strict');
const adminRoutes = require('../src/routes/adminRoutes');
const { requireAuth } = require('../src/middleware/authMiddleware');
const { requireSuperAdmin } = require('../src/middleware/roleMiddleware');

test('admin management API routes require authentication and the SUPER_ADMIN role', () => {
  const protectedRoutes = new Map([
    ['GET /admin/admins', true],
    ['GET /admin/admin-candidates', true],
    ['POST /admin/admins', true],
    ['DELETE /admin/admins/:id', true],
  ]);

  for (const layer of adminRoutes.stack) {
    if (!layer.route) continue;
    const key = `${Object.keys(layer.route.methods).find((method) => layer.route.methods[method]).toUpperCase()} ${layer.route.path}`;
    if (!protectedRoutes.has(key)) continue;

    const handlers = layer.route.stack.map((routeLayer) => routeLayer.handle);
    assert.ok(handlers.indexOf(requireAuth) >= 0, `${key} must require authentication`);
    assert.ok(handlers.indexOf(requireSuperAdmin) > handlers.indexOf(requireAuth), `${key} must require Super Admin after authentication`);
    protectedRoutes.delete(key);
  }

  assert.equal(protectedRoutes.size, 0, `Missing protected routes: ${[...protectedRoutes.keys()].join(', ')}`);
});

test('requireSuperAdmin denies regular admins and users', () => {
  for (const role of ['ADMIN', 'USER', 'ORGANIZATION']) {
    assert.throws(
      () => requireSuperAdmin({ user: { role } }, {}, () => {}),
      (error) => error.status === 403 && error.code === 'FORBIDDEN',
      `${role} must not be authorized`,
    );
  }
});

test('requireSuperAdmin allows a Super Admin', () => {
  let continued = false;
  requireSuperAdmin({ user: { role: 'SUPER_ADMIN' } }, {}, () => { continued = true; });
  assert.equal(continued, true);
});
