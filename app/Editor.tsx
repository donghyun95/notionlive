'use client';

import { BlockNoteView } from '@blocknote/mantine';
import { Threads } from './Threads';
import { useEffect, useState, useRef } from 'react';
import { EditorProvider, useEditor } from './EditorProvider';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { TitleInput } from './TitleInput';

async function uploadFile(file: File) {
  const body = new FormData();
  body.append('file', file);
  const ret = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: body,
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
export function Editor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile, schema },
    { offlineSupport_experimental: true },
  );

  console.log('editor 함수 실행함');
  return (
    <>
      <TitleInput editor={editor}></TitleInput>
      <BlockNoteView
        editor={editor}
        className="editor"
        editable={true}
        onChange={(editor, { getChanges }) => {
          const changes = getChanges();
        }}
      />
    </>
  );
}
