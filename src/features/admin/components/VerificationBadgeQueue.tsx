import React from 'react';
import { ShieldCheck, Award, ArrowUpRight } from 'lucide-react';
import { AuditLog } from '../types/admin.types';

interface VerificationBadgeQueueProps {
  logs: AuditLog[];
}

export const VerificationBadgeQueue: React.FC<VerificationBadgeQueueProps> = ({ logs }) => {
  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
      <h3 className="text-sm font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#9A7432]" />
        የኦዲትና ፍተሻ መዝገብ (ACSO Compliance Audit Log)
      </h3>

      <div className="divide-y divide-[#D5C8B2]/40 dark:divide-[#2E2822]">
        {logs.map((log) => (
          <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    log.action === 'approve'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-500/15 text-red-700 dark:text-red-400'
                  }`}
                >
                  {log.action === 'approve' ? 'ጸድቋል' : 'ውድቅ ተደርጓል'}
                </span>
                <span className="font-semibold text-[#14110E] dark:text-[#FAF6EE]">
                  {log.targetTitle}
                </span>
              </div>
              {log.reason && (
                <p className="text-[11px] text-[#73685B] dark:text-[#A89E90] mt-1 italic">
                  "{log.reason}"
                </p>
              )}
              <span className="text-[10px] text-[#9A7432] dark:text-[#C9A24D] font-mono mt-0.5 inline-block">
                መርማሪ፡ {log.adminEmail} • {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationBadgeQueue;
