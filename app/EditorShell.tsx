'use client';

import { useEffect } from 'react';
import { EditorContext } from './EditorProvider';
import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { TitleInput } from './TitleInput';
import { Editor } from './Editor';

async function uploadFile(file: File) {
  const body = new FormData();
  body.append('file', file);

  const ret = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body,
  });

  return (await ret.json()).data.url.replace(
    'tmpfiles.org/',
    'tmpfiles.org/dl/',
  );
}

const { video, audio, file, ...remainingBlockSpecs } = defaultBlockSpecs;

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...remainingBlockSpecs,
  },
});

export function EditorShell() {
  console.count('EditorShell render');

  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile, schema },
    { offlineSupport_experimental: false },
  );

  useEffect(() => {
    console.log('EditorShell mounted');
    return () => {
      console.log('EditorShell unmounted');
    };
  }, []);

  return (
    <EditorContext.Provider value={editor}>
      <TitleInput />
      <Editor />
    </EditorContext.Provider>
  );
}
