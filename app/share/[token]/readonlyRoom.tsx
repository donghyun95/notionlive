'use client';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from '@liveblocks/react/suspense';

import { ReadOnlyPopOverEmoticon } from '@/app/share/[token]/ReadOnlyPopOverEmoticon';
import { ReadOnlyTitle } from '@/app/share/[token]/ReadOnlyTitleInput';
import { ClientReadOnlyEditor } from './ClientReadOnlyEditor';
import { useQuery } from '@tanstack/react-query';
import { pagePublicInfoFetch } from '@/lib/api/getPublishedFetch';
import { notFound } from 'next/navigation';
import { useEffect } from 'react';
import AccessDeniedPage from './accesDenied';

export default function Room({ pageid }: { pageid: number }) {
  const { data: publicData } = useQuery({
    queryKey: ['pagePublicInfo', pageid],
    queryFn: () => pagePublicInfoFetch(pageid),
    enabled: !!pageid, // pageId 없으면 실행 안 함
    refetchInterval: 2000,
  });
  if (!publicData) {
    return null;
  }
  if (!publicData?.ispublished) {
    return <AccessDeniedPage />;
  }
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider id={String(pageid)} initialPresence={{ cursor: null }}>
        <div className="relative page">
          <ReadOnlyPopOverEmoticon pagenodeID={pageid} />
          <ReadOnlyTitle pagenodeID={pageid} />
          <ClientReadOnlyEditor pagenodeID={pageid} />
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
