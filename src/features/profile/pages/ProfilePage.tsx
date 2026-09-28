import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../hooks/useProfile';
import { ProfileCard } from '../components/ProfileCard';
import { BadgesList } from '../components/BadgesList';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Loading } from '../../../components/Loading';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';

interface ProfilePageProps {
  onBack?: () => void;
  onNavigateSettings?: () => void;
  onViewCertificate?: (id: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onBack,
  onNavigateSettings,
  onViewCertificate,
}) => {
  const { t } = useTranslation();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return <Loading variant="full" message="የለጋሽ መረጃ በመጫን ላይ..." />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="የተጠቃሚ መረጃ አልተገኘም"
        description="እባክዎ መጀመሪያ ወደ መለያዎ ይግቡ"
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
            የለጋሽ መለያና አስተዋጽኦዎች
          </h1>
          <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1">
            በለወገን መድረክ ያከናወኗቸው የሰብአዊና ማኅበራዊ ድጋፎች ሙሉ መዝገብ
          </p>
        </div>
      </div>

      <ProfileCard profile={profile} onEdit={onNavigateSettings} />

      <BadgesList badges={profile.badges} />

      {profile.recentActivities.length > 0 ? (
        <ActivityTimeline
          activities={profile.recentActivities}
          onViewCertificate={onViewCertificate}
        />
      ) : (
        <EmptyState
          title="ምንም የቅርብ ጊዜ ልገሳ አልተመዘገበም"
          description="ምክንያቶችን በመደገፍ የመጀመሪያዎን ዲጂታል ሰነድ ያግኙ"
        />
      )}
    </div>
  );
};

export default ProfilePage;
