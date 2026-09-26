import React from 'react';

/**
 * Authentic SVG Intaglio & Steel-Plate Engraving Artwork for the Ethiopian Banknote Canvas.
 * Handcrafted vector linework representing classical Ethiopian numismatic craft:
 * - Lalibela / Axumite architectural stonework
 * - Communal solidarity (micro-dam, health clinic, education, harvest)
 * - Corner denomination guilloché rosettes ("100" and "፻")
 * - Official ACSO circular medallion seal
 * - Voxide voice concentric soundwave medallion
 */

export const CornerRosette: React.FC<{
  numeral: '100' | '፻';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({ numeral, position, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-14 h-14 sm:w-16 sm:h-16 text-[#26211C] dark:text-[#D8B066] drop-shadow-xs"
      >
        {/* Outer Guilloché Petal Rings */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#9A7432" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
        <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="0.6" />
        
        {/* Spirograph Petal Curves */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx="18"
              ry="38"
              fill="none"
              stroke="#9A7432"
              strokeWidth="0.45"
              opacity="0.75"
              transform={`rotate(${angle} 50 50)`}
            />
          );
        })}

        {/* Inner Solid Disk with Microtext Border */}
        <circle cx="50" cy="50" r="28" fill="#F7F2E7" className="dark:fill-[#1C1815]" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#9A7432" strokeWidth="0.6" strokeDasharray="1 1" />
        
        {/* Denomination Numeral */}
        <text
          x="50"
          y={numeral === '፻' ? '57' : '56'}
          textAnchor="middle"
          fill="currentColor"
          fontSize={numeral === '፻' ? '20' : '17'}
          fontWeight="900"
          fontFamily={numeral === '፻' ? "'Noto Serif Ethiopic', serif" : "'Cinzel', Georgia, serif"}
          letterSpacing="-0.03em"
        >
          {numeral}
        </text>
      </svg>
    </div>
  );
};

