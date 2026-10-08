const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const linksEt = require('../src/services/LinkEt');

const payoutAccount = {
  bankId: 'bank_telebirr',
  bankName: 'Telebirr',
  accountNumber: '251912345678',
  accountName: 'Lewegene Charity',
};

let originalFetch;
let originalApiKey;
let originalBaseUrl;

beforeEach(() => {
  originalFetch = global.fetch;
  originalApiKey = process.env.LINKS_ET_API_KEY;
  originalBaseUrl = process.env.LINKS_ET_URL;
  process.env.LINKS_ET_API_KEY = 'test-api-key';
  process.env.LINKS_ET_URL = 'https://links.et';
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.LINKS_ET_API_KEY;
  else process.env.LINKS_ET_API_KEY = originalApiKey;
  if (originalBaseUrl === undefined) delete process.env.LINKS_ET_URL;
  else process.env.LINKS_ET_URL = originalBaseUrl;
});

const mockVerifiedReceipt = (receipt) => {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({ ok: true, receipt }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  return requests;
};

test('verifies Links.et receipt against provider, recipient name, account, and amount', async () => {
  const requests = mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: payoutAccount.accountNumber,
    transactionStatus: 'Completed',
  });

  const result = await linksEt.verifyDonationReceipt(
    'https://transactioninfo.ethiotelecom.et/receipt/123',
    payoutAccount
  );

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://links.et/api/verify');
  assert.equal(requests[0].options.headers['x-api-key'], 'test-api-key');
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    url: 'https://transactioninfo.ethiotelecom.et/receipt/123',
    waitMs: 20000,
  });
  assert.deepEqual(result, {
    provider: 'telebirr',
    amount: 250,
    receiptKey: 'telebirr:REF123',
  });
});

test('rejects a receipt with a different recipient account even when its name matches', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: '251912340000',
    transactionStatus: 'Completed',
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt(
      'https://transactioninfo.ethiotelecom.et/receipt/123',
      payoutAccount
    ),
    (error) => error.code === 'wrong_receiver_account' && error.status === 422
  );
});

test('rejects masked account data when too few digits are exposed to verify it', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: '251*********',
    transactionStatus: 'Completed',
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt(
      'https://transactioninfo.ethiotelecom.et/receipt/123',
      payoutAccount
    ),
    (error) => error.code === 'wrong_receiver_account' && error.status === 422
  );
});

test('rejects a valid receipt from a different provider than the selected campaign account', async () => {
  mockVerifiedReceipt({
    source: 'cbe-pdf',
    reference: 'CBE123',
    transferredAmount: 250,
    receiverName: 'Lewegene Charity',
    receiverAccount: payoutAccount.accountNumber,
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt(
      'https://transactioninfo.ethiotelecom.et/receipt/123',
      payoutAccount
    ),
    (error) => error.code === 'wrong_provider' && error.status === 422
  );
});
