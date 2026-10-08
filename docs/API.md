# API

Success responses use `{ success: true, message, data }`. Errors use `{ success: false, message, error: { code, fields } }`. Unknown paths return `404`; unhandled exceptions return `500`.

## Campaign moderation

- New campaigns are always `pending`. Clients cannot set `status` on create or update; it comes from the schema default.
- `GET /api/campaigns` returns published campaigns with `status: "pending"` or `"approved"`. Pending campaigns are live, accept donations, and remain unverified until an admin approves them.
- `GET /api/campaigns/:id` returns pending campaigns (the payload includes `status`) and returns `404 { "message": "Campaign not found" }` when `status` is `"rejected"`.
- Donations are accepted for published pending and approved campaigns. Campaigns moved to changes-requested, rejected, paused, or completed status are not listed for public discovery.
- Admin donation records and statistics include only donations whose `paymentStatus` is `completed` after successful receipt verification. `GET /api/admin/donations` returns those records as `successful`; `status=pending` and `status=failed` filters are rejected.

## Donating

- `GET /api/campaigns/:campaignId/donation-accounts` returns only valid accounts saved for that public campaign, each with an `accountId` that distinguishes accounts even when they use the same bank/provider. If the fundraiser has not saved an account, it returns `{ "accounts": [] }`. Public campaign list/detail responses omit account details.
- `POST /api/donations/:campaignId` accepts `{ amount, receiptUrl, payoutAccountId, donorName?, donorEmail?, anonymous?, message? }`. The `payoutAccountId` is resolved only against accounts loaded from that campaign (or its registered organization); payout details supplied by the client are never trusted. `bankId` is accepted only for legacy clients when it identifies exactly one account. A campaign without a valid registered payout account cannot accept donations.
- Successful receipt verification is required before recording a donation. Links.et must provide explicit completed/success status, ETB amount, the exact receiving account number, and the expected destination provider. The account-holder name is not used as the destination check because receipt formatting can differ; receipt formats that do not establish status or destination are rejected. Receipt references have a unique sparse MongoDB index, created before the API starts; successful donation creation and campaign totals are updated in one MongoDB transaction. Invalid or unverified receipts do not create donations.
- Set both `LINKS_ET_API_KEY` and `LINKS_ET_URL=https://links.et` in the backend environment, then restart/redeploy the backend. The URL is required rather than defaulted in source. Replace an exposed key in the Links.et provider dashboard and update the backend secret store; never commit or log it.

## Auth

Admin-only routes require a bearer token for an active account whose database role is `ADMIN` or `SUPER_ADMIN`.
Admin account management routes require the `SUPER_ADMIN` database role; `ADMIN` tokens do not authorize these operations.

### User authentication

- `POST /api/auth/google` with `{ credential }` verifies a Google Identity Services ID token and signs in or creates a user from its verified email. The server requires `GOOGLE_CLIENT_ID`; sign-in creates the account automatically if the email is new.
- `GET /api/auth/me` returns the current user and, for organization accounts, its organization details. Send the JWT in `Authorization: Bearer <token>`.
- `PATCH /api/users/me` accepts profile fields including `preferredLanguage` (`am` or `en`) for the language options shown in the frontend. Older stored values are normalized to Amharic by the frontend.
- `POST /api/organizations/signup` requires that Google-authenticated bearer token and creates an organization application for the signed-in account. Organization contact details are separate from the account's verified Google email.
- `yeabsiraayele42@gmail.com` is the configured Super Admin account. Its verified Google account is promoted automatically at sign-in or on its next authenticated API request, so an existing session does not need to be recreated. Other verified Google accounts can be promoted with `node scripts/promote-google-super-admin.js <email>` from the backend directory; the script only promotes an existing, active account linked to a verified Google identity.

### Admin dashboard and reports

