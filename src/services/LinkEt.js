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
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const receiverMatches = (receiverName) => {
  const expected = (process.env.EXPECTED_RECEIVER_NAME || "")
    .split(",")
    .map(normalizeName)
    .filter(Boolean);

  if (expected.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new VerificationError(
        "Payment verification is not configured",
        503,
        "not_configured"
      );
    }
    console.warn(
      "[links.et] EXPECTED_RECEIVER_NAME is not set: any receipt will be accepted. Set it before going live."
    );
    return true;
  }

  const actual = normalizeName(receiverName);
  if (!actual) return false;
  return expected.some((e) => actual.includes(e) || e.includes(actual));
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

const linksFetch = async (path, init = {}) => {
  const key = process.env.LINKS_ET_API_KEY;
  const base = (process.env.LINKS_ET_URL || "https://links.et").replace(/\/+$/, "");

  try {
    return await fetch(base + path, {
      ...init,
      headers: { "x-api-key": key, "content-type": "application/json" },
      signal: AbortSignal.timeout(35000),
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
const attempt = async (url) => {
  let res = await linksFetch("/api/verify", {
    method: "POST",
    body: JSON.stringify({ url, waitMs: 20000 }),
  });
  let data = await readJson(res);

  if (res.status === 202 && typeof data?.statusUrl === "string" && data.statusUrl.startsWith("/api/verify/")) {
    const statusUrl = data.statusUrl;
    for (let i = 0; i < 15; i++) {
      await sleep(1500);
      res = await linksFetch(statusUrl, { method: "GET" });
      data = await readJson(res);
      if (res.status !== 202 && typeof data?.ok === "boolean") break;
    }
  }

  return { status: res.status, data };
};

const isRetryable = ({ status, data }) =>
  status === 502 || (status === 400 && !errorCode(data));

const fetchReceipt = async (url) => {
  let result = await attempt(url);
  if (isRetryable(result)) {
    await sleep(1000 + Math.random() * 1000);
    result = await attempt(url);
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
  const done = (o) => o;

  switch (receipt?.source) {
    case "telebirr-html":
      return done({
        provider: "telebirr",
        reference: receipt.receiptNo,
        amount: parseAmount(receipt.settledAmount), // amount received, without fees
        receiverName: receipt.creditedPartyName,
        statusOk: /^completed$/i.test(receipt.transactionStatus || ""),
      });

    case "cbe-pdf":
    case "mb-json":
      return done({
        provider: "cbe",
        reference: receipt.reference,
        amount: parseAmount(receipt.transferredAmount),
        receiverName: receipt.receiverName,
        statusOk: true, // CBE receipts carry no status field
      });

    case "zemen-pdf":
      return done({
        provider: "zemen",
        reference: receipt.reference,
        amount: parseAmount(receipt.settledAmount),
        receiverName: receipt.recipientName,
        statusOk: /^completed$/i.test(receipt.transactionStatus || ""),
      });

    case "boa-json":
      return done({
        provider: "boa",
        reference: receipt.transactionReference,
        amount: parseAmount(receipt.transferredAmount),
        receiverName: receipt.receiverName,
        statusOk: /^success/i.test(receipt.upstreamStatus || ""),
      });

    case "awash-html":
      return done({
        provider: "awash",
        reference: receipt.transaction?.transactionId,
        amount: parseAmount(receipt.transaction?.amount),
        receiverName: receipt.transaction?.beneficiaryName,
        statusOk: true,
      });

    default:
      throw new VerificationError(
        `Unsupported receipt type. Supported: ${SUPPORTED_LABEL}.`,
        422,
        "unsupported_provider"
      );
  }
};

// Verifies a receipt URL end to end and returns what we need to record.
const verifyDonationReceipt = async (rawUrl) => {
  const url = validateReceiptUrl(rawUrl);

  if (!process.env.LINKS_ET_API_KEY) {
    throw new VerificationError("Payment verification is not configured", 503, "not_configured");
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
  if (!receiverMatches(n.receiverName)) {
    throw new VerificationError(
      "This payment was not sent to our donation account",
      422,
      "wrong_receiver"
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
  VerificationError,
};