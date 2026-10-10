"use strict";

const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const {
  accountNumberMatches,
  verifyDonationReceipt,
} = require("../src/services/LinkEt");

// Fake test data
const fakeExpectedAccount = "1000111122223";
const fakeHolder = "ABEBE KEBEDE";

// ------------------------------------------------------------
// Phase D: Required unit test cases for accountNumberMatches
// ------------------------------------------------------------

test("1. exact unmasked equal -> true", () => {
  assert.equal(
    accountNumberMatches(fakeExpectedAccount, fakeExpectedAccount, "cbe"),
    true
  );
});

test("2. unmasked, different number -> false", () => {
  assert.equal(
    accountNumberMatches("1000111122224", fakeExpectedAccount, "cbe"),
    false
  );
});

test("3. masked '1********2223' with name 'ABEBE KEBEDE' -> true", () => {
  assert.equal(
    accountNumberMatches("1********2223", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    true
  );
});

test("4. same mask, different name -> false", () => {
  assert.equal(
    accountNumberMatches("1********2223", fakeExpectedAccount, "cbe", {
      receiptName: "CHALA BIKILA",
      expectedName: fakeHolder,
    }),
    false
  );
});

test("5. same mask, name missing -> false", () => {
  assert.equal(
    accountNumberMatches("1********2223", fakeExpectedAccount, "cbe", {
      receiptName: "",
      expectedName: fakeHolder,
    }),
    false
  );
  assert.equal(
    accountNumberMatches("1********2223", fakeExpectedAccount, "cbe", {}),
    false
  );
});

test("6. masked, wrong suffix -> false", () => {
  assert.equal(
    accountNumberMatches("1********9999", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("7. masked, wrong prefix -> false", () => {
  assert.equal(
    accountNumberMatches("2********2223", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("8. masked, wrong length -> false", () => {
  assert.equal(
    accountNumberMatches("1*******2223", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("9. visible digits fewer than 4 (e.g. '*********..23') -> false", () => {
  assert.equal(
    accountNumberMatches("*********..23", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
  assert.equal(
    accountNumberMatches("1*******23", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("10. all asterisks or empty receiver account -> false", () => {
  assert.equal(
    accountNumberMatches("*************", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
  assert.equal(
    accountNumberMatches("", fakeExpectedAccount, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("11. missing expected account -> false", () => {
  assert.equal(
    accountNumberMatches("1********2223", null, "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
  assert.equal(
    accountNumberMatches("1********2223", "", "cbe", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("12. telebirr phone formats 0910119336, +251910119336, 251910119336 compare equal -> true; masked telebirr -> false", () => {
  assert.equal(
    accountNumberMatches("0910119336", "251910119336", "telebirr"),
    true
  );
  assert.equal(
    accountNumberMatches("+251910119336", "0910119336", "telebirr"),
    true
  );
  assert.equal(
    accountNumberMatches("251910119336", "0910119336", "telebirr"),
    true
  );
  assert.equal(
    accountNumberMatches("09****9336", "0910119336", "telebirr", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

test("13. masked receipt but provider not 'cbe' -> false", () => {
  assert.equal(
    accountNumberMatches("1********2223", fakeExpectedAccount, "boa", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
  assert.equal(
    accountNumberMatches("1********2223", fakeExpectedAccount, "zemen", {
      receiptName: fakeHolder,
      expectedName: fakeHolder,
    }),
    false
  );
});

// ------------------------------------------------------------
// Phase D: Integration tests for verifyDonationReceipt
// ------------------------------------------------------------

let originalFetch;
let originalApiKey;
let originalBaseUrl;

beforeEach(() => {
  originalFetch = global.fetch;
  originalApiKey = process.env.LINKS_ET_API_KEY;
  originalBaseUrl = process.env.LINKS_ET_URL;
  process.env.LINKS_ET_API_KEY = "test-api-key";
  process.env.LINKS_ET_URL = "https://links.et";
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.LINKS_ET_API_KEY;
  } else {
    process.env.LINKS_ET_API_KEY = originalApiKey;
  }
  if (originalBaseUrl === undefined) {
    delete process.env.LINKS_ET_URL;
  } else {
    process.env.LINKS_ET_URL = originalBaseUrl;
  }
});

const mockReceiptResponse = (receipt) => {
  global.fetch = async () =>
    new Response(JSON.stringify({ ok: true, receipt }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
};

const fakeCbePayoutAccount = {
  bankId: "bank_cbe",
  bankName: "Commercial Bank of Ethiopia",
  accountNumber: fakeExpectedAccount,
  accountName: fakeHolder,
};

test("integration: valid masked + matching name -> resolves with provider 'cbe', amount 5, receiptKey 'cbe:<REFERENCE UPPERCASED>'", async () => {
  mockReceiptResponse({
    source: "mb-json",
    reference: "txref12345",
    transferredAmount: 5,
    currency: "ETB",
    receiverName: fakeHolder,
    receiverAccount: "1********2223",
  });

  const result = await verifyDonationReceipt(
    "https://mbreciept.cbe.com.et/receipt/test1",
    fakeCbePayoutAccount
  );

  assert.deepEqual(result, {
    provider: "cbe",
    amount: 5,
    receiptKey: "cbe:TXREF12345",
  });
});

test("integration: wrong name -> rejects with code wrong_receiver_account", async () => {
  mockReceiptResponse({
    source: "mb-json",
    reference: "txref12345",
    transferredAmount: 5,
    currency: "ETB",
    receiverName: "CHALA BIKILA",
    receiverAccount: "1********2223",
  });

  await assert.rejects(
    verifyDonationReceipt(
      "https://mbreciept.cbe.com.et/receipt/test2",
      fakeCbePayoutAccount
    ),
    (err) => err.code === "wrong_receiver_account"
  );
});

test("integration: wrong suffix -> rejects with code wrong_receiver_account", async () => {
  mockReceiptResponse({
    source: "mb-json",
    reference: "txref12345",
    transferredAmount: 5,
    currency: "ETB",
    receiverName: fakeHolder,
    receiverAccount: "1********9999",
  });

  await assert.rejects(
    verifyDonationReceipt(
      "https://mbreciept.cbe.com.et/receipt/test3",
      fakeCbePayoutAccount
    ),
    (err) => err.code === "wrong_receiver_account"
  );
});

test("integration: non-ETB currency -> rejects with unsupported_currency", async () => {
  mockReceiptResponse({
    source: "mb-json",
    reference: "txref12345",
    transferredAmount: 5,
    currency: "USD",
    receiverName: fakeHolder,
    receiverAccount: "1********2223",
  });

  await assert.rejects(
    verifyDonationReceipt(
      "https://mbreciept.cbe.com.et/receipt/test4",
      fakeCbePayoutAccount
    ),
    (err) => err.code === "unsupported_currency"
  );
});

test("integration: payout account of another provider -> rejects with wrong_provider", async () => {
  mockReceiptResponse({
    source: "mb-json",
    reference: "txref12345",
    transferredAmount: 5,
    currency: "ETB",
    receiverName: fakeHolder,
    receiverAccount: "1********2223",
  });

  const fakeTelebirrPayoutAccount = {
    bankId: "bank_telebirr",
    bankName: "Telebirr",
    accountNumber: "0910119336",
    accountName: fakeHolder,
  };

  await assert.rejects(
    verifyDonationReceipt(
      "https://mbreciept.cbe.com.et/receipt/test5",
      fakeTelebirrPayoutAccount
    ),
    (err) => err.code === "wrong_provider"
  );
});
