// Run with: node test-api.js
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

  console.log("\nDonations");
  r = await call("POST", `/api/donations/${campaignId}`, {
    amount: 250,
    donorName: "Test Donor",
    message: "Good luck!",
  });
  check("POST donation returns 201", r.status === 201, JSON.stringify(r.data));
  const donationId = r.data?.donation?._id;
  check("donation starts as pending", r.data?.donation?.paymentStatus === "pending");

  r = await call("POST", `/api/donations/${campaignId}`, { amount: -5 });
  check("negative amount returns 400", r.status === 400);

  r = await call("POST", `/api/donations/64b7f0f0f0f0f0f0f0f0f0f0`, { amount: 10 });
  check("donation to unknown campaign returns 404", r.status === 404);

  r = await call("GET", `/api/donations/${campaignId}`);
  check("pending donation is not listed publicly", r.status === 200 && r.data?.donations.length === 0);

  r = await call("GET", `/api/campaigns/${campaignId}`);
  check("raisedAmount still 0 while pending", r.data?.raisedAmount === 0);

  console.log("\nPayment confirmation");
  r = await call("PATCH", `/api/donations/${donationId}/status`, { status: "bogus" });
  check("invalid status returns 400", r.status === 400);

  r = await call("PATCH", `/api/donations/${donationId}/status`, { status: "completed" });
  check("marking completed returns 200", r.status === 200, JSON.stringify(r.data));

  r = await call("PATCH", `/api/donations/${donationId}/status`, { status: "completed" });
  check("confirming twice returns 409 (no double count)", r.status === 409);

  r = await call("GET", `/api/donations/${campaignId}`);
  check("completed donation is now listed", r.data?.donations.length === 1);

  r = await call("GET", `/api/campaigns/${campaignId}`);
  check("raisedAmount is now 250", r.data?.raisedAmount === 250, `got ${r.data?.raisedAmount}`);
  check("progress is 25%", r.data?.progress === 25, `got ${r.data?.progress}`);

  console.log("\nDelete rules");
  r = await call("DELETE", `/api/campaigns/${campaignId}`);
  check("cannot delete campaign that has donations (409)", r.status === 409);

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
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error("\nCould not reach the server. Is `npm run dev` running?\n", err.message);
  process.exit(1);
});