# Shared Frontend UI Package & Design System

A modern, high-precision React and Tailwind CSS component system designed for seamless teammate imports.

---

## 🚀 New Components Added

### 1. `LoadingPage`
Full-page loading screens for route transitions, data ingestion, and authentication gates:
- **`variant="skeleton"`**: Complete application dashboard shimmer (navbar, KPI cards, table skeleton).
- **`variant="branded"`**: Interactive branded splash with progress meter, status step tracker, and cancel/retry hooks.
- **`variant="minimal"`**: Clean Apple/Linear centered spinner with micro-status tracker.
- **`fullScreen`**: Supports fixed full-screen takeover or responsive container embedding.

```tsx
import { LoadingPage } from '@/components/ui';

// In an async page, Next.js loading.tsx, or React Suspense boundary:
export default function Loading() {
  return <LoadingPage variant="skeleton" />;
}

// Or with step progress:
<LoadingPage
  variant="branded"
  title="Ingesting Dataset..."
  steps={[
    'Connecting to cluster...',
    'Parsing records...',
    'Generating vector embeddings...',
    'Ready'
  ]}
  onCancel={() => handleAbort()}
/>
```

---

### 2. Form & Data Components
- **`Select`**: Styled custom select dropdown with keyboard support, chevron icon, error state, and helper text.
- **`StatCard`**: Executive metric card with trend indicators (`+18.4%`), timeframe labels, and icon slots.
- **`Table`**: Modern data table with `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell`.
- **`Avatar` & `AvatarGroup`**: User avatars with image error fallback to initials, online status dots, and overlapping group stacks (`+3`).
- **`Tooltip`**: Micro-tooltips for action buttons, badges, and icons.

---

## 🔲 Precision Button Curvature (Apple & Linear Math)

Buttons feature mathematically balanced radii, tactile top-rim micro-highlights, and active spring compression:

- **Squircle (9px Default)**: `curve="squircle"` (Apple / Linear sweet spot: `rounded-[9px]` on `h-9.5` with `shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.16)]`).
- **Pill Capsule**: `curve="pill"` (`rounded-full` for community CTAs and filter chips).
- **Subtle Technical (6px)**: `curve="subtle"` (`rounded-md` for dense developer data tables).

```tsx
<Button variant="primary" curve="squircle">Squircle (9px Default)</Button>
<Button variant="accent" curve="pill">Pill Capsule</Button>
<Button variant="secondary" curve="subtle">Subtle Technical</Button>
```

---

## 📦 Quick Start for Teammates

### 1. Pull Latest Branch
```bash
git pull origin dev
npm install
npm run dev
```

### 2. Import Anything from `@/components/ui`
```tsx
import {
  Button,
  LoadingPage,
  Card,
  Input,
  Select,
  StatCard,
  Table,
  Badge
} from '@/components/ui';

export default function Dashboard() {
  return (
    <Card variant="default">
      <StatCard label="Monthly Backers" value="1,429" change="+24.1%" trend="up" />
      <Select
        label="Role"
        options={[{ value: 'eng', label: 'Engineer' }]}
      />
      <Button variant="primary" curve="squircle">Confirm</Button>
    </Card>
  );
}
```