export const CentralMonumentEngraving: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 800 360"
        className="w-full h-auto text-[#1C1A17] dark:text-[#E8DEC8]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Engraving Crosshatch Shading Pattern */}
          <pattern id="hatch-dense" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
          </pattern>
          <pattern id="hatch-light" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
          </pattern>
          <linearGradient id="sky-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B08A45" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Archival Vignette Oval Mask Frame */}
        <rect x="10" y="10" width="780" height="340" fill="url(#sky-glow)" rx="6" />

        {/* Intaglio Sunburst Rays radiating from the center */}
        {Array.from({ length: 32 }).map((_, i) => {
          const angle = (i * 180) / 32;
          const rad = (angle * Math.PI) / 180;
          const x2 = 400 + Math.cos(rad) * 450;
          const y2 = 300 - Math.sin(rad) * 320;
          return (
            <line
              key={i}
              x1="400"
              y1="260"
              x2={x2}
              y2={y2}
              stroke="#B08A45"
              strokeWidth="0.5"
              opacity="0.35"
              strokeDasharray={i % 2 === 0 ? '4 2' : '1 3'}
            />
          );
        })}

        {/* Distant Simien Mountains Contours (Steel-Etched) */}
        <path
          d="M 10 240 Q 90 200 170 215 T 320 185 T 460 210 T 620 175 T 790 230 L 790 350 L 10 350 Z"
          fill="url(#hatch-light)"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <path
          d="M 10 260 Q 120 230 240 245 T 480 230 T 680 245 T 790 255 L 790 350 L 10 350 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Central Arch: Rock-Hewn Lalibela / Axumite Monolith Pillars */}
        {/* Left Column */}
        <g stroke="currentColor" strokeWidth="1.2" fill="none">
          <rect x="230" y="110" width="34" height="150" fill="url(#hatch-dense)" />
          <line x1="230" y1="120" x2="264" y2="120" />
          <line x1="230" y1="140" x2="264" y2="140" />
          <line x1="230" y1="200" x2="264" y2="200" />
          <line x1="230" y1="240" x2="264" y2="240" />
          {/* Column Capital */}
          <polygon points="224,110 270,110 264,124 230,124" fill="#F4EFE6" className="dark:fill-[#1E2420]" />
        </g>

        {/* Right Column */}
        <g stroke="currentColor" strokeWidth="1.2" fill="none">
          <rect x="536" y="110" width="34" height="150" fill="url(#hatch-dense)" />
          <line x1="536" y1="120" x2="570" y2="120" />
          <line x1="536" y1="140" x2="570" y2="140" />
          <line x1="536" y1="200" x2="570" y2="200" />
          <line x1="536" y1="240" x2="570" y2="240" />
          {/* Column Capital */}
          <polygon points="530,110 576,110 570,124 536,124" fill="#F4EFE6" className="dark:fill-[#1E2420]" />
        </g>

        {/* Arch Connecting Columns */}
        <path
          d="M 230 110 Q 400 45 570 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M 242 114 Q 400 62 558 114"
          fill="none"
          stroke="#B08A45"
          strokeWidth="1.2"
          strokeDasharray="3 2"
        />
        <path
          d="M 252 120 Q 400 80 548 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Keystone Rosette in Arch Center */}
        <circle cx="400" cy="74" r="16" fill="#F4EFE6" className="dark:fill-[#1E2420]" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="400" cy="74" r="12" fill="none" stroke="#B08A45" strokeWidth="0.8" strokeDasharray="1 1" />
        {/* Ethiopic Star in Keystone */}
        <path
          d="M 400 62 L 404 71 L 413 74 L 404 77 L 400 86 L 396 77 L 387 74 L 396 71 Z"
          fill="currentColor"
        />

        {/* Central Scene: Communal Solidarity & Building (Water fountain, health, education) */}
        {/* Community Water Well / Fountain Base */}
        <ellipse cx="400" cy="275" rx="90" ry="24" fill="#F4EFE6" className="dark:fill-[#1E2420]" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="400" cy="270" rx="80" ry="18" fill="url(#hatch-dense)" stroke="#B08A45" strokeWidth="0.8" />
        <ellipse cx="400" cy="265" rx="60" ry="12" fill="none" stroke="currentColor" strokeWidth="1" />
        {/* Flowing Water Streams */}
        <path d="M 400 230 Q 385 245 380 265" fill="none" stroke="#B08A45" strokeWidth="1.2" />
        <path d="M 400 230 Q 415 245 420 265" fill="none" stroke="#B08A45" strokeWidth="1.2" />
        <line x1="400" y1="210" x2="400" y2="265" stroke="currentColor" strokeWidth="1.5" />

        {/* Figures Representing Education, Health, and Reconstruction */}
        {/* Teacher / Student figure Left */}
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <circle cx="330" cy="210" r="7" fill="currentColor" />
          <path d="M 330 217 L 330 248 L 320 270" />
          <path d="M 330 248 L 340 270" />
          <path d="M 330 226 L 315 238 L 310 245" />
          {/* Book in hand */}
          <polygon points="305,242 316,238 316,249 305,253" fill="#B08A45" stroke="currentColor" strokeWidth="0.6" />
        </g>

        {/* Health Caregiver figure Right */}
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <circle cx="470" cy="210" r="7" fill="currentColor" />
          <path d="M 470 217 L 470 248 L 460 270" />
          <path d="M 470 248 L 480 270" />
          <path d="M 470 226 L 485 238 L 490 245" />
          {/* Caduceus / medical cross emblem */}
          <line x1="486" y1="239" x2="494" y2="239" stroke="#B08A45" strokeWidth="1.5" />
          <line x1="490" y1="235" x2="490" y2="243" stroke="#B08A45" strokeWidth="1.5" />
        </g>

        {/* Community elder and child in center */}
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <circle cx="385" cy="195" r="8" fill="currentColor" />
          <path d="M 385 203 L 385 240 L 378 265" />
          <path d="M 385 240 L 392 265" />
          {/* Traditional Ethiopian Netela / Gabi mantle */}
          <path d="M 374 212 Q 385 220 396 212 L 394 238 Q 385 244 376 238 Z" fill="url(#hatch-dense)" />
          {/* Child holding elder's hand */}
          <circle cx="415" cy="218" r="5" fill="currentColor" />
          <path d="M 415 223 L 415 248 L 410 265" />
          <path d="M 415 248 L 420 265" />
          <line x1="392" y1="220" x2="411" y2="228" stroke="currentColor" strokeWidth="1.2" />
        </g>

        {/* Foreground Cobblestone Ground & Micro-Etch Lines */}
        <path
          d="M 10 290 Q 200 280 400 282 T 790 290 L 790 350 L 10 350 Z"
          fill="url(#hatch-dense)"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Bottom Engraved Filigree Cartouche Banner */}
        <path
          d="M 160 310 L 640 310 L 630 338 L 170 338 Z"
          fill="#F7F2E7"
          className="dark:fill-[#1C1815]"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <line x1="172" y1="314" x2="628" y2="314" stroke="#9A7432" strokeWidth="0.6" />
        <line x1="172" y1="334" x2="628" y2="334" stroke="#9A7432" strokeWidth="0.6" />
        <text
          x="400"
          y="328"
          textAnchor="middle"
          fill="currentColor"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="0.25em"
          fontFamily="'Cinzel', Georgia, serif"
        >
          COOPERATIVE CITIZEN TENDER · ACCREDITED HUMANITARIAN WORKS
        </text>
      </svg>
    </div>
  );
};

