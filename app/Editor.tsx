'use client';

import { useEffect, useMemo, useRef } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { Threads } from './Threads';
import { useSelectedData } from './Providers/ClientDataProvider';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import {
  useCreateBlockNoteWithLiveblocks,
  useIsEditorReady,
} from '@liveblocks/react-blocknote';
import { TitleInput } from './TitleInput';
import { useCreateBlockNote } from '@blocknote/react';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const { data: selfAndChildren = { self: {}, children: [] } } = useQuery({
    queryKey: ['page', Number(pageNodeID)],
    queryFn: () => getSelfandChildrenFetch(String(pageNodeID)),
    staleTime: 0,
    enabled: true,
  });
  console.log('render Editor', selfAndChildren);
  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile, schema },
    { offlineSupport_experimental: true },
  );
  const ready = useIsEditorReady();
  return (
    <>
      <TitleInput editor={editor} />
      <BlockNoteView
        editor={editor}
        className={`editor`}
        editable={selfAndChildren.role === 'VIEWER' ? false : true}
        onChange={(editor, { getChanges }) => {
          const changes = getChanges();
          console.log(editor.document);
        }}
      />
    </>
  );
}
//
