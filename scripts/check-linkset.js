const path = require("path");
const dns = require("dns");
const https = require("https");
const dotenv = require("dotenv");

// Load backend/.env
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

async function run() {
  console.log("=== LinkEt Diagnostics ===");
  const rawUrl = process.env.LINKS_ET_URL;
  const apiKey = process.env.LINKS_ET_API_KEY;

  console.log("API Key configured:", Boolean(apiKey));
  console.log("API Key length:", apiKey ? apiKey.length : 0);

  if (!rawUrl) {
    console.error("LINKS_ET_URL is not set.");
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
    console.log("LINKS_ET_URL Host:", parsedUrl.host);
    console.log("LINKS_ET_URL Origin:", parsedUrl.origin);
    console.log("LINKS_ET_URL Protocol:", parsedUrl.protocol);
    console.log("LINKS_ET_URL Pathname:", parsedUrl.pathname);
  } catch (err) {
    console.error("Failed to parse LINKS_ET_URL:", err.message);
    return;
  }

  const hostname = parsedUrl.hostname;

  // 1. DNS Lookup
  console.log("\n--- Step 1: DNS Lookup ---");
  try {
    const lookupResult = await dns.promises.lookup(hostname);
    console.log("DNS Lookup Success:", lookupResult.address, `(family: ${lookupResult.family})`);
  } catch (err) {
    console.error("DNS Lookup Error:", err.code || err.message);
  }

  // 2. HTTPS GET (using node https)
  console.log("\n--- Step 2: HTTPS GET (node https module, 10s timeout) ---");
  await new Promise((resolve) => {
    const req = https.get(parsedUrl.origin, { timeout: 10000 }, (res) => {
      console.log("HTTPS GET Response Status:", res.statusCode, res.statusMessage);
      res.resume();
      resolve();
    });

    req.on("timeout", () => {
      console.error("HTTPS GET timed out after 10s");
      req.destroy(new Error("ETIMEDOUT"));
    });

    req.on("error", (err) => {
      console.error("HTTPS GET Error:", {
        name: err.name,
        code: err.code,
        message: err.message,
      });
      resolve();
    });
  });

  // 3. fetch GET (using Node global fetch, 10s timeout)
  console.log("\n--- Step 3: Fetch GET (global fetch, 10s timeout) ---");
  try {
    const res = await fetch(parsedUrl.origin, {
      signal: AbortSignal.timeout(10000),
    });
    console.log("Fetch GET Response Status:", res.status, res.statusText);
  } catch (err) {
    console.error("Fetch GET Error:", {
      name: err.name,
      message: err.message,
      causeCode: err.cause?.code,
      causeMessage: err.cause?.message,
      causeName: err.cause?.name,
    });
  }
}

run();
