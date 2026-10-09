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

for (const amount of [1, 5, 10, 25, 49, 50, 500]) {
  test(`Links.et verification accepts a completed ${amount} ETB receipt`, async () => {
    mockVerifiedReceipt({
      source: 'telebirr-html',
      receiptNo: `REF${amount}`,
      settledAmount: `${amount} Birr`,
      creditedPartyName: 'Lewegene Charity',
      creditedPartyAccountNo: payoutAccount.accountNumber,
      transactionStatus: 'Completed',
    });

    const result = await linksEt.verifyDonationReceipt(
      'https://transactioninfo.ethiotelecom.et/receipt/123',
      payoutAccount
    );

    assert.equal(result.amount, amount);
  });
}

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

const cbeAccount = {
  bankId: 'cbe',
  bankName: 'CBE',
  accountNumber: payoutAccount.accountNumber,
  accountName: payoutAccount.accountName,
};

// links.et documents no status field for CBE and Awash receipts, so the
// bank-fetched receipt (ok:true + reference + ETB amount + exact account) is the evidence.
for (const [source, url] of [
  ['cbe-pdf', 'https://apps.cbe.com.et/receipt.pdf'],
  ['mb-json', 'https://mb.cbe.com.et/receipt'],
]) {
  test(`accepts a CBE ${source} receipt that has no status field`, async () => {
    mockVerifiedReceipt({
      source,
      reference: 'CBE123',
      transferredAmount: 250,
      currency: 'ETB',
      receiverName: 'Lewegene Charity',
      receiverAccount: payoutAccount.accountNumber,
    });

    assert.deepEqual(await linksEt.verifyDonationReceipt(url, cbeAccount), {
      provider: 'cbe',
      amount: 250,
      receiptKey: 'cbe:CBE123',
    });
  });
}

test('still rejects a CBE receipt with the wrong receiving account or currency', async () => {
  mockVerifiedReceipt({
    source: 'cbe-pdf',
    reference: 'CBE123',
    transferredAmount: 250,
    currency: 'ETB',
    receiverAccount: '1000000000999',
  });
  await assert.rejects(
    linksEt.verifyDonationReceipt('https://apps.cbe.com.et/receipt.pdf', cbeAccount),
    (error) => error.code === 'wrong_receiver_account'
  );

  mockVerifiedReceipt({
    source: 'cbe-pdf',
    reference: 'CBE124',
    transferredAmount: 250,
    currency: 'USD',
    receiverAccount: payoutAccount.accountNumber,
  });
  await assert.rejects(
    linksEt.verifyDonationReceipt('https://apps.cbe.com.et/receipt.pdf', cbeAccount),
    (error) => error.code === 'unsupported_currency'
  );
});

test('accepts an Awash receipt (no status field) paid to the exact destination', async () => {
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

  assert.deepEqual(
    await linksEt.verifyDonationReceipt('https://awashpay.awashbank.com/receipt/123', payoutAccount),
    { provider: 'awash', amount: 250, receiptKey: 'awash:AWASH123' }
  );
});

test('rejects receipts whose status is present but not a success value', async () => {
  for (const status of ['Failed', 'Unsuccessful', 'Incomplete', 'Not completed', 'Pending', 'Reversed']) {
    mockVerifiedReceipt({
      source: 'telebirr-html',
      receiptNo: 'REF123',
      settledAmount: '250 Birr',
      creditedPartyName: 'Lewegene Charity',
      creditedPartyAccountNo: payoutAccount.accountNumber,
      transactionStatus: status,
    });
    await assert.rejects(
      linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
      (error) => error.code === 'payment_status_unconfirmed' && error.status === 422,
      status
    );
  }
});

test('rejects a status-bearing receipt (telebirr) whose status is missing', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: payoutAccount.accountNumber,
  });
  await assert.rejects(
    linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
    (error) => error.code === 'payment_status_unconfirmed'
  );
});

test('rejects a CBE receipt if a status is present and not successful', async () => {
  mockVerifiedReceipt({
    source: 'mb-json',
    reference: 'CBE125',
    transferredAmount: 250,
    currency: 'ETB',
    receiverAccount: payoutAccount.accountNumber,
    status: 'Failed',
  });
  await assert.rejects(
    linksEt.verifyDonationReceipt('https://mb.cbe.com.et/receipt', cbeAccount),
    (error) => error.code === 'payment_status_unconfirmed'
  );
});

