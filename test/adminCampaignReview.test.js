const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const Campaign = require('../src/models/Campaign');

const campaignId = '507f1f77bcf86cd799439011';
const campaign = {
  _id: campaignId,
  title: 'Community project',
  status: 'pending',
  raisedAmount: 750,
  donationsCount: 3,
  __v: 4,
  fundraiserData: {},
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
let updateOperation;
let updatedCampaign;
let controller;

beforeEach(() => {
  updateFilter = null;
  updateOperation = null;
  updatedCampaign = { ...campaign, toObject() { return { ...this }; } };
  Campaign.findById = async () => ({ ...campaign });
  Campaign.findOneAndUpdate = async (filter, update) => {
    updateFilter = filter;
    updateOperation = update;
    return updatedCampaign;
  };
  controller = require('../src/controllers/adminController');
});

test('admin approval uses the reviewed campaign version and preserves donation totals', async () => {
  const response = makeResponse();

  await controller.approveCampaign({ params: { id: campaignId }, body: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(updateFilter, { _id: campaignId, __v: 4 });
  assert.deepEqual(updateOperation, { $set: { status: 'approved' }, $inc: { __v: 1 } });
  assert.equal(campaign.raisedAmount, 750);
  assert.equal(campaign.donationsCount, 3);
});

test('admin review returns a conflict if the campaign changed after it was loaded', async () => {
  Campaign.findOneAndUpdate = async () => null;
  const response = makeResponse();

  await controller.approveCampaign({ params: { id: campaignId }, body: {} }, response);

  assert.equal(response.statusCode, 409);
  assert.match(response.body.message, /changed while it was being reviewed/i);
});

test('admin review details include the latest deadline, images, beneficiary, documents, and payout details', async () => {
  Campaign.findById = () => ({
    lean: async () => ({
      ...campaign,
      imageUrl: 'campaign-cover.jpg',
      organizationName: 'Community Group',
      payoutAccounts: [{
        bankName: 'CBE',
        accountNumber: '1234567890',
        accountName: 'Group Account',
      }],
      fundraiserData: {
        beneficiaryType: 'friend_family',
        beneficiary: {
          name: 'A beneficiary',
          phone: '+251911111111',
          info: 'Updated beneficiary details',
        },
        deadline: '2027-05-01',
        images: ['campaign-1.jpg', 'campaign-2.jpg'],
        documents: [{ fileName: 'support-letter.pdf', kind: 'supporting_letter' }],
      },
    }),
  });
  const response = makeResponse();

  await controller.getCampaignReview({ params: { id: campaignId } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deadline, '2027-05-01');
  assert.deepEqual(response.body.images, ['campaign-1.jpg', 'campaign-2.jpg']);
  assert.deepEqual(response.body.beneficiary, {
    name: 'A beneficiary',
    relation: 'friend_family',
    phone: '+251911111111',
    info: 'Updated beneficiary details',
  });
  assert.deepEqual(response.body.documents, [{
    name: 'support-letter.pdf',
    kind: 'supporting_letter',
  }]);
  assert.equal(response.body.receiving.accountNumber, '1234567890');
});
