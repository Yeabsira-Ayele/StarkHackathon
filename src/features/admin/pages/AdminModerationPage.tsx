import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { AdminStatsBar } from '../components/AdminStatsBar';
import { CampaignModerationCard } from '../components/CampaignModerationCard';
import { Loading } from '../../../components/Loading';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/ErrorState';

export const AdminModerationPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    pendingCampaigns,
    isLoadingPending,
    stats,
    moderateCampaign,
    isModerating,
  } = useAdmin();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788] mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              የቁጥጥርና ማረጋገጫ ዴስክ (ACSO Compliance)
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
            የህዝብ ልገሳ ፕሮጀክቶች ማረጋገጫ
          </h1>
          <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1">
            በሲቪል ማኅበራት ህግ መሰረት የቀረቡ አዳዲስ የገንዘብ ማሰባሰቢያ ፕሮጀክቶችን መርምረው ያጽድቁ
          </p>
        </div>
      </div>

      {/* Top Stats Overview */}
      <AdminStatsBar stats={stats} />

      {/* Pending Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-base font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          ውሳኔ የሚጠባበቁ ፕሮጀክቶች ({pendingCampaigns.length})
        </h2>

        {isLoadingPending ? (
          <Loading variant="skeleton" count={2} />
        ) : pendingCampaigns.length === 0 ? (
          <EmptyState
            title="በጥበቃ ላይ ያለ ፕሮጀክት የለም"
            description="ሁሉም የቀረቡ ማመልከቻዎች ተመርምረው ውሳኔ አግኝተዋል።"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingCampaigns.map((camp) => (
              <CampaignModerationCard
                key={camp.id}
                campaign={camp}
                isProcessing={isModerating}
                onApprove={async (id, reason) => {
                  await moderateCampaign({
                    campaignId: id,
                    action: 'approve',
                    reason,
                    title: camp.title,
                  });
                }}
                onReject={async (id, reason) => {
                  await moderateCampaign({
                    campaignId: id,
                    action: 'reject',
                    reason,
                    title: camp.title,
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModerationPage;
