'use client';

import { useEffect } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { TitleInput } from './TitleInput';
async function uploadFile(file: File) {
  const body = new FormData();
  body.append('file', file);

  const ret = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body,
  });

  const json = await ret.json();

  return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
}

const { video, audio, file, ...remainingBlockSpecs } = defaultBlockSpecs;

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...remainingBlockSpecs,
  },
});

export function Editor({ role }) {
  const editor = useCreateBlockNoteWithLiveblocks(
    { schema },
    { mentions: false },
  ) as BlockNoteEditor;

  return (
    <>
      <TitleInput editor={editor} />
      <BlockNoteView editor={editor} className="editor" />
    </>
  );
}
//
// editable={role === 'VIEWER' ? false : true}