export const AcsoCircularSeal: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to view Federal ACSO Registry Certification"
      className={`group relative flex flex-col items-center justify-center p-1 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none ${className}`}
    >
      <svg viewBox="0 0 120 120" className="w-20 h-20 sm:w-24 sm:h-24">
        {/* Outer Sawtooth Intaglio Edge */}
        <circle cx="60" cy="60" r="56" fill="none" stroke="#8B2626" strokeWidth="1.5" strokeDasharray="3 1.5" />
        <circle cx="60" cy="60" r="52" fill="#FCF9F2" className="dark:fill-[#1E1A17]" stroke="#26211C" strokeWidth="1.8" />
        <circle cx="60" cy="60" r="48" fill="none" stroke="#9A7432" strokeWidth="0.8" strokeDasharray="1.5 1.5" />

        {/* Circular Engraved Text Path */}
        <path
          id="seal-text-path-top"
          d="M 20 60 A 40 40 0 0 1 100 60"
          fill="none"
        />
        <text fontSize="7" fontWeight="bold" fill="#26211C" letterSpacing="0.14em">
          <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
            FEDERAL CIVIL SOCIETY ORG
          </textPath>
        </text>

        <path
          id="seal-text-path-bottom"
          d="M 100 60 A 40 40 0 0 1 20 60"
          fill="none"
        />
        <text fontSize="6.5" fontWeight="bold" fill="#8B2626" letterSpacing="0.16em">
          <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
            ★ ACSO VERIFIED 2026 ★
          </textPath>
        </text>

        {/* Center Emblem: Scales of Trust & Lion of Solidarity */}
        <circle cx="60" cy="60" r="24" fill="none" stroke="#9A7432" strokeWidth="1" />
        <g stroke="#26211C" strokeWidth="1.2" fill="none" transform="translate(60, 60)">
          {/* Beam of Balance */}
          <line x1="-12" y1="-4" x2="12" y2="-4" />
          <line x1="0" y1="-10" x2="0" y2="8" />
          {/* Left Pan */}
          <path d="M -12 -4 L -16 4 L -8 4 Z" fill="#9A7432" stroke="none" />
          {/* Right Pan */}
          <path d="M 12 -4 L 8 4 L 16 4 Z" fill="#9A7432" stroke="none" />
          {/* Center Pivot */}
          <circle cx="0" cy="-4" r="2" fill="#8B2626" />
        </g>
      </svg>
      <span className="mt-1 text-[9px] font-mono font-bold tracking-widest text-[#8B2626] dark:text-[#D8B066] uppercase">
        № ACSO-ET-58291
      </span>
    </button>
  );
};

