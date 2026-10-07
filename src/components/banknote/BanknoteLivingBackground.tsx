import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../../data/content.ts';

interface BanknoteLivingBackgroundProps {
  isDark?: boolean;
}

export const BanknoteLivingBackground: React.FC<BanknoteLivingBackgroundProps> = ({ isDark = false }) => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Subtle interactive parallax shift (1-6px)
  const shiftX = (mousePos.x - 0.5) * 8;
  const shiftY = (mousePos.y - 0.5) * 8;

  // Vintage Banknote Green (1 Birr Reference) vs Dark mode luminous emerald
  const banknoteGreen = isDark ? '#52B788' : '#1E4D38';
  const banknoteGold = isDark ? '#D8B066' : '#9A7432';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 1: ETHIOPIAN NETELA (ሸማ) WARM RAW-COTTON CLOTH TEXTURE & OBSIDIAN
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#080706' : '#F2ECE1',
          backgroundImage: isDark
            ? `radial-gradient(circle at 50% 45%, #12100E 0%, #080706 65%, #020202 100%)`
            : `radial-gradient(circle at 50% 35%, #F7F3E9 0%, #F2ECE1 55%, #EAE2D3 100%)`,
        }}
      />

      {/* Tactile Netela (ነጠላ) Fine Cotton Gauze Weave */}
      <div className="absolute inset-0 opacity-100 dark:opacity-25 netela-cloth-texture pointer-events-none" />
      <div className="absolute inset-0 opacity-15 mix-blend-multiply dark:mix-blend-screen banknote-texture pointer-events-none" />
      <div className="absolute inset-0 opacity-20 paper-grain pointer-events-none" />

      {/* Traditional Ethiopian Tibeb (ጥበብ) Woven Decorative Edge Ribbons */}
      <div className="absolute top-0 inset-x-0 h-[4px] tibeb-ribbon-pattern opacity-60 dark:opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[4px] tibeb-ribbon-pattern opacity-60 dark:opacity-40 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 2: AUTHENTIC BANKNOTE SECURITY THREAD (EMBEDDED WINDOWED WIRE)
          Positioned clearly on the left-side margin, zero overlap with main cards
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 bottom-0 left-[6%] sm:left-[8%] w-[3px] pointer-events-none flex flex-col justify-between items-center z-1 opacity-60 dark:opacity-45 select-none">
        <div className="absolute inset-y-0 w-[1px] bg-[#8A6534] dark:bg-[#A88147] opacity-60" />
        {Array.from({ length: 22 }).map((_, i) => {
          const labels = ['1 BIRR', APP_NAME.toUpperCase(), '፩ ETB', 'NBE'];
          const label = labels[i % labels.length];
          return (
            <div
              key={i}
              className="relative z-10 w-[3px] h-6 sm:h-7 my-2.5 rounded-[0.5px] bg-[#8A6534] dark:bg-[#A88147] shadow-[0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center"
              style={{ opacity: i % 2 === 0 ? 0.9 : 0.6 }}
            >
              <span className="text-[4px] font-mono text-[#FAF6EC] dark:text-[#0C0A09] font-black -rotate-90 whitespace-nowrap tracking-wider select-none">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ZONE 1: UPPER-LEFT WATERMARK WINDOW (LION OF JUDAH CARTOUCHE)
          Cleanly tucked in the upper-left watermark area
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute left-[2%] top-[8%] w-[200px] sm:w-[240px] h-[280px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${shiftX * -0.3}px, ${shiftY * -0.3}px)`,
          opacity: isDark ? 0.14 : 0.18,
        }}
      >
        <svg viewBox="0 0 300 400" className="w-full h-full text-[#9A7432] dark:text-[#D8B066]">
          {/* Watermark Oval Cartouche Rings */}
          <ellipse cx="150" cy="200" rx="135" ry="180" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          <ellipse cx="150" cy="200" rx="125" ry="170" fill="none" stroke="currentColor" strokeWidth="0.8" />

          {/* Watermark Radial Sunburst Rays */}
          {Array.from({ length: 32 }).map((_, idx) => (
            <line
              key={idx}
              x1="150"
              y1="200"
              x2={150 + 105 * Math.cos((idx * Math.PI) / 16)}
              y2={200 + 150 * Math.sin((idx * Math.PI) / 16)}
              stroke="currentColor"
              strokeWidth="0.4"
              opacity="0.35"
            />
          ))}

          {/* Crowned Lion of Judah Watermark Silhouette */}
          <g transform="translate(150, 175) scale(0.95)" fill="currentColor" stroke="none">
            <path d="M -12 -58 L -16 -46 L -6 -50 L 0 -62 L 6 -50 L 16 -46 L 12 -58 Z" />
            <circle cx="0" cy="-64" r="2" />
            <circle cx="0" cy="-38" r="15" />
            <ellipse cx="-4" cy="-36" rx="13" ry="17" />
            <path d="M -16 -34 Q -28 -20 -18 0 Q -24 16 -8 24 Q 8 26 18 16 Q 24 -10 10 -34 Z" />
            <path d="M -12 -10 Q -40 10 -35 48 L 35 48 Q 40 10 12 -10 Z" />
            <path d="M 12 24 L 26 60 L 16 62 L 6 30 Z" />
            <path d="M -22 24 L -14 60 L -24 62 L -30 30 Z" />
            <path d="M 14 0 Q 32 -10 38 10 L 26 12 Q 22 2 12 8 Z" />
            <line x1="30" y1="-56" x2="22" y2="60" stroke="currentColor" strokeWidth="2.2" />
            <path d="M 30 -54 L 58 -42 L 30 -30 Z" />
            <path d="M -34 40 Q -55 20 -48 -6 Q -42 -22 -52 -28 Q -56 -24 -52 -16 Q -46 10 -28 44 Z" />
          </g>

          <text
            x="150"
            y="350"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="0.25em"
            fill="currentColor"
            opacity="0.7"
          >
            የኢትዮጵያ ብሔራዊ ባንክ · ፩
          </text>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ZONE 2: BOTTOM-LEFT 1-BIRR REVERSE VIGNETTE: GREATER KUDU ANTELOPE (አጋዘን)
          As featured prominently on the authentic 1 Birr Reverse banknote.
          Tucked completely in the lower-left corner with zero overlap.
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute left-[1.5%] bottom-[4%] w-[180px] sm:w-[220px] lg:w-[260px] pointer-events-none transition-transform duration-700 ease-out hidden sm:block"
        style={{
          transform: `translate(${shiftX * -0.25}px, ${shiftY * -0.25}px)`,
          opacity: isDark ? 0.22 : 0.26,
        }}
      >
        <svg viewBox="0 0 240 200" className="w-full h-auto text-[#1E4D38] dark:text-[#52B788]">
          <defs>
            <pattern id="savannah-grass" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>

          {/* Grassy savannah knoll ground */}
          <path
            d="M 10 180 Q 70 165 140 170 Q 190 175 230 185 L 230 195 L 10 195 Z"
            fill="url(#savannah-grass)"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Acacia Savanna Tree in background */}
          <g opacity="0.5" stroke="currentColor" strokeWidth="0.8" fill="none">
            <path d="M 190 170 Q 185 130 195 100 Q 198 85 205 75" />
            <path d="M 195 100 Q 180 88 170 78" />
            {/* Flat-topped Acacia foliage canopy clouds */}
            <path d="M 155 78 Q 185 70 225 75 Q 235 85 210 90 Q 170 92 155 78 Z" fill="currentColor" opacity="0.15" />
            <path d="M 145 88 Q 170 82 200 86 Q 190 98 160 96 Z" fill="currentColor" opacity="0.15" />
          </g>

          {/* Majestic Greater Kudu Antelope (Classic 1 Birr Reverse feature) */}
          <g transform="translate(60, 45)">
            {/* Body */}
            <path
              d="M 40 85 Q 55 78 80 80 Q 105 82 115 95 Q 118 115 105 125 Q 75 125 45 120 Q 30 115 32 98 Z"
              fill="currentColor"
              opacity="0.85"
            />
            {/* White vertical flank stripes (Kudu signature) */}
            <g stroke="#FAF6EC" strokeWidth="1" opacity="0.75">
              <line x1="55" y1="88" x2="52" y2="114" />
              <line x1="65" y1="87" x2="63" y2="116" />
              <line x1="75" y1="87" x2="74" y2="118" />
              <line x1="85" y1="88" x2="84" y2="116" />
              <line x1="95" y1="90" x2="94" y2="114" />
            </g>
            {/* Slender legs */}
            <path
              d="M 36 116 L 34 165 L 38 165 L 42 118 M 46 118 L 48 165 L 52 165 L 50 118
                 M 98 122 L 102 165 L 106 165 L 104 122 M 108 120 L 112 165 L 116 165 L 114 120"
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
            />
            {/* Elegant upright neck and head */}
            <path
              d="M 34 98 Q 30 70 28 45 Q 32 38 42 38 Q 48 44 46 65 Q 44 80 40 88 Z"
              fill="currentColor"
              opacity="0.85"
            />
            {/* Muzzle and large ears */}
            <path d="M 28 45 L 20 44 L 22 40 L 30 40 Z" fill="currentColor" />
            <ellipse cx="38" cy="36" rx="4" ry="9" transform="rotate(-30 38 36)" fill="currentColor" />
            <ellipse cx="26" cy="38" rx="3.5" ry="8" transform="rotate(25 26 38)" fill="currentColor" />

            {/* Magnificent Spiral Horns (Iconic Ethiopian Greater Kudu) */}
            <path
              d="M 34 38 Q 28 20 38 6 Q 48 -6 40 -20 Q 34 -30 44 -40
                 M 38 38 Q 42 22 52 8 Q 62 -4 54 -18 Q 48 -28 58 -38"
              stroke={banknoteGold}
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Numismatic Label */}
          <text x="120" y="192" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="6.5" fontWeight="bold" fill="currentColor" letterSpacing="0.14em">
            GREATER KUDU · አጋዘን
          </text>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ZONE 3: BOTTOM-RIGHT 1-BIRR REVERSE VIGNETTE: TIS ISSAT (BLUE NILE FALLS)
          The signature centerpiece of the authentic 1 Birr Reverse banknote.
          Placed in the lower-right margin with zero overlap with center content.
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute right-[1.5%] bottom-[4%] w-[220px] sm:w-[280px] lg:w-[320px] pointer-events-none transition-transform duration-700 ease-out hidden sm:block"
        style={{
          transform: `translate(${shiftX * 0.25}px, ${shiftY * 0.25}px)`,
          opacity: isDark ? 0.22 : 0.26,
        }}
      >
        <svg viewBox="0 0 280 190" className="w-full h-auto text-[#1E4D38] dark:text-[#52B788]">
          <defs>
            {/* Basalt Rock Intaglio Hatching */}
            <pattern id="basalt-hatch" width="4" height="4" patternTransform="rotate(75)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
            </pattern>
          </defs>

          {/* Flying Waterfowl / Pelicans overhead (from 1 Birr reverse) */}
          <g stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.75">
            <path d="M 60 25 Q 70 18 80 26 Q 90 18 100 25" />
            <path d="M 95 38 Q 102 32 110 39 Q 118 32 125 38" />
            <path d="M 130 22 Q 138 16 146 23 Q 154 16 162 22" />
          </g>

          {/* Left Basalt Rock Escarpment */}
          <polygon
            points="10,65 55,68 65,150 10,165"
            fill="url(#basalt-hatch)"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Right Basalt Rock Escarpment */}
          <polygon
            points="225,65 270,60 270,165 215,150"
            fill="url(#basalt-hatch)"
            stroke="currentColor"
            strokeWidth="1"
          />

          {/* Upper River Lip (Tis Issat Falls crest) */}
          <path
            d="M 55 68 Q 140 64 225 65"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
          />

          {/* Cascading Waterfall Torrent Lines */}
          <g stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 3 12 2" opacity="0.8">
            {Array.from({ length: 28 }).map((_, idx) => {
              const x = 60 + idx * 5.8;
              return (
                <line key={idx} x1={x} y1="68" x2={x + (idx % 2 === 0 ? 1 : -1)} y2="148" />
              );
            })}
          </g>

          {/* Rising Water Mist & Spray Clouds at Fall Base ("Tis Issat" = Smoke of Fire) */}
          <g fill="currentColor" opacity="0.18">
            <circle cx="85" cy="148" r="14" />
            <circle cx="115" cy="144" r="18" />
            <circle cx="145" cy="142" r="20" />
            <circle cx="175" cy="145" r="17" />
            <circle cx="205" cy="149" r="14" />
          </g>

          {/* Blue Nile River Gorge Surface Ripples */}
          <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6">
            <path d="M 30 160 Q 80 154 140 156 Q 200 154 250 160" />
            <path d="M 45 168 Q 95 162 145 164 Q 195 162 235 168" />
            <path d="M 60 176 Q 110 172 150 173 Q 190 172 220 176" />
          </g>

          {/* Inscription Cartouche */}
          <text x="140" y="186" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="6.5" fontWeight="bold" fill="currentColor" letterSpacing="0.14em">
            TIS ISSAT FALLS · ጢስ እሳት (BLUE NILE)
          </text>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ZONE 4: UPPER-RIGHT CORNER GUILLOCHE ROSETTE & DENOMINATION '1' & '፩'
          Cleanly positioned in top-right corner, non-overlapping
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute top-12 sm:top-14 right-[3%] pointer-events-none select-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${shiftX * 0.3}px, ${shiftY * 0.3}px)`,
          opacity: isDark ? 0.16 : 0.22,
        }}
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          {/* Concentric Guilloche Lathe Rosette Rings */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#1E4D38] dark:text-[#52B788]">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={banknoteGold} strokeWidth="0.8" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 36 * Math.cos((i * Math.PI) / 12)}
                y2={50 + 36 * Math.sin((i * Math.PI) / 12)}
                stroke="currentColor"
                strokeWidth="0.4"
                opacity="0.4"
              />
            ))}
          </svg>

          {/* Large Ornamental Denomination '1' and '፩' */}
          <div className="text-center space-y-0.5">
            <span className="font-display font-black text-3xl sm:text-4xl text-[#1E4D38] dark:text-[#52B788] block leading-none">
              1
            </span>
            <span className="font-ethiopic font-black text-xs sm:text-sm text-[#9A7432] dark:text-[#D8B066] block leading-none">
              ፩ ብር
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
