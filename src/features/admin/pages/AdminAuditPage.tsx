import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { VerificationBadgeQueue } from '../components/VerificationBadgeQueue';
import { EmptyState } from '../../../components/EmptyState';
import { AdminErrorState, AdminLoadingState } from '../components/AdminUI';

interface AdminAuditPageProps {
  onBack?: () => void;
}

export const AdminAuditPage: React.FC<AdminAuditPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { auditLogs, isLoadingAudit, auditError, refetchAudit } = useAdmin();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#73685B] hover:text-[#14110E] dark:hover:text-[#FAF6EE] mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      )}

      <div>
        <h1 className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          {t('adminAudit.title')}
        </h1>
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1">
          {t('adminAudit.description')}
        </p>
      </div>

      {isLoadingAudit ? (
        <AdminLoadingState label="Loading audit records…" />
      ) : auditError ? (
        <AdminErrorState
          title="Audit records are unavailable"
          text={auditError instanceof Error ? auditError.message : 'Could not load audit records.'}
          onRetry={() => void refetchAudit()}
        />
      ) : auditLogs.length > 0 ? (
        <VerificationBadgeQueue logs={auditLogs} />
      ) : (
        <EmptyState
          title={t('adminAudit.empty')}
          description={t('adminAudit.emptyHint')}
        />
      )}
    </div>
  );
};

export default AdminAuditPage;
