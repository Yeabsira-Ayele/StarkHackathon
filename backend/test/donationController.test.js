const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const mongoose = require('mongoose');
const Campaign = require('../src/models/Campaign');
const Donation = require('../src/models/Donation');
const linksEt = require('../src/services/LinkEt');

let verifyReceipt;
let createCalls;
let campaignUpdates;

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

const makeRequest = (body = {}) => ({
  params: { campaignId },
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
  mongoose.startSession = async () => ({
    withTransaction: async (callback) => callback(),
    endSession: async () => {},
  });
  let campaign = {
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
  Donation.findOne = () => ({ lean: async () => null });
  Donation.create = async (input) => {
    if (Array.isArray(input)) {
      return input.map((item) => {
        createCalls.push(item);
        return {
          ...item,
          _id: '507f1f77bcf86cd799439eb',
          createdAt: new Date('2026-01-01T00:00:00Z'),
        };
      });
    }
    createCalls.push(input);
    return { ...input, _id: '507f191e810c19729de860eb', createdAt: new Date('2026-01-01T00:00:00Z') };
  };
  verifyReceipt = async () => ({
    amount: 250,
    provider: 'telebirr',
    receiptKey: 'telebirr:REF123',
  });
});

test('waits for Links.et and only then creates a completed donation', async () => {
  let releaseVerification;
  let signalVerificationStarted;
  const verificationStarted = new Promise((resolve) => {
    signalVerificationStarted = resolve;
  });
  let isVerifying = false;
  verifyReceipt = async () => {
    isVerifying = true;
    signalVerificationStarted();
    await new Promise((resolve) => { releaseVerification = resolve; });
    isVerifying = false;
    return { amount: 250, provider: 'telebirr', receiptKey: 'telebirr:REF123' };
  };
  Donation.create = async (input) => {
    const donation = Array.isArray(input) ? input[0] : input;
    assert.equal(isVerifying, false);
    createCalls.push(donation);
    return [{ ...donation, _id: '507f1f77bcf86cd799439eb', createdAt: new Date('2026-01-01T00:00:00Z') }];
  };

  const response = makeResponse();
  const request = controller.createDonation(makeRequest({ anonymous: true }), response);
  await verificationStarted;
  assert.equal(createCalls.length, 0);
  releaseVerification();
  await request;

  assert.equal(response.statusCode, 201);
  assert.equal(createCalls.length, 1);
  assert.equal(createCalls[0].paymentStatus, 'completed');
  assert.equal(createCalls[0].amount, 250);
  assert.equal(createCalls[0].donorName, 'Anonymous');
  assert.equal(createCalls[0].anonymous, true);
  assert.equal(campaignUpdates.length, 1);
});

test('does not save a donation when Links.et rejects the receipt', async () => {
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

test('does not save a donation when the verified receipt amount does not match', async () => {
  verifyReceipt = async () => ({
    amount: 200,
    provider: 'telebirr',
    receiptKey: 'telebirr:REF123',
  });

  const response = makeResponse();
  await controller.createDonation(makeRequest(), response);

  assert.equal(response.statusCode, 422);
  assert.equal(response.body.code, 'amount_mismatch');
  assert.equal(createCalls.length, 0);
  assert.equal(campaignUpdates.length, 0);
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
