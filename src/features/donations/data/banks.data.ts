export interface Bank {
  id: string;
  code: string;
  name: {
    en: string;
    am: string;
    om: string;
  };
  shortName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  swiftCode?: string;
  paybillCode?: string;
  logoText: string;
  badge: string;
  isPopular?: boolean;
  color: string;
  instructions: {
    en: string[];
    am: string[];
    om: string[];
  };
}

export const mockBanks: Bank[] = [
  {
    id: 'bank_cbe',
    code: 'CBE',
    name: {
      en: 'Commercial Bank of Ethiopia (CBE)',
      am: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
      om: 'Baankii Daldala Itoophiyaa (CBE)',
    },
    shortName: 'CBE',
    accountNumber: '1000284920194',
    accountName: 'Lewegene Civic Solidarity / Community Escrow',
    branch: 'Addis Ababa Central Branch',
    swiftCode: 'CBETETAA',
    logoText: 'CBE',
    badge: 'State Escrow & Largest Network',
    isPopular: true,
    color: '#800080',
    instructions: {
      en: [
        'Open your CBE Mobile Banking App or dial *847#',
        'Select "Transfer" → "Transfer to CBE Account"',
        'Enter Account Number: 1000284920194',
        'Verify receiver: "Lewegene Civic Solidarity"',
        'Complete transfer and paste your digital payment receipt link below',
      ],
      am: [
        'የሲቢኢ ሞባይል ባንኪንግ መተግበሪያን ይክፈቱ ወይም *847# ይደውሉ',
        '«ገንዘብ ማስተላለፍ» → «ወደ ሲቢኢ ሂሳብ» የሚለውን ይምረጡ',
        'የሂሳብ ቁጥር: 1000284920194 ያስገቡ',
        'ተቀባይ «Lewegene Civic Solidarity» መሆኑን ያረጋግጡ',
        'ክፍያውን ፈፅመው የግብይት ማረጋገጫ ሊንኩን ከታች ያስገቡ',
      ],
      om: [
        'Appii Baankii Moobaayilaa CBE banaa yookiin *847# bilbilaa',
        '"Dabarsa" → "Gara herrega CBEtti" filadhaa',
        'Lakkoofsa Herregaa: 1000284920194 galchaa',
        'Maqaan simataa "Lewegene Civic Solidarity" ta’uu mirkaneeffadhaa',
        'Kaffaltii raawwadhaa liinkii nagahee kaffaltii asitti galchaa',
      ],
    },
  },
  {
    id: 'bank_telebirr',
    code: 'TELEBIRR',
    name: {
      en: 'Telebirr (Ethio Telecom)',
      am: 'ቴሌብር (ኢትዮ ቴሌኮም)',
      om: 'Telebirr (Ityoo Teelekoom)',
    },
    shortName: 'Telebirr',
    accountNumber: '584920',
    accountName: 'Lewegene National Solidarity Fund',
    branch: 'Ethio Telecom Head Office',
    paybillCode: '584920',
    logoText: 'TBIRR',
    badge: 'Instant 1-Second Paybill',
    isPopular: true,
    color: '#0072CE',
    instructions: {
      en: [
        'Open your Telebirr SuperApp or dial *127#',
        'Select "Pay Merchant" and enter Merchant Code: 584920',
        'Or transfer to verified phone: +251 91 100 2233',
        'Confirm receiver name "Lewegene National Solidarity"',
        'Copy your Telebirr digital receipt link and paste it below',
      ],
      am: [
        'የቴሌብር መተግበሪያን ይክፈቱ ወይም *127# ይደውሉ',
        '«ክፍያ ፈፅም / የነጋዴ ቁጥር» መርጠው 584920 ያስገቡ',
        'ወይም ወደ ተረጋገጠ ስልክ: +251 91 100 2233 ያስተላልፉ',
        'የተቀባይ ስም «Lewegene National Solidarity» መሆኑን ያረጋግጡ',
        'የደረሶትን የክፍያ ደረሰኝ ሊንክ ከታች ያስገቡ',
      ],
      om: [
        'Appii Telebirr banaa yookiin *127# bilbilaa',
        '"Kaffaltii Daldalaa" filachuun 584920 galchaa',
        'Yookiin lakkoofsa mirkanaa’e: +251 91 100 2233 irratti dabarsaa',
        'Maqaan simataa "Lewegene National Solidarity" ta’uu mirkaneeffadhaa',
        'Liinkii nagahee kaffaltii asitti galchaa',
      ],
    },
  },
  {
    id: 'bank_abyssinia',
    code: 'BOA',
    name: {
      en: 'Bank of Abyssinia (BOA)',
      am: 'የአቢሲንያ ባንክ (BOA)',
      om: 'Baankii Abisiiniyaa (BOA)',
    },
    shortName: 'Abyssinia',
    accountNumber: '84739201',
    accountName: 'Lewegene Civic Relief Fund',
    branch: 'Bole Medhanialem Branch',
    swiftCode: 'ABYSETAA',
    logoText: 'BOA',
    badge: 'Apollo & BOA Mobile Clearing',
    isPopular: true,
    color: '#D4AF37',
    instructions: {
      en: [
        'Open BOA Mobile or Apollo App',
        'Select "Fund Transfer" → "To Bank of Abyssinia Account"',
        'Enter Account Number: 84739201',
        'Confirm beneficiary: "Lewegene Civic Relief Fund"',
        'Paste your digital payment receipt link after completing payment',
      ],
      am: [
        'የአቢሲንያ ሞባይል ወይም የአፖሎ መተግበሪያን ይክፈቱ',
        '«ገንዘብ ማስተላለፍ» → «ወደ አቢሲንያ ሂሳብ» ይምረጡ',
        'የሂሳብ ቁጥር: 84739201 ያስገቡ',
        'ተቀባይ «Lewegene Civic Relief Fund» መሆኑን ያረጋግጡ',
        'ክፍያውን ፈፅመው የደረሰኝ ሊንኩን ከታች ያስገቡ',
      ],
      om: [
        'Appii BOA Mobile yookiin Apollo banaa',
        '"Dabarsa Maallaqaa" filadhaa',
        'Lakkoofsa Herregaa: 84739201 galchaa',
        'Maqaa simataa mirkaneeffadhaa',
        'Kaffaltii booda liinkii nagahee galchaa',
      ],
    },
  },
  {
    id: 'bank_awash',
    code: 'AWASH',
    name: {
      en: 'Awash Bank',
      am: 'አዋሽ ባንክ',
      om: 'Baankii Hawaas',
    },
    shortName: 'Awash',
    accountNumber: '01320849201900',
    accountName: 'Lewegene Civic Solidarity Organization',
    branch: 'Ras Abebe Aregay Head Office',
    swiftCode: 'AWINETAA',
    logoText: 'AWASH',
    badge: 'Awash Birr & Retail Wire',
    isPopular: true,
    color: '#005A9C',
    instructions: {
      en: [
        'Open Awash Mobile Banking or Awash Birr App',
        'Select "Direct Transfer" and enter Account: 01320849201900',
        'Confirm name: "Lewegene Civic Solidarity Organization"',
        'Copy your digital payment receipt link and paste it in Lewegene',
      ],
      am: [
        'የአዋሽ ሞባይል ባንኪንግ ወይም የአዋሽ ብር መተግበሪያን ይክፈቱ',
        '«ቀጥታ ማስተላለፍ» መርጠው ሂሳብ ቁጥር: 01320849201900 ያስገቡ',
        'ተቀባይ «Lewegene Civic Solidarity Organization» መሆኑን ያረጋግጡ',
        'የክፍያ ደረሰኝ ሊንኩን ወስደው በለወገኔ ላይ ያስገቡ',
      ],
      om: [
        'Appii Awash Mobile yookiin Awash Birr banaa',
        '"Dabarsa Kallattii" filachuun herrega: 01320849201900 galchaa',
        'Maqaa simataa mirkaneeffadhaa',
        'Liinkii nagahee dabarsa maallaqaa asitti galchaa',
      ],
    },
  },
  {
    id: 'bank_coop',
    code: 'COOP',
    name: {
      en: 'Cooperative Bank of Oromia (Coop)',
      am: 'የኦሮሚያ ህብረት ስራ ባንክ (ኮኦፕ)',
      om: 'Baankii Hojii Gamtaa Oromiyaa (Coop)',
    },
    shortName: 'Coop',
    accountNumber: '100293847291',
    accountName: 'Lewegene Public Trust Foundation',
    branch: 'Finfinnee Main Branch',
    swiftCode: 'CBORETAA',
    logoText: 'COOP',
    badge: 'Coopay-Ebirr Direct Interlink',
    isPopular: false,
    color: '#00843D',
    instructions: {
      en: [
        'Open Coopay-Ebirr App or Coop Mobile Banking',
        'Choose "Transfer to Coop Account" and input: 100293847291',
        'Confirm: "Lewegene Public Trust Foundation"',
        'Paste your digital payment receipt link to complete verification',
      ],
      am: [
        'የኮኦፔይ-ኢብር ወይም የኮኦፕ ሞባይል መተግበሪያን ይክፈቱ',
        '«ወደ ኮኦፕ ሂሳብ ማስተላለፍ» መርጠው: 100293847291 ያስገቡ',
        'ተቀባይ «Lewegene Public Trust Foundation» መሆኑን ያረጋግጡ',
        'የደረሰኝ ሊንኩን ከታች ያስገቡ',
      ],
      om: [
        'Appii Coopay-Ebirr yookiin Baankii Moobaayilaa Coop banaa',
        '"Gara herrega CBOtti" filadhaa: 100293847291',
        'Maqaa simataa mirkaneeffadhaa',
        'Liinkii nagahee galchaa',
      ],
    },
  },
  {
    id: 'bank_dashen',
    code: 'DASHEN',
    name: {
      en: 'Dashen Bank (Amole)',
      am: 'ዳሽን ባንክ (አሞሌ)',
      om: 'Baankii Daashen (Amoolee)',
    },
    shortName: 'Dashen',
    accountNumber: '502938472910',
    accountName: 'Lewegene Social Support Project',
    branch: 'Kirkos Branch Addis Ababa',
    swiftCode: 'DASHETAA',
    logoText: 'DASHEN',
    badge: 'Amole Instant Gateway',
    isPopular: false,
    color: '#1C3F95',
    instructions: {
      en: [
        'Open Amole or Dashen Mobile Banking',
        'Transfer funds to Account: 502938472910',
        'Verify recipient "Lewegene Social Support Project"',
        'Paste your digital payment receipt link back here on Lewegene',
      ],
      am: [
        'አሞሌ ወይም የዳሽን ሞባይል መተግበሪያን ይክፈቱ',
        'ወደ ሂሳብ ቁጥር: 502938472910 ያስተላልፉ',
        'ተቀባይ «Lewegene Social Support Project» መሆኑን ያረጋግጡ',
        'የደረሰኝ ሊንኩን በለወገኔ ላይ ያስገቡ',
      ],
      om: [
        'Appii Amole yookiin Daashen banaa',
        'Gara lakkoofsa herregaa: 502938472910tti dabarsaa',
        'Maqaa simataa mirkaneeffadhaa',
        'Liinkii nagahee asitti galchaa',
      ],
    },
  },
  {
    id: 'bank_cbe_birr',
    code: 'CBE_BIRR',
    name: {
      en: 'CBE Birr',
      am: 'ሲቢኢ ብር',
      om: 'CBE Birr',
    },
    shortName: 'CBE Birr',
    accountNumber: '882190',
    accountName: 'Lewegene Direct Civic Escrow',
    branch: 'CBE Digital Banking',
    paybillCode: '882190',
    logoText: 'CBE B',
    badge: 'Nationwide Mobile Wallet',
    isPopular: false,
    color: '#8A2BE2',
    instructions: {
      en: [
        'Dial *847# or open CBE Birr App',
        'Choose "Pay Merchant" and enter code: 882190',
        'Or transfer to mobile number: +251 98 811 2233',
        'Copy the confirmation receipt link to paste here',
      ],
      am: [
        '*847# ይደውሉ ወይም የሲቢኢ ብር መተግበሪያን ይክፈቱ',
        '«ነጋዴ ይክፈሉ» መርጠው ኮድ: 882190 ያስገቡ',
        'ወይም ወደ ስልክ ቁጥር: +251 98 811 2233 ያስተላልፉ',
        'የደረሶትን የማረጋገጫ ሊንክ እዚህ ያስገቡ',
      ],
      om: [
        '*847# bilbilaa yookiin appii CBE Birr banaa',
        '"Kaffaltii Daldalaa" filachuun koodii: 882190 galchaa',
        'Liinkii nagahee asitti galchaa',
      ],
    },
  },
  {
    id: 'bank_hibret',
    code: 'HIBRET',
    name: {
      en: 'Hibret Bank',
      am: 'ህብረት ባንክ',
      om: 'Baankii Hibret',
    },
    shortName: 'Hibret',
    accountNumber: '109283746501',
    accountName: 'Lewegene Community Trust',
    branch: 'Hiber Tower Addis Ababa',
    swiftCode: 'UNITEDAA',
    logoText: 'HIBRET',
    badge: 'Direct Wire',
    isPopular: false,
    color: '#D97706',
    instructions: {
      en: [
        'Open Hibret Mobile Banking App',
        'Select "Account Transfer" and enter: 109283746501',
        'Confirm receiver: "Lewegene Community Trust"',
        'Paste your digital receipt link in Lewegene upon completion',
      ],
      am: [
        'የህብረት ሞባይል መተግበሪያን ይክፈቱ',
        '«ሂሳብ ማስተላለፍ» መርጠው: 109283746501 ያስገቡ',
        'ተቀባይ «Lewegene Community Trust» መሆኑን ያረጋግጡ',
        'የደረሰኝ ሊንኩን በለወገኔ ላይ ይመዝግቡ',
      ],
      om: [
        'Appii Hibret Mobile banaa',
        'Dabarsa maallaqaa filachuun herrega: 109283746501 galchaa',
        'Maqaa simataa mirkaneeffadhaa',
        'Liinkii nagahee asitti galchaa',
      ],
    },
  },
];

export const getBankById = (id: string): Bank | undefined => {
  return mockBanks.find((b) => b.id === id || b.code.toLowerCase() === id.toLowerCase());
};
