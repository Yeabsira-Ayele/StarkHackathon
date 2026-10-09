
"use strict";

const ALLOWED_HOSTS = new Set([
  "transactioninfo.ethiotelecom.et",
  "apps.cbe.com.et",
  "mb.cbe.com.et",
  "mbreciept.cbe.com.et",
  "share.zemenbank.com",
  "cs.bankofabyssinia.com",
  "awashpay.awashbank.com",
]);

const SUPPORTED_LABEL =
  "Telebirr, CBE, Zemen Bank, Bank of Abyssinia and Awash Bank";

const DEFAULT_LINKS_ET_URL = "https://links.et";
const VERIFICATION_DEADLINE_MS = 175000;
const STATUS_POLL_INTERVAL_MS = 1000;
const STATUS_REQUEST_TIMEOUT_MS = 10000;

const SUCCESS_STATUSES = new Set([
  "completed",
  "complete",
  "success",
  "successful",
  "succeeded",
  "paid",
  "settled",
  "confirmed",
  "approved",
]);

const SOURCES_WITHOUT_STATUS = new Set([
  "cbe-pdf",
  "mb-json",
  "awash-html",
]);

class VerificationError extends Error {
  constructor(message, status = 422, code = "verification_failed") {
    super(message);
    this.name = "VerificationError";
    this.status = status;
    this.code = code;
  }
}

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------
// Amounts and currency

const parseAmount = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const cleaned = value.replace(/,/g, "").trim();
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);

  if (!match) return null;

  const amount = Number(match[0]);
  return Number.isFinite(amount) ? amount : null;
};

const currencyIsEtb = (amount, currency) => {
  if (typeof amount === "number") {
    return String(currency || "").trim().toUpperCase() === "ETB";
  }

  if (typeof amount !== "string") return false;

  return /\b(?:ETB|BIRR)\b/i.test(amount);
};

// ------------------------------------------------------------
// Provider identification

