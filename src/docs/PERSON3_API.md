# Person 3 API — donations, payments, search, reports

Branch: `backend/donations`. This slice does not implement User, Organization, OTP, Campaign, Category, notifications, audit logs, or admin routes.

Every endpoint uses the same envelope.

Success:

```json
{ "success": true, "message": "Donation initialized", "data": {} }
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": { "code": "VALIDATION_ERROR", "fields": { "amount": "Amount must be greater than 0" } }
}
```

## Assumptions

- Amounts are **ETB (birr)**, rounded to 2 decimal places (the santim). `Donation.amount`, `Campaign.goalAmount`, and `Campaign.raisedAmount` share that unit. See `src/config/constants.js` (`MIN_DONATION` 10, `MAX_DONATION` 1000000).
- `ALLOW_GUEST_DONATIONS` is `true`. Guests may donate. Their donation has no `donor`, so they can see the receipt only on the verify response (they hold the `txRef`). `GET /api/donations/:id/receipt` still requires the donor account or an admin.
- A campaign must be `published`, not completed, and not past `deadline`. It does not have to be verified.
- Provider results `failed` and `cancelled` are both stored as donation status `failed`.
- `PAYMENT_PROVIDER` defaults to `mock` when unset.
- The public donor list is **not** mounted on `/api/campaigns`. That router belongs to Person 2.

## Stubs to remove on merge

| File | What to do |
| --- | --- |
| `src/middlewares/_stubAuth.js` | Delete. Point `src/middlewares/auth.js` at Person 1's middleware. Keep the export names `requireAuth` and `optionalAuth`. The stub sets `req.user = { _id, role }` from a Bearer JWT (`JWT_SECRET`, HS256). Payload id is `sub`, `_id`, `id`, or `userId`. |
| `src/models/_stubCampaign.js` | Delete once Person 2's Campaign model is registered. `src/models/index.js` loads the stub only when `mongoose.models.Campaign` is missing. |

The stub Campaign includes `story` and `completedAt` because search and auto-complete use them. Person 2's model already has both. Auto-complete also sets `isOpen: false` so Person 2's "one open campaign per owner" index releases the fundraiser. The stub schema ignores `isOpen`.

## Events

`src/services/events.js` exports `emit(eventName, payload)` and currently only logs. Person 4 replaces the body. Fully anonymous `donorId` is omitted from the log line.

| Event | When |
| --- | --- |
| `donation.paid` | A pending donation is credited for the first time |
| `donation.failed` | Provider init failed, provider said failed/cancelled, amount or currency mismatched, or the provider transaction id was already used |
| `report.created` | A user filed a report |

`donation.paid` payload: `donationId`, `campaignId`, `amount`, `currency`, `txRef`, `receiptNumber`, `donorId`, `identityMode`, `campaignCompleted`.

## Exported functions for other people

Person 2 — `src/services/campaignCompletion.service.js`

```js
const { completeIfGoalReached } = require('./services/campaignCompletion.service');
await completeIfGoalReached(campaignId, sessionOrNull);
// { completed: boolean, campaign }
```

Call this after any other code increments `raisedAmount`. It marks a `published` campaign `completed` when `raisedAmount >= goalAmount` and sets `completedAt` and `isOpen: false`.

Person 4 — `src/services/report.service.js`. These do **not** check that the caller is an admin. The admin route must authorize first.

```js
const { listReports, getReport, updateReportStatus } = require('./services/report.service');

await listReports({ status: 'open', targetType: 'campaign', page: 1, limit: 12 });
await getReport(reportId);
await updateReportStatus(reportId, { status: 'resolved', adminNote: 'Checked', adminId });
```

`status` is `open | reviewing | resolved | dismissed`.

## Money and privacy

`identityMode`:

- `identified` — public donor list shows `displayName`. Fundraiser and admin also receive `donorId`.
- `public_anonymous` — everyone sees `displayName: "Anonymous"`. Fundraiser, admin, and the donor receive `donorId`.
- `fully_anonymous` — public **and** the fundraiser see only "Anonymous" with no `donorId`. Admin and the donor still receive `donorId`. Receipts stay available to that donor.

`src/utils/donationSerializer.js` (`serializeDonation(donation, viewerRole, viewerId)`) is the only place this is decided. Responses never include `rawProviderPayload` or a phone number.

`viewerRole` is `public`, `fundraiser` (campaign owner), `admin` (`req.user.role` of `admin`), or `donor`.

## Payment providers

`src/services/payment/index.js` selects the adapter.

