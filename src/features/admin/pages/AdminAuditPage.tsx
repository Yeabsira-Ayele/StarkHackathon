import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { VerificationBadgeQueue } from '../components/VerificationBadgeQueue';
import { EmptyState } from '../../../components/EmptyState';

interface AdminAuditPageProps {
  onBack?: () => void;
}

export const AdminAuditPage: React.FC<AdminAuditPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { auditLogs } = useAdmin();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#73685B] hover:text-[#14110E] dark:hover:text-[#FAF6EE] mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', 'ወደ ኋላ')}
        </button>
      )}

      <div>
        <h1 className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          የመድረኩ ኦፊሴላዊ የኦዲት መዝገብ
        </h1>
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1">
          በአስተዳዳሪዎችና በሲቪል ማኅበራት ባለስልጣን ተቆጣጣሪዎች የተሰጡ ውሳኔዎች ታሪካዊ ሰነድ
        </p>
      </div>

      {auditLogs.length > 0 ? (
        <VerificationBadgeQueue logs={auditLogs} />
      ) : (
        <EmptyState
          title="ምንም የኦዲት መዝገብ አልተገኘም"
          description="የተመዘገቡ ውሳኔዎች እዚህ ይዘረዘራሉ"
        />
      )}
    </div>
  );
};

export default AdminAuditPage;