const payoutProvider = (account) => {
  const bank = `${account?.bankId || ""} ${account?.bankName || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (bank.includes("telebirr") || bank.includes("ethiotelecom")) {
    return "telebirr";
  }

  if (bank.includes("zemen")) return "zemen";

  if (bank.includes("abyssinia") || bank === "boa" || bank.includes("bankofabyssinia")) {
    return "boa";
  }

  if (bank.includes("awash")) return "awash";

  if (
    bank === "cbe" ||
    bank.includes("commercialbankofethiopia")
  ) {
    return "cbe";
  }

  return null;
};

const canonicalPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (/^251\d{9}$/.test(digits)) return digits.slice(3);
  if (/^0\d{9}$/.test(digits)) return digits.slice(1);

  return digits;
};

// Never assume a masked account is an exact account number.
// Masked-account verification requires a separate, reliable provider-specific
// strategy. Matching only the last four digits is not sufficient.
const accountNumberMatches = (
  receiptAccount,
  expectedAccountNumber,
  provider
) => {
  if (receiptAccount == null || expectedAccountNumber == null) {
    return false;
  }

  const receiptText = String(receiptAccount).trim();
  const expectedText = String(expectedAccountNumber).trim();

  if (!receiptText || !expectedText) return false;

  if (/[*xX\u2022\u00b7#]/.test(receiptText)) {
    return false;
  }

  let actual = receiptText.replace(/\D/g, "");
  let expected = expectedText.replace(/\D/g, "");

  if (!actual || !expected) return false;

  if (provider === "telebirr") {
    actual = canonicalPhone(actual);
    expected = canonicalPhone(expected);
  }

  return actual === expected;
};

const describeAccountMismatch = (
  receiptAccount,
  expectedAccountNumber
) => {
  const receiptText = String(receiptAccount || "");
  const receiptDigits = receiptText.replace(/\D/g, "");
  const expectedDigits = String(expectedAccountNumber || "").replace(/\D/g, "");

  return {
    receiptMissing: !receiptDigits,
    receiptLooksMasked: /[*xX\u2022\u00b7#]/.test(receiptText),
    receiptDigitCount: receiptDigits.length,
    expectedDigitCount: expectedDigits.length,
    receiptLast4: receiptDigits.slice(-4),
    expectedLast4: expectedDigits.slice(-4),
  };
};

// ------------------------------------------------------------
// Receipt URL validation

const validateReceiptUrl = (raw) => {
  let url;

  try {
    url = new URL(String(raw).trim());
  } catch {
    throw new VerificationError(
      "The receipt link is not a valid URL.",
      400,
      "invalid_receipt_url"
    );
  }

  if (
    url.protocol !== "https:" ||
    !ALLOWED_HOSTS.has(url.hostname) ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new VerificationError(
      `Unsupported receipt link. Supported: ${SUPPORTED_LABEL}.`,
      400,
      "unsupported_provider"
    );
  }

  return url.toString();
};

// ------------------------------------------------------------
// Links.et API requests

const linksFetch = async (path, init = {}, timeoutMs = 35000) => {
  const key = process.env.LINKS_ET_API_KEY;
  const configuredBase =
    process.env.LINKS_ET_URL || DEFAULT_LINKS_ET_URL;

  if (!key) {
    throw new VerificationError(
      "Payment verification is not configured. Set LINKS_ET_API_KEY in the backend environment.",
      503,
      "not_configured"
    );
  }

  let baseUrl;

  try {
    baseUrl = new URL(configuredBase);
  } catch {
    throw new VerificationError(
      "LINKS_ET_URL must be a valid HTTPS URL.",
      503,
      "not_configured"
    );
  }

  if (
    baseUrl.protocol !== "https:" ||
    baseUrl.pathname !== "/" ||
    baseUrl.search ||
    baseUrl.hash ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new VerificationError(
      "LINKS_ET_URL must be an HTTPS base URL without a path.",
      503,
      "not_configured"
    );
  }

  // Restrict API calls to the configured service origin and API paths.
  if (
    !path.startsWith("/api/verify") ||
    path.startsWith("//") ||
    path.includes("://")
  ) {
    throw new VerificationError(
      "Invalid verification service endpoint.",
      500,
      "invalid_internal_endpoint"
    );
  }

  try {
    return await fetch(new URL(path, baseUrl.origin), {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": key,
        ...init.headers,
      },
      signal: AbortSignal.timeout(timeoutMs),
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

  if (typeof value === "boolean") {
    return value ? "success" : "failed";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

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
  const normalized = statusValue(value)
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  return SUCCESS_STATUSES.has(normalized);
};

const extractReceipt = (data) => {
  if (!data || typeof data !== "object") return null;

  if (
    data.receipt &&
    typeof data.receipt === "object" &&
    !Array.isArray(data.receipt)
  ) {
    return data.receipt;
  }

  for (const key of ["result", "data", "verification", "details"]) {
    if (data[key] && typeof data[key] === "object") {
      const nested = extractReceipt(data[key]);
      if (nested) return nested;
    }
  }

  if (Array.isArray(data.receipts)) {
    return (
      data.receipts.find(
        (item) => item && typeof item === "object"
      ) || null
    );
  }

  // Some documented responses return the receipt object directly.
  if (typeof data.source === "string") return data;

  // Legacy CBE PDF responses may not have a source field.
  if (
    data.reference &&
    data.receiverAccount &&
    data.transferredAmount !== undefined
  ) {
    return data;
  }

  return null;
};

const hasExplicitSuccess = (data) => {
  if (!data || typeof data !== "object") return false;

  if (
    data.ok === true ||
    data.success === true ||
    data.verified === true
  ) {
    return true;
  }

  return isSuccessfulStatus(data);
};

const errorCode = (data) => {
  const error =
    data && typeof data === "object"
      ? data.error ?? data.data?.error ?? data.result?.error
      : undefined;

  return error && typeof error === "object"
    ? error.code
    : typeof error === "string"
      ? error
      : undefined;
};

// ------------------------------------------------------------
// Async verification and polling

const attempt = async (url) => {
  const deadline = Date.now() + VERIFICATION_DEADLINE_MS;

  let res = await linksFetch(
    "/api/verify",
    {
      method: "POST",
      body: JSON.stringify({ url, waitMs: 20000 }),
    },
    Math.min(35000, VERIFICATION_DEADLINE_MS)
  );

  let data = await readJson(res);

  while (res.status === 202) {
    if (Date.now() >= deadline) {
      return { status: 202, data };
    }

    const statusUrl = data?.statusUrl;

    if (
      typeof statusUrl !== "string" ||
      !statusUrl.startsWith("/api/verify/")
    ) {
      return { status: 202, data };
    }

    await sleep(
      Math.min(
        STATUS_POLL_INTERVAL_MS,
        Math.max(1, deadline - Date.now())
      )
    );

    res = await linksFetch(
      statusUrl,
      { method: "GET" },
      Math.min(
        STATUS_REQUEST_TIMEOUT_MS,
        Math.max(1, deadline - Date.now())
      )
    );

    data = await readJson(res);
  }

  return { status: res.status, data };
};

const throwForFailure = ({ status, data }) => {
  const code = errorCode(data);

  if (status === 401 || status === 403) {
    console.error("[links.et] authentication rejected:", status, code);

    throw new VerificationError(
      "Payment verification is misconfigured. Please contact support.",
      503,
      "not_configured"
    );
  }

  if (status === 429 && code === "rate_limited") {
    throw new VerificationError(
      "Too many verifications right now. Please try again in a minute.",
      503,
      "rate_limited"
    );
  }

  if (status === 429) {
    console.error("[links.et] quota problem:", code);

    throw new VerificationError(
      "Verification is temporarily unavailable. Please try again later.",
      503,
      "quota_exceeded"
    );
  }

  if (status === 502 || status === 503 || status === 504) {
    throw new VerificationError(
      "The receipt service could not verify this transaction right now. Please try again later.",
      503,
      "provider_down"
    );
  }

  if (status === 202) {
    throw new VerificationError(
      "Verification is still processing. Please try again shortly.",
      503,
      "still_processing"
    );
  }

  throw new VerificationError(
    "We could not verify this receipt. Check the link and try again.",
    422,
    "receipt_not_verified"
  );
};

// ------------------------------------------------------------
// Receipt normalization

const normalizeReceipt = (receipt) => {
  if (!receipt || typeof receipt !== "object") {
    throw new VerificationError(
      "The verification service returned no receipt.",
      422,
      "invalid_receipt"
    );
  }

  const receiptStatus = () => {
    const candidates = [
      receipt.transactionStatus,
      receipt.paymentStatus,
      receipt.status,
      receipt.upstreamStatus,
      receipt.settlementStatus,
      receipt.verificationStatus,
      receipt.state,
      receipt.transaction?.status,
      receipt.transaction?.transactionStatus,
      receipt.data?.status,
    ];

    return candidates.find(
      (candidate) =>
        candidate !== undefined &&
        candidate !== null &&
        String(candidate).trim() !== ""
    );
  };

  const statusConfirmed = () => {
    const status = receiptStatus();

    if (status !== undefined) {
      return isSuccessfulStatus(status);
    }

    return SOURCES_WITHOUT_STATUS.has(receipt.source);
  };

  // CBE PDF receipts may omit source in the documented response.
  const source =
    receipt.source ||
    (
      receipt.reference &&
      receipt.receiverAccount &&
      receipt.transferredAmount !== undefined
        ? "cbe-pdf"
        : ""
    );

  const build = (
    provider,
    reference,
    amountValue,
    receiverName,
    receiverAccount,
    destinationProvider,
    currencyOk
  ) => ({
    provider,
    reference,
    amount: parseAmount(amountValue),
    receiverName,
    receiverAccount,
    destinationProvider,
    currencyOk,
    statusOk: statusConfirmed(),
  });

  switch (source) {
    case "telebirr-html":
      return build(
        "telebirr",
        receipt.receiptNo,
        receipt.settledAmount,
        receipt.creditedPartyName,
        receipt.creditedPartyAccountNo,
        "telebirr",
        currencyIsEtb(receipt.settledAmount)
      );

    case "cbe-pdf":
    case "mb-json":
      return build(
        "cbe",
        receipt.reference,
        receipt.transferredAmount,
        receipt.receiverName,
        receipt.receiverAccount,
        "cbe",
        currencyIsEtb(
          receipt.transferredAmount,
          receipt.currency
        )
      );

    case "zemen-pdf":
      return build(
        "zemen",
        receipt.reference,
        receipt.settledAmount,
        receipt.recipientName,
        receipt.recipientAccount,
        "zemen",
        currencyIsEtb(
          receipt.settledAmount,
          receipt.currency || "ETB"
        )
      );

    case "boa-json":
      return build(
        "boa",
        receipt.transactionReference,
        receipt.transferredAmount,
        receipt.receiverName,
        receipt.receiverAccount,
        "boa",
        currencyIsEtb(
          receipt.transferredAmount,
          receipt.currency
        )
      );

    case "awash-html":
      return build(
        "awash",
        receipt.transaction?.transactionId,
        receipt.transaction?.amount,
        receipt.transaction?.beneficiaryName,
        receipt.transaction?.beneficiaryAccount,
        payoutProvider({
          bankName: receipt.transaction?.beneficiaryBank,
        }),
        currencyIsEtb(receipt.transaction?.amount)
      );

    default:
      throw new VerificationError(
        `Unsupported receipt type. Supported: ${SUPPORTED_LABEL}.`,
        422,
        "unsupported_provider"
      );
  }
};

// ------------------------------------------------------------
// Main verification function

const verifyDonationReceipt = async (rawUrl, payoutAccount) => {
  const url = validateReceiptUrl(rawUrl);

  if (!process.env.LINKS_ET_API_KEY) {
    throw new VerificationError(
      "Payment verification is not configured. Set LINKS_ET_API_KEY in the backend environment.",
      503,
      "not_configured"
    );
  }

  if (!payoutAccount || typeof payoutAccount !== "object") {
    throw new VerificationError(
      "The campaign payment account is missing.",
      503,
      "recipient_not_configured"
    );
  }

  const expectedProvider = payoutProvider(payoutAccount);

  if (!expectedProvider) {
    throw new VerificationError(
      "Receipt verification is not supported for this campaign payment provider.",
      422,
      "unsupported_campaign_bank"
    );
  }

  if (!String(payoutAccount.accountNumber || "").trim()) {
    throw new VerificationError(
      "The campaign payment account is missing verification details.",
      503,
      "recipient_not_configured"
    );
  }

  const result = await attempt(url);
  const payload = result.data || {};

  if (
    result.status !== 200 ||
    !hasExplicitSuccess(payload)
  ) {
    console.info("[links.et] verification response summary", {
      status: result.status,
      hasOk: payload?.ok === true,
      hasSuccess: payload?.success === true,
      errorCode: errorCode(payload) || null,
    });

    throwForFailure(result);
  }

  const receipt = extractReceipt(payload);

  if (!receipt) {
    console.info("[links.et] successful response contained no receipt", {
      status: result.status,
    });

    throw new VerificationError(
      "The verification service returned no readable receipt.",
      422,
      "invalid_receipt"
    );
  }

  const normalized = normalizeReceipt(receipt);
  const reference = String(normalized.reference || "")
    .trim()
    .toUpperCase();

  if (!reference) {
    throw new VerificationError(
      "The receipt has no transaction reference.",
      422,
      "invalid_receipt"
    );
  }

  if (!normalized.statusOk) {
    throw new VerificationError(
      "The receipt does not confirm that this payment completed successfully.",
      422,
      "payment_status_unconfirmed"
    );
  }

  if (
    normalized.amount === null ||
    normalized.amount <= 0
  ) {
    throw new VerificationError(
      "Could not read a valid amount from the receipt.",
      422,
      "invalid_receipt"
    );
  }

  if (!normalized.currencyOk) {
    throw new VerificationError(
      "The receipt does not confirm an ETB amount.",
      422,
      "unsupported_currency"
    );
  }

  if (normalized.destinationProvider !== expectedProvider) {
    throw new VerificationError(
      "The receipt is from a different payment provider than the selected campaign account.",
      422,
      "wrong_provider"
    );
  }

  if (
    !accountNumberMatches(
      normalized.receiverAccount,
      payoutAccount.accountNumber,
      expectedProvider
    )
  ) {
    console.warn("[links.et] receiver account mismatch", {
      source: receipt.source || "cbe-pdf",
      ...describeAccountMismatch(
        normalized.receiverAccount,
        payoutAccount.accountNumber
      ),
    });

    throw new VerificationError(
      "The receipt does not confirm the selected campaign payment account. If the bank masks the recipient account, support for safe masked-account verification is required.",
      422,
      "wrong_receiver_account"
    );
  }

  return {
    provider: normalized.provider,
    amount: normalized.amount,
    receiptKey: `${normalized.provider}:${reference}`,
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