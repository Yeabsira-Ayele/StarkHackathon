import React, { useState } from 'react';

export interface HeritageSite {
  id: string;
  name: string;
  amharicName: string;
  region: string;
  era: string;
  symbolism: string;
  description: string;
}

export const ETHIOPIAN_HERITAGE_SITES: HeritageSite[] = [
  {
    id: 'lalibela',
    name: 'Lalibela · Bet Giyorgis',
    amharicName: 'ቤተ ጊዮርጊስ · ላሊበላ',
    region: 'Lasta, Amhara',
    era: '12th Century AD (King Lalibela)',
    symbolism: 'Faith, Monolithic Architecture, Endurance',
    description: 'Carved downwards 12 meters into red volcanic volcanic tuff with an iconic equal-armed Greek cross roof plan, representing the pinnacle of rock-hewn Ethiopian engineering.',
  },
  {
    id: 'gondar',
    name: 'Fasil Ghebbi · Gondar Castles',
    amharicName: 'ፋሲል ግቢ · ጎንደር',
    region: 'Central Gondar, Amhara',
    era: '17th Century AD (Emperor Fasilides)',
    symbolism: 'Sovereignty, Stone Masonry, Medieval Governance',
    description: 'The Royal Enclosure featuring stone battlements, circular domed corner turrets, and arched bridge passages blending Ethiopian, Arab, and Baroque architectural styles.',
  },
  {
    id: 'harar',
    name: 'Harar Jugol · Historic Gate',
    amharicName: 'የሐረር ጁጎል በር',
    region: 'Harari Region',
    era: '16th Century AD (Emir Nur)',
    symbolism: 'Peace, Crossroads of Commerce, Islamic Heritage',
    description: 'The fortified stone walls and 5 historic monumental gates of Harar Jugol, recognized as the 4th holiest city in Islam and a UNESCO World Heritage cultural sanctuary.',
  },
  {
    id: 'jebena',
    name: 'Kaffa & Oromia · Jebena Coffee Ceremony',
    amharicName: 'የኢትዮጵያ ቡና ሥነ-ሥርዓት',
    region: 'Kaffa, Oromia & All Ethiopia',
    era: 'Ancestral Origins (Coffea Arabica)',
    symbolism: 'Communal Hospitality, Reconciliation, Daily Solidarity',
    description: 'The traditional clay long-necked Jebena brewing freshly roasted coffee over aromatic frankincense (itan), served in handleless sini cups as a sacred ritual of communal bonding.',
  },
  {
    id: 'simien',
    name: 'Simien Mountains & Walia Ibex',
    amharicName: 'የስሜን ተራሮችና ዋልያ',
    region: 'North Gondar & Simien National Park',
    era: 'Afro-Alpine Ecosystem (Ras Dejen 4,550m)',
    symbolism: 'Highland Pride, Resilience, Endemic Natural Heritage',
    description: 'The dramatic jagged precipices and gorges of the Simien range, home to the endangered Walia Ibex with its magnificent sweeping ridged horns.',
  },
  {
    id: 'tana',
    name: 'Lake Tana & Papyrus Tankwa',
    amharicName: 'ጣና ሐይቅና ታንኳ',
    region: 'Bahir Dar, Lake Tana Basin',
    era: 'Ancient Abay (Blue Nile) Source',
    symbolism: 'Life-Giving Waters, Ancient Papyrus Craft, Monastic Sanctuaries',
    description: 'The vast highland lake feeding the Blue Nile, traversed for thousands of years by hand-woven papyrus reed boats (Tankwa) connecting isolated island monasteries.',
  },
  {
    id: 'axum',
    name: 'Aksumite Obelisk · Stele of Axum',
    amharicName: 'ሐውልቲ ኣኽሱም',
    region: 'Axum, Tigray',
    era: '4th Century AD (Aksumite Empire)',
    symbolism: 'Antiquity, Geʽez Script, Monumental Stonework',
    description: 'The towering 24-meter monolith carved from a single piece of granite, featuring multi-tiered false windows and doors that celebrate classical Ethiopian civilization.',
  },
];