- `GET /api/admin/dashboard` returns aggregate counts and totals in `data`.
- `GET /api/admin/reports` requires an admin role and returns persisted reports in `{ reports, items, total }`, including reporter and campaign display fields.
- `POST /api/reports` requires authentication and accepts `{ campaignId, category, details, evidence? }`. Categories are `False Information`, `Fraud / Scam`, `Misleading Content`, and `Other`. The authenticated user is recorded as the reporter.
- `GET /api/reports/me` returns the signed-in user's reports.
- `PATCH /api/admin/reports/:id` requires an admin role and accepts `{ status, note? }`, where status is `reviewed`, `resolved`, or `dismissed`.
- `GET /api/admin/admins` returns all non-deleted administrator accounts and their basic information; Super Admin only.
- `GET /api/admin/admin-candidates` returns paginated active regular users eligible for admin access; Super Admin only.
- `POST /api/admin/admins` accepts `{ userId }` for an existing active regular user, promotes that account to `ADMIN`, and invalidates its existing tokens; Super Admin only.
- `DELETE /api/admin/admins/:id` removes `ADMIN` access by demoting the account to `USER` and invalidating its existing tokens; Super Admin only. Super Admin accounts cannot be removed through this endpoint.
- `GET /api/admin/users` omits administrator accounts for regular admins. Looking up an administrator through `GET /api/admin/users/:id` is also restricted to Super Admins.
- `GET /api/reports/transparency` returns totals and campaign-grouped summaries derived from completed donation records for publicly visible pending or approved campaigns. These are donation totals, not disbursements or independent audit records.
- `GET /api/reports/audits/:id` returns the completed-donation summary for one publicly visible campaign using `{ success, data: { record } }`. Despite the legacy route name, it does not represent an audit or disbursement.
- `GET /api/users/me` and `PATCH /api/users/me` return/load and update the signed-in user's profile. `PATCH /api/users/me/password` requires `{ currentPassword, newPassword }` and returns a replacement token after a successful password change.

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

Public list of published campaigns with **pending** (live, awaiting verification) or **approved** status.

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

Public. Returns pending and approved campaigns. Rejected and unpublished draft campaigns are treated as missing.

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

Public list of donations with `paymentStatus: "completed"` (newest first). Receipt keys, donor emails, and donor IDs are not returned.

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

**Body:** `{ amount, receiptUrl, payoutAccountId, donorName?, donorEmail?, anonymous?, message? }`

Local checks run first (minimum amount, receipt URL/provider, optional field types and lengths, campaign exists and is published, and `payoutAccountId` belongs to the campaign) so a links.et verification is not spent on invalid input. The account ID selects a payout account from the database-loaded campaign; client-supplied payout details are ignored. The amount read from the verified receipt must match `amount`. No donation record is saved while Links.et is working, and a rejected or mismatched receipt creates no donation.

**Success:** `201`

```json
{
  "message": "Donation verified. Thank you!",
  "donation": {
    "_id": "...",
    "campaignId": {
      "_id": "...",
      "title": "...",
      "creatorName": "..."
    },
    "donorId": "...",
    "amount": 100,
    "donorName": "Anonymous",
    "donorEmail": "donor@example.com",
    "anonymous": false,
    "message": "...",
    "bankId": "...",
    "paymentStatus": "completed",
    "provider": "telebirr",
    "certificateId": "LW-ETB-...",
    "createdAt": "..."
  }
}
```

`donorName` defaults to `"Anonymous"` when omitted.

**Errors**

- `400 { "message": "Invalid campaign ID" }`
- `400 { "message": "Contribution amount must be at least 50 ETB" }`
- `400 { "message": "receiptUrl is required" }`
- `422 { "message": "The receipt amount does not match your contribution amount", "code": "amount_mismatch" }`
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
| `wrong_receiver_account` | `422` | Receipt does not confirm the exact receiving account selected for this campaign. |
| `wrong_provider` | `422` | Receipt destination provider does not match the selected campaign account. |
| `duplicate_receipt` | `409` | This receipt's `receiptKey` was already stored. |
| `payment_status_unconfirmed` | `422` | Links.et did not provide explicit evidence that the payment completed successfully. |
| `unsupported_currency` | `422` | The receipt does not confirm an ETB amount. |
| `amount_mismatch` | `422` | The verified receipt amount does not match the requested donation amount. |
| `invalid_receipt` | `422` | Missing transaction reference, or no valid amount on the receipt. |
| `receipt_not_verified` | `422` | links.et did not return a verified receipt. |
| `campaign_not_approved` | `403` | Campaign exists but `status` is not `"approved"`. |
| `rate_limited` | `429` | This app's campaign or donation limiter. Also `503` when links.et itself returns `429` with `rate_limited`. |
| `not_configured` | `503` | `LINKS_ET_API_KEY` or `LINKS_ET_URL` is missing, or links.et rejected the API key. |
| `service_unreachable` | `503` | Could not reach the links.et verification service. |
| `provider_down` | `503` | links.et returned `503` (bank receipt service down). |
| `quota_exceeded` | `503` | links.et returned `429` other than `rate_limited`. |
| `still_processing` | `503` | Verification was still `202` after polling. |
