'use client';
import { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';

export const EditorContext = createContext<any | null>(null);

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

export function EditorProvider({ children }: { children: ReactNode }) {
  console.count('EditorProvider render');
  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile, schema },
    { offlineSupport_experimental: false },
  );

  const prevEditorRef = useRef<any>(null);

  useEffect(() => {
    if (prevEditorRef.current !== editor) {
      console.log('🔥 editor instance changed');
    } else {
      console.log('same editor instance');
    }

    prevEditorRef.current = editor;
  }, [editor]);

  return (
    <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const editor = useContext(EditorContext);

  if (!editor) {
    throw new Error('useEditor must be used within EditorProvider');
  }

  return editor;
}
