'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import TeamSpaceErrorPage from './errorPage';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <TeamSpaceErrorPage></TeamSpaceErrorPage>;
}
