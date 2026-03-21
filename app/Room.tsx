'use client';

import { ReactNode, useEffect } from 'react';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useOthers,
  useUpdateMyPresence,
} from '@liveblocks/react/suspense';

type RoomData = {
  id: number;
  createdAt: Date;
  partNo: number;
  roomId: string;
};

type RoomProps = {
  children: ReactNode;
  data: RoomData[];
};

export function Room({ id, children }: any) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider id={'example'} initialPresence={{ cursor: null }}>
        <ClientSideSuspense fallback={<LoadingFallback />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

export function LoadingFallback() {
  useEffect(() => {
    performance.mark('suspense-fallback-mounted');
    console.log('[perf] fallback mounted');

    return () => {
      performance.mark('suspense-fallback-unmounted');
      performance.measure(
        'suspense-fallback-duration',
        'suspense-fallback-mounted',
        'suspense-fallback-unmounted',
      );

      const entries = performance.getEntriesByName(
        'suspense-fallback-duration',
      );
      const last = entries[entries.length - 1];

      console.log('[perf] fallback duration:', Math.round(last.duration), 'ms');
    };
  }, []);

  return <div>Loading…</div>;
}
