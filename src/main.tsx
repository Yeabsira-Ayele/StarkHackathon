import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FundraisingApp from './features/fundraising/FundraisingApp.tsx';
import './index.css';
import './i18n/config';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <FundraisingApp />
      </div>
    </QueryClientProvider>
  </StrictMode>
);
