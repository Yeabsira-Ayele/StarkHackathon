// Verifies payment receipts through links.et (https://links.et/agents.md).
// The donor pays by telebirr / CBE / etc. and submits the receipt link;
// we ask links.et to fetch the receipt from the bank and check it.
//
// Never log or return the receipt URL: it is a lookup key for someone's
// transaction and links.et asks integrators to treat it like a credential.

// Only providers whose receipt fields are documented are accepted for now.
const ALLOWED_HOSTS = new Set([
  "transactioninfo.ethiotelecom.et", // telebirr
  "apps.cbe.com.et", // CBE (PDF)
  "mb.cbe.com.et", // CBE (JSON)
  "mbreciept.cbe.com.et", // CBE (JSON)
  "share.zemenbank.com", // Zemen
  "cs.bankofabyssinia.com", // Bank of Abyssinia
  "awashpay.awashbank.com", // Awash
]);

const SUPPORTED_LABEL = "telebirr, CBE, Zemen Bank, Bank of Abyssinia and Awash Bank";

class VerificationError extends Error {
  constructor(message, status = 422, code = "verification_failed") {
    super(message);
    this.name = "VerificationError";
    this.status = status;
    this.code = code;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------- helpers

// Amounts arrive as numbers (CBE, Zemen, BoA) or strings like "100 Birr" / "1,000.50 ETB".
const parseAmount = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
};

const normalizeName = (name) =>
  String(name || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

const receiverMatches = (receiverName, expectedReceiverName) => {
  const expected = normalizeName(expectedReceiverName);
  const actual = normalizeName(receiverName);
  return Boolean(expected && actual && actual === expected);
};

const payoutProvider = (account) => {
  const bank = `${account.bankId || ""} ${account.bankName || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (bank.includes("telebirr") || bank.includes("ethiotelecom")) return "telebirr";
  if (bank.includes("zemen")) return "zemen";
  if (bank.includes("abyssinia") || bank.includes("boa")) return "boa";
  if (bank.includes("awash")) return "awash";
  if (bank.includes("cbe") || bank.includes("commercialbankofethiopia")) return "cbe";
  return null;
};

const accountNumberMatches = (receiptAccount, expectedAccountNumber) => {
  const actual = String(receiptAccount || "")
    .replace(/[xX•●]/g, "*")
    .replace(/[^\d*]/g, "");
  const expected = String(expectedAccountNumber || "").replace(/\D/g, "");
  if (!actual || !expected || actual.length !== expected.length) return false;

  let visibleDigits = 0;
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] === "*") continue;
    visibleDigits += 1;
    if (actual[index] !== expected[index]) return false;
  }
  return visibleDigits >= 6;
};

// ------------------------------------------------------------- validation

const validateReceiptUrl = (raw) => {
  let url;
  try {
    url = new URL(String(raw).trim());
  } catch {
    throw new VerificationError("The receipt link is not a valid URL", 400, "invalid_receipt_url");
  }

  if (!["https:", "http:"].includes(url.protocol) || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new VerificationError(
      `Unsupported receipt link. Supported: ${SUPPORTED_LABEL}.`,
      400,
      "unsupported_provider"
    );
  }

  return url.toString();
};

// -------------------------------------------------------- links.et calls

const linksFetch = async (path, init = {}, deadline) => {
  const key = process.env.LINKS_ET_API_KEY;
  const base = (process.env.LINKS_ET_URL || "https://links.et").replace(/\/+$/, "");

  try {
    return await fetch(base + path, {
      ...init,
      headers: { "x-api-key": key, "content-type": "application/json" },
      signal: AbortSignal.timeout(Math.min(35000, Math.max(1, deadline - Date.now()))),
    });
  } catch (err) {
    console.error("[links.et] request failed:", err.name);
    throw new VerificationError(
      "Could not reach the verification service. Please try again.",
      503,
      "service_unreachable"
    );
  }
};

const readJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const errorCode = (data) =>
  data && typeof data.error === "object" && data.error ? data.error.code : undefined;

// One verification attempt. Uses waitMs so we never hold a request for
// over a minute; on 202 we poll the status URL until it resolves.
const attempt = async (url, deadline) => {
  let res = await linksFetch("/api/verify", {
    method: "POST",
    body: JSON.stringify({ url, waitMs: 20000 }),
  }, deadline);
  let data = await readJson(res);

  if (res.status === 202 && typeof data?.statusUrl === "string" && data.statusUrl.startsWith("/api/verify/")) {
    const statusUrl = data.statusUrl;
    while (Date.now() < deadline) {
      await sleep(Math.min(1500, deadline - Date.now()));
      if (Date.now() >= deadline) break;
      res = await linksFetch(statusUrl, { method: "GET" }, deadline);
      data = await readJson(res);
      if (res.status !== 202 && typeof data?.ok === "boolean") break;
    }
  }

  return { status: res.status, data };
};

const isRetryable = ({ status, data }) =>
  status === 502 || (status === 400 && !errorCode(data));

const fetchReceipt = async (url) => {
  const deadline = Date.now() + 75000;
  let result = await attempt(url, deadline);
  if (isRetryable(result) && Date.now() < deadline - 2000) {
    await sleep(1000 + Math.random() * 1000);
    result = await attempt(url, deadline);
  }
  return result;
};

const throwForFailure = ({ status, data }) => {
  const code = errorCode(data);

  if (status === 401) {
    console.error("[links.et] API key rejected:", code);
    throw new VerificationError("Payment verification is misconfigured. Please contact support.", 503, "not_configured");
  }
  if (status === 429 && code === "rate_limited") {
    throw new VerificationError("Too many verifications right now. Please try again in a minute.", 503, "rate_limited");
  }
  if (status === 429) {
    console.error("[links.et] quota problem:", code);
    throw new VerificationError("Verification is temporarily unavailable. Please try again later.", 503, "quota_exceeded");
  }
  if (status === 503) {
    throw new VerificationError("That bank's receipt service is down right now. Please try again later.", 503, "provider_down");
  }
  if (status === 202) {
    throw new VerificationError("Verification is still processing. Please try again shortly.", 503, "still_processing");
  }
  throw new VerificationError(
    "We could not verify this receipt. Check the link and try again.",
    422,
    "receipt_not_verified"
  );
};

// ------------------------------------------------------ receipt parsing

// Turns each provider's receipt into one shape. Fields per source come from
// https://links.et/docs/verify.md. Always switch on receipt.source.
const normalizeReceipt = (receipt) => {
  switch (receipt?.source) {
    case "telebirr-html":
      return {
        provider: "telebirr",
        reference: receipt.receiptNo,
        amount: parseAmount(receipt.settledAmount), // amount received, without fees
        receiverName: receipt.creditedPartyName,
        receiverAccount: receipt.creditedPartyAccountNo,
        statusOk: /^completed$/i.test(receipt.transactionStatus || ""),
      };

    case "cbe-pdf":
    case "mb-json":
      return {
        provider: "cbe",
        reference: receipt.reference,
        amount: parseAmount(receipt.transferredAmount),
        receiverName: receipt.receiverName,
        receiverAccount: receipt.receiverAccount,
        statusOk: true, // CBE receipts carry no status field
      };

    case "zemen-pdf":
      return {
        provider: "zemen",
        reference: receipt.reference,
        amount: parseAmount(receipt.settledAmount),
        receiverName: receipt.recipientName,
        receiverAccount: receipt.recipientAccount,
        statusOk: /^completed$/i.test(receipt.transactionStatus || ""),
      };

    case "boa-json":
      return {
        provider: "boa",
        reference: receipt.transactionReference,
        amount: parseAmount(receipt.transferredAmount),
        receiverName: receipt.receiverName,
        receiverAccount: receipt.receiverAccount,
        statusOk: /^success/i.test(receipt.upstreamStatus || ""),
      };

    case "awash-html":
      return {
        provider: "awash",
        reference: receipt.transaction?.transactionId,
        amount: parseAmount(receipt.transaction?.amount),
        receiverName: receipt.transaction?.beneficiaryName,
        receiverAccount: receipt.transaction?.beneficiaryAccount,
        statusOk: true,
      };

    default:
      throw new VerificationError(
        `Unsupported receipt type. Supported: ${SUPPORTED_LABEL}.`,
        422,
        "unsupported_provider"
      );
  }
};

// Verifies a receipt URL end to end and returns what we need to record.
const verifyDonationReceipt = async (rawUrl, payoutAccount) => {
  const url = validateReceiptUrl(rawUrl);

  if (!process.env.LINKS_ET_API_KEY) {
    throw new VerificationError(
      "Payment verification is not configured. Set LINKS_ET_API_KEY in the backend environment and restart the backend.",
      503,
      "not_configured"
    );
  }

  const expectedProvider = payoutProvider(payoutAccount || {});
  if (!expectedProvider) {
    throw new VerificationError(
      "Receipt verification is not supported for this campaign payment provider",
      422,
      "unsupported_campaign_bank"
    );
  }
  if (!String(payoutAccount.accountName || "").trim() || !String(payoutAccount.accountNumber || "").trim()) {
    throw new VerificationError(
      "The campaign payment account is missing verification details",
      503,
      "recipient_not_configured"
    );
  }

  const result = await fetchReceipt(url);

  if (result.status !== 200 || result.data?.ok !== true || !result.data?.receipt) {
    throwForFailure(result);
  }

  const n = normalizeReceipt(result.data.receipt);
  const reference = String(n.reference || "").trim().toUpperCase();

  if (!reference) {
    throw new VerificationError("The receipt has no transaction reference", 422, "invalid_receipt");
  }
  if (!n.statusOk) {
    throw new VerificationError("This payment was not completed", 422, "payment_not_completed");
  }
  if (n.amount === null || n.amount <= 0) {
    throw new VerificationError("Could not read a valid amount from the receipt", 422, "invalid_receipt");
  }
  if (n.provider !== expectedProvider) {
    throw new VerificationError(
      "The receipt is from a different payment provider than the selected campaign account",
      422,
      "wrong_provider"
    );
  }
  if (!receiverMatches(n.receiverName, payoutAccount.accountName)) {
    throw new VerificationError(
      "This payment was not sent to our donation account",
      422,
      "wrong_receiver"
    );
  }
  if (!accountNumberMatches(n.receiverAccount, payoutAccount.accountNumber)) {
    throw new VerificationError(
      "The receipt does not confirm the selected campaign payment account",
      422,
      "wrong_receiver_account"
    );
  }

  return {
    provider: n.provider,
    amount: n.amount,
    // Same bank reference can never be counted twice. CBE's two receipt
    // formats share one provider key so they can't be used to bypass this.
    receiptKey: `${n.provider}:${reference}`,
  };
};

module.exports = {
  verifyDonationReceipt,
  validateReceiptUrl,
  normalizeReceipt,
  parseAmount,
  payoutProvider,
  accountNumberMatches,
  VerificationError,
};