- `PAYMENT_PROVIDER=mock` — in-memory checkout. `initializePayment` records a successful payment so verify and the webhook can finish with no real money. Sign webhooks with HMAC-SHA256 of the raw body, header `x-mock-signature`, secret `LINKS_ET_WEBHOOK_SECRET` or `mock-webhook-secret`.
- `PAYMENT_PROVIDER=links.et` — `src/services/payment/linksEtProvider.js`. Endpoint paths and JSON fields are empty `TODO(links.et)` markers. The adapter **fails closed** with `PAYMENT_CONTRACT_MISSING` until those are copied from the links.et docs. Do not guess them.

`finalizeDonation(txRef)` is idempotent. If the donation is already `paid`, it returns it and does **not** increment `raisedAmount` again. On a replica set it uses a Mongo transaction. On a standalone server it uses `findOneAndUpdate({ txRef, status: "pending" })` and only then `$inc`s `raisedAmount`. The provider amount and currency must match the donation or the row is marked `failed` and not credited.

Receipt numbers look like `LWG-2026-A1B2C3`.

## Rate limit

`src/middlewares/rateLimit.js` limits `POST /api/donations/initialize` and `POST /api/donations/verify/:txRef` (30 requests / 10 minutes). Set `DISABLE_RATE_LIMIT=true` locally. Person 4 owns the global limiter. The webhook is not rate limited, so provider retries are not dropped.

## Auth header

```
Authorization: Bearer <jwt>
```

Missing header on `optionalAuth` routes continues as a guest. A present but invalid token is `401 AUTH_INVALID`.

---

## POST /api/donations/initialize

`optionalAuth`. Body is strict (unknown fields are rejected).

```json
{
  "campaignId": "66f0c2e1a1b2c3d4e5f60718",
  "amount": 400,
  "identityMode": "identified",
  "displayName": "Abebe",
  "message": "For the well"
}
```

`identityMode`: `identified | public_anonymous | fully_anonymous`. `displayName` is required only for `identified`. `message` is optional, max 300 characters.

`201`

```json
{
  "success": true,
  "message": "Donation initialized",
  "data": {
    "checkoutUrl": "http://localhost:5173/donations/return?txRef=lwg_m1abc_0123456789abcdef",
    "txRef": "lwg_m1abc_0123456789abcdef",
    "donationId": "66f0c2e1a1b2c3d4e5f60799"
  }
}
```

Errors: `VALIDATION_ERROR`, `NOT_FOUND`, `CAMPAIGN_NOT_DONATABLE`, `AUTH_REQUIRED` (only when guest donations are turned off), `PAYMENT_NOT_CONFIGURED`, `PAYMENT_CONTRACT_MISSING`, `RATE_LIMITED`.

## POST /api/donations/verify/:txRef

`optionalAuth`. The server asks the provider. The client amount is ignored.

`200` first time:

```json
{
  "success": true,
  "message": "Donation confirmed",
  "data": {
    "alreadyProcessed": false,
    "pending": false,
    "campaignCompleted": false,
    "donation": {
      "id": "66f0c2e1a1b2c3d4e5f60799",
      "campaign": "66f0c2e1a1b2c3d4e5f60718",
      "amount": 400,
      "currency": "ETB",
      "identityMode": "fully_anonymous",
      "displayName": "Anonymous",
      "message": "For the well",
      "status": "paid",
      "paidAt": "2026-10-04T20:00:00.000Z",
      "createdAt": "2026-10-04T19:59:00.000Z",
      "donorId": "66f0c2e1a1b2c3d4e5f60701",
      "txRef": "lwg_m1abc_0123456789abcdef",
      "receiptNumber": "LWG-2026-A1B2C3",
      "provider": "mock"
    }
  }
}
```

A guest donation (no token and no donor on the row) includes receipt fields because that caller holds the `txRef`. Anyone who is not that donor — including a request with no token when the row has a donor — gets the public shape: no `donorId`, no `txRef`, no `receiptNumber`.

Calling verify again:

```json
{
  "success": true,
  "message": "Donation already processed",
  "data": { "alreadyProcessed": true, "pending": false, "campaignCompleted": false, "donation": {} }
}
```

`raisedAmount` does not change on the replay.

## POST /api/payments/webhook

No auth header. Raw body, mounted **before** `express.json`. Header for the mock provider: `x-mock-signature` (hex HMAC-SHA256).

The body is only a pointer. Amount and currency come from `verifyPayment`, not from this JSON. The mock provider reads `txRef`. links.et does not: `CONTRACT.webhookTxRefField` in `linksEtProvider.js` stays empty until the docs name that field, and `parseWebhook` fails closed with `PAYMENT_CONTRACT_MISSING`.

