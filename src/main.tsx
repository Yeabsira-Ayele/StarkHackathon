import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { APP_DESCRIPTION, APP_NAME } from './data/content.ts';
import './index.css';
import './i18n/config';

document.title = APP_NAME;
document.querySelector('meta[property="og:title"]')?.setAttribute('content', APP_NAME);
document.querySelector('meta[name="description"]')?.setAttribute('content', APP_DESCRIPTION);
document.querySelector('meta[property="og:description"]')?.setAttribute('content', APP_DESCRIPTION);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
