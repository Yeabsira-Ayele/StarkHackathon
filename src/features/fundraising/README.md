# Fundraising (Member 2)

Start Fundraising, Form, Preview, My Fundraisers, Management, Drafts and Edit — all in this folder.
Entry point: `FundraisingApp.tsx` (default export). Styled like the green donations-branch design via `components/bn.tsx`.
Built against the `donations` branch.

## Add the START A FUNDRAISER tab (tell the owner of BanknoteMasterCanvas.tsx first)
Run this once from the project folder (it makes 4 small edits for you):
    node src/features/fundraising/apply-nav.mjs
Undo anytime:
    git restore src/components/banknote/BanknoteMasterCanvas.tsx
(What it does: adds an import, `| 'fundraise'` to BanknoteZoomMode, a nav button after FOUNDATION DESK,
and a view that renders <FundraisingApp />.)

## What it reads from teammates (by id, nothing copied)
- Member 1: `CampaignCategory` type (features/campaigns/types) — category list in `data/categories.data.ts`.
- Member 3: logged-in user from `useAuthStore` — see `data/currentUser.ts`.
- Bank choices are static lookup configuration in `hooks/useBanks.ts`.
- Approved organizations are loaded from the backend.

## Data / drafts
Fundraiser drafts and submissions are stored by the backend in MongoDB through
`api/fundraising.api.ts`. Existing browser-local fundraiser records are not
imported.

Fundraiser campaigns are created as private drafts, submitted for admin review,
and kept under the authenticated backend account. Static bank options are
configuration only; fundraiser and organization records are not browser-seeded.
