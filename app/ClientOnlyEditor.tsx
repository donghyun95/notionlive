'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
const Editor = dynamic(() => import('./Editor').then((m) => m.Editor), {
  ssr: false,
});

export function ClientOnlyEditor({ role }) {
  useEffect(() => {
    console.log('ClientOnlyEditor mounted');
    return () => console.log('ClientOnlyEditor unmounted');
  }, []);
  return <Editor role={role} />;
}
