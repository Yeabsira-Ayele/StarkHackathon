// Lewegene Voxide Feature & @voxide/react SDK Exports
export * from './components/VoxideAssistant';
export * from './components/VoiceVisualizer';
export * from './components/VoxideVoiceTrigger';
export * from './components/VoiceTranscriptDrawer';
export * from './pages/VoiceAssistantPage';
export * from './hooks/useVoxide';
export * from './hooks/useVoxideCapabilities';
export * from './store/voxide.store';
export * from './api/voxide.api';
export * from './api/voxide.client';
export * from './data/voxide.data';
export * from './schemas/voxide.schema';
export * from './types/voxide.types';

// Direct export of official @voxide/react library
export {
  VoxideWidget,
  VoxideClient,
  useVoxideVoice,
  isWakeWordSupported,
  resolveLiveUrl,
  DEFAULT_BASE_URL,
} from '@voxide/react';

export type {
  VoxideWidgetProps,
  VoxideClientConfig,
  VoxideAction,
  VoxideActionConfig,
  VoxideMessage,
  VoxideStatus,
} from '@voxide/react';
