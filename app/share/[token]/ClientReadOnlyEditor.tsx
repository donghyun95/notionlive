'use client';

import dynamic from 'next/dynamic';
const ReadOnlyEditor = dynamic(
  () => import('./ReadOnlyEditor').then((m) => m.ReadOnlyEditor),
  {
    ssr: false,
  },
);

export function ClientReadOnlyEditor({ pagenodeID }: { pagenodeID: number }) {
  return <ReadOnlyEditor pagenodeID={pagenodeID} />;
}
