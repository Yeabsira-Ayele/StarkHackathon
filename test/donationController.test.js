const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const mongoose = require('mongoose');
const Campaign = require('../src/models/Campaign');
const Donation = require('../src/models/Donation');
const { getPayoutAccountId } = require('../src/services/campaignPayoutAccounts');
const linksEt = require('../src/services/LinkEt');

let verifyReceipt;
let createCalls;
let campaignUpdates;
let existingReceipt;
let session;
let verificationAccount;

linksEt.verifyDonationReceipt = (...args) => verifyReceipt(...args);
const controller = require('../src/controllers/donationController');

const campaignId = '507f1f77bcf86cd799439011';

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

const makeRequest = (body = {}, requestCampaignId = campaignId) => ({
  params: { campaignId: requestCampaignId },
  body: {
    amount: 250,
    receiptUrl: 'https://transactioninfo.ethiotelecom.et/receipt/123',
    bankId: 'telebirr',
    ...body,
  },
  user: { _id: '507f191e810c19729de860ea', name: 'Donor' },
});

beforeEach(() => {
  createCalls = [];
  campaignUpdates = [];
  existingReceipt = null;
  verificationAccount = null;
  session = {
    withTransaction: async (callback) => callback(),
    endSession: async () => {},
  };
  mongoose.startSession = async () => session;

  const campaign = {
    _id: campaignId,
    title: 'Community project',
    creatorName: 'Fundraiser',
    status: 'approved',
    organizationId: null,
    payoutAccounts: [{
      bankId: 'telebirr',
      bankName: 'Telebirr',
      accountNumber: '1234567890',
      accountName: 'Lewegene',
    }],
  };
  Campaign.findById = async () => campaign;
  Campaign.findByIdAndUpdate = async (...args) => {
    campaignUpdates.push(args);
    return campaign;
  };
  Donation.findOne = (filter) => ({
    lean: async () => {
      assert.deepEqual(filter, { receiptKey: 'telebirr:REF123' });
      return existingReceipt;
    },
  });
  Donation.create = async (input, options) => {
    assert.ok(Array.isArray(input));
    createCalls.push({ input: input[0], options });
    return input.map((item) => ({
      ...item,
      _id: '507f191e810c19729de860eb',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    }));
  };
  verifyReceipt = async (_url, payoutAccount) => {
    verificationAccount = payoutAccount;
    return { amount: 250, provider: 'telebirr', receiptKey: 'telebirr:REF123' };
  };
});

test('receipt key is protected by a unique sparse MongoDB index', () => {
  const index = Donation.schema.indexes().find(([keys]) => keys.receiptKey === 1);
  assert.ok(index);
  assert.equal(index[1].unique, true);
  assert.equal(index[1].sparse, true);
});

test('creates a successful donation and updates the campaign in one transaction', async () => {
  let releaseVerification;
  let signalVerificationStarted;
  const verificationStarted = new Promise((resolve) => {
    signalVerificationStarted = resolve;
  });
  let isVerifying = false;
  verifyReceipt = async (_url, payoutAccount) => {
    verificationAccount = payoutAccount;
    isVerifying = true;
    signalVerificationStarted();
    await new Promise((resolve) => { releaseVerification = resolve; });
    isVerifying = false;
    return { amount: 250, provider: 'telebirr', receiptKey: 'telebirr:REF123' };
  };
  Donation.create = async (input, options) => {
    assert.equal(isVerifying, false);
    assert.ok(Array.isArray(input));
    createCalls.push({ input: input[0], options });
    return [{ ...input[0], _id: '507f191e810c19729de860eb', createdAt: new Date('2026-01-01T00:00:00Z') }];
  };

  const response = makeResponse();
  const request = controller.createDonation(makeRequest({ anonymous: true }), response);
  await verificationStarted;
  assert.equal(createCalls.length, 0);
  releaseVerification();
  await request;

  assert.equal(response.statusCode, 201);
  assert.equal(createCalls.length, 1);
  assert.equal(createCalls[0].input.paymentStatus, 'completed');
  assert.equal(createCalls[0].input.amount, 250);
  assert.equal(createCalls[0].input.donorName, 'Anonymous');
  assert.equal(createCalls[0].input.anonymous, true);
  assert.equal(verificationAccount.accountNumber, '1234567890');
  assert.equal(campaignUpdates.length, 1);
  assert.equal(createCalls[0].options.session, session);
  assert.equal(campaignUpdates[0][2].session, session);
});

