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

test('verifies a completed telebirr payment against the exact registered destination', async () => {
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

test('rejects the right recipient name with a different receiving account', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: '251912340000',
    transactionStatus: 'Completed',
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
    (error) => error.code === 'wrong_receiver_account' && error.status === 422
  );
});

test('rejects masked account numbers because the exact destination cannot be confirmed', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: '251*********',
    transactionStatus: 'Completed',
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
    (error) => error.code === 'wrong_receiver_account' && error.status === 422
  );
});

test('rejects receipts whose provider does not match the campaign payout account', async () => {
  mockVerifiedReceipt({
    source: 'zemen-pdf',
    reference: 'REF123',
    settledAmount: 250,
    currency: 'ETB',
    recipientName: 'Lewegene Charity',
    recipientAccount: payoutAccount.accountNumber,
    transactionStatus: 'COMPLETED',
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://share.zemenbank.com/rt/receipt/pdf', payoutAccount),
    (error) => error.code === 'wrong_provider' && error.status === 422
  );
});

test('accepts supported bank formats only when status and destination fields are explicit', async () => {
  const cases = [
    {
      url: 'https://share.zemenbank.com/rt/receipt/pdf',
      account: { bankId: 'zemen', bankName: 'Zemen Bank', accountNumber: '1730000123', accountName: 'Lewegene Charity' },
      receipt: {
        source: 'zemen-pdf',
        reference: 'ZEM123',
        settledAmount: 250,
        currency: 'ETB',
        recipientName: 'Lewegene Charity',
        recipientAccount: '1730000123',
        transactionStatus: 'COMPLETED',
      },
      expected: { provider: 'zemen', amount: 250, receiptKey: 'zemen:ZEM123' },
    },
    {
      url: 'https://cs.bankofabyssinia.com/slip/receipt',
      account: { bankId: 'boa', bankName: 'Bank of Abyssinia', accountNumber: '1000123456', accountName: 'Lewegene Charity' },
      receipt: {
        source: 'boa-json',
        transactionReference: 'BOA123',
        transferredAmount: 250,
        currency: 'ETB',
        receiverName: 'Lewegene Charity',
        receiverAccount: '1000123456',
        upstreamStatus: 'Success',
      },
      expected: { provider: 'boa', amount: 250, receiptKey: 'boa:BOA123' },
    },
  ];

  for (const item of cases) {
    mockVerifiedReceipt(item.receipt);
    assert.deepEqual(
      await linksEt.verifyDonationReceipt(item.url, item.account),
      item.expected
    );
  }
});

test('rejects CBE receipts that do not provide explicit completed-payment evidence', async () => {
  mockVerifiedReceipt({
    source: 'cbe-pdf',
    reference: 'CBE123',
    transferredAmount: 250,
    currency: 'ETB',
    receiverName: 'Lewegene Charity',
    receiverAccount: payoutAccount.accountNumber,
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://apps.cbe.com.et/receipt.pdf', {
      bankId: 'cbe',
      bankName: 'CBE',
      accountNumber: payoutAccount.accountNumber,
      accountName: payoutAccount.accountName,
    }),
    (error) => error.code === 'payment_status_unconfirmed' && error.status === 422
  );
});

test('rejects Awash receipts without explicit completed-payment status', async () => {
  mockVerifiedReceipt({
    source: 'awash-html',
    transaction: {
      transactionId: 'AWASH123',
      amount: '250 ETB',
      beneficiaryName: 'Lewegene Charity',
      beneficiaryAccount: payoutAccount.accountNumber,
      beneficiaryBank: 'Telebirr',
    },
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://awashpay.awashbank.com/receipt/123', payoutAccount),
    (error) => error.code === 'payment_status_unconfirmed' && error.status === 422
  );
});

test('requires Links.et base URL configuration rather than falling back to a source URL', async () => {
  delete process.env.LINKS_ET_URL;
  global.fetch = async () => {
    throw new Error('fetch must not run without configuration');
  };

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
    (error) => error.code === 'not_configured' && error.status === 503
  );
});

test('rejects holder names that only partially match', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity Other',
    creditedPartyAccountNo: payoutAccount.accountNumber,
    transactionStatus: 'Completed',
  });

  await assert.rejects(
    linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
    (error) => error.code === 'wrong_receiver' && error.status === 422
  );
});