export const VoxideVoiceSeal: React.FC<{
  onClick?: () => void;
  isListening?: boolean;
  className?: string;
}> = ({ onClick, isListening = false, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Voxide Voice Agent — Tap to speak (e.g. 'Show education causes', 'Open project 024')"
      className={`group relative flex flex-col items-center justify-center p-1 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none ${className}`}
    >
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${isListening ? 'ring-4 ring-red-500 animate-pulse' : ''}`}>
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Concentric Soundwave Guilloché */}
          <circle cx="60" cy="60" r="56" fill="none" stroke="#9A7432" strokeWidth="1.2" strokeDasharray="2 1" />
          <circle cx="60" cy="60" r="50" fill="#FCF9F2" className="dark:fill-[#1E1A17]" stroke="#26211C" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="45" fill="none" stroke="#8B2626" strokeWidth="0.8" strokeDasharray="1.5 2" />

          {/* Soundwave Bars radiating */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const height = 4 + (i % 4) * 3;
            return (
              <line
                key={i}
                x1="60"
                y1={32 - height}
                x2="60"
                y2="34"
                stroke="#26211C"
                strokeWidth="1.2"
                transform={`rotate(${angle} 60 60)`}
                opacity={isListening ? 0.9 : 0.6}
              />
            );
          })}

          {/* Center Mic Cartouche */}
          <circle cx="60" cy="60" r="22" fill="#26211C" className="dark:fill-[#2A231C]" stroke="#9A7432" strokeWidth="1.4" />
          
          {/* Microphone Icon */}
          <g stroke="#FCF9F2" strokeWidth="1.5" fill="none" transform="translate(60, 58)">
            <rect x="-4" y="-8" width="8" height="12" rx="4" fill="#FCF9F2" />
            <path d="M -7 -2 C -7 5 7 5 7 -2" />
            <line x1="0" y1="5" x2="0" y2="10" />
            <line x1="-4" y1="10" x2="4" y2="10" />
          </g>
        </svg>
      </div>

      <span className="mt-1 text-[9px] font-mono font-bold tracking-widest text-[#26211C] dark:text-[#D8B066] uppercase">
        {isListening ? 'VOXIDE LISTENING...' : 'VOXIDE VOICE SEAL'}
      </span>
    </button>
  );
};

export const BanknoteRulerGauge: React.FC<{
  percent: number;
  raised: number;
  goal: number;
  className?: string;
}> = ({ percent, raised, goal, className = '' }) => {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={`space-y-1 select-none font-mono ${className}`}>
      {/* Top Numbers: Denomination Scale */}
      <div className="flex justify-between items-baseline text-[11px] font-bold">
        <span className="text-[#26211C] dark:text-[#D8B066]">
          {clamped}% FUNDED
        </span>
        <span className="text-zinc-600 dark:text-zinc-400 text-[10px]">
          {raised.toLocaleString()} / {goal.toLocaleString()} ETB
        </span>
      </div>

      {/* Engraved Ruler Bar with Ge'ez & Tick Marks */}
      <div className="relative h-6 rounded-none border border-[#26211C] dark:border-[#9A7432] bg-[#F7F2E7] dark:bg-[#1E1A17] overflow-hidden flex items-center">
        {/* Filled Portion: Carmine Red Intaglio Bar */}
        <div
          className="absolute inset-y-0 left-0 bg-[#8B2626] dark:bg-[#B88B45] transition-all duration-500 opacity-90"
          style={{ width: `${clamped}%` }}
        />

        {/* Intaglio Tick Marks */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className={`w-px ${i % 5 === 0 ? 'h-full bg-zinc-800 dark:bg-zinc-200' : 'h-2 self-end bg-zinc-500 dark:bg-zinc-400'}`}
            />
          ))}
        </div>

        {/* Middle Percentage Stamp */}
        <div className="relative z-10 w-full flex justify-between px-2 text-[9px] font-black tracking-widest text-zinc-900 dark:text-zinc-100 mix-blend-difference">
          <span>0%</span>
          <span>፳፭% (25)</span>
          <span>፶% (50)</span>
          <span>፸፭% (75)</span>
          <span>፻% (100)</span>
        </div>
      </div>
    </div>
  );
};
