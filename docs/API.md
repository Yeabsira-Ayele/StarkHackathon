# API

All JSON errors use `{ message, code? }`. Unknown paths return `404 { "message": "Route not found" }`. Unhandled exceptions return `500 { "message": "Server error" }` (or `err.message` when the error has a non-500 `status`).

## Campaign moderation

- New campaigns are always `pending`. Clients cannot set `status` on create or update; it comes from the schema default.
- `GET /api/campaigns` only returns campaigns with `status: "approved"`.
- `GET /api/campaigns/:id` returns pending campaigns (the payload includes `status`) and returns `404 { "message": "Campaign not found" }` when `status` is `"rejected"`.
- Donations are accepted only for approved campaigns.

## Donating (differs from the original plan)

> **Note:** Donating is `POST /api/donations/:campaignId` with `{ receiptUrl, donorName?, message? }`. The amount is read from the verified receipt and is never sent by the client. This is not `POST /campaigns/:id/donate` with an `amount`.

## Auth

Admin-only routes expect the `x-admin-key` header, compared to `ADMIN_KEY`.

- `503 { "message": "Admin access is not configured" }` if `ADMIN_KEY` is unset
- `401 { "message": "Invalid admin key" }` if the header is missing or does not match

## Rate limits

Disabled when `DISABLE_RATE_LIMIT=true`. Failed requests (4xx/5xx) are not counted.

| Route | Window | Limit |
| --- | --- | --- |
| `POST /api/campaigns` | 1 hour | 20 |
| `POST /api/donations/:campaignId` | 15 minutes | 10 |

Over the limit: `429 { "message": "Too many requests, please try again later.", "code": "rate_limited" }`.

---

## `GET /`

Health check. No auth.

**Success:** `200 { "message": "Server is running!" }`

---

## `GET /api/campaigns`

Public list of **approved** campaigns.

**Query**

| Param | Default | Notes |
| --- | --- | --- |
| `category` | | One of `medical`, `education`, `emergency`, `business`, `other` |
| `search` | | Case-insensitive substring match on `title` |
| `sort` | `newest` | `newest` (`createdAt` desc), `oldest` (`createdAt` asc), `mostFunded` (`raisedAmount` desc). Unknown values fall back to `newest`. |
| `page` | `1` | Minimum 1 |
| `limit` | `10` | Clamped to 1–50 |

**Success:** `200`

```json
{
  "campaigns": [
    {
      "_id": "...",
      "title": "...",
      "story": "...",
      "goalAmount": 1000,
      "raisedAmount": 0,
      "creatorName": "Anonymous",
      "category": "other",
      "imageUrl": "...",
      "status": "approved",
      "createdAt": "...",
      "progress": 0
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 0, "pages": 0 }
}
```

`progress` is `min(round(raisedAmount / goalAmount * 100), 100)`, or `0` if `goalAmount` is 0.

**Errors**

- `400 { "message": "Category must be one of: medical, education, emergency, business, other" }`
- `500 { "message": "Server error" }`

---

## `GET /api/campaigns/:id`

Public. Returns pending and approved campaigns. Rejected campaigns are treated as missing.

**Success:** `200` — the campaign plus `progress` (same formula as the list).

**Errors**

- `400 { "message": "Invalid campaign ID" }`
- `404 { "message": "Campaign not found" }` — missing id, or `status === "rejected"`
- `500 { "message": "Server error" }`

---

## `POST /api/campaigns`

Public (rate limited). Creates a campaign. `status` is always `pending`. `raisedAmount` is not accepted from the client.

**Body:** `{ title, story, goalAmount, creatorName?, category?, imageUrl? }`

**Success:** `201` — the created campaign (`status: "pending"`, `raisedAmount: 0`, `creatorName` defaults to `"Anonymous"`, `category` defaults to `"other"`). No `progress` field.

**Errors**

- `400 { "message": "Title and story are required" }`
- `400 { "message": "Goal amount must be a number greater than 0" }`
- `400 { "message": "Category must be one of: medical, education, emergency, business, other" }`
- `429` — `rate_limited` (see Rate limits)
- `500 { "message": "Server error" }`

---

## `PATCH /api/campaigns/:id`

**Auth:** `x-admin-key`. Admin-only until user accounts exist.

Only these fields are applied: `title`, `story`, `goalAmount`, `category`, `imageUrl`, `creatorName`. `raisedAmount` and `status` are ignored.

**Success:** `200` — the updated campaign.

**Errors**

- `503` / `401` — admin auth (see Auth)
- `400 { "message": "Invalid campaign ID" }`
- `400 { "message": "No valid fields to update" }`
- `400 { "message": "title cannot be empty" }` or `"story cannot be empty"`
- `400 { "message": "Goal amount must be a number greater than 0" }`
- `400 { "message": "Category must be one of: medical, education, emergency, business, other" }`
- `404 { "message": "Campaign not found" }`
- `500 { "message": "Server error" }`

---

## `DELETE /api/campaigns/:id`

**Auth:** `x-admin-key`. Admin-only until user accounts exist.

Blocked once `raisedAmount > 0` so donation records are not orphaned.

**Success:** `200 { "message": "Campaign deleted" }`

**Errors**

