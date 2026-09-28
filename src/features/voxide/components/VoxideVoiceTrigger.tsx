import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VoxideVoiceTriggerProps {
  onClick: () => void;
  isListening?: boolean;
}

export const VoxideVoiceTrigger: React.FC<VoxideVoiceTriggerProps> = ({
  onClick,
  isListening = false,
}) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
        isListening
          ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/30'
          : 'bg-gradient-to-r from-[#1E4D38] to-[#123023] hover:from-[#163829] hover:to-[#0D241A] text-white ring-1 ring-[#52B788]/30 hover:scale-[1.02]'
      }`}
    >
      <div className="relative">
        <Mic className="w-4 h-4 text-[#52B788]" />
        {isListening && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400 animate-ping" />
        )}
      </div>
      <span>{isListening ? 'ድምፅዎን በማዳመጥ ላይ...' : 'በድምፅ ይለግሱ (Voxide)'}</span>
      <Sparkles className="w-3.5 h-3.5 text-[#C9A24D]" />
    </button>
  );
};

export default VoxideVoiceTrigger;
