import { create } from 'zustand';
import { VoxideExtraction } from '../types/voxide.types';

interface VoxideState {
  isListening: boolean;
  isOpen: boolean;
  transcript: string;
  extraction: VoxideExtraction | null;
  setIsOpen: (isOpen: boolean) => void;
  setIsListening: (isListening: boolean) => void;
  setTranscript: (transcript: string) => void;
  setExtraction: (extraction: VoxideExtraction | null) => void;
  resetVoiceState: () => void;
}

export const useVoxideStore = create<VoxideState>((set) => ({
  isListening: false,
  isOpen: false,
  transcript: '',
  extraction: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setIsListening: (isListening) => set({ isListening }),
  setTranscript: (transcript) => set({ transcript }),
  setExtraction: (extraction) => set({ extraction }),
  resetVoiceState: () =>
    set({ isListening: false, transcript: '', extraction: null }),
}));
