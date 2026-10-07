# Lewegene Frontend — Visual Design & Hierarchy Plan

## 1. Design Tokens Confirmed from `src/index.css`

All visual changes strictly adhere to the Ethiopian Netela (`ነጠላ`) handwoven cotton cloth and steel-plate intaglio engraving system defined in `src/index.css`:

### Color Tokens
- `--background`: `#F2ECE1` (light) / `#080706` (dark) — Warm Natural Netela Linen/Cotton Cloth Swatch
- `--surface`: `#F8F4EC` (light) / `#0E0D0B` (dark) — Tactile Shemma Plate Surface
- `--surface-alt`: `#E9E1D2` (light) / `#161411` (dark) — Natural Handspun Cotton Slub Layer
- `--primary`: `#26211C` (light) / `#B88B45` (dark) — Deep Carbon Intaglio Ink
- `--primary-dark`: `#181512` (light) / `#9A7432` (dark) — Pure Engraving Black Ink
- `--accent`: `#9A7432` (light) / `#C89D52` (dark) — Antique Banknote Ochre & Bronze
- `--accent-gold`: `#B88B45` (light) / `#D8B066` (dark) — Subdued Historical Gold/Ochre
- `--accent-burgundy` / `--accent-green`: `#1E4D38` (light) / `#52B788` (dark) — Authentic Vintage Banknote Green (1 Birr Reference)
- `--accent-green-dark`: `#163E2C` (light) / `#3E966C` (dark) — Deep Banknote Green Hover
- `--accent-blue`: `#2A435E` (light) / `#3A5F82` (dark) — Faded Slate Banknote Blue
- `--border-color`: `#383028` (light) / `#2F261E` (dark) — Fine Intaglio Engraved Hairline
- `--border-subtle`: `#D2C5B0` (light) / `#1C1713` (dark) — Subtle Hand-spun Cotton Divider
- `--text-main`: `#201C18` (light) / `#F4EFE6` (dark) — Historical Carbon Black Ink
- `--text-muted`: `#5A4E3E` (light) / `#9E9383` (dark) — Faded Sepia Thread Ink

### Typography Tokens & Type Scale
- `--font-display` (`'Cinzel', serif`): Reserved strictly for true display moments (hero headline, primary section titles, denomination figures).
  - **Headline Display**: `text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.08]`
  - **Section Title**: `text-2xl sm:text-3xl font-display font-black tracking-tight leading-tight`
- `--font-serif` (`'Cormorant Garamond', Georgia, serif`): Editorial subheads, cause plate titles, and pull-quotes.
  - **Subhead / Card Title**: `text-lg sm:text-xl font-serif font-bold leading-snug`
- `--font-sans` (`'Plus Jakarta Sans', system-ui, sans-serif`): Body copy, descriptions, and form controls, constrained to `< 75ch` (`max-w-2xl` / `max-w-[68ch]`).
  - **Body**: `text-sm sm:text-base font-sans leading-relaxed max-w-[65ch]`
- `--font-ethiopic` (`'Noto Serif Ethiopic', 'Noto Sans Ethiopic', serif`): Amharic/Ge'ez mottos and numeral stamps.
- **Caption / Ledger Metadata** (`font-mono`): Serial numbers, ACSO registry codes, and tabular currency figures (`text-[11px] font-mono tracking-wider uppercase tabular-nums`).

### Structural & Engraving Primitives
- Sharp rectangular geometry (`rounded-none`), double-framed intaglio perimeter borders (`border-2` outer frame with `inset-1.5 border border-[#9A7432]/35` inner hairline or `.banknote-inner-border`), `.intaglio-overlay`, `.intaglio-crosshatch`, `.banknote-engraved-text`, `.banknote-serial-red`, and `BanknotePlateCard` / `BanknoteRulerGauge`.
- Consistent section spacing rhythm: `px-6 sm:px-12 lg:px-20` horizontal padding and `py-10 sm:py-14` vertical rhythm.

---

## 2. Home Page Section Order & One-Line Purpose

1. **Hero (`#home-hero`)**: Establish Lewegene's Ethiopian civic banknote identity with an integrated intaglio monument vignette, one primary CTA ("Explore causes"), and one lower-emphasis secondary text link ("For foundations →").
2. **Featured Causes & Accredited Partners (`#home-featured-causes`)**: Showcase 3 urgent, ACSO-verified community cause plates with live Birr underwriting progress alongside a compact ledger strip of accredited partner organizations.
3. **How It Works (`#home-how-it-works`)**: Explain the three-step citizen underwriting process (01 Find a cause → 02 Support the cause → 03 Track verified impact) in an engraved three-column plate.
4. **Impact Stats (`#home-impact`)**: Substantiate platform trust with four real-time tabular metrics (Total Underwritten Birr, Community Patrons, 100% Direct to Beneficiaries, Verified Cause Plates).
5. **Closing CTA (`#home-closing-cta`)**: Conclude the narrative with a single primary invitation to start fundraising ("Start fundraising") and a quiet secondary text link for voice navigation or cause discovery.

---

## 3. Single Primary Action Per Page

- **Home (`/` — overview mode)**: **"Explore causes"** (solid `#1E4D38` banknote green button; "For foundations →" demoted to a quiet inline link).
- **Discover (`/discover` — discover mode)**: **"Support this cause"** on each `BanknotePlateCard`.
- **Cause Detail (`/causes/:id` — detail mode)**: **"Support this cause"** in the sticky right-hand promissory ledger.
- **Organization Profile (`/organizations/:id` — `OrganizationProfile.tsx`)**: **"Support this cause"** / **"View cause"** on the organization's `BanknotePlateCard` grid.
- **Foundation Dashboard (`/foundation` — `FoundationDashboard.tsx`)**:
  - Approved foundation: **"Publish new cause"** (`onCreateCampaign`).
  - Needs changes: **"Edit application & resubmit"**.
  - Pending / Declined: **"Preview public profile"** (`onViewProfile`).
