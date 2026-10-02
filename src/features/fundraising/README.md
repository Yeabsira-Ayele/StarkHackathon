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
- Member 4: `mockBanks` (ids like `bank_cbe`) — see `hooks/useBanks.ts`.
- Organizations: shared `data/mockOrganizations.ts`.

## Data / drafts
Saved in the browser (localStorage key `lewegene_fundraisers_v1`) by `api/fundraising.api.ts`.
Backend later: only that file and the `hooks/` change.
Demo-only code to delete later: `demoReview` in the api, and the "Demo only" card in `pages/FundraiserManagement.tsx`.

## Still to agree with the team
- Member 5 / Member 1: submitted fundraisers are NOT yet in the shared campaign list. `campaignApi.createCampaign`
  auto-approves, and admin reads `campaignApi.getAdminCampaigns()`. Decide how a submitted fundraiser enters that list
  as `pending`. Statuses I use: draft | pending | changes_requested | approved | rejected | completed | paused
  (admin already has the action `request_changes`).
- The branch already has `features/fundraiser/` (singular, a simple create form). Mine is `features/fundraising/`.
  Agree on which one stays, or two similarly named folders will confuse everyone.
