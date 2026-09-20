// Run with: node test-api.js
// Optional: set TEST_RECEIPT_URL to a real receipt link (paid to your
// EXPECTED_RECEIVER_NAME) to also test verification end to end:
//   $env:TEST_RECEIPT_URL="https://..."; node test-api.js   (PowerShell)
// Requires the server to be running (npm run dev) and Node 18+.

const BASE = process.env.BASE_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;

const call = async (method, path, body) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, data };
};

const check = (name, condition, extra = "") => {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
};

const run = async () => {
  console.log(`Testing ${BASE}\n`);

  console.log("Health");
  let r = await call("GET", "/");
  check("GET / returns 200", r.status === 200);

  console.log("\nCampaigns");
  r = await call("POST", "/api/campaigns", {
    title: "[TEST] School fees for Abel",
    story: "Helping Abel finish the school year.",
    goalAmount: 1000,
    category: "education",
    creatorName: "Test User",
  });
  check("POST /api/campaigns returns 201", r.status === 201, JSON.stringify(r.data));
  const campaignId = r.data?._id;
  check("campaign has an _id", !!campaignId);
  check("raisedAmount starts at 0", r.data?.raisedAmount === 0);

  r = await call("POST", "/api/campaigns", { title: "No story" });
  check("POST without story/goal returns 400", r.status === 400);

  r = await call("POST", "/api/campaigns", {
    title: "Bad", story: "x", goalAmount: -5,
  });
  check("negative goalAmount returns 400", r.status === 400);

  r = await call("GET", "/api/campaigns?category=education");
  check("GET /api/campaigns returns list", r.status === 200 && Array.isArray(r.data?.campaigns));

  r = await call("GET", "/api/campaigns?category=nonsense");
  check("invalid category filter returns 400", r.status === 400);

  r = await call("GET", `/api/campaigns/${campaignId}`);
  check("GET /api/campaigns/:id returns 200", r.status === 200);
  check("progress is 0", r.data?.progress === 0);

  r = await call("GET", "/api/campaigns/not-an-id");
  check("invalid ID returns 400", r.status === 400);

  r = await call("GET", "/api/campaigns/64b7f0f0f0f0f0f0f0f0f0f0");
  check("unknown ID returns 404", r.status === 404);

  r = await call("PATCH", `/api/campaigns/${campaignId}`, {
    title: "[TEST] School fees (updated)",
    raisedAmount: 999999, // should be ignored
  });
  check("PATCH updates title", r.status === 200 && r.data?.title.includes("updated"));
  check("PATCH ignores raisedAmount", r.data?.raisedAmount === 0);

  console.log("\nDonations (input checks, no links.et call needed)");
  r = await call("POST", `/api/donations/${campaignId}`, {});
  check("missing receiptUrl returns 400", r.status === 400);

  r = await call("POST", `/api/donations/${campaignId}`, { receiptUrl: "not a url" });
  check("invalid receiptUrl returns 400", r.status === 400);

  r = await call("POST", `/api/donations/${campaignId}`, { receiptUrl: "https://example.com/receipt/123" });
  check("unsupported host returns 400", r.status === 400 && r.data?.code === "unsupported_provider");

  r = await call("POST", `/api/donations/64b7f0f0f0f0f0f0f0f0f0f0`, {
    receiptUrl: "https://transactioninfo.ethiotelecom.et/receipt/ABCD1234EF",
  });
  check("unknown campaign returns 404", r.status === 404);

  r = await call("PATCH", `/api/donations/anything/status`, { status: "completed" });
  check("old status route is gone (404)", r.status === 404);

  r = await call("GET", `/api/donations/${campaignId}`);
  check("donations list works and is empty", r.status === 200 && r.data?.donations.length === 0);

  const receiptUrl = process.env.TEST_RECEIPT_URL;
  if (receiptUrl) {
    console.log("\nReal receipt (TEST_RECEIPT_URL, uses one links.et verification)");
    r = await call("POST", `/api/donations/${campaignId}`, {
      receiptUrl,
      donorName: "Test Donor",
      message: "Good luck!",
    });
    check("verified receipt returns 201", r.status === 201, JSON.stringify(r.data));
    const paid = r.data?.donation?.amount;
    check("amount comes from the receipt", typeof paid === "number" && paid > 0);
    check("donation is completed", r.data?.donation?.paymentStatus === "completed");

    r = await call("POST", `/api/donations/${campaignId}`, { receiptUrl });
    check("same receipt again returns 409", r.status === 409, JSON.stringify(r.data));

    r = await call("GET", `/api/campaigns/${campaignId}`);
    check("raisedAmount equals the receipt amount (counted once)", r.data?.raisedAmount === paid, `got ${r.data?.raisedAmount}`);

    r = await call("GET", `/api/donations/${campaignId}`);
    check("donation is listed", r.data?.donations.length === 1);
    check("receiptKey is not exposed", r.data?.donations[0]?.receiptKey === undefined);
  } else {
    console.log("\n  (skipped real receipt test: set TEST_RECEIPT_URL to run it)");
  }

  console.log("\nDelete rules");
  if (receiptUrl) {
    r = await call("DELETE", `/api/campaigns/${campaignId}`);
    check("cannot delete campaign that has donations (409)", r.status === 409);
  }

  r = await call("POST", "/api/campaigns", {
    title: "[TEST] Temp", story: "Delete me", goalAmount: 10,
  });
  const tempId = r.data?._id;
  r = await call("DELETE", `/api/campaigns/${tempId}`);
  check("can delete empty campaign (200)", r.status === 200);

  r = await call("GET", `/api/campaigns/${tempId}`);
  check("deleted campaign returns 404", r.status === 404);

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log(`Note: one "[TEST] School fees" campaign remains in your database.`);
  if (receiptUrl) console.log("Note: the test receipt is now used up, so it cannot be used to donate again.");
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error("\nCould not reach the server. Is `npm run dev` running?\n", err.message);
  process.exit(1);
});