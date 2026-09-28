import React from 'react';
import { User, Award, ShieldCheck, MapPin, Mail, Phone, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfileData } from '../types/profile.types';

interface ProfileCardProps {
  profile: UserProfileData;
  onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E4D38] to-[#123023] flex items-center justify-center text-white font-serif font-bold text-2xl shadow-md">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
                {profile.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                የተረጋገጠ ለጋሽ
              </span>
            </div>
            {profile.bio && (
              <p className="text-xs text-[#73685B] dark:text-[#A89E90] mt-1 max-w-md line-clamp-2">
                {profile.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#73685B] dark:text-[#A89E90] mt-2">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {profile.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EBE3D3] dark:bg-[#201C18] text-[#14110E] dark:text-[#FAF6EE] hover:bg-[#E0D5C1] dark:hover:bg-[#28231E] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            መረጃ አዘምን
          </button>
        )}
      </div>

      {/* Numerical Stats bar */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#D5C8B2]/50 dark:border-[#2E2822]">
        <div className="p-3 rounded-2xl bg-[#EFE7D5]/60 dark:bg-[#1C1814] text-center">
          <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-bold tracking-wider">
            ጠቅላላ የተበረከተ
          </p>
          <p className="text-base font-serif font-bold text-[#1E4D38] dark:text-[#52B788] mt-0.5">
            {profile.totalDonated.toLocaleString()} {t('common.currency', 'ብር')}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-[#EFE7D5]/60 dark:bg-[#1C1814] text-center">
          <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-bold tracking-wider">
            የተደገፉ ምክንያቶች
          </p>
          <p className="text-base font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mt-0.5">
            {profile.causesSupportedCount}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-[#EFE7D5]/60 dark:bg-[#1C1814] text-center">
          <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] uppercase font-bold tracking-wider">
            ዲጂታል ሰነዶች
          </p>
          <p className="text-base font-serif font-bold text-[#9A7432] dark:text-[#C9A24D] mt-0.5">
            {profile.certificatesCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
