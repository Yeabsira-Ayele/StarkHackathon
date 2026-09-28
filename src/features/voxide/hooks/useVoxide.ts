import { useMutation } from '@tanstack/react-query';
import { voxideApi } from '../api/voxide.api';
import { useVoxideStore } from '../store/voxide.store';

export const useVoxide = () => {
  const {
    isListening,
    isOpen,
    transcript,
    extraction,
    setIsOpen,
    setIsListening,
    setTranscript,
    setExtraction,
    resetVoiceState,
  } = useVoxideStore();

  const processMutation = useMutation({
    mutationFn: ({ text, lang }: { text: string; lang: 'am' | 'en' | 'om' }) =>
      voxideApi.processVoiceInput(text, lang),
    onSuccess: (data) => {
      setExtraction(data);
    },
  });

  return {
    isListening,
    isOpen,
    transcript,
    extraction,
    isProcessing: processMutation.isPending,
    setIsOpen,
    setIsListening,
    setTranscript,
    processVoice: processMutation.mutateAsync,
    resetVoiceState,
  };
};
