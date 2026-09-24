import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonCurve,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  ProgressBar,
  Spinner,
  Skeleton,
  ErrorMessage,
  Alert,
  Badge,
  Toggle,
  Modal,
  Tabs,
  LoadingPage,
  LoadingPageVariant,
  Select,
  StatCard,
  Avatar,
  AvatarGroup,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tooltip,
} from '../components/ui';
import {
  Check,
  Copy,
  Sliders,
  ArrowRight,
  Search,
  Zap,
  HeartHandshake,
  TrendingUp,
  Layers,
  Terminal,
  ShieldCheck,
  Share2,
  Bookmark,
  Sun,
  Moon,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  RefreshCw,
  Users,
  DollarSign,
  Activity,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function StyleGuide() {
  const [isDark, setIsDark] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'buttons' | 'gallery' | 'loading' | 'preview' | 'tokens'>('buttons');

  // Interactive Button Studio State
  const [btnText, setBtnText] = useState('Continue to Payment');
  const [btnVariant, setBtnVariant] = useState<ButtonVariant>('primary');
  const [btnSize, setBtnSize] = useState<ButtonSize>('md');
  const [btnCurve, setBtnCurve] = useState<ButtonCurve>('squircle');
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnFullWidth, setBtnFullWidth] = useState(false);
  const [btnIcon, setBtnIcon] = useState<'none' | 'left' | 'right'>('right');

  // Interactive Loading Page State
  const [loadingVariant, setLoadingVariant] = useState<LoadingPageVariant>('skeleton');
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [customLoadingTitle, setCustomLoadingTitle] = useState('Synchronizing Workspace');
  const [simulatedProgress, setSimulatedProgress] = useState(64);

  // Form Controls State
  const [searchVal, setSearchVal] = useState('solar infrastructure deployment');
  const [emailVal, setEmailVal] = useState('lead.engineer@meridian.io');
  const [selectedRole, setSelectedRole] = useState('engineer');

  // App preview demo state
  const [modalOpen, setModalOpen] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState<number>(75);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col font-sans transition-colors duration-150">
      {/* Toast Feedback */}
      {copiedItem && (
        <div className="fixed bottom-6 right-6 z-50 bg-text text-text-inverse px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-medium animate-fadeIn border border-white/10">
          <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
          <span>Copied {copiedItem}</span>
        </div>
      )}

      {/* Full-Screen Loading Overlay Mode if triggered */}
      {isFullScreenLoading && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="absolute top-4 right-4 z-60">
            <Button
              variant="secondary"
              size="sm"
              curve="squircle"
              onClick={() => setIsFullScreenLoading(false)}
              leftIcon={<Minimize2 className="w-3.5 h-3.5" />}
            >
              Exit Full-Screen (ESC)
            </Button>
          </div>
          <LoadingPage
            variant={loadingVariant}
            fullScreen
            title={customLoadingTitle}
            progress={simulatedProgress}
            onCancel={() => setIsFullScreenLoading(false)}
          />
        </div>
      )}

      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-text">
              UI Design System
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-text-muted">
              v2.1
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-text-muted">
            <button
              onClick={() => setActiveTab('buttons')}
              className={`hover:text-text transition-colors pb-0.5 cursor-pointer ${
                activeTab === 'buttons' ? 'text-text font-semibold border-b-2 border-primary' : ''
              }`}
            >
              Button Studio
            </button>
            <button
              onClick={() => setActiveTab('loading')}
              className={`hover:text-text transition-colors pb-0.5 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'loading' ? 'text-text font-semibold border-b-2 border-primary' : ''
              }`}
            >
              <span>Loading Page</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`hover:text-text transition-colors pb-0.5 cursor-pointer ${
                activeTab === 'gallery' ? 'text-text font-semibold border-b-2 border-primary' : ''
              }`}
            >
              Component Gallery
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`hover:text-text transition-colors pb-0.5 cursor-pointer ${
                activeTab === 'preview' ? 'text-text font-semibold border-b-2 border-primary' : ''
              }`}
            >
              App Preview
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`hover:text-text transition-colors pb-0.5 cursor-pointer ${
                activeTab === 'tokens' ? 'text-text font-semibold border-b-2 border-primary' : ''
              }`}
            >
              Tokens
            </button>
          </nav>

          {/* Zone 3: Actions & Clean Dark/Light Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Clean Dark Mode Toggle (Replaced unwanted multi-theme buttons) */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="w-8.5 h-8.5 rounded-lg border border-border bg-surface text-text hover:bg-surface-subtle active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <Button
              size="sm"
              variant="secondary"
              curve="squircle"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              onClick={() => copyToClipboard(`import { Button, LoadingPage, Card, Input, Select, StatCard } from '@/components/ui';`, 'Import statement')}
            >
              Copy Imports
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Editorial Subhead */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
              <span>Frontend Package</span>
              <span aria-hidden="true">·</span>
              <span>Linear / Apple Geometry</span>
              <span aria-hidden="true">·</span>
              <span className="text-accent font-medium">Ready for Team Production</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text text-balance">
              Design System &amp; UI Components
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl text-balance">
              Includes full Loading Page screens, refined Squircle buttons, KPI Stat Cards, Select menus, and Data Tables.
            </p>
          </div>
        </div>

        {/* ========================================================
            TAB 1: BUTTON STUDIO
        ======================================================== */}
        {activeTab === 'buttons' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Interactive Button Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-5 p-5 bg-surface rounded-xl border border-border shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-accent" />
                    Interactive Button Configurator
                  </h3>
                  <span className="text-[11px] font-mono text-text-muted">Live Preview</span>
                </div>

                {/* Curve Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">Corner Curvature</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs">
                    {(['squircle', 'pill', 'subtle'] as ButtonCurve[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setBtnCurve(c)}
                        className={`py-1.5 px-2 rounded-md font-medium text-center transition-all cursor-pointer capitalize ${
                          btnCurve === c
                            ? 'bg-surface text-text shadow-2xs font-semibold'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {c === 'squircle' ? 'Squircle (9px)' : c === 'pill' ? 'Pill (Full)' : 'Subtle (6px)'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-muted leading-tight">
                    {btnCurve === 'squircle'
                      ? 'Apple & Linear 9px standard: balanced, ergonomic, and tactile.'
                      : btnCurve === 'pill'
                      ? 'Full continuous capsule for high-conversion CTAs and filter chips.'
                      : 'Precise 6px radius for dense developer consoles and data tables.'}
                  </p>
                </div>

                {/* Variant Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">Variant Style</label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger'] as ButtonVariant[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setBtnVariant(v)}
                        className={`py-1.5 px-2 rounded-lg border text-center font-medium capitalize transition-all cursor-pointer ${
                          btnVariant === v
                            ? 'border-accent bg-accent/10 text-accent font-semibold'
                            : 'border-border bg-surface text-text-muted hover:text-text hover:border-border-strong'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

   {/* Size Selector */}
<div className="space-y-1.5">
  <label className="text-xs font-medium text-text-muted">Size Proportion</label>

  <div className="grid grid-cols-5 gap-1.5 p-1 bg-surface-subtle border border-border-subtle rounded-lg text-xs">
    {(['2xs', 'xs', 'sm', 'md', 'lg'] as ButtonSize[]).map((s) => {
      const labels: Record<ButtonSize, string> = {
        '2xs': '2XS (24px)',
        xs: 'XS (28px)',
        sm: 'SM (32px)',
        md: 'MD (38px)',
        lg: 'LG (44px)',
      };

      return (
        <button
          key={s}
          onClick={() => setBtnSize(s)}
          className={`py-1.5 px-2 rounded-md font-medium text-center transition-all cursor-pointer uppercase ${
            btnSize === s
              ? 'bg-surface text-text shadow-2xs font-semibold'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {labels[s]}
        </button>
      );
    })}
  </div>
</div>          

                {/* Button Label Input */}
                <Input
                  label="Button Label"
                  value={btnText}
                  onChange={(e) => setBtnText(e.target.value)}
                />

                {/* State Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={btnLoading}
                      onChange={(e) => setBtnLoading(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>Loading Spinner</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={btnDisabled}
                      onChange={(e) => setBtnDisabled(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>Disabled State</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={btnFullWidth}
                      onChange={(e) => setBtnFullWidth(e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>Full Width</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Icon Slot:</span>
                    <select
                      value={btnIcon}
                      onChange={(e) => setBtnIcon(e.target.value as any)}
                      className="bg-surface text-text text-xs border border-border rounded-md px-1.5 py-0.5"
                    >
                      <option value="none">None</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Stage Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-8 sm:p-12 bg-surface rounded-xl border border-border shadow-xs flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
                  <div className="absolute top-3 left-4 text-[11px] font-mono text-text-muted">
                    Stage Preview (Click to test active spring)
                  </div>

                  <div className="w-full max-w-sm flex items-center justify-center">
                    <Button
                      variant={btnVariant}
                      size={btnSize}
                      curve={btnCurve}
                      isLoading={btnLoading}
                      disabled={btnDisabled}
                      fullWidth={btnFullWidth}
                      leftIcon={btnIcon === 'left' ? <Sparkles className="w-3.5 h-3.5" /> : undefined}
                      rightIcon={btnIcon === 'right' ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                    >
                      {btnText}
                    </Button>
                  </div>

                  <div className="absolute bottom-3 right-4 text-[11px] font-mono text-text-muted">
                    active:scale-[0.985] · top highlight · 1:2.2 padding
                  </div>
                </div>

                {/* Generated Code Snippet */}
                <div className="p-4 bg-surface rounded-xl border border-border shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-accent" />
                      JSX Code
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `<Button variant="${btnVariant}" size="${btnSize}" curve="${btnCurve}"${
                            btnLoading ? ' isLoading' : ''
                          }${btnDisabled ? ' disabled' : ''}${
                            btnIcon === 'left' ? ' leftIcon={<Sparkles className="w-3.5 h-3.5" />}' : ''
                          }${btnIcon === 'right' ? ' rightIcon={<ArrowRight className="w-3.5 h-3.5" />}' : ''}>\n  ${btnText}\n</Button>`,
                          'Button JSX'
                        )
                      }
                      className="text-xs text-text-muted hover:text-text flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      Copy JSX
                    </button>
                  </div>
                  <pre className="text-xs font-mono bg-surface-subtle p-3 rounded-lg border border-border-subtle overflow-x-auto text-text">
                    {`<Button\n  variant="${btnVariant}"\n  size="${btnSize}"\n  curve="${btnCurve}"${
                      btnLoading ? '\n  isLoading' : ''
                    }${btnDisabled ? '\n  disabled' : ''}${
                      btnIcon === 'left' ? '\n  leftIcon={<Sparkles className="w-3.5 h-3.5" />}' : ''
                    }${btnIcon === 'right' ? '\n  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}' : ''}\n>\n  ${btnText}\n</Button>`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Side-by-Side Curve Comparison Matrix */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-text">Curve Comparison Matrix</h3>
                <p className="text-xs text-text-muted">Direct visual comparison of all 3 geometric styles across primary and secondary treatments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Squircle (9px) */}
                <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text">Squircle (9px)</h4>
                      <p className="text-[11px] text-text-muted">Apple / Linear standard</p>
                    </div>
                    <Badge variant="accent" curve="pill">Default</Badge>
                  </div>
                  <div className="p-4 bg-surface-subtle rounded-lg flex flex-col gap-2.5 items-center justify-center">
                    <Button variant="primary" curve="squircle" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Create Account
                    </Button>
                    <Button variant="secondary" curve="squircle" size="md">
                      View Documentation
                    </Button>
                    <Button variant="accent" curve="squircle" size="sm">
                      Upgrade Team
                    </Button>
                  </div>
                  <p className="text-[11px] text-text-muted font-mono bg-surface-subtle px-2 py-1 rounded">
                    curve="squircle" (rounded-[9px])
                  </p>
                </div>

                {/* Pill Capsule */}
                <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text">Pill Capsule</h4>
                      <p className="text-[11px] text-text-muted">Organic continuous radius</p>
                    </div>
                    <Badge variant="neutral" curve="pill">Capsule</Badge>
                  </div>
                  <div className="p-4 bg-surface-subtle rounded-lg flex flex-col gap-2.5 items-center justify-center">
                    <Button variant="primary" curve="pill" size="md" leftIcon={<HeartHandshake className="w-3.5 h-3.5" />}>
                      Back Initiative
                    </Button>
                    <Button variant="secondary" curve="pill" size="md">
                      Explore Projects
                    </Button>
                    <Button variant="accent" curve="pill" size="sm">
                      Join Community
                    </Button>
                  </div>
                  <p className="text-[11px] text-text-muted font-mono bg-surface-subtle px-2 py-1 rounded">
                    curve="pill" (rounded-full)
                  </p>
                </div>

                {/* Subtle Technical */}
                <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text">Subtle (6px)</h4>
                      <p className="text-[11px] text-text-muted">Developer console crisp</p>
                    </div>
                    <Badge variant="neutral" curve="subtle">Crisp</Badge>
                  </div>
                  <div className="p-4 bg-surface-subtle rounded-lg flex flex-col gap-2.5 items-center justify-center">
                    <Button variant="primary" curve="subtle" size="md">
                      Export Schema
                    </Button>
                    <Button variant="secondary" curve="subtle" size="md">
                      Run Query
                    </Button>
                    <Button variant="accent" curve="subtle" size="sm">
                      Copy Key
                    </Button>
                  </div>
                  <p className="text-[11px] text-text-muted font-mono bg-surface-subtle px-2 py-1 rounded">
                    curve="subtle" (rounded-md)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: LOADING PAGE (NEW DEDICATED COMPONENT SHOWCASE)
        ======================================================== */}
        {activeTab === 'loading' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-border shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted">Variant:</span>
                <div className="flex items-center p-0.5 bg-surface-subtle border border-border rounded-lg text-xs">
                  {(['skeleton', 'branded', 'minimal'] as LoadingPageVariant[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setLoadingVariant(v)}
                      className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all cursor-pointer ${
                        loadingVariant === v
                          ? 'bg-surface text-text shadow-2xs font-semibold'
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      {v === 'skeleton' ? 'App Skeleton Shimmer' : v === 'branded' ? 'Branded Progress Splash' : 'Minimal Spinner'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  curve="squircle"
                  leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
                  onClick={() => setIsFullScreenLoading(true)}
                >
                  Test Full-Screen Mode
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  curve="squircle"
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  onClick={() =>
                    copyToClipboard(
                      `<LoadingPage variant="${loadingVariant}" />`,
                      'LoadingPage JSX'
                    )
                  }
                >
                  Copy JSX
                </Button>
              </div>
            </div>

            {/* Live Loading Page Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-muted px-1">
                <span>Interactive Container Preview (Simulates in-app loading view)</span>
                <span className="font-mono text-[11px]">Variant: {loadingVariant}</span>
              </div>
              <LoadingPage
                variant={loadingVariant}
                title={customLoadingTitle}
                progress={simulatedProgress}
                onCancel={() => copyToClipboard('cancelled', 'Cancel triggered')}
                onRetry={() => {
                  setSimulatedProgress(0);
                  setTimeout(() => setSimulatedProgress(100), 1000);
                }}
              />
            </div>

            {/* Quick documentation */}
            <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-accent" />
                How Teammates Use LoadingPage
              </h4>
              <p className="text-xs text-text-muted">
                Drop this component into any async route, suspense boundary, or authentication gate:
              </p>
              <pre className="text-xs font-mono bg-surface-subtle p-3 rounded-lg border border-border-subtle text-text overflow-x-auto">
{`// In any page or Next.js loading.tsx / React Suspense fallback:
import { LoadingPage } from '@/components/ui';

export default function Loading() {
  return <LoadingPage variant="skeleton" />;
}

// Or for long-running deployments / data ingestion:
<LoadingPage
  variant="branded"
  title="Ingesting Dataset..."
  steps={[
    'Connecting to cluster...',
    'Parsing 50,000 records...',
    'Generating vector embeddings...',
    'Finalizing index...'
  ]}
  onCancel={() => handleAbort()}
/>`}
              </pre>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: COMPONENT GALLERY (NEW & EXISTING ATOMS)
        ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 1. Stat Cards & KPIs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">KPI &amp; Stat Cards (<code className="text-xs font-mono">StatCard</code>)</h3>
                  <p className="text-xs text-text-muted">Compact executive summaries with delta trend indicators and icon slots.</p>
                </div>
                <Badge variant="accent">New Component</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Capital Raised"
                  value="$128,450"
                  change="+18.4%"
                  trend="up"
                  timeframe="vs last month"
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <StatCard
                  label="Active Backers"
                  value="1,429"
                  change="+24.1%"
                  trend="up"
                  timeframe="vs last month"
                  icon={<Users className="w-4 h-4" />}
                />
                <StatCard
                  label="Milestones Verified"
                  value="94.2%"
                  change="+2.1%"
                  trend="up"
                  timeframe="all-time high"
                  icon={<ShieldCheck className="w-4 h-4" />}
                />
                <StatCard
                  label="Average Latency"
                  value="42ms"
                  change="-6ms"
                  trend="up"
                  timeframe="instant CDN"
                  icon={<Activity className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* 2. Select & Custom Dropdowns */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">Select &amp; Form Inputs (<code className="text-xs font-mono">Select, Input</code>)</h3>
                  <p className="text-xs text-text-muted">Custom styled select dropdown with chevron, focus ring, and helper messages.</p>
                </div>
                <Badge variant="accent">New Component</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                  <Select
                    label="Teammate Role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    options={[
                      { value: 'engineer', label: 'Senior Frontend Engineer' },
                      { value: 'designer', label: 'Product Designer' },
                      { value: 'lead', label: 'Technical Lead' },
                      { value: 'auditor', label: 'Security Auditor' },
                    ]}
                    helperText="Controls workspace editing permissions."
                  />
                  <Select
                    label="Curvature Geometry"
                    options={[
                      { value: 'squircle', label: 'Squircle (9px Apple standard)' },
                      { value: 'pill', label: 'Pill Capsule (rounded-full)' },
                      { value: 'subtle', label: 'Subtle Technical (6px)' },
                    ]}
                  />
                </div>

                <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                  <Input
                    label="Search Query"
                    leftIcon={<Search className="w-3.5 h-3.5" />}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    isClearable
                    onClear={() => setSearchVal('')}
                    helperText="Clearable with instant button."
                  />
                  <Input
                    label="Password Field"
                    type="password"
                    defaultValue="SecureTokens2026!"
                    helperText="Click eye icon to toggle visibility."
                  />
                </div>

                <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                  <Input
                    label="Work Email"
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                  />
                  <Input
                    label="Error Validation"
                    defaultValue="invalid-format-domain"
                    error="Please specify a valid top-level domain address."
                  />
                </div>
              </div>
            </div>

            {/* 3. Avatars & Tooltips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">Avatars &amp; Micro-Tooltips (<code className="text-xs font-mono">Avatar, AvatarGroup, Tooltip</code>)</h3>
                  <p className="text-xs text-text-muted">User profiles with fallback initials, online status dots, and hover badges.</p>
                </div>
                <Badge variant="accent">New Component</Badge>
              </div>

              <div className="p-5 bg-surface rounded-xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-text-muted mr-2">Avatar Sizes:</span>
                  <Avatar name="Elena Rostova" size="xs" status="online" />
                  <Avatar name="Sarah Connor" size="sm" status="busy" />
                  <Avatar name="Marcus Vance" size="md" status="online" />
                  <Avatar name="David Chen" size="lg" status="away" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-text-muted mr-2">Avatar Stack:</span>
                  <AvatarGroup max={3}>
                    <Avatar name="Alice Walker" />
                    <Avatar name="Bob Vance" />
                    <Avatar name="Charlie Day" />
                    <Avatar name="Diana Prince" />
                    <Avatar name="Evan Wright" />
                  </AvatarGroup>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-text-muted mr-2">Hover Tooltips:</span>
                  <Tooltip content="Verified cryptographic signer">
                    <Button variant="secondary" size="sm" curve="squircle" leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}>
                      Hover for Tooltip
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* 4. Data Table Component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">Data Table (<code className="text-xs font-mono">Table, TableHeader, TableRow</code>)</h3>
                  <p className="text-xs text-text-muted">Clean data table with hairline borders, subtle hover highlights, and badges.</p>
                </div>
                <Badge variant="accent">New Component</Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Initiative</TableHead>
                    <TableHead>Lead Backer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-text">Solar Desalination Well</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name="Elena Rostova" size="xs" />
                        <span>Elena Rostova</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" withDot>Active Grant</Badge>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums font-medium">$50,000</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" curve="squircle">Manage</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-text">Off-Grid Microgrid Pavilion</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name="David Chen" size="xs" />
                        <span>David Chen</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" withDot>Auditing</Badge>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums font-medium">$32,000</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" curve="squircle">Manage</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-text">Reforestation Seed Drones</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name="Amina Yusuf" size="xs" />
                        <span>Amina Yusuf</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">Draft</Badge>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums font-medium">$15,000</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" curve="squircle">Manage</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* 5. Progress Bars & Badges */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-text">Progress Meters &amp; Semantic Badges</h3>
                <p className="text-xs text-text-muted">Fluid percentage meters and contextual semantic tags.</p>
              </div>

              <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ProgressBar value={28} showLabel label="Pledged Target (28%)" variant="accent" />
                  <ProgressBar value={64} showLabel label="Milestone Validation (64%)" variant="primary" />
                  <ProgressBar value={100} showLabel label="Audit Completed (100%)" variant="success" />
                </div>

                <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-text-muted mr-2">Status Badges:</span>
                  <Badge variant="neutral">Draft</Badge>
                  <Badge variant="primary">Active Initiative</Badge>
                  <Badge variant="accent" withDot>Verified Partner</Badge>
                  <Badge variant="success" withDot>Goal Met</Badge>
                  <Badge variant="error" withDot>Overdue</Badge>
                </div>
              </div>
            </div>

            {/* 6. Alert Notifications */}
            <div className="space-y-3">
              <Alert variant="info" title="Full Loading Page Ready">
                Use <code className="text-[11px] font-mono">&lt;LoadingPage variant="skeleton" /&gt;</code> anywhere in your application routes for instant skeleton screens.
              </Alert>
              <Alert variant="success" title="Component Library Compiled">
                All TypeScript interfaces and exports passed strict typechecks with zero errors.
              </Alert>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: APP PREVIEW (REAL-WORLD PRODUCTION TEMPLATE)
        ======================================================== */}
        {activeTab === 'preview' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-sm font-semibold text-text">Real-World Software Composition</h3>
              <p className="text-xs text-text-muted">How the design system elements seamlessly assemble into a production web app.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Campaign / Initiative Card */}
              <div className="lg:col-span-7 bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
                {/* Header banner */}
                <div className="p-6 border-b border-border bg-gradient-to-r from-surface to-surface-subtle">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">Clean Water Initiative</span>
                      <span aria-hidden="true">·</span>
                      <span>Nairobi Region</span>
                    </div>
                    <Badge variant="success" withDot>Active Grant</Badge>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-text">
                    Solar Desalination Well Deployment
                  </h2>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Deploying 12 off-grid solar-powered groundwater desalination filtration units providing 40,000 liters of potable water daily.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Funding stats grid */}
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b border-border-subtle">
                    <div>
                      <p className="text-xs text-text-muted">Raised so far</p>
                      <p className="text-lg font-bold text-text tabular-nums mt-0.5">$38,450</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Target goal</p>
                      <p className="text-lg font-bold text-text tabular-nums mt-0.5">$50,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Backers</p>
                      <p className="text-lg font-bold text-text tabular-nums mt-0.5">342</p>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <ProgressBar value={76.9} showLabel label="Goal Progress (76.9%)" variant="primary" />

                  {/* Call to action bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      curve="squircle"
                      leftIcon={<HeartHandshake className="w-3.5 h-3.5" />}
                      onClick={() => setModalOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      Pledge Contribution
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      curve="squircle"
                      leftIcon={<Share2 className="w-3.5 h-3.5" />}
                      onClick={() => copyToClipboard('https://meridian.io/initiatives/solar-well', 'Share URL')}
                      className="w-full sm:w-auto"
                    >
                      Share Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      curve="squircle"
                      leftIcon={<Bookmark className="w-3.5 h-3.5" />}
                      className="w-full sm:w-auto text-text-muted"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Pledge Summary Box */}
              <div className="lg:col-span-5 p-6 bg-surface rounded-xl border border-border shadow-xs space-y-5">
                <div>
                  <h4 className="text-sm font-semibold text-text">Direct Backing Form</h4>
                  <p className="text-xs text-text-muted">Select an amount to back this cause immediately.</p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 150].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setPledgeAmount(amt)}
                      className={`py-2 rounded-lg border text-xs font-semibold tabular-nums transition-all cursor-pointer ${
                        pledgeAmount === amt
                          ? 'border-accent bg-accent/10 text-accent ring-1 ring-accent'
                          : 'border-border bg-surface text-text hover:border-border-strong'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <Input
                  label="Donor Name or Organization"
                  placeholder="e.g. Elena Rostova"
                />

                <Input
                  label="Email Receipt"
                  type="email"
                  defaultValue="elena@meridian.io"
                />

                <div className="pt-2">
                  <Button
                    variant="accent"
                    size="md"
                    curve="squircle"
                    fullWidth
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setIsSubmitting(true);
                      setTimeout(() => {
                        setIsSubmitting(false);
                        setSubmitSuccess(true);
                        setTimeout(() => setSubmitSuccess(false), 3000);
                      }, 700);
                    }}
                    isLoading={isSubmitting}
                  >
                    Confirm ${pledgeAmount} Pledge
                  </Button>
                </div>

                {submitSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fadeIn">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pledge verified! Receipt dispatched to your email.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Donation Modal */}
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Pledge Support"
              description="Your capital directly finances off-grid equipment procurement."
              footer={
                <>
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>Authorize Transaction</Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input label="Contribution Amount ($)" defaultValue="100" />
                <Input label="Billing Cardholder" placeholder="Jane Doe" />
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-text-muted">Estimated impact:</span>
                  <span className="font-semibold text-text">8,000 liters filtered / day</span>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ========================================================
            TAB 5: COLOR TOKENS
        ======================================================== */}
        {activeTab === 'tokens' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h3 className="text-sm font-semibold text-text">Core Design Tokens</h3>
              <p className="text-xs text-text-muted">Defined in CSS variables and Tailwind theme classes. Click any swatch to copy hex code.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'Primary', hex: isDark ? '#ffffff' : '#09090b', tw: 'bg-primary', role: 'Main action & solid fills' },
                { name: 'Accent', hex: '#4f46e5', tw: 'bg-accent', role: 'CTAs, focus rings, highlights' },
                { name: 'Canvas', hex: isDark ? '#09090b' : '#fbfbfc', tw: 'bg-background', role: 'Default root canvas' },
                { name: 'Surface', hex: isDark ? '#121215' : '#ffffff', tw: 'bg-surface', role: 'Cards and container panels' },
                { name: 'Border', hex: isDark ? '#27272a' : '#e4e4e7', tw: 'border-border', role: 'Subtle hairline structure' },
                { name: 'Error', hex: '#e11d48', tw: 'bg-error', role: 'Destructive alerts and errors' },
              ].map((token) => (
                <div
                  key={token.name}
                  onClick={() => copyToClipboard(token.hex, token.name)}
                  className="p-3 bg-surface rounded-xl border border-border hover:border-border-strong transition-all cursor-pointer group shadow-2xs"
                >
                  <div
                    className="w-full h-10 rounded-lg border border-border/80 shadow-2xs mb-2 group-hover:scale-102 transition-transform"
                    style={{ backgroundColor: token.hex }}
                  />
                  <p className="text-xs font-semibold text-text truncate">{token.name}</p>
                  <p className="text-[11px] font-mono text-text-muted mt-0.5">{token.hex}</p>
                  <p className="text-[10px] font-mono text-accent font-medium mt-1 truncate">{token.tw}</p>
                </div>
              ))}
            </div>

            {/* Typography Scale */}
            <div className="p-6 bg-surface rounded-xl border border-border shadow-xs space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text">Typography Hierarchy (Plus Jakarta Sans)</h4>
              <div className="space-y-3">
                <div className="pb-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-2xl font-bold tracking-tight text-text">Display 24px Headline</span>
                  <span className="text-xs font-mono text-text-muted">text-2xl font-bold tracking-tight</span>
                </div>
                <div className="pb-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-lg font-semibold tracking-tight text-text">Section Title 18px</span>
                  <span className="text-xs font-mono text-text-muted">text-lg font-semibold</span>
                </div>
                <div className="pb-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-sm text-text">Body text 14px for general descriptions and prose reading.</span>
                  <span className="text-xs font-mono text-text-muted">text-sm text-text</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="text-xs font-mono tabular-nums text-text-muted">Tabular Numerals: $48,290.00 / 99.4%</span>
                  <span className="text-xs font-mono text-text-muted">font-mono tabular-nums</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 px-6 bg-surface/50 text-xs text-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Shared UI Component Package · Ready for team production</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono">Tailwind CSS v4</span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] font-mono">React 19</span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] font-mono">TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
