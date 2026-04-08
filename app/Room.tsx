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
        id={PageId ? PageId : String(pageNodeID)}
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
export function EditorSkeleton() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-4xl px-8 py-10">
        <div className="mb-4 h-10 w-72 animate-pulse rounded bg-gray-200" />
        <div className="mb-8 h-4 w-40 animate-pulse rounded bg-gray-200" />

        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-9/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="my-8 h-48 w-full animate-pulse rounded-xl bg-gray-200" />

        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-8/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-7/12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </main>
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
