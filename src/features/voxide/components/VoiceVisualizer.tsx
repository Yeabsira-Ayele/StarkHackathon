import React from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  className?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 h-10 ${className}`}>
      {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9, 0.3].map((delay, idx) => (
        <span
          key={idx}
          className={`w-1 rounded-full bg-emerald-500 transition-all ${
            isListening
              ? 'animate-pulse h-6 sm:h-8'
              : 'h-2 bg-[#D5C8B2] dark:bg-[#3E362E]'
          }`}
          style={{
            animationDelay: `${delay}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
