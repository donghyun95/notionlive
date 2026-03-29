'use client';

import { ReactNode, useEffect } from 'react';
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react/suspense';
import { useSelectedData } from './Providers/ClientDataProvider';

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

export function Room({ PageId, children }: any) {
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const setPageNodeID = useSelectedData((state) => state.setPageNodeID);
  useEffect(() => {
    if (PageId) {
      setPageNodeID(PageId);
    }
  });

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider
        id={PageId ? PageId : pageNodeID}
        initialPresence={{ cursor: null }}
      >
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}

{
  /* <ClientSideSuspense fallback={<LoadingFallback />}></ClientSideSuspense> */
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
