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

const currencyIsEtb = (amount, currency) => {
  if (typeof amount === "number") return String(currency || "").trim().toUpperCase() === "ETB";
  return typeof amount === "string" && /\b(?:ETB|BIRR)\b/i.test(amount);
};

const payoutProvider = (account) => {
  const bank = `${account?.bankId || ""} ${account?.bankName || ""}`
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
  const actual = String(receiptAccount || "").replace(/\D/g, "");
  const expected = String(expectedAccountNumber || "").replace(/\D/g, "");
  return Boolean(actual && expected && actual === expected);
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
  const configuredBase = process.env.LINKS_ET_URL;
  if (!key || !configuredBase) {
    throw new VerificationError(
      "Payment verification is not configured. Set LINKS_ET_API_KEY and LINKS_ET_URL in the backend environment.",
      503,
      "not_configured"
    );
  }

  let baseUrl;
  try {
    baseUrl = new URL(configuredBase);
  } catch {
    throw new VerificationError("LINKS_ET_URL must be a valid HTTPS URL.", 503, "not_configured");
  }
  if (baseUrl.protocol !== "https:" || baseUrl.pathname !== "/" || baseUrl.search || baseUrl.hash) {
    throw new VerificationError("LINKS_ET_URL must be an HTTPS base URL without a path.", 503, "not_configured");
  }

  try {
    return await fetch(baseUrl.origin + path, {
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

const statusValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "success" : "failed";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "object") {
    for (const key of [
      "transactionStatus",
      "paymentStatus",
      "status",
      "upstreamStatus",
      "settlementStatus",
      "verificationStatus",
      "state",
      "result",
      "transaction",
      "data",
    ]) {
      const nested = statusValue(value[key]);
      if (nested) return nested;
    }
  }
  return "";
};

const isSuccessfulStatus = (value) => {
  const normalized = statusValue(value).toLowerCase();
  if (!normalized) return false;
  return [
    "completed",
    "complete",
    "success",
    "successful",
    "succeeded",
    "paid",
    "settled",
    "confirmed",
    "approved",
  ].some((token) => normalized === token || normalized.includes(token));
};

const extractReceipt = (data) => {
  if (!data || typeof data !== "object") return null;
  if (data.receipt && typeof data.receipt === "object") return data.receipt;

  for (const key of ["receipt", "result", "data", "verification", "details"]) {
    if (data[key] && typeof data[key] === "object") {
      const nested = extractReceipt(data[key]);
      if (nested) return nested;
    }
  }

  if (Array.isArray(data.receipts)) {
    return data.receipts.find((item) => item && typeof item === "object") || null;
  }

  return null;
};

const hasExplicitSuccess = (data) => {
  if (!data || typeof data !== "object") return false;
  if (data.ok === true || data.success === true || data.verified === true) return true;
  const status = statusValue(data).toLowerCase();
  return ["completed", "complete", "success", "successful", "succeeded", "paid", "settled", "confirmed", "approved"].some(
    (token) => status === token || status.includes(token)
  );
};

const errorCode = (data) => {
  const error = data && typeof data === "object" ? data.error ?? data.data?.error ?? data.result?.error : undefined;
  return error && typeof error === "object" ? error.code : undefined;
};

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
      if (res.status !== 202 && (typeof data?.ok === "boolean" || typeof data?.success === "boolean" || hasExplicitSuccess(data))) break;
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
  const receiptStatus = () => {
    const candidates = [
      receipt?.transactionStatus,
      receipt?.paymentStatus,
      receipt?.status,
      receipt?.upstreamStatus,
      receipt?.settlementStatus,
      receipt?.verificationStatus,
      receipt?.state,
      receipt?.transaction?.status,
      receipt?.transaction?.transactionStatus,
      receipt?.data?.status,
    ];

    return candidates.find((candidate) => typeof candidate !== "undefined" && candidate !== null && String(candidate).trim());
  };

  switch (receipt?.source) {
    case "telebirr-html":
      return {
        provider: "telebirr",
        reference: receipt.receiptNo,
        amount: parseAmount(receipt.settledAmount),
        receiverName: receipt.creditedPartyName,
        receiverAccount: receipt.creditedPartyAccountNo,
        destinationProvider: "telebirr",
        currencyOk: currencyIsEtb(receipt.settledAmount),
        statusOk: isSuccessfulStatus(receiptStatus()),
      };

    case "cbe-pdf":
    case "mb-json":
      return {
        provider: "cbe",
        reference: receipt.reference,
        amount: parseAmount(receipt.transferredAmount),
        receiverName: receipt.receiverName,
        receiverAccount: receipt.receiverAccount,
        destinationProvider: "cbe",
        currencyOk: currencyIsEtb(receipt.transferredAmount, receipt.currency),
        statusOk: isSuccessfulStatus(receiptStatus()),
      };

    case "zemen-pdf":
      return {
        provider: "zemen",
        reference: receipt.reference,
        amount: parseAmount(receipt.settledAmount),
        receiverName: receipt.recipientName,
        receiverAccount: receipt.recipientAccount,
        destinationProvider: "zemen",
        currencyOk: currencyIsEtb(receipt.settledAmount, receipt.currency),
        statusOk: isSuccessfulStatus(receiptStatus()),
      };

    case "boa-json":
      return {
        provider: "boa",
        reference: receipt.transactionReference,
        amount: parseAmount(receipt.transferredAmount),
        receiverName: receipt.receiverName,
        receiverAccount: receipt.receiverAccount,
        destinationProvider: "boa",
        currencyOk: currencyIsEtb(receipt.transferredAmount, receipt.currency),
        statusOk: isSuccessfulStatus(receiptStatus()),
      };

    case "awash-html":
      return {
        provider: "awash",
        reference: receipt.transaction?.transactionId,
        amount: parseAmount(receipt.transaction?.amount),
        receiverName: receipt.transaction?.beneficiaryName,
        receiverAccount: receipt.transaction?.beneficiaryAccount,
        destinationProvider: payoutProvider({ bankName: receipt.transaction?.beneficiaryBank }),
        currencyOk: currencyIsEtb(receipt.transaction?.amount),
        statusOk: isSuccessfulStatus(receiptStatus()),
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

  if (!process.env.LINKS_ET_API_KEY || !process.env.LINKS_ET_URL) {
    throw new VerificationError(
      "Payment verification is not configured. Set LINKS_ET_API_KEY and LINKS_ET_URL in the backend environment.",
      503,
      "not_configured"
    );
  }

  const expectedProvider = payoutProvider(payoutAccount);
  if (!expectedProvider) {
    throw new VerificationError(
      "Receipt verification is not supported for this campaign payment provider",
      422,
      "unsupported_campaign_bank"
    );
  }
  if (!String(payoutAccount.accountNumber || "").trim()) {
    throw new VerificationError(
      "The campaign payment account is missing verification details",
      503,
      "recipient_not_configured"
    );
  }

  const result = await fetchReceipt(url);
  const payload = result.data || {};
  const receipt = extractReceipt(payload);

  if (result.status !== 200 || !hasExplicitSuccess(payload) || !receipt) {
    const receiptPreview = receipt ? { source: receipt.source, status: statusValue(receipt) } : null;
    console.info("[links.et] verification response summary", {
      status: result.status,
      hasOk: Boolean(payload?.ok),
      hasSuccess: Boolean(payload?.success),
      receiptPreview,
    });
    throwForFailure(result);
  }

  const n = normalizeReceipt(receipt);
  const reference = String(n.reference || "").trim().toUpperCase();

  if (!reference) {
    throw new VerificationError("The receipt has no transaction reference", 422, "invalid_receipt");
  }
  if (!n.statusOk) {
    throw new VerificationError(
      "Links.et did not provide explicit evidence that this payment completed",
      422,
      "payment_status_unconfirmed"
    );
  }
  if (n.amount === null || n.amount <= 0) {
    throw new VerificationError("Could not read a valid amount from the receipt", 422, "invalid_receipt");
  }
  if (!n.currencyOk) {
    throw new VerificationError("The receipt does not confirm an ETB amount", 422, "unsupported_currency");
  }
  if (n.destinationProvider !== expectedProvider) {
    throw new VerificationError(
      "The receipt is from a different payment provider than the selected campaign account",
      422,
      "wrong_provider"
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