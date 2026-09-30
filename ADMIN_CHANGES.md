# Admin section: what changed

## New (all inside `src/features/admin/`)
- `pages/` AdminPortal (sidebar shell), Dashboard, Fundraisers, Reports, Donations, Users, Organizations, Activity, Admins, Profile
- `components/AdminUI.tsx` banknote-styled primitives (tables, badges, drawer, reason dialog, toast)
- `hooks/useAdminStore.ts` + `AdminContext.ts` (mock data now; swap internals for TanStack Query later)
- `api/admin.api.ts` mock API (localStorage, same pattern as campaignApi); endpoint names noted in comments
- `data/admin.data.ts`, `types/admin.types.ts`

## Shared files touched (tell the team)
- `src/components/banknote/BanknoteMasterCanvas.tsx`: import AdminPortal, `userRole` also allows `'admin'`,
  an ADMIN button next to PATRON / FOUNDATION, early `return <AdminPortal …/>` when admin, approve/reject prop types allow Promise.
- `src/types/index.ts`: `CampaignStatus` gains `'needs_changes'` (additive).

## Not touched
App.tsx, routing, package.json (no new dependencies), all user-facing pages.

## How to open
Run the app, click ADMIN in the top ribbon (next to PATRON / FOUNDATION). "Exit admin" returns to the public view.
