const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const Campaign = require('../src/models/Campaign');
const Donation = require('../src/models/Donation');
const Organization = require('../src/models/Organization');

const campaignId = '507f1f77bcf86cd799439011';
const ownerId = '507f191e810c19729de860ea';
const campaign = {
  _id: campaignId,
  creatorUserId: ownerId,
  title: 'Original title',
  story: 'Original story',
  goalAmount: 1000,
  raisedAmount: 750,
  donationsCount: 3,
  status: 'approved',
  __v: 2,
  toObject() {
    return { ...this };
  },
};

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

let updateFilter;
let updateFields;
let updatedCampaign;
let controller;
let donationAggregatePipeline;

beforeEach(() => {
  Object.assign(campaign, {
    title: 'Original title',
    story: 'Original story',
    goalAmount: 1000,
    raisedAmount: 750,
    donationsCount: 3,
    status: 'approved',
    __v: 2,
  });
  updateFilter = null;
  updateFields = null;
  updatedCampaign = { ...campaign };
  donationAggregatePipeline = null;
  Donation.aggregate = async (pipeline) => {
    donationAggregatePipeline = pipeline;
    return [];
  };
  Campaign.findById = async () => campaign;
  Organization.findById = () => ({
    select: async () => null,
  });
  Campaign.findOneAndUpdate = async (filter, updates) => {
    updateFilter = filter;
    updateFields = updates;
    return updatedCampaign;
  };
  controller = require('../src/controllers/campaignController');
});

test('campaign list progress is calculated from completed donation records, not cached totals', async () => {
  const secondCampaignId = '507f1f77bcf86cd799439012';
  const listedCampaigns = [
    { ...campaign, raisedAmount: 9999, donationsCount: 99 },
    { ...campaign, _id: secondCampaignId, goalAmount: 500, raisedAmount: 9999, donationsCount: 99 },
  ];
  const query = {
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => listedCampaigns,
  };
  Campaign.find = () => query;
  Campaign.countDocuments = async () => listedCampaigns.length;
  Donation.aggregate = async (pipeline) => {
    donationAggregatePipeline = pipeline;
    return [
      { _id: campaignId, raisedAmount: 250, donationsCount: 2 },
      { _id: secondCampaignId, raisedAmount: 600, donationsCount: 3 },
    ];
  };
  const response = makeResponse();

  await controller.getCampaigns({ query: {} }, response);

  assert.deepEqual(donationAggregatePipeline[0].$match, {
    campaignId: { $in: listedCampaigns.map((item) => item._id) },
    paymentStatus: 'completed',
  });
  assert.deepEqual(
    response.body.campaigns.map(({ raisedAmount, donationsCount, progress }) => ({ raisedAmount, donationsCount, progress })),
    [
      { raisedAmount: 250, donationsCount: 2, progress: 25 },
      { raisedAmount: 600, donationsCount: 3, progress: 100 },
    ]
  );
});

test('campaign detail progress is calculated from its completed donation records', async () => {
  Campaign.findById = () => ({ lean: async () => ({ ...campaign, raisedAmount: 9999, donationsCount: 99 }) });
  Donation.aggregate = async (pipeline) => {
    donationAggregatePipeline = pipeline;
    return [{ _id: campaignId, raisedAmount: 250, donationsCount: 2 }];
  };
  const response = makeResponse();

  await controller.getCampaignById({ params: { id: campaignId } }, response);

  assert.deepEqual(donationAggregatePipeline[0].$match, {
    campaignId: { $in: [campaignId] },
    paymentStatus: 'completed',
  });
  assert.equal(response.body.raisedAmount, 250);
  assert.equal(response.body.donationsCount, 2);
  assert.equal(response.body.progress, 25);
});