```json
{ "txRef": "lwg_m1abc_0123456789abcdef" }
```

`200` when the event is new, still pending, unknown, or already processed. Already processed:

```json
{ "success": true, "message": "Already processed", "data": {} }
```

Bad signature: `401` `INVALID_SIGNATURE`. Unknown `txRef`: `200` `{ "message": "Ignored", "data": {} }` so the provider stops retrying.

## GET /api/donations/:id/receipt

`requireAuth`. Donor or admin. Fully anonymous receipts are included for that donor.

`200` data is the donor/admin serialization (includes `receiptNumber`). `403 FORBIDDEN` for anyone else. `400 VALIDATION_ERROR` when `:id` is not an ObjectId.

## GET /api/donations/mine

`requireAuth`. Query: `page` (default 1), `limit` (default 12, max 50).

```json
{
  "success": true,
  "message": "Your donations",
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0, "hasNext": false }
  }
}
```

Newest first. All statuses. Serialized as the donor.

## GET /api/donations/campaign/:campaignId

Public. `optionalAuth` so a campaign owner is treated as `fundraiser` and an admin as `admin`. Paid donations only, newest first. Same pagination query as above.

This is the public donor list. It is intentionally **not** `GET /api/campaigns/:campaignId/donations`.

## GET /api/search/campaigns

Public. Query:

| Param | Notes |
| --- | --- |
| `q` | Keyword on title and story. Input is escaped and matched case-insensitively. Max 100 characters. |
| `category` | Category ObjectId |
| `location` | Case-insensitive exact location |
| `verification` | `verified` or `unverified` |
| `organization` | Organization ObjectId |
| `status` | `published` or `completed`. Default is both. Drafts are never returned. |
| `sort` | `newest` (default), `oldest`, `mostFunded`, `endingSoon`, `progress` |
| `page`, `limit` | Default 12, max 50 |

```json
{
  "success": true,
  "message": "Campaigns",
  "data": {
    "items": [
      {
        "id": "66f0c2e1a1b2c3d4e5f60718",
        "title": "Clean Water for Person3",
        "story": "A well for the village",
        "category": null,
        "location": "Addis Ababa",
        "goalAmount": 1000,
        "raisedAmount": 1000,
        "deadline": "2026-10-11T00:00:00.000Z",
        "status": "completed",
        "verificationStatus": "verified",
        "organization": null,
        "owner": "66f0c2e1a1b2c3d4e5f60700",
        "createdAt": "2026-10-04T19:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 1, "totalPages": 1, "hasNext": false }
  }
}
```

Items are a whitelist. Payout accounts and beneficiary phone numbers are not selected.

## POST /api/reports

`requireAuth`. Strict body.

```json
{
  "targetType": "campaign",
  "targetId": "66f0c2e1a1b2c3d4e5f60718",
  "reason": "misleading",
  "details": "Please review this story"
}
```

`targetType`: `campaign | user | organization | donation`.

`reason`: `fraud | misleading | inappropriate | duplicate | payment_issue | other`.

`details` max 1000 characters. `status` cannot be set by the client.

`201`

```json
{
  "success": true,
  "message": "Report filed",
  "data": {
    "id": "66f0c2e1a1b2c3d4e5f60800",
    "reporter": "66f0c2e1a1b2c3d4e5f60701",
    "targetType": "campaign",
    "targetId": "66f0c2e1a1b2c3d4e5f60718",
    "reason": "misleading",
    "details": "Please review this story",
    "status": "open",
    "adminNote": null,
    "resolvedBy": null,
    "createdAt": "2026-10-04T20:05:00.000Z",
    "updatedAt": "2026-10-04T20:05:00.000Z"
  }
}
```

Rules:

- The target must exist. `user` and `organization` need Person 1's models. Until those models are registered the API returns `503 TARGET_MODEL_UNAVAILABLE`.
- A user cannot report themself (`400 SELF_REPORT`).
- A donation report is allowed only for the donor of that donation (`403 FORBIDDEN`).
- One **open** report per reporter + target (`409 DUPLICATE_REPORT`). After Person 4 resolves it, a new report is allowed.

Also emits `report.created`.

## GET /api/reports/mine

`requireAuth`. Same pagination as donations. Newest first.

There is no admin report route in this slice.

## Local check

```bash
npm install
npm run smoke:person3
```

The smoke script forces `PAYMENT_PROVIDER=mock`, creates a stub campaign, verifies a donation twice, asserts `raisedAmount` moved once, completes the campaign at the goal, searches, and files a report.
