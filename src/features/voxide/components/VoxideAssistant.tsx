import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VoxideWidget, useVoxideVoice } from '@voxide/react';
import { voxideClient } from '../api/voxide.client';
import { useVoxideCapabilities } from '../hooks/useVoxideCapabilities';
import { Mic, AlertCircle, X } from 'lucide-react';

export function VoxideAssistant() {
  // Register capabilities into the Voxide client instance
  useVoxideCapabilities();

  const { t } = useTranslation();
  const { status, connect } = useVoxideVoice(voxideClient);
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (status === 'error') {
      setShowMicPrompt(true);
    } else if (status === 'listening' || status === 'speaking' || status === 'thinking') {
      setShowMicPrompt(false);
    }
  }, [status]);

  const handleGrantMicAccess = async () => {
    setIsRequesting(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setShowMicPrompt(false);
        await connect();
      }
    } catch {
      // Keep prompt open if still denied so user is guided
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <>
      {/*
        Pass nothing but the client. Every other prop outranks the dashboard, so
        hardcoding one makes the matching control in Appearance silently do
        nothing. Set the colour, title and placement there instead.
      */}
      <VoxideWidget client={voxideClient} />

      {/* Helpful permission banner when microphone access is blocked or denied */}
      {showMicPrompt && (
        <div
          role="alert"
          className="fixed bottom-24 right-6 z-50 max-w-sm bg-[#FFFDF9] dark:bg-[#1A1815] text-[#14110E] dark:text-[#FFFFFF] border-2 border-[#D97706] dark:border-[#B45309] rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-3 font-sans"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-[#D97706] dark:text-[#FBBF24] font-semibold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t('voxide.title')}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMicPrompt(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
              aria-label={t('voxide.messages.dismiss')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {t(
              'voxide.messages.micPermissionRequired'
            )}
          </p>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowMicPrompt(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium cursor-pointer"
            >
              {t('voxide.messages.dismiss')}
            </button>
            <button
              type="button"
              onClick={handleGrantMicAccess}
              disabled={isRequesting}
              className="px-3.5 py-1.5 bg-[#1E4D38] hover:bg-[#173C32] dark:bg-[#52B788] dark:hover:bg-[#40916C] text-white dark:text-[#080706] rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>
                {isRequesting
                  ? t('common.loading')
                  : t('voxide.messages.grantMicPermission')}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
