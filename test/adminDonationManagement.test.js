const assert = require('node:assert/strict');
const { test } = require('node:test');
const Donation = require('../src/models/Donation');
const controller = require('../src/controllers/adminController');

const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('donation records can only have completed payment status', () => {
  assert.deepEqual(Donation.schema.path('paymentStatus').enumValues, ['completed']);
});

test('admin donation management returns only verified donations and success-only statistics', async () => {
  const filters = [];
  const donation = {
    _id: 'donation-1',
    campaignId: { _id: 'campaign-1', title: 'Campaign' },
    amount: 250,
    donorName: 'Donor',
    paymentStatus: 'completed',
    receiptKey: 'telebirr:REF123',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };
  const query = {
    populate() { return this; },
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => [donation],
  };

  Donation.find = (filter) => {
    filters.push(filter);
    return query;
  };
  Donation.countDocuments = async (filter) => {
    filters.push(filter);
    return 1;
  };

  const response = makeResponse();
  await controller.getAdminDonations({ query: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(filters.length, 3);
  assert.ok(filters.every((filter) => filter.paymentStatus === 'completed'));
  assert.equal(response.body.donations[0].paymentStatus, 'successful');
  assert.equal(response.body.donations[0].paymentVerificationStatus, 'verified');
  assert.deepEqual(response.body.summary, {
    totalDonations: 1,
    successfulDonations: 1,
    totalDonatedAmount: 250,
  });
  assert.deepEqual(response.body.totals, {
    totalNumberOfDonations: 1,
    totalSuccessfulDonations: 1,
    totalDonatedAmount: 250,
  });
});

test('admin donation status filters reject pending and failed workflows', async () => {
  for (const status of ['pending', 'failed', 'processing']) {
    const response = makeResponse();
    await controller.getAdminDonations({ query: { status } }, response);
    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /successfully verified/);
  }
});
