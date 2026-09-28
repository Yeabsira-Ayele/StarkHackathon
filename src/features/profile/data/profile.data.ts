import { UserProfileData, PatronBadge } from '../types/profile.types';

export const PATRON_BADGES: PatronBadge[] = [
  {
    id: 'first_pledge',
    title: {
      am: 'የመጀመሪያው ድጋፍ አበርካች',
      en: 'First Pledge Founder',
      om: 'Gumaacha Jalqabaa',
    },
    description: {
      am: 'በለወገን መድረክ የመጀመሪያውን የዜግነት ድጋፍ አበርክተዋል',
      en: 'Initiated the first civic solidarity pledge on Lewegene',
      om: 'Waltajjii Lewegene irratti gumaacha jalqabaa taasiftaniittu',
    },
    iconName: 'Award',
    tier: 'bronze',
    unlockedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'health_guardian',
    title: {
      am: 'የህክምና ተስፋ አጋር',
      en: 'Healthcare Champion',
      om: 'Hawaasa Fayyaa',
    },
    description: {
      am: 'የህይወት አድን የህክምና ወጪዎችን በልግስና ደግፈዋል',
      en: 'Funded critical surgical interventions for cardiac patients',
      om: 'Baasii yaala fayyaa lubbuu baraaruuf gumaachaniittu',
    },
    iconName: 'HeartHandshake',
    tier: 'gold',
    unlockedAt: '2024-02-20T14:20:00Z',
  },
  {
    id: 'stem_benefactor',
    title: {
      am: 'የዕውቀትና ትምህርት አጋር',
      en: 'STEM Pioneer',
      om: 'Barsiisa Beekumsaa',
    },
    description: {
      am: 'የገጠር ትምህርት ቤቶችን የኮምፒውተር ቤተ-ሙከራዎች አሟልተዋል',
      en: 'Supplied high-density digital literacy labs to public schools',
      om: 'Manni barumsaa baadiyyaa laabii kompiitaraa akka argatan deeggartaniittu',
    },
    iconName: 'GraduationCap',
    tier: 'silver',
    unlockedAt: '2024-03-01T09:15:00Z',
  },
];

export const MOCK_USER_PROFILE: UserProfileData = {
  id: 'usr-donor-01',
  name: 'አቤል ተፈራ (Abel Tefera)',
  email: 'abel.tefera@gmail.com',
  phone: '+251 911 223 344',
  bio: 'ለህሙማን ህጻናትና ለገጠር ትምህርት ቤቶች ልማት የበኩሌን አስተዋጽኦ የማደርግ ዜጋ ነኝ።',
  location: 'Addis Ababa, Bole Sub-City',
  preferredLanguage: 'am',
  totalDonated: 12500,
  causesSupportedCount: 5,
  certificatesCount: 4,
  badges: PATRON_BADGES,
  recentActivities: [
    {
      id: 'act-01',
      type: 'donation',
      title: 'የልብ ቀዶ ጥገና ድጋፍ ተበርክቷል',
      amount: 5000,
      timestamp: '2024-03-12T11:45:00Z',
      certificateId: 'LWG-CERT-2024-9481',
      campaignTitle: 'የህጻን ቤተልሔም አስቸኳይ የልብ ቀዶ-ጥገና ህክምና ድጋፍ',
    },
    {
      id: 'act-02',
      type: 'donation',
      title: 'የኮምፒውተር ቤተ-ሙከራ ድጋፍ ተበርክቷል',
      amount: 2500,
      timestamp: '2024-02-18T16:20:00Z',
      certificateId: 'LWG-CERT-2024-8120',
      campaignTitle: 'ለኦሮሚያ ገጠር ትምህርት ቤቶች የኮምፒውተር ቤተ-ሙከራ ማደራጃ',
    },
  ],
};
