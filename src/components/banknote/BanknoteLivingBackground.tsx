import React, { useState, useEffect } from 'react';

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

  // Subtle interactive parallax shift (1-8px)
  const shiftX = (mousePos.x - 0.5) * 14;
  const shiftY = (mousePos.y - 0.5) * 14;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 1: AUTHENTIC AGED BANKNOTE PAPER WITH TONAL VIGNETTE & FIBERS
      ───────────────────────────────────────────────────────────────────────────── */}
      {/* Deep aged perimeter vignette (darker edges like antique currency) */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#141210' : '#F6F1E5',
          backgroundImage: isDark
            ? `radial-gradient(circle at 50% 45%, #1C1814 0%, #141210 65%, #0D0B0A 100%)`
            : `radial-gradient(circle at 50% 45%, #FAF7EE 0%, #F5EFE1 55%, #EADBCA 100%)`,
        }}
      />

      {/* Tactile Banknote Paper Grain & Fine Intaglio Weave */}
      <div className="absolute inset-0 opacity-45 mix-blend-multiply banknote-texture pointer-events-none" />
      <div className="absolute inset-0 opacity-35 mix-blend-multiply paper-grain pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 2: AUTHENTIC BANKNOTE SECURITY THREAD (METALLIC STRIP WITH MICROPRINT)
          Visible vertical dashed strip embedded into the paper substrate
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 bottom-0 left-[22%] sm:left-[26%] w-[3px] pointer-events-none flex flex-col justify-between items-center opacity-40 dark:opacity-30">
        {/* Continuous thread line */}
        <div className="absolute inset-y-0 w-[1px] bg-[#9A7432] dark:bg-[#D8B066] opacity-60" />
        {/* Dashed metallic windows with microprint */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="relative z-10 w-[3px] h-9 my-3 bg-[#8B2626] dark:bg-[#D8B066] shadow-xs flex items-center justify-center"
            style={{ opacity: i % 2 === 0 ? 0.75 : 0.4 }}
          >
            <span className="text-[5px] font-mono text-[#F6F1E5] dark:text-[#141210] font-black -rotate-90 select-none">
              1 BIRR
            </span>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 3: HISTORICAL EMBOSSED WATERMARK WINDOW (LION OF JUDAH CARTOUCHE)
          Faint translucent watermark visible in the paper light
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute left-[5%] top-[18%] sm:top-[22%] w-[260px] sm:w-[340px] h-[340px] sm:h-[420px] rounded-[50%] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${shiftX * -0.5}px, ${shiftY * -0.5}px)`,
          opacity: isDark ? 0.08 : 0.12,
        }}
      >
        <svg viewBox="0 0 300 400" className="w-full h-full text-[#9A7432] dark:text-[#D8B066]">
          {/* Watermark Oval Cartouche Rings */}
          <ellipse cx="150" cy="200" rx="135" ry="180" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
          <ellipse cx="150" cy="200" rx="125" ry="170" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="150" cy="200" rx="115" ry="160" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 2" />

          {/* Watermark Radial Sunburst Rays */}
          {Array.from({ length: 36 }).map((_, idx) => (
            <line
              key={idx}
              x1="150"
              y1="200"
              x2={150 + 110 * Math.cos((idx * Math.PI) / 18)}
              y2={200 + 155 * Math.sin((idx * Math.PI) / 18)}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Crowned Lion of Judah Silhouette (Historical Bank of Ethiopia Watermark) */}
          <g transform="translate(150, 185) scale(1.1)" fill="currentColor" stroke="none">
            {/* Crown */}
            <path d="M -12 -58 L -16 -46 L -6 -50 L 0 -62 L 6 -50 L 16 -46 L 12 -58 Z" />
            <circle cx="0" cy="-64" r="2" />
            {/* Head & Mane */}
            <circle cx="0" cy="-38" r="16" />
            <ellipse cx="-4" cy="-36" rx="14" ry="18" />
            <path d="M -16 -34 Q -28 -20 -18 0 Q -24 16 -8 24 Q 8 26 18 16 Q 24 -10 10 -34 Z" />
            {/* Proud Muscular Body */}
            <path d="M -12 -10 Q -40 10 -35 48 L 35 48 Q 40 10 12 -10 Z" />
            {/* Powerful Foreleg stepping forward */}
            <path d="M 12 24 L 28 62 L 18 64 L 6 32 Z" />
            <path d="M -22 24 L -14 62 L -24 64 L -30 32 Z" />
            {/* Raised Forepaw holding Staff */}
            <path d="M 14 0 Q 32 -10 38 10 L 26 12 Q 22 2 12 8 Z" />
            {/* Royal Standard Flagstaff */}
            <line x1="32" y1="-56" x2="24" y2="64" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 32 -54 L 62 -42 L 32 -30 Z" />
            {/* Cross finial atop staff */}
            <line x1="32" y1="-62" x2="32" y2="-52" stroke="currentColor" strokeWidth="2" />
            <line x1="28" y1="-57" x2="36" y2="-57" stroke="currentColor" strokeWidth="2" />
            {/* Tufted Tail curving upwards */}
            <path d="M -34 40 Q -55 20 -48 -6 Q -42 -22 -52 -28 Q -56 -24 -52 -16 Q -46 10 -28 44 Z" />
          </g>

          {/* Watermark Ge'ez Microtext arc */}
          <text
            x="150"
            y="350"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="11"
            fontWeight="bold"
            letterSpacing="0.25em"
            fill="currentColor"
            opacity="0.8"
          >
            የኢትዮጵያ ብሔራዊ ባንክ · ፩
          </text>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 4: MASTER INTAGLIO GUILLOCHÉ SECURITY UNDERPRINT (THE BANKNOTE LACE)
          Visible, multi-colored interlaced spirograph curves across the entire canvas
      ───────────────────────────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${shiftX * 0.3}px, ${shiftY * 0.3}px)`,
        }}
      >
        <defs>
          {/* 1. Fine Banknote Security Lathe Net (Multi-color intertwined waves) */}
          <pattern id="master-banknote-guilloche-net" width="240" height="120" patternUnits="userSpaceOnUse">
            {/* Antique Ochre & Gold Primary Wave Net */}
            <path
              d="M 0 60 Q 60 0, 120 60 T 240 60"
              fill="none"
              stroke={isDark ? '#D8B066' : '#9A7432'}
              strokeWidth="0.75"
              opacity="0.45"
            />
            <path
              d="M 0 60 Q 60 120, 120 60 T 240 60"
              fill="none"
              stroke={isDark ? '#D8B066' : '#9A7432'}
              strokeWidth="0.75"
              opacity="0.45"
            />
            <path
              d="M 0 60 Q 60 20, 120 60 T 240 60"
              fill="none"
              stroke={isDark ? '#E8DEC8' : '#B88B45'}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <path
              d="M 0 60 Q 60 100, 120 60 T 240 60"
              fill="none"
              stroke={isDark ? '#E8DEC8' : '#B88B45'}
              strokeWidth="0.5"
              opacity="0.4"
            />

            {/* Carmine / Historical Red Banknote Secondary Ribbon (Old 1 Birr & 10 Birr ink) */}
            <path
              d="M 0 30 Q 60 90, 120 30 T 240 30"
              fill="none"
              stroke={isDark ? '#D34545' : '#8B2626'}
              strokeWidth="0.6"
              opacity="0.35"
            />
            <path
              d="M 0 90 Q 60 30, 120 90 T 240 90"
              fill="none"
              stroke={isDark ? '#D34545' : '#8B2626'}
              strokeWidth="0.6"
              opacity="0.35"
            />

            {/* Faded Banknote Slate Blue Cross-Lines */}
            <path
              d="M 30 0 Q 90 60, 30 120"
              fill="none"
              stroke={isDark ? '#5B84B1' : '#2A435E'}
              strokeWidth="0.45"
              opacity="0.3"
            />
            <path
              d="M 150 0 Q 210 60, 150 120"
              fill="none"
              stroke={isDark ? '#5B84B1' : '#2A435E'}
              strokeWidth="0.45"
              opacity="0.3"
            />

            {/* Central Diamond Rosette Knot in each tile */}
            <ellipse cx="60" cy="60" rx="16" ry="32" fill="none" stroke={isDark ? '#D8B066' : '#9A7432'} strokeWidth="0.4" opacity="0.4" />
            <ellipse cx="180" cy="60" rx="16" ry="32" fill="none" stroke={isDark ? '#D8B066' : '#9A7432'} strokeWidth="0.4" opacity="0.4" />
            <ellipse cx="120" cy="60" rx="32" ry="16" fill="none" stroke={isDark ? '#8B2626' : '#8B2626'} strokeWidth="0.4" opacity="0.3" />
          </pattern>

          {/* 2. Micro-Geometric Security Lathe Fish-Scale (Counterfeit Prevention Mesh) */}
          <pattern id="banknote-security-mesh" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="14" fill="none" stroke={isDark ? '#9A7432' : '#26211C'} strokeWidth="0.35" opacity="0.18" />
            <circle cx="0" cy="0" r="14" fill="none" stroke={isDark ? '#9A7432' : '#26211C'} strokeWidth="0.35" opacity="0.18" />
            <circle cx="32" cy="0" r="14" fill="none" stroke={isDark ? '#9A7432' : '#26211C'} strokeWidth="0.35" opacity="0.18" />
            <circle cx="0" cy="32" r="14" fill="none" stroke={isDark ? '#9A7432' : '#26211C'} strokeWidth="0.35" opacity="0.18" />
            <circle cx="32" cy="32" r="14" fill="none" stroke={isDark ? '#9A7432' : '#26211C'} strokeWidth="0.35" opacity="0.18" />
          </pattern>
        </defs>

        {/* Fill the full canvas with the Master Banknote Guilloché Underprint */}
        <rect width="100%" height="100%" fill="url(#master-banknote-guilloche-net)" />
        <rect width="100%" height="100%" fill="url(#banknote-security-mesh)" opacity="0.75" />

        {/* ─────────────────────────────────────────────────────────────────────────────
            INTAGLIO MARGINAL ACCENTS: HORIZONTAL SECURITY BANDS (TOP & BOTTOM)
        ───────────────────────────────────────────────────────────────────────────── */}
        {/* Top Banknote Intaglio Security Frieze */}
        <g opacity="0.7">
          <line x1="0" y1="20" x2="100%" y2="20" stroke={isDark ? '#D8B066' : '#26211C'} strokeWidth="1" />
          <line x1="0" y1="24" x2="100%" y2="24" stroke={isDark ? '#9A7432' : '#9A7432'} strokeWidth="0.6" strokeDasharray="3 2" />
          <line x1="0" y1="28" x2="100%" y2="28" stroke={isDark ? '#D8B066' : '#26211C'} strokeWidth="0.5" />
        </g>

        {/* Bottom Banknote Intaglio Security Frieze */}
        <g opacity="0.7">
          <line x1="0" y1="calc(100% - 28px)" x2="100%" y2="calc(100% - 28px)" stroke={isDark ? '#D8B066' : '#26211C'} strokeWidth="0.5" />
          <line x1="0" y1="calc(100% - 24px)" x2="100%" y2="calc(100% - 24px)" stroke={isDark ? '#9A7432' : '#9A7432'} strokeWidth="0.6" strokeDasharray="3 2" />
          <line x1="0" y1="calc(100% - 20px)" x2="100%" y2="calc(100% - 20px)" stroke={isDark ? '#D8B066' : '#26211C'} strokeWidth="1" />
        </g>

        {/* Marginal Precision Registration Crosses (Printer Alignment Crosshairs) */}
        <g stroke={isDark ? '#D8B066' : '#8B2626'} strokeWidth="1" opacity="0.65">
          {/* Top Left */}
          <line x1="16" y1="52" x2="40" y2="52" />
          <line x1="28" y1="40" x2="28" y2="64" />
          <circle cx="28" cy="52" r="7" fill="none" strokeWidth="0.6" />

          {/* Top Right */}
          <line x1="calc(100% - 40px)" y1="52" x2="calc(100% - 16px)" y2="52" />
          <line x1="calc(100% - 28px)" y1="40" x2="calc(100% - 28px)" y2="64" />
          <circle cx="calc(100% - 28px)" cy="52" r="7" fill="none" strokeWidth="0.6" />

          {/* Bottom Left */}
          <line x1="16" y1="calc(100% - 52px)" x2="40" y2="calc(100% - 52px)" />
          <line x1="28" y1="calc(100% - 64px)" x2="28" y2="calc(100% - 40px)" />
          <circle cx="28" cy="calc(100% - 52px)" r="7" fill="none" strokeWidth="0.6" />

          {/* Bottom Right */}
          <line x1="calc(100% - 40px)" y1="calc(100% - 52px)" x2="calc(100% - 16px)" y2="calc(100% - 52px)" />
          <line x1="calc(100% - 28px)" y1="calc(100% - 64px)" x2="calc(100% - 28px)" y2="calc(100% - 40px)" />
          <circle cx="calc(100% - 28px)" cy="calc(100% - 52px)" r="7" fill="none" strokeWidth="0.6" />
        </g>
      </svg>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 5: HISTORICAL CORNER GUILLOCHÉ ROSETTES (THE CORNER VALUE STAMPS)
          Authentic spirograph lathe rosettes in the four corners that flow outward
      ───────────────────────────────────────────────────────────────────────────── */}
      {/* Top Left Rosette */}
      <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-45 dark:opacity-35">
        <svg viewBox="0 0 160 160" className="w-full h-full text-[#9A7432] dark:text-[#D8B066]">
          <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="80" cy="80" r="66" fill="none" stroke="#8B2626" strokeWidth="0.8" strokeDasharray="2 1.5" />
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse
              key={i}
              cx="80"
              cy="80"
              rx="24"
              ry="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              transform={`rotate(${i * 10} 80 80)`}
            />
          ))}
          <circle cx="80" cy="80" r="32" fill="none" stroke="#26211C" strokeWidth="1" />
          <text x="80" y="86" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="18" fontWeight="bold" fill="currentColor">
            1
          </text>
        </svg>
      </div>

      {/* Top Right Rosette */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-45 dark:opacity-35">
        <svg viewBox="0 0 160 160" className="w-full h-full text-[#9A7432] dark:text-[#D8B066]">
          <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="80" cy="80" r="66" fill="none" stroke="#8B2626" strokeWidth="0.8" strokeDasharray="2 1.5" />
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse
              key={i}
              cx="80"
              cy="80"
              rx="24"
              ry="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              transform={`rotate(${i * 10} 80 80)`}
            />
          ))}
          <circle cx="80" cy="80" r="32" fill="none" stroke="#26211C" strokeWidth="1" />
          <text x="80" y="88" textAnchor="middle" fontFamily="Noto Serif Ethiopic, serif" fontSize="20" fontWeight="bold" fill="#8B2626">
            ፩
          </text>
        </svg>
      </div>

      {/* Bottom Left Rosette */}
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none opacity-45 dark:opacity-35">
        <svg viewBox="0 0 160 160" className="w-full h-full text-[#9A7432] dark:text-[#D8B066]">
          <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="80" cy="80" r="66" fill="none" stroke="#8B2626" strokeWidth="0.8" strokeDasharray="2 1.5" />
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse
              key={i}
              cx="80"
              cy="80"
              rx="24"
              ry="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              transform={`rotate(${i * 10} 80 80)`}
            />
          ))}
          <circle cx="80" cy="80" r="32" fill="none" stroke="#26211C" strokeWidth="1" />
          <text x="80" y="88" textAnchor="middle" fontFamily="Noto Serif Ethiopic, serif" fontSize="20" fontWeight="bold" fill="#8B2626">
            ፩
          </text>
        </svg>
      </div>

      {/* Bottom Right Rosette */}
      <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full pointer-events-none opacity-45 dark:opacity-35">
        <svg viewBox="0 0 160 160" className="w-full h-full text-[#9A7432] dark:text-[#D8B066]">
          <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="80" cy="80" r="66" fill="none" stroke="#8B2626" strokeWidth="0.8" strokeDasharray="2 1.5" />
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse
              key={i}
              cx="80"
              cy="80"
              rx="24"
              ry="60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              transform={`rotate(${i * 10} 80 80)`}
            />
          ))}
          <circle cx="80" cy="80" r="32" fill="none" stroke="#26211C" strokeWidth="1" />
          <text x="80" y="86" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="18" fontWeight="bold" fill="currentColor">
            1
          </text>
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 6: GIANT HISTORICAL DENOMINATION ENGRAVINGS (INTAGLIO UNDERPRINT)
      ───────────────────────────────────────────────────────────────────────────── */}
      {/* 100 / 1 Birr Large Historical Numerals */}
      <div
        className="absolute top-16 right-[14%] pointer-events-none select-none font-display font-black text-[130px] sm:text-[180px] lg:text-[240px] leading-none text-[#9A7432]/10 dark:text-[#D8B066]/10 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${shiftX * 0.4}px, ${shiftY * 0.4}px)`,
        }}
      >
        1
      </div>

      <div
        className="absolute bottom-20 left-[12%] pointer-events-none select-none font-ethiopic font-black text-[130px] sm:text-[180px] lg:text-[240px] leading-none text-[#8B2626]/10 dark:text-[#D8B066]/10 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${shiftX * -0.4}px, ${shiftY * -0.4}px)`,
        }}
      >
        ፩
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 7: CONTINUOUS MICROTEXT SECURITY BANDS RUNNING FULL-WIDTH
      ───────────────────────────────────────────────────────────────────────────── */}
      {/* Top Microtext Security Band */}
      <div className="absolute top-[8px] inset-x-0 overflow-hidden whitespace-nowrap opacity-40 dark:opacity-30">
        <p className="font-mono text-[7px] tracking-[0.22em] text-[#26211C] dark:text-[#D8B066] uppercase font-bold">
          {Array(12).fill('NATIONAL BANK OF ETHIOPIA · LEWEGENE CIVIC SOLIDARITY TENDER · ፩ ብር · ONE BIRR · LEGAL REPOSITORY · ACSO AUDITED · ').join('')}
        </p>
      </div>

      {/* Bottom Microtext Security Band */}
      <div className="absolute bottom-[8px] inset-x-0 overflow-hidden whitespace-nowrap opacity-40 dark:opacity-30">
        <p className="font-mono text-[7px] tracking-[0.22em] text-[#8B2626] dark:text-[#D8B066] uppercase font-bold">
          {Array(12).fill('FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA · ZERO PLATFORM FEES · 100% DIRECT CITIZEN BIRR · ፳፻፲፰ · TELEBIRR ESCROW CLEARING · ').join('')}
        </p>
      </div>

      {/* Vertical Edge Microtext on left & right borders */}
      <div className="absolute top-1/2 left-1.5 -translate-y-1/2 -rotate-90 origin-center hidden lg:block opacity-45">
        <span className="font-mono text-[7.5px] tracking-[0.35em] uppercase text-[#26211C] dark:text-[#D8B066] font-bold whitespace-nowrap">
          № ET-2026-BANKNOTE-SERIES · SECURITY INTAGLIO ENGRAVED · ETHIOPIA
        </span>
      </div>

      <div className="absolute top-1/2 right-1.5 -translate-y-1/2 rotate-90 origin-center hidden lg:block opacity-45">
        <span className="font-mono text-[7.5px] tracking-[0.35em] uppercase text-[#8B2626] dark:text-[#D8B066] font-bold whitespace-nowrap">
          GUARANTEED BY ACSO STATUTE № 1113/2019 · DIRECT SETTLEMENT LEDGER
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LAYER 8: INTERACTIVE INK ILLUMINATOR (CURSOR LIGHT THAT REVEALS THE PAPER)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isDark
            ? `radial-gradient(circle 500px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(216, 176, 102, 0.08) 0%, transparent 80%)`
            : `radial-gradient(circle 500px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(154, 116, 50, 0.07) 0%, transparent 80%)`,
        }}
      />
    </div>
  );
};
