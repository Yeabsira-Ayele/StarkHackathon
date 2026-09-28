import { OrganizationProfile } from '../types/fundraiser.types';

export const INITIAL_ORGANIZATION: OrganizationProfile = {
  id: 'org-rotary-eth',
  name: 'Rotary Club of Addis Ababa (Central)',
  registrationNo: 'FDRE-ACSO-2019-8472',
  verified: true,
  contactEmail: 'projects@rotaryaddis.org',
  location: 'Addis Ababa, Kirkos Sub-City',
  totalRaised: 1850000,
};

export const FUNDRAISER_GUIDELINES = [
  {
    id: 'verify_acso',
    title: {
      am: 'የሲቪል ማኅበራት ፈቃድ ማረጋገጥ',
      en: 'ACSO Registration Verification',
      om: 'Waraqaa Ragaa ACSO Mirkaneessuu',
    },
    description: {
      am: 'ሁሉም ፕሮጀክቶች በኢ.ፌ.ዲ.ሪ ሲቪል ማኅበራት ድርጅቶች ባለስልጣን እውቅና ያገኙ መሆን አለባቸው።',
      en: 'All initiatives must hold valid civic society registration under FDRE ACSO directives.',
      om: 'Pirojektoonni hundi abbaa taayitaa dhaabbilee hawaasa siivilii FDRI tiin beekamtii qabaachuu qabu.',
    },
  },
  {
    id: 'escrow_transparency',
    title: {
      am: 'ቀጥታ የገንዘብ ግልፅነት',
      en: '100% Escrow Direct Disbursement',
      om: 'Iftoomina Maallaqaa Guutuu',
    },
    description: {
      am: 'የተሰበሰበው ገንዘብ በቀጥታ ወደ ህጋዊ የባንክ ሂሳብ እና ለታለመለት ፕሮጀክት ይተላለፋል።',
      en: 'Funds flow directly into verified project banking rails with public transaction certificates.',
      om: 'Maallaqni walitti qabame kallattiin herrega baankii seera qabeessaa fi pirojektichaaf darba.',
    },
  },
  {
    id: 'beneficiary_metrics',
    title: {
      am: 'ተጨባጭ የተጠቃሚ መረጃ',
      en: 'Quantifiable Beneficiary Impact',
      om: 'Faayidaa Qabatamaa Lammilee',
    },
    description: {
      am: 'የተጠቃሚ ዜጎች ቁጥር እና የሚጠበቀውን ማኅበራዊ ለውጥ በግልጽ ማመልከት።',
      en: 'State measurable target beneficiaries and verifiable physical impact milestones.',
      om: 'Baay\'ina lammilee fayyadaman fi jijjiirama hawaasummaa eegamu ifatti agarsiisuu.',
    },
  },
];
