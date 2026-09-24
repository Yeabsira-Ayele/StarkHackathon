import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, ArrowRight, CornerDownRight } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { voxideService, VoxideExtraction } from '../../services/voice/voxideService.ts';
import { Campaign } from '../../types/index.ts';

export interface VoxideBarProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onExtractedCreation: (data: NonNullable<VoxideExtraction['campaignData']>) => void;
  onExtractedDonation: (data: NonNullable<VoxideExtraction['donationData']>) => void;
  language?: 'en' | 'am' | 'om';
}

export const VoxideBar: React.FC<VoxideBarProps> = ({
  isOpen,
  onClose,
  campaigns,
  onExtractedCreation,
  onExtractedDonation,
  language = 'en',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Click the mic or select a quick voice prompt');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const quickPrompts = [
    {
      label: '🎤 "Donate 1,000 Birr to Bethlehem\'s surgery fund from Dawit"',
      text: 'Donate 1,000 Birr to Bethlehem heart surgery fund from Dawit with message May God heal her quickly',
      type: 'donation',
    },
    {
      label: '🎤 "Create campaign for Woliso Maternity Clinic Oxygen Refill"',
      text: 'Create a campaign for Woliso Maternity Clinic Oxygen Refill with goal of 65000 birr in emergency category',
      type: 'creation',
    },
    {
      label: '🎤 "Donate 2,500 Birr to East Shewa clean water well"',
      text: 'Donate 2,500 Birr to East Shewa clean water well project from Almaz',
      type: 'donation',
    },
    {
      label: '🎤 "Start fundraiser for Hawassa STEM High School books"',
      text: 'Start fundraiser for Hawassa High School STEM textbooks with goal of 95000 birr in education category',
      type: 'creation',
    },
  ];

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'am' ? 'am-ET' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('Listening... Speak your campaign or donation request');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setStatusMessage('Microphone access unavailable or quiet. You can use sample prompts.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setRecognitionSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionSupported) {
      setStatusMessage('Voice recognition is not supported in this browser. Try the quick prompts below.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        processText(transcript);
      }
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Could not start recognition', e);
      }
    }
  };

  const processText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;

    setStatusMessage('Analyzing request...');
    const result = voxideService.parseSpokenIntent(textToProcess, campaigns);

    setTimeout(() => {
      setStatusMessage(result.statusMessage);

      if (result.intent === 'create_campaign' && result.campaignData) {
        voxideService.speakFeedback(
          `Extracted campaign details for ${result.campaignData.title}. Please review and confirm.`
        );
        onExtractedCreation(result.campaignData);
        onClose();
      } else if (result.intent === 'donate' && result.donationData) {
        voxideService.speakFeedback(
          `Extracted donation of ${result.donationData.amount} Birr. Please review before payment.`
        );
        onExtractedDonation(result.donationData);
        onClose();
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 flex justify-center pointer-events-none">
      <div className="w-full max-w-2xl bg-surface text-primary rounded-2xl shadow-2xl border border-border p-5 pointer-events-auto backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-accent text-white ring-4 ring-indigo-500/30'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-accent border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
              </div>
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-primary tracking-tight">
                  Voice Assistant
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{statusMessage}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Voice Assistant"
            className="text-zinc-400 hover:text-primary p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Visualizer */}
        <div className="py-4 flex items-center justify-center gap-1.5 h-14 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl my-3 border border-border px-4">
          {isListening ? (
            <div className="flex items-center gap-1 h-8">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(15, Math.sin((i + Date.now() / 200) * 0.5) * 100)}%`,
                    animationDuration: `${0.3 + (i % 5) * 0.15}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              {transcript ? `"${transcript}"` : 'Press microphone or select a prompt below'}
            </p>
          )}
        </div>

        {/* Action Controls & Input */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Button
            size="sm"
            variant={isListening ? 'danger' : 'accent'}
            onClick={toggleListening}
            icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            className="shrink-0"
          >
            {isListening ? 'Stop Listening' : 'Speak'}
          </Button>

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Or type voice command directly..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && transcript.trim()) {
                  processText(transcript);
                }
              }}
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-primary placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-accent"
            />
            {transcript && (
              <Button
                size="sm"
                variant="accent"
                onClick={() => processText(transcript)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Submit
              </Button>
            )}
          </div>
        </div>

        {/* Quick Voice Demo Presets */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[11px] font-semibold text-zinc-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Example Voice Commands:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => processText(p.text)}
                className="text-left px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-accent/40 border border-border rounded-lg text-xs text-primary transition-all flex items-start justify-between gap-2 group cursor-pointer"
              >
                <span className="line-clamp-1">{p.label}</span>
                <CornerDownRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-accent shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
