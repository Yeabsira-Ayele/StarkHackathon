import React from 'react';
import { Award, HeartHandshake, GraduationCap, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PatronBadge } from '../types/profile.types';

interface BadgesListProps {
  badges: PatronBadge[];
}

export const BadgesList: React.FC<BadgesListProps> = ({ badges }) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language as 'am' | 'en' | 'om') || 'am';

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Award':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-rose-500" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#9A7432]" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
      <h3 className="text-sm font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-[#9A7432]" />
        የክብር ሜዳሊያዎችና እውቅናዎች (Patron Badges)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="p-4 rounded-2xl bg-[#EFE7D5]/50 dark:bg-[#1A1714] border border-[#D5C8B2]/60 dark:border-[#2E2822] flex items-start gap-3"
          >
            <div className="p-2.5 rounded-xl bg-[#FAF6EE] dark:bg-[#25201A] shadow-xs shrink-0">
              {renderIcon(badge.iconName)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#14110E] dark:text-[#FAF6EE]">
                {badge.title[lang] || badge.title.am}
              </h4>
              <p className="text-[11px] text-[#73685B] dark:text-[#A89E90] mt-1 line-clamp-2">
                {badge.description[lang] || badge.description.am}
              </p>
              {badge.unlockedAt && (
                <span className="inline-block text-[9px] text-[#9A7432] dark:text-[#C9A24D] mt-2 font-mono">
                  {new Date(badge.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesList;
