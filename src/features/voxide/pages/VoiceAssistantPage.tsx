import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useVoxide } from '../hooks/useVoxide';
import { VoiceVisualizer } from '../components/VoiceVisualizer';
import { VOXIDE_PRESET_PROMPTS } from '../data/voxide.data';
import { Loading } from '../../../components/Loading';
import { resolveLanguage } from '../../../i18n/index.ts';

interface VoiceAssistantPageProps {
  onExecuteDonation?: (data: any) => void;
  onExecuteCreation?: (data: any) => void;
}

export const VoiceAssistantPage: React.FC<VoiceAssistantPageProps> = ({
  onExecuteDonation,
  onExecuteCreation,
}) => {
  const { t, i18n } = useTranslation();
  const lang = resolveLanguage(i18n.language);
  const {
    isListening,
    transcript,
    setTranscript,
    setIsListening,
    processVoice,
    isProcessing,
    extraction,
    error,
  } = useVoxide();

  const handleToggleMic = () => {
    setIsListening(!isListening);
  };

  const handleExecute = async () => {
    if (!transcript.trim()) return;
    try {
      const result = await processVoice({ text: transcript, lang });
      if (result.intent === 'donate' && result.donationData) {
        onExecuteDonation?.(result.donationData);
      } else if (result.intent === 'create_campaign' && result.campaignData) {
        onExecuteCreation?.(result.campaignData);
      }
    } catch {
      // The mutation error is shown below and can be retried.
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E4D38]/10 text-[#1E4D38] dark:text-[#52B788] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Voxide Natural Speech Interface
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#14110E] dark:text-[#FAF6EE]">
          በድምፅ ይለግሱ፣ አዲስ ምክንያት ይጀምሩ
        </h1>
        <p className="text-xs text-[#73685B] dark:text-[#A89E90] max-w-lg mx-auto">
          በአማርኛ፣ በእንግሊዝኛ ወይም በኦሮምኛ ድምፅዎን በመጠቀም የልገሳ ሂደቶችን በቅጽበት ያከናውኑ
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822] shadow-sm text-center space-y-6">
        <VoiceVisualizer isListening={isListening} />

        <button
          onClick={handleToggleMic}
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer shadow-xl ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-500/25'
              : 'bg-gradient-to-br from-[#1E4D38] to-[#123023] hover:from-[#163829] hover:to-[#0D241A] text-white hover:scale-105'
          }`}
        >
          <Mic className="w-9 h-9 text-[#52B788]" />
        </button>

        <p className="text-xs font-medium text-[#73685B] dark:text-[#A89E90]">
          {isListening
            ? 'በማዳመጥ ላይ ነው... ንግግርዎን ሲጨርሱ ቁልፉን ይጫኑ'
            : 'ለመናገር ማይክራፎኑን ይጫኑ'}
        </p>

        <div className="max-w-xl mx-auto">
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="ወይም ትዕዛዝዎን እዚህ ይጻፉ..."
            className="w-full px-4 py-3 text-xs rounded-2xl bg-[#EFE7D5] dark:bg-[#1E1A16] border border-[#D5C8B2]/70 dark:border-[#2E2822] text-[#14110E] dark:text-[#FAF6EE] focus:outline-none"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleExecute}
            disabled={!transcript.trim() || isProcessing}
            className="px-8 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#153828] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 transition-all"
          >
            {isProcessing ? 'ትዕዛዙን በማጣራት ላይ...' : 'ትዕዛዙን አከናውን'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {isProcessing && (
          <p role="status" className="text-xs text-[#73685B] dark:text-[#A89E90]">
            ትዕዛዙን በማጣራት ላይ...
          </p>
        )}
        {error && (
          <div role="alert" className="mx-auto max-w-xl border border-red-500/30 bg-red-500/10 p-3 text-left text-xs text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : 'The voice request could not be processed.'}
            <p className="mt-1">Check your connection and try again.</p>
          </div>
        )}
        {extraction && (
          <p role="status" className="text-xs text-[#73685B] dark:text-[#A89E90]">
            Request processed: {extraction.intent}
          </p>
        )}
      </div>

      {/* Preset Prompts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#73685B] dark:text-[#A89E90]">
          የተዘጋጁ የናሙና ድምፅ ትዕዛዞች
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VOXIDE_PRESET_PROMPTS.map((p) => (
            <div
              key={p.id}
              onClick={() => setTranscript(p.text[lang] || p.text.am)}
              className="p-3 rounded-2xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/60 dark:border-[#2E2822] hover:border-[#9A7432] cursor-pointer transition-all text-left"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#9A7432] mb-1.5" />
              <p className="text-[11px] text-[#26211C] dark:text-[#FAF6EE] leading-snug">
                "{p.text[lang] || p.text.am}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantPage;
