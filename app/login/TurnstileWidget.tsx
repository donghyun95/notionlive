'use client';

import { useRef, useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        },
      ) => string;
    };
  }
}

type Props = {
  onVerify: (token: string) => void;
  handleSubmitError: (message: string) => void;
};

export default function TurnstileWidget({
  onVerify,
  handleSubmitError,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function loadConfig() {
      try {
        if (process.env.NODE_ENV === 'development') {
          // dev에서는 테스트용 값
          const sitekey = String(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
          setSiteKey(sitekey);
          return;
        }

        const res = await fetch('/api/public-config');
        if (!res.ok) {
          throw new Error('Failed to load config');
        }
        const data = await res.json();
        if (!data.turnstileSiteKey) {
          throw new Error('Missing Turnstile site key');
        }
        setSiteKey(data.turnstileSiteKey);
      } catch {
        handleSubmitError('Security verification is not configured.');
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [handleSubmitError]);
  const renderTurnstile = () => {
    if (!window.turnstile || !ref.current || rendered.current || !siteKey)
      return;
    window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onVerify(token);
        console.log('Turnstile token:', token);
      },
      'expired-callback': () => {
        console.log('expired-callback fired');
        onVerify('');
        handleSubmitError('Security verification expired. Please try again.');
      },
      'error-callback': () => {
        console.log('error-callback fired');
        onVerify('');
        handleSubmitError('Verification failed. Please try again.');
      },
    });

    rendered.current = true;
  };
  useEffect(() => {
    renderTurnstile();
  }, [siteKey]);

  if (isLoading) {
    return <div>Loading security verification...</div>;
  }

  if (!siteKey) {
    return <div>Security verification is not available.</div>;
  }
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />
      <div ref={ref} />
    </>
  );
}