test('uses the exact selected account when a campaign has multiple accounts at the same bank', async () => {
  const accounts = [
    {
      bankId: 'telebirr',
      bankName: 'Telebirr',
      accountNumber: '1234567890',
      accountName: 'First Account',
    },
    {
      bankId: 'telebirr',
      bankName: 'Telebirr',
      accountNumber: '0987654321',
      accountName: 'Second Account',
    },
  ];
  Campaign.findById = async () => ({
    _id: campaignId,
    title: 'Community project',
    status: 'approved',
    organizationId: null,
    payoutAccounts: accounts,
  });

  const response = makeResponse();
  await controller.createDonation(makeRequest({
    payoutAccountId: getPayoutAccountId(accounts[1]),
    accountNumber: 'attacker-supplied-details-are-ignored',
  }), response);

  assert.equal(response.statusCode, 201);
  assert.equal(verificationAccount.accountNumber, '0987654321');
});

test('rejects an ambiguous legacy bank-only selection when multiple accounts share that bank', async () => {
  Campaign.findById = async () => ({
    _id: campaignId,
    title: 'Community project',
    status: 'approved',
    organizationId: null,
    payoutAccounts: [
      {
        bankId: 'telebirr',
        bankName: 'Telebirr',
        accountNumber: '1234567890',
        accountName: 'First Account',
      },
      {
        bankId: 'telebirr',
        bankName: 'Telebirr',
        accountNumber: '0987654321',
        accountName: 'Second Account',
      },
    ],
  });

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 400);
  assert.equal(verificationAccount, null);
  assert.equal(createCalls.length, 0);
});

test('rejects an account ID that is not registered to the requested campaign', async () => {
  const response = makeResponse();
  await controller.createDonation(makeRequest({ payoutAccountId: 'telebirr:9999999999' }), response);

  assert.equal(response.statusCode, 400);
  assert.equal(verificationAccount, null);
  assert.equal(createCalls.length, 0);
});

test('does not create a donation when Links.et rejects the receipt', async () => {
  verifyReceipt = async () => {
    throw new linksEt.VerificationError('Receipt could not be verified', 422, 'receipt_not_verified');
  };

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 422);
  assert.equal(response.body.code, 'receipt_not_verified');
  assert.equal(createCalls.length, 0);
  assert.equal(campaignUpdates.length, 0);
});

test('does not create a donation when the verified receipt amount does not match', async () => {
  verifyReceipt = async () => ({ amount: 200, provider: 'telebirr', receiptKey: 'telebirr:REF123' });

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 422);
  assert.equal(response.body.code, 'amount_mismatch');
  assert.equal(createCalls.length, 0);
  assert.equal(campaignUpdates.length, 0);
});

test('does not use payout details supplied by the client', async () => {
  const response = makeResponse();
  await controller.createDonation(makeRequest({
    bankId: 'attacker-controlled-account',
    accountNumber: '9999999999',
    accountName: 'Attacker',
  }), response);

  assert.equal(response.statusCode, 400);
  assert.equal(verificationAccount, null);
  assert.equal(createCalls.length, 0);
});

test('a campaign without registered payout accounts cannot accept a donation', async () => {
  Campaign.findById = async () => ({
    _id: campaignId,
    title: 'Hawassa High School STEM textbooks',
    status: 'approved',
    organizationId: null,
    payoutAccounts: [],
  });

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 400);
  assert.equal(verificationAccount, null);
  assert.equal(createCalls.length, 0);
  assert.equal(campaignUpdates.length, 0);
});

test('rejects a receipt already recorded for any campaign', async () => {
  existingReceipt = { _id: 'already-donated', campaignId: 'another-campaign' };

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.code, 'duplicate_receipt');
  assert.equal(createCalls.length, 0);
  assert.equal(campaignUpdates.length, 0);
});

test('the unique receipt index rejects a duplicate racing the pre-check', async () => {
  Donation.create = async () => {
    const error = new Error('duplicate receipt');
    error.code = 11000;
    error.keyPattern = { receiptKey: 1 };
    throw error;
  };

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.code, 'duplicate_receipt');
  assert.equal(campaignUpdates.length, 0);
});

test('does not return success when a campaign total update fails inside the transaction', async () => {
  Campaign.findByIdAndUpdate = async (...args) => {
    campaignUpdates.push(args);
    throw new Error('campaign update failed');
  };

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 500);
  assert.equal(createCalls.length, 1);
  assert.equal(campaignUpdates.length, 1);
  assert.equal(createCalls[0].options.session, campaignUpdates[0][2].session);
});

test('does not create a donation when Links.et is unavailable', async () => {
  verifyReceipt = async () => {
    throw new linksEt.VerificationError('Verification service is unavailable', 503, 'service_unreachable');
  };

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, 'service_unreachable');
  assert.equal(createCalls.length, 0);
  assert.equal(campaignUpdates.length, 0);
});
