import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface GoogleIdentityCredential {
  credential: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleIdentityCredential) => void;
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
}

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess }) => {
  const { loginWithGoogle, isLoading } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef(loginWithGoogle);
  const successRef = useRef(onSuccess);
  const [error, setError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    loginRef.current = loginWithGoogle;
    successRef.current = onSuccess;
  }, [loginWithGoogle, onSuccess]);

  useEffect(() => {
    if (!clientId) {
      setError('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID and restart the frontend.');
      return;
    }

    let active = true;
    const renderButton = () => {
      if (!active || !buttonRef.current || !window.google) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError(null);
          try {
            await loginRef.current(credential);
            successRef.current?.();
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Could not sign in with Google.');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
      });
    };

    if (window.google) {
      renderButton();
      return () => {
        active = false;
      };
    }

    let script = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    const isNewScript = !script;
    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
    }

    const handleLoad = () => renderButton();
    const handleError = () => {
      if (active) setError('Google sign-in could not load. Check your connection and try again.');
    };
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    if (isNewScript) document.head.appendChild(script);

    return () => {
      active = false;
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
  }, [clientId]);

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex min-h-11 justify-center">
        <div ref={buttonRef} aria-busy={isLoading} className={isLoading ? 'pointer-events-none opacity-60' : ''} />
      </div>
      <p className="text-center text-[11px] text-[#73685B] dark:text-[#A89E90]">
        Use your Google account to sign in or create an account.
      </p>
    </div>
  );
};

export default GoogleAuthButton;
