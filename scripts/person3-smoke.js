/**
 * Person 3 smoke test. Uses the mock payment provider and an in-memory MongoDB.
 *
 *   npm run smoke:person3
 *
 * Optional: SMOKE_MONGO_URI=mongodb://127.0.0.1:27017/lewegene_person3_smoke
 * to use a local server instead of mongodb-memory-server.
 */
require('dotenv').config();

process.env.PAYMENT_PROVIDER = 'mock';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'person3-smoke-secret';
process.env.DISABLE_RATE_LIMIT = 'true';

const mongoose = require('mongoose');

function assert(condition, message) {
  if (!condition) {
    const error = new Error(message);
    error.name = 'SmokeAssertion';
    throw error;
  }
  console.log('ok -', message);
}

async function startMongo() {
  if (process.env.SMOKE_MONGO_URI) {
    await mongoose.connect(process.env.SMOKE_MONGO_URI);
    const name = mongoose.connection.name || '';
    if (!/smoke/i.test(name)) {
      throw new Error('SMOKE_MONGO_URI must point at a database whose name includes "smoke"');
    }
    await mongoose.connection.dropDatabase();
    return async function stop() {
      await mongoose.disconnect();
    };
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  return async function stop() {
    await mongoose.disconnect();
    await mongod.stop();
  };
}

async function main() {
  const stopMongo = await startMongo();
  require('../src/models').ensureCampaignModel();

  const app = require('../src/app');
  const donationService = require('../src/services/donation.service');
  const searchService = require('../src/services/search.service');
  const reportService = require('../src/services/report.service');
  const { serializeDonation } = require('../src/utils/donationSerializer');
  const { signWebhook } = require('../src/services/payment/mockProvider');

  const Campaign = mongoose.model('Campaign');
  const Donation = mongoose.model('Donation');

  const ownerId = new mongoose.Types.ObjectId();
  const donorId = new mongoose.Types.ObjectId();
  const otherId = new mongoose.Types.ObjectId();
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const campaign = await Campaign.create({
    title: 'Clean Water for Person3',
    story: 'A well for the village',
    location: 'Addis Ababa',
    goalAmount: 1000,
    raisedAmount: 0,
    deadline,
    status: 'published',
    verificationStatus: 'verified',
    owner: ownerId,
  });

  await Campaign.create({
    title: 'Secret Draft Water',
    story: 'not public',
    location: 'Addis Ababa',
    goalAmount: 500,
    deadline,
    status: 'draft',
    verificationStatus: 'unverified',
    owner: ownerId,
  });

  const first = await donationService.initializeDonation({
    user: { _id: donorId, role: 'user' },
    body: {
      campaignId: String(campaign._id),
      amount: 400,
      identityMode: 'fully_anonymous',
      message: 'For the well',
    },
  });

  assert(first.checkoutUrl && first.txRef && first.donationId, 'initialize returns checkoutUrl, txRef, donationId');

  const paid = await donationService.verifyDonation(first.txRef, { _id: donorId, role: 'user' });
  assert(paid.donation.status === 'paid', 'first verify marks the donation paid');
  assert(paid.donation.receiptNumber && paid.donation.receiptNumber.startsWith('LWG-'), 'receipt number allocated');
  assert(paid.alreadyProcessed === false, 'first verify is not a replay');

  const replay = await donationService.verifyDonation(first.txRef, { _id: donorId, role: 'user' });
  assert(replay.alreadyProcessed === true, 'second verify is idempotent');
  assert(replay.donation.receiptNumber === paid.donation.receiptNumber, 'replay keeps the same receipt');

  let stored = await Campaign.findById(campaign._id).lean();
  assert(stored.raisedAmount === 400, 'raisedAmount increased once (400)');
  assert(stored.status === 'published', 'campaign stays published below the goal');

  const server = await new Promise((resolve) => {
    const listener = app.listen(0, () => resolve(listener));
  });
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const raw = JSON.stringify({ txRef: first.txRef, amount: 999999 });
  const bad = await fetch(`${base}/api/payments/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-mock-signature': 'deadbeef' },
    body: raw,
  });
  const badBody = await bad.json();
  assert(bad.status === 401 && badBody.success === false && badBody.error.code === 'INVALID_SIGNATURE', 'webhook rejects a bad signature');

  const good = await fetch(`${base}/api/payments/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-mock-signature': signWebhook(raw) },
    body: raw,
  });
  const goodBody = await good.json();
  assert(good.status === 200 && goodBody.success === true && goodBody.message === 'Already processed', 'webhook replay returns 200 already processed');

  stored = await Campaign.findById(campaign._id).lean();
  assert(stored.raisedAmount === 400, 'webhook replay did not credit the campaign again');

  const rawDoc = await Donation.findById(first.donationId);
  const asPublic = serializeDonation(rawDoc, 'public');
  const asFundraiser = serializeDonation(rawDoc, 'fundraiser', ownerId);
  const asAdmin = serializeDonation(rawDoc, 'admin');
  assert(asPublic.displayName === 'Anonymous' && asPublic.donorId === undefined, 'public view hides a fully anonymous donor');
  assert(asFundraiser.donorId === undefined, 'fundraiser view hides a fully anonymous donor');
  assert(String(asAdmin.donorId) === String(donorId), 'admin view can see a fully anonymous donor');
  assert(!JSON.stringify(asPublic).includes('rawProviderPayload'), 'public payload omits rawProviderPayload');

  const second = await donationService.initializeDonation({
    user: { _id: donorId, role: 'user' },
    body: {
      campaignId: String(campaign._id),
      amount: 600,
      identityMode: 'identified',
      displayName: 'Abebe',
    },
  });
  const finished = await donationService.verifyDonation(second.txRef, { _id: donorId, role: 'user' });
  assert(finished.donation.status === 'paid', 'second donation is paid');
  assert(finished.campaignCompleted === true, 'reaching the goal auto-completes the campaign');

  const anonymousVerify = await donationService.verifyDonation(second.txRef);
  assert(anonymousVerify.donation.donorId === undefined, 'verify without a token hides the donor id');
  assert(anonymousVerify.donation.receiptNumber === undefined, 'verify without a token hides the receipt number');

  const publicAnonymous = serializeDonation({
    _id: new mongoose.Types.ObjectId(),
    campaign: campaign._id,
    donor: donorId,
    amount: 10,
    currency: 'ETB',
    identityMode: 'public_anonymous',
    status: 'paid',
    txRef: 'lwg_test_0123456789abcdef',
  }, 'fundraiser', ownerId);
  assert(
    publicAnonymous.displayName === 'Anonymous' && String(publicAnonymous.donorId) === String(donorId),
    'fundraiser can see a public-anonymous donor'
  );
  const publicAnonymousList = serializeDonation({
    _id: new mongoose.Types.ObjectId(),
    campaign: campaign._id,
    donor: donorId,
    amount: 10,
    currency: 'ETB',
    identityMode: 'public_anonymous',
    status: 'paid',
  }, 'public');
  assert(
    publicAnonymousList.displayName === 'Anonymous' && publicAnonymousList.donorId === undefined,
    'public list hides a public-anonymous donor id'
  );

  stored = await Campaign.findById(campaign._id).lean();
  assert(stored.raisedAmount === 1000, 'raisedAmount equals the goal after two donations');
  assert(stored.status === 'completed' && stored.completedAt, 'campaign status is completed');

  let blocked = false;
  try {
    await donationService.initializeDonation({
      user: { _id: donorId, role: 'user' },
      body: {
        campaignId: String(campaign._id),
        amount: 50,
        identityMode: 'public_anonymous',
      },
    });
  } catch (err) {
    blocked = err.code === 'CAMPAIGN_NOT_DONATABLE';
  }
  assert(blocked, 'completed campaign rejects another donation');

  const found = await searchService.searchCampaigns({
    q: 'Water',
    location: 'Addis Ababa',
    verification: 'verified',
    sort: 'newest',
    page: 1,
    limit: 12,
  });
  assert(found.items.length === 1, 'search returns the public campaign and not the draft');
  assert(found.items[0].title === 'Clean Water for Person3', 'search matched the title');
  assert(found.pagination.total === 1 && found.pagination.hasNext === false, 'search pagination shape');
  const leaked = Object.keys(found.items[0]).some((key) => /payout|beneficiary|phone/i.test(key));
  assert(!leaked, 'search items omit payout and beneficiary fields');

  const progress = await searchService.searchCampaigns({ sort: 'progress', page: 1, limit: 12 });
  assert(progress.items.some((item) => item.id === String(campaign._id)), 'progress sort includes the completed campaign');

  const listed = await donationService.listCampaignDonations(
    String(campaign._id),
    { page: 1, limit: 12 },
    { _id: ownerId, role: 'user' }
  );
  const hidden = listed.items.find((item) => item.identityMode === 'fully_anonymous');
  const named = listed.items.find((item) => item.identityMode === 'identified');
  assert(hidden && hidden.donorId === undefined && hidden.displayName === 'Anonymous', 'donor list hides fully anonymous donors from the fundraiser');
  assert(named && named.displayName === 'Abebe' && String(named.donorId) === String(donorId), 'fundraiser can see an identified donor');

  const receipt = await donationService.getReceipt(String(first.donationId), { _id: donorId, role: 'user' });
  assert(receipt.receiptNumber === paid.donation.receiptNumber, 'donor can open a fully anonymous receipt');

  let forbidden = false;
  try {
    await donationService.getReceipt(String(first.donationId), { _id: otherId, role: 'user' });
  } catch (err) {
    forbidden = err.code === 'FORBIDDEN';
  }
  assert(forbidden, 'another user cannot open the receipt');

  const report = await reportService.createReport({
    user: { _id: donorId, role: 'user' },
    body: {
      targetType: 'campaign',
      targetId: String(campaign._id),
      reason: 'misleading',
      details: 'Please review this story',
    },
  });
  assert(report.status === 'open', 'report is filed');

  let duplicate = false;
  try {
    await reportService.createReport({
      user: { _id: donorId, role: 'user' },
      body: {
        targetType: 'campaign',
        targetId: String(campaign._id),
        reason: 'fraud',
      },
    });
  } catch (err) {
    duplicate = err.code === 'DUPLICATE_REPORT';
  }
  assert(duplicate, 'duplicate open report is rejected');

  let selfReport = false;
  try {
    await reportService.createReport({
      user: { _id: donorId, role: 'user' },
      body: { targetType: 'user', targetId: String(donorId), reason: 'other' },
    });
  } catch (err) {
    selfReport = err.code === 'SELF_REPORT';
  }
  assert(selfReport, 'users cannot report themselves');

  const donationReport = await reportService.createReport({
    user: { _id: donorId, role: 'user' },
    body: {
      targetType: 'donation',
      targetId: String(first.donationId),
      reason: 'payment_issue',
    },
  });
  assert(donationReport.targetType === 'donation', 'donor can report their own donation');

  let stranger = false;
  try {
    await reportService.createReport({
      user: { _id: otherId, role: 'user' },
      body: {
        targetType: 'donation',
        targetId: String(second.donationId),
        reason: 'payment_issue',
      },
    });
  } catch (err) {
    stranger = err.code === 'FORBIDDEN';
  }
  assert(stranger, 'only the donor can report a donation');

  const updated = await reportService.updateReportStatus(report.id, {
    status: 'resolved',
    adminNote: 'Checked',
    adminId: String(ownerId),
  });
  assert(updated.status === 'resolved' && updated.resolvedBy === String(ownerId), 'Person 4 status helper updates a report');

  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await stopMongo();
  console.log('person3 smoke passed');
}

main().catch(async (err) => {
  console.error('person3 smoke failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // already closed
  }
  process.exit(1);
});