export const PanEthiopianHeritageShowcase: React.FC<{
  isDark?: boolean;
  className?: string;
}> = ({ isDark = false, className = '' }) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('lalibela');

  const site = ETHIOPIAN_HERITAGE_SITES.find((s) => s.id === selectedSiteId) || ETHIOPIAN_HERITAGE_SITES[0];

  return (
    <div
      className={`relative border-2 border-[#1E4D38] dark:border-[#B88B45] bg-[#FAF6EC] dark:bg-[#0C0A09] p-6 sm:p-8 space-y-6 shadow-xl ${className}`}
    >
      {/* High-Contrast Double Intaglio Perimeter Line */}
      <div className="absolute inset-1.5 border border-[#9A7432]/50 pointer-events-none" />
      <div className="absolute inset-2.5 border border-[#1E4D38]/20 dark:border-[#B88B45]/25 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1E4D38]/20 dark:border-[#B88B45]/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] font-mono text-[9px] font-black uppercase tracking-widest shadow-xs">
              PAN-ETHIOPIAN NUMISMATIC TAPESTRY
            </span>
            <span className="font-mono text-xs font-black text-[#8B5E14] dark:text-[#D8B066] tracking-wider uppercase">
              ★ HERITAGE FROM EVERY REGION
            </span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-[#14110E] dark:text-[#FFFFFF] mt-1.5 tracking-tight">
            CULTURAL &amp; ARCHITECTURAL SYMBOLS OF SOLIDARITY
          </h3>
        </div>

        <div className="font-ethiopic text-base sm:text-lg text-[#1E4D38] dark:text-[#52B788] font-black">
          ከሁሉም የኢትዮጵያ ማዕዘናት የተውጣጡ ቅርሶች
        </div>
      </div>

      {/* Site Selector Tabs with Sharp Contrast & Focus States */}
      <div className="relative z-10 flex flex-wrap gap-2 pt-1">
        {ETHIOPIAN_HERITAGE_SITES.map((s) => {
          const isSelected = s.id === selectedSiteId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSiteId(s.id)}
              className={`px-3.5 py-2 text-xs font-mono font-black tracking-wider uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-[#163E2C] dark:border-[#52B788] bg-[#1E4D38] text-white dark:bg-[#52B788] dark:text-[#080706] shadow-md ring-2 ring-[#9A7432]/60 scale-102'
                  : 'border border-[#26211C]/40 dark:border-[#B88B45]/50 bg-[#F0E6D2] dark:bg-[#181512] text-[#1A1815] dark:text-[#F4EFE6] hover:bg-[#1E4D38] hover:text-white dark:hover:bg-[#52B788] dark:hover:text-[#080706] hover:border-[#1E4D38] shadow-xs'
              }`}
            >
              {s.name.split('·')[0].trim()}
            </button>
          );
        })}
      </div>

      {/* Active Site Spotlight Card with Detailed High-Contrast SVG Engraving */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        {/* SVG Engraving Plate (Left Column) - High Contrast Intaglio Bed */}
        <div className="lg:col-span-6 relative border-2 border-[#1E4D38]/50 dark:border-[#B88B45]/60 bg-[#F4ECE0] dark:bg-[#050505] p-6 flex items-center justify-center min-h-[240px] shadow-inner">
          <div className="absolute inset-1.5 border border-[#9A7432]/35 pointer-events-none" />
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1E4D38]/15 dark:bg-[#52B788]/20 border border-[#1E4D38]/40 dark:border-[#52B788]/50 text-[8px] font-mono font-black text-[#1E4D38] dark:text-[#52B788] uppercase tracking-widest">
            STEEL-PLATE VIGNETTE № 0{ETHIOPIAN_HERITAGE_SITES.findIndex((s) => s.id === selectedSiteId) + 1}
          </div>

          {/* Render selected site vector engraving with punchy strokes */}
          {selectedSiteId === 'lalibela' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Trench Wall Pit */}
              <polygon points="20,30 220,30 205,150 35,150" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
              {/* Bet Giyorgis Cruciform Body */}
              <polygon
                points="90,45 150,45 150,75 180,75 180,135 150,135 150,165 90,165 90,135 60,135 60,75 90,75"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              />
              {/* Relief Cross on Roof */}
              <path
                d="M 96,52 L 144,52 L 144,79 L 171,79 L 171,127 L 144,127 L 144,154 L 96,154 L 96,127 L 69,127 L 69,79 L 96,79 Z"
                fill="none"
                stroke="#B88B45"
                strokeWidth="1.6"
              />
              <circle cx="120" cy="103" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="120" cy="103" r="2.5" fill="#B88B45" />
            </svg>
          )}

          {selectedSiteId === 'gondar' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Central Keep */}
              <rect x="65" y="55" width="110" height="95" fill="none" stroke="currentColor" strokeWidth="2" />
              {[70, 85, 100, 115, 130].map((y, idx) => (
                <line key={idx} x1="65" y1={y} x2="175" y2={y} stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 2" opacity="0.7" />
              ))}
              {/* Left Domed Turret */}
              <rect x="45" y="40" width="30" height="110" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M 45 40 Q 60 18 75 40 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="60" cy="22" r="2" fill="#B88B45" />
              {/* Right Domed Turret */}
              <rect x="165" y="40" width="30" height="110" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M 165 40 Q 180 18 195 40 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="180" cy="22" r="2" fill="#B88B45" />
              {/* Portal Arches */}
              <path d="M 105 110 Q 120 95 135 110 L 135 150 L 105 150 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="120" cy="80" r="5" fill="none" stroke="#B88B45" strokeWidth="1.2" />
            </svg>
          )}

          {selectedSiteId === 'harar' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Fortified Wall */}
              <rect x="25" y="60" width="60" height="90" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <rect x="155" y="60" width="60" height="90" fill="none" stroke="currentColor" strokeWidth="1.6" />
              {/* Central Gatehouse */}
              <rect x="75" y="40" width="90" height="110" fill="none" stroke="currentColor" strokeWidth="2.2" />
              {/* Moorish Arch Gateway */}
              <path d="M 98 150 L 98 95 Q 98 68 120 60 Q 142 68 142 95 L 142 150 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
              <path d="M 104 150 L 104 98 Q 104 74 120 68 Q 136 74 136 98 L 136 150 Z" fill="none" stroke="#B88B45" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="120" cy="50" r="6" fill="none" stroke="#B88B45" strokeWidth="1.4" />
              {/* Crenellations */}
              <path d="M 70 40 L 70 32 L 80 32 L 80 40 L 90 40 L 90 32 L 100 32 L 100 40 L 110 40 L 110 32 L 120 32 L 120 40 L 130 40 L 130 32 L 140 32 L 140 40 L 150 40 L 150 32 L 160 32 L 160 40 L 170 40" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}

          {selectedSiteId === 'jebena' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Steam */}
              <path d="M 120 45 Q 110 30 125 18 Q 140 6 130 -6" fill="none" stroke="#B88B45" strokeWidth="1.6" strokeDasharray="3 2" />
              <path d="M 126 48 Q 134 32 128 20 Q 120 8 126 -2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
              {/* Jebena Neck */}
              <path d="M 112 50 L 128 50 L 125 90 L 115 90 Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              {/* Bulbous Body */}
              <circle cx="120" cy="118" r="30" fill="none" stroke="currentColor" strokeWidth="2.2" />
              {/* Stand */}
              <ellipse cx="120" cy="148" rx="24" ry="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
              {/* Spout */}
              <path d="M 106 98 Q 80 96 74 80 L 82 78 Q 88 90 110 92" fill="none" stroke="currentColor" strokeWidth="1.8" />
              {/* Handle */}
              <path d="M 125 65 Q 152 75 148 110 Q 144 125 130 134" fill="none" stroke="currentColor" strokeWidth="2" />
              {/* Cups */}
              <path d="M 50 145 Q 50 155 58 155 Q 66 155 66 145" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M 174 145 Q 174 155 182 155 Q 190 155 190 145" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}

          {selectedSiteId === 'simien' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Mountain Pinnacle */}
              <polygon points="30,150 90,80 150,110 210,60 230,150" fill="none" stroke="currentColor" strokeWidth="1.6" />
              {/* Walia Ibex Figure */}
              <path d="M 85 85 Q 90 70 100 70 Q 110 70 115 78 L 118 95 L 112 98 L 110 85 L 95 88 L 92 98 L 86 96 Z" fill="currentColor" />
              {/* Huge Horns */}
              <path d="M 100 68 Q 80 35 102 20 Q 108 18 104 24 Q 90 40 105 65" fill="currentColor" />
              <path d="M 103 68 Q 90 42 108 27 Q 114 24 110 30 Q 98 46 108 65" fill="#B88B45" />
            </svg>
          )}

          {selectedSiteId === 'tana' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Lake Waves */}
              <path d="M 20 130 Q 60 120 100 130 T 180 130 T 230 130" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 2" />
              <path d="M 10 145 Q 50 135 90 145 T 170 145 T 230 145" fill="none" stroke="currentColor" strokeWidth="1.2" />
              {/* Papyrus Tankwa Reed Boat */}
              <path d="M 50 130 Q 70 148 130 145 Q 185 142 195 120 Q 160 138 120 136 Q 80 134 50 130 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
              {/* Fisherman with Pole */}
              <circle cx="115" cy="105" r="5" fill="currentColor" />
              <line x1="115" y1="110" x2="118" y2="135" stroke="currentColor" strokeWidth="1.8" />
              <line x1="95" y1="90" x2="135" y2="155" stroke="#B88B45" strokeWidth="1.8" />
            </svg>
          )}

          {selectedSiteId === 'axum' && (
            <svg viewBox="0 0 240 180" className="w-full max-w-[300px] h-auto text-[#143D2B] dark:text-[#4AE397]">
              {/* Axum Stele */}
              <polygon points="105,25 135,25 140,150 100,150" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M 105 25 Q 120 12 135 25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="120" cy="20" r="3.5" fill="#B88B45" />
              {[38, 52, 66, 80, 94, 108, 122, 136].map((y, idx) => (
                <line key={idx} x1="102" y1={y} x2="138" y2={y} stroke="currentColor" strokeWidth="1.1" />
              ))}
              <rect x="110" y="138" width="20" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <rect x="92" y="150" width="56" height="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        </div>

        {/* Narrative & Details (Right Column) - High Contrast Dark Ink & Crisp Backgrounds */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1">
            <span className="font-mono text-xs tracking-widest text-[#8B5E14] dark:text-[#D8B066] font-black uppercase">
              ★ {site.region} · {site.era}
            </span>
            <h4 className="font-display font-black text-2xl sm:text-3xl text-[#14110E] dark:text-[#FFFFFF] leading-snug">
              {site.name}
            </h4>
            <p className="font-ethiopic text-xl text-[#1E4D38] dark:text-[#52B788] font-black">
              {site.amharicName}
            </p>
          </div>

          {/* High-Contrast Plaque for Symbolism */}
          <div className="p-4 border-2 border-[#1E4D38]/30 dark:border-[#52B788]/40 bg-[#EDE4D0] dark:bg-[#141210] space-y-1 font-mono text-xs shadow-xs">
            <span className="text-[#1E4D38] dark:text-[#52B788] uppercase font-black text-[10px] tracking-widest block">
              CIVIC SOLIDARITY SYMBOLISM
            </span>
            <p className="text-[#14110E] dark:text-[#F4EFE6] font-bold text-sm">
              {site.symbolism}
            </p>
          </div>

          <p className="text-sm font-sans text-[#221E19] dark:text-[#E8DEC8] leading-relaxed font-medium">
            {site.description}
          </p>

          <div className="pt-3 flex items-center justify-between text-[10px] font-mono font-bold text-[#14110E] dark:text-[#F4EFE6] uppercase border-t border-[#1E4D38]/20 dark:border-[#B88B45]/30">
            <span>PRINTED ON ETHIOPIAN CIVIC TENDER</span>
            <span className="text-[#1E4D38] dark:text-[#52B788] font-black">★ 100% COMMUNITY CLEARING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