test('owner edits to an approved campaign return it to the pending review queue without changing donation totals', async () => {
  const response = makeResponse();
  await controller.updateCampaign({
    params: { id: campaignId },
    user: { _id: ownerId, role: 'USER' },
    body: { title: 'Updated title' },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(updateFilter.__v, campaign.__v);
  assert.deepEqual(updateFields, { title: 'Updated title', status: 'pending', __v: 3 });
  assert.equal(campaign.raisedAmount, 750);
  assert.equal(campaign.donationsCount, 3);
});

test('owner edits to completed campaigns are re-queued for verification', async () => {
  campaign.status = 'completed';
  const response = makeResponse();

  await controller.updateCampaign({
    params: { id: campaignId },
    user: { _id: ownerId, role: 'USER' },
    body: { goalAmount: 2000 },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(updateFields, { goalAmount: 2000, status: 'pending', __v: 3 });
});

test('unchanged approved campaign data does not remove its verified status', async () => {
  const response = makeResponse();

  await controller.updateCampaign({
    params: { id: campaignId },
    user: { _id: ownerId, role: 'USER' },
    body: { title: 'Original title' },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(updateFields, { title: 'Original title', __v: 3 });
});

test('an edit that races with another campaign update returns a conflict', async () => {
  Campaign.findOneAndUpdate = async () => null;
  const response = makeResponse();

  await controller.updateCampaign({
    params: { id: campaignId },
    user: { _id: ownerId, role: 'USER' },
    body: { title: 'Updated title' },
  }, response);

  assert.equal(response.statusCode, 409);
});

test('editing the beneficiary organization updates campaign ownership details and future payout accounts', async () => {
  const organizationId = '507f191e810c19729de860eb';
  Organization.findById = (id) => {
    assert.equal(String(id), organizationId);
    return {
      select: async () => ({
        _id: organizationId,
        name: 'Verified Community',
        verificationStatus: 'approved',
        payoutAccounts: [{
          bankName: 'CBE',
          accountNumber: '1234567890',
          accountHolderName: 'Community Account',
        }],
      }),
    };
  };
  const response = makeResponse();

  await controller.updateCampaign({
    params: { id: campaignId },
    user: { _id: ownerId, role: 'USER' },
    body: {
      fundraiserData: {
        beneficiaryType: 'community_org',
        organizationId,
        banks: [],
        bank: { bankId: '', accountNumber: '', accountName: '' },
      },
    },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(updateFields.status, 'pending');
  assert.equal(updateFields.organizationId, organizationId);
  assert.equal(updateFields.organizationName, 'Verified Community');
  assert.deepEqual(updateFields.payoutAccounts, [{
    bankId: 'CBE',
    bankName: 'CBE',
    accountNumber: '1234567890',
    accountName: 'Community Account',
  }]);
  assert.equal(campaign.raisedAmount, 750);
  assert.equal(campaign.donationsCount, 3);
});

test('owner cannot save incomplete payout-account details', async () => {
  const response = makeResponse();

  await controller.updateCampaign({
    params: { id: campaignId },
    user: { _id: ownerId, role: 'USER' },
    body: {
      fundraiserData: {
        beneficiaryType: 'myself',
        banks: [{ bankId: 'telebirr', accountNumber: '123', accountName: '' }],
      },
    },
  }, response);

  assert.equal(response.statusCode, 400);
});

test('donation-accounts returns an accountId the donation routes can resolve', async () => {
  const savedCampaign = {
    status: 'approved',
    payoutAccounts: [
      { bankId: 'telebirr', bankName: 'Telebirr', accountNumber: '251912345678', accountName: 'Lewegene Charity' },
      { bankId: 'cbe', bankName: 'CBE', accountNumber: '1000123456789', accountName: 'Lewegene Charity' },
    ],
  };
  Campaign.findById = () => ({ select: () => ({ lean: async () => savedCampaign }) });
  const response = makeResponse();

  await controller.getDonationAccounts({ params: { id: campaignId } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.accounts.map((a) => a.accountId), [
    'telebirr:251912345678',
    'cbe:1000123456789',
  ]);
  // existing fields are unchanged
  assert.equal(response.body.accounts[0].accountNumber, '251912345678');
  assert.equal(response.body.accounts[0].bankId, 'telebirr');
});
