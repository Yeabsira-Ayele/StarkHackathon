import React from 'react';
import { Mic, X, Sparkles, Send, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveLanguage } from '../../../i18n/index.ts';
import { VoiceVisualizer } from './VoiceVisualizer';
import { VOXIDE_PRESET_PROMPTS } from '../data/voxide.data';
import { VoxideExtraction } from '../types/voxide.types';

interface VoiceTranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmit: () => void;
  extraction: VoxideExtraction | null;
  isProcessing: boolean;
}

export const VoiceTranscriptDrawer: React.FC<VoiceTranscriptDrawerProps> = ({
  isOpen,
  onClose,
  isListening,
  transcript,
  onTranscriptChange,
  onStartListening,
  onStopListening,
  onSubmit,
  extraction,
  isProcessing,
}) => {
  const { i18n } = useTranslation();
  const lang = resolveLanguage(i18n.language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1E4D38] dark:text-[#52B788]">
            <Sparkles className="w-4 h-4 text-[#9A7432]" />
            <h3 className="text-sm font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
              Voxide Voice Assistant (የድምፅ ረዳት)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#73685B] hover:text-[#14110E] dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer & Mic Pulse */}
        <div className="p-6 rounded-2xl bg-[#EFE7D5]/50 dark:bg-[#1A1714] border border-[#D5C8B2]/60 dark:border-[#2E2822] text-center space-y-4">
          <VoiceVisualizer isListening={isListening} />

          <button
            onClick={isListening ? onStopListening : onStartListening}
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-500/20'
                : 'bg-[#1E4D38] hover:bg-[#153828] text-white hover:scale-105'
            }`}
          >
            <Mic className="w-7 h-7" />
          </button>

          <p className="text-xs text-[#73685B] dark:text-[#A89E90]">
            {isListening
              ? 'አሁን ድምፅዎን በማዳመጥ ላይ ነው... ሲጨርሱ ቁልፉን ይጫኑ'
              : 'ማይክራፎኑን በመጫን በአማርኛ ወይም በእንግሊዝኛ ይናገሩ'}
          </p>
        </div>

        {/* Text Input & Live Transcript */}
        <div>
          <label className="block text-[11px] font-semibold text-[#73685B] dark:text-[#A89E90] mb-1">
            የተሰማው ድምፅ ወይም በእጅ ያስገቡ
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              placeholder="ለምሳሌ፡ ለቤተልሔም የልብ ቀዶ ጥገና 500 ብር በቴሌብር መለገስ እፈልጋለሁ..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-[#14110E] dark:text-[#FAF6EE] focus:outline-none"
            />
          </div>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-[#73685B] dark:text-[#A89E90] tracking-wider">
            የናሙና ድምፅ ትዕዛዞች (Preset Prompts)
          </p>
          <div className="space-y-1">
            {VOXIDE_PRESET_PROMPTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onTranscriptChange(preset.text[lang] || preset.text.am)}
                className="w-full text-left p-2 rounded-lg bg-[#FAF6EE]/80 dark:bg-[#1C1814] hover:bg-[#EFE7D5] text-[11px] text-[#5A5046] dark:text-[#A89E90] truncate border border-[#D5C8B2]/40 dark:border-[#2E2822] transition-colors cursor-pointer"
              >
                "{preset.text[lang] || preset.text.am}"
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onSubmit}
          disabled={!transcript.trim() || isProcessing}
          className="w-full py-2.5 rounded-xl bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          {isProcessing ? 'ትዕዛዙን በማጣራት ላይ...' : 'ትዕዛዙን አከናውን (Execute)'}
        </button>
      </div>
    </div>
  );
};

export default VoiceTranscriptDrawer;
