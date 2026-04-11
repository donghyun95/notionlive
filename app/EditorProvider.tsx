// 'use client';

// import { createContext, useContext, type ReactNode } from 'react';
// import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
// import {
//   BlockNoteSchema,
//   defaultBlockSpecs,
//   type BlockNoteEditor,
// } from '@blocknote/core';
// import { createReactBlockSpec } from '@blocknote/react';
// async function uploadFile(file: File) {
//   const body = new FormData();
//   body.append('file', file);

//   const ret = await fetch('https://tmpfiles.org/api/v1/upload', {
//     method: 'POST',
//     body,
//   });

//   const json = await ret.json();

//   return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
// }

// const { video, audio, file, ...remainingBlockSpecs } = defaultBlockSpecs;

// const schema = BlockNoteSchema.create({
//   blockSpecs: {
//     ...remainingBlockSpecs,
//   },
// });
// type EditorType = ReturnType<typeof useCreateBlockNoteWithLiveblocks>;
// const EditorContext = createContext<EditorType | null>(null);

// type EditorProviderProps = {
//   children: ReactNode;
// };

// export const EditorProvider = ({ children }: EditorProviderProps) => {
//   const editor = useCreateBlockNoteWithLiveblocks(
//     { uploadFile, schema },
//     { offlineSupport_experimental: true },
//   );

//   return (
//     <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
//   );
// };
