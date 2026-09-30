import React, { useMemo } from 'react';

export interface GuillocheCanvasProps {
  className?: string;
  opacity?: number;
  color?: string;
}

export const GuillocheCanvas: React.FC<GuillocheCanvasProps> = ({
  className = '',
  opacity = 0.05,
  color = '#9A7432',
}) => {
  // Generate multi-lobe guilloché rosette coordinates
  const paths = useMemo(() => {
    const generated: string[] = [];
    
    // Outer Rosette 1: 18-lobed spirograph
    let d1 = '';
    const R1 = 180;
    const r1 = 30;
    const p1 = 60;
    for (let theta = 0; theta <= Math.PI * 12; theta += 0.05) {
      const x = 250 + (R1 - r1) * Math.cos(theta) + p1 * Math.cos(((R1 - r1) * theta) / r1);
      const y = 250 + (R1 - r1) * Math.sin(theta) - p1 * Math.sin(((R1 - r1) * theta) / r1);
      d1 += theta === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    generated.push(d1);

    // Inner Rosette 2: 12-lobed tight weave
    let d2 = '';
    const R2 = 120;
    const r2 = 20;
    const p2 = 45;
    for (let theta = 0; theta <= Math.PI * 10; theta += 0.06) {
      const x = 250 + (R2 - r2) * Math.cos(theta) + p2 * Math.cos(((R2 - r2) * theta) / r2);
      const y = 250 + (R2 - r2) * Math.sin(theta) - p2 * Math.sin(((R2 - r2) * theta) / r2);
      d2 += theta === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    generated.push(d2);

    // Sinusoidal security waves
    const waves: string[] = [];
    for (let i = 0; i < 6; i++) {
      let waveD = '';
      const offsetY = 40 + i * 70;
      for (let x = 0; x <= 1200; x += 15) {
        const y = offsetY + Math.sin(x * 0.015 + i * 0.4) * 16 + Math.cos(x * 0.03) * 6;
        waveD += x === 0 ? `M ${x} ${y.toFixed(1)}` : ` L ${x} ${y.toFixed(1)}`;
      }
      waves.push(waveD);
    }

    return { rosettes: generated, waves };
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Repeating background wave bands */}
      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.waves.map((w, idx) => (
          <path
            key={idx}
            d={w}
            fill="none"
            stroke={idx % 2 === 0 ? color : '#B08A45'}
            strokeWidth="0.85"
            strokeOpacity="0.8"
          />
        ))}
      </svg>

      {/* Floating Rotating Rosette Left */}
      <div className="absolute -left-20 top-1/4 w-[360px] h-[360px] animate-guilloche">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <path d={paths.rosettes[0]} fill="none" stroke={color} strokeWidth="0.75" />
          <path d={paths.rosettes[1]} fill="none" stroke="#B08A45" strokeWidth="0.65" />
        </svg>
      </div>

      {/* Floating Rotating Rosette Right */}
      <div className="absolute -right-20 top-1/3 w-[420px] h-[420px] animate-guilloche" style={{ animationDirection: 'reverse' }}>
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <path d={paths.rosettes[0]} fill="none" stroke="#B08A45" strokeWidth="0.75" />
          <path d={paths.rosettes[1]} fill="none" stroke={color} strokeWidth="0.65" />
        </svg>
      </div>
    </div>
  );
};
