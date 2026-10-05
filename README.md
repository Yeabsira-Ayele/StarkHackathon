# StarkHackathon

The frontend runs from the repository root; the Express/MongoDB API is in
[`backend/`](./backend/). The projects have separate package manifests and
install steps.

## Run locally

1. Install the frontend dependencies from the repository root with `npm ci`.
2. Configure and start the backend using [`backend/SETUP.txt`](./backend/SETUP.txt).
3. In a second terminal at the repository root, run `npm run dev`.
4. Open `http://localhost:3000`.

The frontend uses `http://localhost:5000/api` for local API requests by default.
Set `VITE_API_BASE_URL` to override it. Donor signup and sign-in use Google
Identity Services; see [`backend/SETUP.txt`](./backend/SETUP.txt) to configure
the Google OAuth web client ID in both frontend and backend environments.
Campaigns, fundraiser drafts/submissions, verified donations, organization
listing, profile identity, and supported admin moderation operations use the
MongoDB API.

Some workflows are not yet implemented by the backend: foundation registration
does not submit the complete organization application, transparency reports
have no API, and donation/report/admin activity management is not available.
Those surfaces no longer report local mock data as if it were persisted; they
may show an unavailable/error state until their backend endpoints are added.
Static bank/category options remain client configuration, not user records.
Previously saved browser demo data is not imported into MongoDB or automatically
deleted from browser storage.
