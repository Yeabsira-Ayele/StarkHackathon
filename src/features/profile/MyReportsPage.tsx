import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink, Flag, FlaskConical } from 'lucide-react';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher.tsx';
import { adminApi } from '../admin/api/admin.api.ts';
import type { AdminReport } from '../admin/types/admin.types.ts';
import { useAuthStore } from '../auth/store/auth.store.ts';

const MyReportsPage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadReports = async () => {
      setLoading(true);
      setError('');
      try {
        const snapshot = await adminApi.getSnapshot();
        if (active) {
          setReports(snapshot.reports.filter(
            (report) => report.reporterId === user?.id && report.id !== 'demo-report-001',
          ));
        }
      } catch (loadError) {
        console.error('Could not load your demo reports.', loadError);
        if (active) setError('Your reports could not be loaded from this browser.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadReports();
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <main className="min-h-screen bg-[#F7F2E7] px-4 py-10 text-[#201C18] dark:bg-[#12100E] dark:text-[#F4EFE6] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#1E4D38] dark:text-[#52B788]">
            <ArrowLeft className="h-4 w-4" /> {t('nav.home', 'Home')}
          </Link>
          <LanguageSwitcher />
        </div>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#9A7432]/30 pb-5">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9A7432]">Your Lewegene space</p>
            <h1 className="mt-2 font-serif text-3xl font-black sm:text-4xl">My Reports</h1>
          </div>
          <span className="inline-flex items-center gap-2 border border-[#9A7432]/40 px-3 py-2 font-mono text-[10px] font-bold uppercase">
            <FlaskConical className="h-3.5 w-3.5 text-[#9A7432]" /> Demo only · stored in this browser
          </span>
        </header>

        {!user && (
          <p className="mt-6 border border-[#9A7432]/30 bg-white/60 p-5 text-sm dark:bg-white/[.03]">
            Choose a demo profile to view reports submitted from that profile.
          </p>
        )}
        {loading && <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Loading your reports…</p>}
        {error && <p role="alert" className="mt-6 border border-red-700/30 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
        {!loading && !error && user && reports.length === 0 && (
          <p className="mt-6 border border-[#9A7432]/30 bg-white/60 p-5 text-sm dark:bg-white/[.03]">
            You have not submitted any cause reports from this demo profile.
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