- `503` / `401` — admin auth (see Auth)
- `400 { "message": "Invalid campaign ID" }`
- `404 { "message": "Campaign not found" }`
- `409 { "message": "Cannot delete a campaign that has already received donations" }`
- `500 { "message": "Server error" }`

---

## `GET /api/donations/:campaignId`

Public list of donations with `paymentStatus: "completed"` (newest first). `receiptKey` is not selected.

The campaign must exist; pending and rejected campaigns still list donations if any exist.

**Query:** `page` (default 1), `limit` (default 10, max 50). Same clamping as campaigns.

**Success:** `200`

```json
{
  "donations": [
    {
      "_id": "...",
      "campaignId": "...",
      "amount": 100,
      "donorName": "Anonymous",
      "message": "...",
      "paymentStatus": "completed",
      "provider": "telebirr",
      "createdAt": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 0, "pages": 0 }
}
```

**Errors**

- `400 { "message": "Invalid campaign ID" }`
- `404 { "message": "Campaign not found" }`
- `500 { "message": "Server error" }`

---

## `POST /api/donations/:campaignId`

Public (rate limited). Submit a payment receipt link. The server verifies it with links.et and records the amount from the receipt.

**Body:** `{ receiptUrl, donorName?, message? }`

Local checks run first (`receiptUrl` required, message ≤ 500 chars, URL/host validation, campaign exists, campaign is approved) so a links.et verification is not spent on bad input or unapproved campaigns.

**Success:** `201`

```json
{
  "message": "Donation verified. Thank you!",
  "donation": {
    "_id": "...",
    "campaignId": "...",
    "amount": 100,
    "donorName": "Anonymous",
    "message": "...",
    "paymentStatus": "completed",
    "provider": "telebirr",
    "createdAt": "..."
  }
}
```

`donorName` defaults to `"Anonymous"` when omitted.

**Errors**

- `400 { "message": "Invalid campaign ID" }`
- `400 { "message": "receiptUrl is required" }`
- `400 { "message": "Message must be 500 characters or fewer" }`
- `400 { "message": "The receipt link is not a valid URL", "code": "invalid_receipt_url" }`
- `400` `unsupported_provider` — host is not telebirr, CBE, Zemen, Bank of Abyssinia, or Awash
- `404 { "message": "Campaign not found" }`
- `403 { "message": "This campaign is not open for donations yet", "code": "campaign_not_approved" }`
- `409 { "message": "This receipt has already been used for a donation", "code": "duplicate_receipt" }`
- Verification failures from links.et / receipt parsing (see Error codes); status is `422` or `503` as listed there
- `429` — `rate_limited` (this app's limiter)
- `500 { "message": "Server error" }`

Supported receipt hosts: `transactioninfo.ethiotelecom.et`, `apps.cbe.com.et`, `mb.cbe.com.et`, `mbreciept.cbe.com.et`, `share.zemenbank.com`, `cs.bankofabyssinia.com`, `awashpay.awashbank.com`.

---

## `GET /api/admin/campaigns`

**Auth:** `x-admin-key`.

Pending campaigns, oldest first (`createdAt` ascending).

**Success:** `200` — a JSON array of campaign documents (no `progress` field).

**Errors**

- `503` / `401` — admin auth (see Auth)
- `500 { "message": "Server error" }`

---

## `PATCH /api/admin/campaigns/:id`

**Auth:** `x-admin-key`.

**Body:** `{ "status": "approved" }` or `{ "status": "rejected" }` (exactly those strings).

**Success:** `200` — the updated campaign.

**Errors**

- `503` / `401` — admin auth (see Auth)
- `400 { "message": "Invalid campaign ID" }`
- `400 { "message": "status must be 'approved' or 'rejected'" }`
- `404 { "message": "Campaign not found" }`
- `500 { "message": "Server error" }`

---

## Error codes

| `code` | Typical status | When |
| --- | --- | --- |
| `unsupported_provider` | `400` | Receipt URL host is not a supported bank. Also `422` if links.et returns an undocumented receipt `source`. |
| `invalid_receipt_url` | `400` | `receiptUrl` is not a valid `http:` / `https:` URL. |
| `wrong_receiver` | `422` | Receipt payee does not match `EXPECTED_RECEIVER_NAME` (comma-separated allowed names). |
| `duplicate_receipt` | `409` | This receipt's `receiptKey` was already stored. |
| `payment_not_completed` | `422` | Receipt status is not a completed payment. |
| `invalid_receipt` | `422` | Missing transaction reference, or no valid amount on the receipt. |
| `receipt_not_verified` | `422` | links.et did not return a verified receipt. |
| `campaign_not_approved` | `403` | Campaign exists but `status` is not `"approved"`. |
| `rate_limited` | `429` | This app's campaign or donation limiter. Also `503` when links.et itself returns `429` with `rate_limited`. |
| `not_configured` | `503` | `LINKS_ET_API_KEY` missing; links.et rejected the API key; or (production only) `EXPECTED_RECEIVER_NAME` is unset. |
| `service_unreachable` | `503` | Could not reach the links.et verification service. |
| `provider_down` | `503` | links.et returned `503` (bank receipt service down). |
| `quota_exceeded` | `503` | links.et returned `429` other than `rate_limited`. |
| `still_processing` | `503` | Verification was still `202` after polling. |
