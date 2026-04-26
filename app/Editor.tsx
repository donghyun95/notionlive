'use client';

import { useEffect } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import {
  useCreateBlockNoteWithLiveblocks,
  useIsEditorReady,
} from '@liveblocks/react-blocknote';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { TitleInput } from './TitleInput';
import { useSelectedData } from './Providers/ClientDataProvider';
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

export function Editor({ role }: { role: string }) {
  const editor = useCreateBlockNoteWithLiveblocks(
    { schema, uploadFile },
    { mentions: false },
  ) as BlockNoteEditor;
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);
  const isReady = useIsEditorReady();
  useEffect(() => {
    console.log('isready on');
    setisCursorOn(true);
    return () => setisCursorOn(false);
  }, [isReady]);
  return (
    <>
      <TitleInput editor={editor} />
      <BlockNoteView
        editor={editor}
        className="editor min-h-[63vh] mx-auto max-w-[100%] md:max-w-[768px] md:min-w-[768px] commonPadding min-h-full"
        editable={role !== 'VIEWER'}
        theme="light"
      />
    </>
  );
}
