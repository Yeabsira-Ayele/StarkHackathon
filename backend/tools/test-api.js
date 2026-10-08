// Run with: node test-api.js
// Optional: set TEST_RECEIPT_URL to a real receipt link (paid to your
// EXPECTED_RECEIVER_NAME) to also test verification end to end:
//   $env:TEST_RECEIPT_URL="https://..."; node test-api.js   (PowerShell)
// Set ADMIN_KEY to the same value the server uses (sent as x-admin-key).
// Without it, admin and PATCH/DELETE tests are skipped and the script
// exits non-zero. Set DISABLE_RATE_LIMIT=true on the server for local
// testing so this script is not rate-limited.
// Requires the server to be running (npm run dev) and Node 18+.

const BASE = process.env.BASE_URL || "http://localhost:5000";
const ADMIN_KEY = process.env.ADMIN_KEY;

let passed = 0;
let failed = 0;

const call = async (method, path, body, extraHeaders = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...extraHeaders },
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

const adminHeaders = () => ({ "x-admin-key": ADMIN_KEY });

const run = async () => {
  console.log(`Testing ${BASE}\n`);

  if (!ADMIN_KEY) {
    console.log("ADMIN_KEY is not set. Admin, PATCH, and DELETE tests will be skipped, and this script will exit with a non-zero status.\n");
  }

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
  check("new campaign status is pending", r.data?.status === "pending");

  r = await call("GET", "/api/campaigns?limit=50");
  check(
    "pending campaign is not in GET /api/campaigns",
    r.status === 200 && Array.isArray(r.data?.campaigns) && !r.data.campaigns.some((c) => c._id === campaignId)
  );

  r = await call("GET", `/api/campaigns/${campaignId}`);
  check("GET /api/campaigns/:id still returns pending campaign", r.status === 200 && r.data?.status === "pending");

  r = await call("POST", `/api/donations/${campaignId}`, {
    receiptUrl: "https://transactioninfo.ethiotelecom.et/receipt/ABCD1234EF",
  });
  check(
    "donation on pending campaign returns 403 campaign_not_approved",
    r.status === 403 && r.data?.code === "campaign_not_approved"
  );

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

  if (ADMIN_KEY) {
    console.log("\nAdmin");
    r = await call("GET", "/api/admin/campaigns");
    check("GET /api/admin/campaigns without key returns 401", r.status === 401);

    r = await call("GET", "/api/admin/campaigns", undefined, { "x-admin-key": "wrong-admin-key" });
    check("GET /api/admin/campaigns with wrong key returns 401", r.status === 401);

    r = await call("GET", "/api/admin/campaigns", undefined, adminHeaders());
    check("GET /api/admin/campaigns returns 200", r.status === 200 && Array.isArray(r.data));
    check("pending list includes the new campaign", Array.isArray(r.data) && r.data.some((c) => c._id === campaignId));

    r = await call("PATCH", `/api/admin/campaigns/${campaignId}`, { status: "nonsense" }, adminHeaders());
    check("PATCH admin status 'nonsense' returns 400", r.status === 400);

    r = await call("PATCH", `/api/admin/campaigns/${campaignId}`, { status: "approved" }, adminHeaders());
    check("PATCH admin status 'approved' returns 200", r.status === 200 && r.data?.status === "approved");

    r = await call("GET", "/api/campaigns?limit=50");
    check(
      "approved campaign appears in GET /api/campaigns",
      r.status === 200 && Array.isArray(r.data?.campaigns) && r.data.campaigns.some((c) => c._id === campaignId)
    );

    r = await call("PATCH", `/api/campaigns/${campaignId}`, { title: "nope" });
    check("PATCH /api/campaigns/:id without key returns 401", r.status === 401);

    r = await call("DELETE", `/api/campaigns/${campaignId}`);
    check("DELETE /api/campaigns/:id without key returns 401", r.status === 401);

    r = await call("PATCH", `/api/campaigns/${campaignId}`, {
      title: "[TEST] School fees (updated)",
      raisedAmount: 999999, // should be ignored
    }, adminHeaders());
    check("PATCH updates title", r.status === 200 && r.data?.title.includes("updated"));
    check("PATCH ignores raisedAmount", r.data?.raisedAmount === 0);
  } else {
    console.log("\n  (skipped admin, PATCH, and DELETE tests: set ADMIN_KEY to run them)");
  }

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

  if (ADMIN_KEY) {
    console.log("\nDelete rules");
    if (receiptUrl) {
      r = await call("DELETE", `/api/campaigns/${campaignId}`, undefined, adminHeaders());
      check("cannot delete campaign that has donations (409)", r.status === 409);
    }

    r = await call("POST", "/api/campaigns", {
      title: "[TEST] Temp", story: "Delete me", goalAmount: 10,
    });
    const tempId = r.data?._id;
    r = await call("DELETE", `/api/campaigns/${tempId}`, undefined, adminHeaders());
    check("can delete empty campaign (200)", r.status === 200);

    r = await call("GET", `/api/campaigns/${tempId}`);
    check("deleted campaign returns 404", r.status === 404);
  }

  if (!receiptUrl && ADMIN_KEY && campaignId) {
    r = await call("PATCH", `/api/admin/campaigns/${campaignId}`, { status: "rejected" }, adminHeaders());
    check("rejected leftover test campaign so it leaves the public feed", r.status === 200 && r.data?.status === "rejected");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (receiptUrl) {
    console.log(`Note: one "[TEST] School fees" campaign remains in your database.`);
    console.log("Note: the test receipt is now used up, so it cannot be used to donate again.");
  } else if (ADMIN_KEY) {
    console.log(`Note: the "[TEST] School fees" campaign was set to rejected so it will not appear in the public feed.`);
  } else {
    console.log(`Note: one pending "[TEST] School fees" campaign remains in your database (not in the public feed).`);
  }
  process.exit(failed || !ADMIN_KEY ? 1 : 0);
};

run().catch((err) => {
  console.error("\nCould not reach the server. Is `npm run dev` running?\n", err.message);
  process.exit(1);
});