test('defaults to the documented Links.et URL when only the API key is configured', async () => {
  delete process.env.LINKS_ET_URL;
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

  assert.equal(requests[0].url, 'https://links.et/api/verify');
  assert.equal(result.amount, 250);
});

test('polls queued Links.et verifications beyond the initial 15 polls', async () => {
  const originalSetTimeout = global.setTimeout;
  const originalReceipt = {
    source: 'telebirr-html',
    receiptNo: 'REF-QUEUED',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: payoutAccount.accountNumber,
    transactionStatus: 'Completed',
  };
  let pollCount = 0;
  const requests = [];
  global.setTimeout = (callback, ...args) => originalSetTimeout(callback, 0, ...args);
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    if (options.method === 'POST') {
      return new Response(JSON.stringify({
        processingStatus: 'queued',
        statusUrl: '/api/verify/request-id',
      }), { status: 202, headers: { 'content-type': 'application/json' } });
    }

    pollCount += 1;
    const stillQueued = pollCount <= 16;
    return new Response(JSON.stringify(stillQueued
      ? { processingStatus: 'queued' }
      : { ok: true, receipt: originalReceipt }), {
      status: stillQueued ? 202 : 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const result = await linksEt.verifyDonationReceipt(
      'https://transactioninfo.ethiotelecom.et/receipt/123',
      payoutAccount
    );
    assert.equal(result.amount, 250);
    assert.equal(pollCount, 17);
    assert.equal(requests.length, 18);
  } finally {
    global.setTimeout = originalSetTimeout;
  }
});

test('accepts the exact destination when the receipt holder name is formatted differently', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF123',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity Other',
    creditedPartyAccountNo: payoutAccount.accountNumber,
    transactionStatus: 'Completed',
  });

  assert.deepEqual(
    await linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
    { provider: 'telebirr', amount: 250, receiptKey: 'telebirr:REF123' }
  );
});

test('accepts telebirr phone numbers written in a different but equivalent format', async () => {
  for (const [saved, shown] of [
    ['0912345678', '251912345678'],
    ['251912345678', '0912345678'],
    ['+251 912 345 678', '912345678'],
  ]) {
    mockVerifiedReceipt({
      source: 'telebirr-html',
      receiptNo: 'REF-PHONE',
      settledAmount: '250 Birr',
      creditedPartyName: 'Lewegene Charity',
      creditedPartyAccountNo: shown,
      transactionStatus: 'Completed',
    });
    const result = await linksEt.verifyDonationReceipt(
      'https://transactioninfo.ethiotelecom.et/receipt/123',
      { ...payoutAccount, accountNumber: saved }
    );
    assert.equal(result.amount, 250);
  }
});

test('phone normalisation never makes a different number match', async () => {
  mockVerifiedReceipt({
    source: 'telebirr-html',
    receiptNo: 'REF-PHONE2',
    settledAmount: '250 Birr',
    creditedPartyName: 'Lewegene Charity',
    creditedPartyAccountNo: '251912345679',
    transactionStatus: 'Completed',
  });
  await assert.rejects(
    linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', {
      ...payoutAccount,
      accountNumber: '0912345678',
    }),
    (error) => error.code === 'wrong_receiver_account'
  );
});

test('logs a safe summary (no full account numbers) when the receiver account mismatches', async () => {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(JSON.stringify(args));
  try {
    mockVerifiedReceipt({
      source: 'telebirr-html',
      receiptNo: 'REF-MASK',
      settledAmount: '250 Birr',
      creditedPartyName: 'Lewegene Charity',
      creditedPartyAccountNo: '2519****5678',
      transactionStatus: 'Completed',
    });
    await assert.rejects(
      linksEt.verifyDonationReceipt('https://transactioninfo.ethiotelecom.et/receipt/123', payoutAccount),
      (error) => error.code === 'wrong_receiver_account'
    );
  } finally {
    console.warn = originalWarn;
  }
  const logged = warnings.join('');
  assert.match(logged, /receiptLooksMasked":true/);
  assert.ok(!logged.includes(payoutAccount.accountNumber));
});
