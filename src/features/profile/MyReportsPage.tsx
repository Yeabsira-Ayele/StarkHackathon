import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, Flag, Moon, Sun } from 'lucide-react';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher.tsx';
import type { AdminReport } from '../admin/types/admin.types.ts';
import { useAuthStore } from '../auth/store/auth.store.ts';
import { APP_NAME } from '../../data/content.ts';
import { reportsApi } from '../reports/api/reports.api.ts';

const MyReportsPage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lewegene_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('lewegene_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setReports([]);
      setError(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);
    reportsApi.getMyReports()
      .then((items) => {
        if (active) setReports(items);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Could not load your reports.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, loadAttempt]);

  return (
    <main className="min-h-screen bg-[#F7F2E7] px-4 py-8 text-[#201C18] dark:bg-[#12100E] dark:text-[#F4EFE6] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9A7432]/25 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs font-bold uppercase tracking-wider">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 border border-[#26211C]/35 bg-[#FFFDF9] px-3 py-1.5 font-black text-[#1E4D38] transition-colors hover:border-[#1E4D38] dark:border-[#9A7432]/45 dark:bg-[#1C1814] dark:text-[#52B788]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('nav.home')}</span>
            </Link>
            <Link
              to="/fundraising"
              className="px-2.5 py-1.5 text-[#201C18] transition-colors hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:text-[#52B788]"
            >
              {t('nav.myFundraisers')}
            </Link>
            <Link
              to="/contributions"
              className="px-2.5 py-1.5 text-[#201C18] transition-colors hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:text-[#52B788]"
            >
              {t('nav.myContributions')}
            </Link>
            <Link
              to="/profile"
              className="px-2.5 py-1.5 text-[#201C18] transition-colors hover:text-[#1E4D38] dark:text-[#E8DEC8] dark:hover:text-[#52B788]"
            >
              {t('nav.myProfile')}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={t('nav.toggleTheme')}
              title={t('nav.toggleTheme')}
              className="p-2 border border-[#9A7432]/50 bg-[#F2ECE1] hover:bg-[#9A7432]/15 text-[#201C18] dark:bg-[#1C1814] dark:text-[#D8B066] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#9A7432]/30 pb-5">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9A7432]">{t('profile.space', { appName: APP_NAME })}</p>
            <h1 className="mt-2 font-serif text-3xl font-black sm:text-4xl">My Reports</h1>
          </div>
          <span className="inline-flex items-center gap-2 border border-[#9A7432]/40 px-3 py-2 font-mono text-[10px] font-bold uppercase">
            <Flag className="h-3.5 w-3.5 text-[#9A7432]" /> ACSO Moderation Queue
          </span>
        </header>

        {!user && (
          <p className="mt-6 border border-[#9A7432]/30 bg-white/60 p-5 text-sm dark:bg-white/[.03]">
            Sign in to view your submitted cause reports.
          </p>
        )}
        {loading && <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading your reports…</p>}
        {error && (
          <div role="alert" className="mt-6 border border-red-700/30 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
            <p>{error}</p>
            <button type="button" className="mt-2 underline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry</button>
          </div>
        )}
        {!loading && !error && user && reports.length === 0 && (
          <p className="mt-6 border border-[#9A7432]/30 bg-white/60 p-5 text-sm dark:bg-white/[.03]">
            You have not submitted any cause reports from this account.
          </p>
        )}

        <div className="mt-6 grid gap-4">
          {reports.map((report) => (
            <article key={report.id} className="border border-[#9A7432]/30 bg-white/60 p-5 dark:bg-white/[.03]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-[#9A7432]/30 bg-[#F2EADA] dark:bg-[#201B16]">
                    <Flag className="h-4 w-4 text-[#9A7432]" />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-bold">{report.category}</h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      Submitted {new Date(report.createdAt).toLocaleDateString()} · Cause {report.campaignId}
                    </p>
                  </div>
                </div>
                <span className="border border-[#9A7432]/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">
                  {report.status.replaceAll('_', ' ')}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{report.details}</p>
              <Link to={`/causes/${report.campaignId}`} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#1E4D38] hover:underline dark:text-[#52B788]">
                View cause <ExternalLink className="h-3 w-3" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MyReportsPage;
