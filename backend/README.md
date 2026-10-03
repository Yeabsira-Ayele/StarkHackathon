# Lewegene API

This API provides persistent account registration/login, public campaign endpoints, receipt verification, and protected campaign review.

## Requirements

- Node.js 18 or later
- MongoDB, local or hosted
- A private JWT signing secret of at least 32 characters

## Run locally

1. Copy `.env.example` to `.env` in this directory.
2. Set `MONGO_URI` and replace `JWT_SECRET` with a private random value.
3. Run `npm install --prefix backend` from the project root.
4. Run `npm run dev:backend` from the project root.

The frontend defaults to `http://localhost:5000/api` in development. Set `VITE_API_BASE_URL` in the project root `.env` when using another API host.

## Auth endpoints

- `POST /api/auth/register`: create an individual or organization account and return a bearer token.
- `POST /api/auth/login`: authenticate by email or phone number and passcode.
- `GET /api/auth/me`: return the account for the bearer token.
- `GET /api/campaigns`: list approved campaigns.
- `GET /api/campaigns/:id`: return a campaign.
- `POST /api/campaigns`: submit a campaign for admin review; new campaigns are always pending.
- `GET /api/donations/:campaignId`: list verified donations for a campaign.
- `POST /api/donations/:campaignId`: verify and record a payment receipt URL.
- `GET /api/admin/campaigns` and `PATCH /api/admin/campaigns/:id`: review fundraisers using the private `x-admin-key`.

Passwords are stored as bcrypt hashes. Organization sign-up creates an unverified account; this API does not yet implement the organization document/application review workflow.

Donation verification requires `LINKS_ET_API_KEY` and the exact expected recipient name in `EXPECTED_RECEIVER_NAME`. Do not expose `ADMIN_KEY` or Links.et credentials in frontend variables.