'use client';

import { useRef } from 'react';
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

  const renderTurnstile = () => {
    if (!window.turnstile || !ref.current || rendered.current) return;

    window.turnstile.render(ref.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
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
