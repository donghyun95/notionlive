'use client';

import { LiveblocksProvider } from '@liveblocks/react';

export function LiveblocksProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      {children}
    </LiveblocksProvider>
  );
}
