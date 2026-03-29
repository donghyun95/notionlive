import { BlockNoteView } from '@blocknote/mantine';
import { Threads } from './Threads';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote';
import { TitleInput } from './TitleInput';
import { useCreateBlockNote } from '@blocknote/react';

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
  const editor2 = useCreateBlockNote({
    initialContent: initial,
  });
  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile, schema },
    { offlineSupport_experimental: true },
  );

  return (
    <>
      <TitleInput editor={editor} />
      <BlockNoteView
        editor={editor}
        className={`editor`}
        editable={true}
        onChange={(editor, { getChanges }) => {
          const changes = getChanges();
          console.log(editor.document);
        }}
      />
    </>
  );
}

const initial = [
  {
    id: 'initialBlockId',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㄴㅇㅁㅇㅁㅇ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '940791e0-c076-4008-a90c-442ae655fa3d',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [],
    children: [],
  },
  {
    id: '0035ded5-62d9-4334-9852-3d8c56ebdcc5',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㄴㅇ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'eccf1f64-bbc0-4bfa-9394-39ff67240ea0',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㅇ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '83d5a60c-6d74-4df5-ad40-faa26ec79c5b',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㄴㅇ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'db3509ae-8cb3-4bcb-b06b-85d49ee8c384',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㅇ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'db4f31aa-e40d-4984-8757-639b4ac7fdf5',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㅇ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '46412e3d-eb22-40d8-ba04-b4c56622a860',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'ㅁㄴㅇㅁㅇㅈㅇㅁ',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'f7af2375-82dd-4d33-9bf9-4f8d4c8d987e',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: '아몰랑 페이지13s',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: '599ea295-42f5-443e-9653-2abcee0e4a5c',
    type: 'paragraph',
    props: {
      backgroundColor: 'default',
      textColor: 'default',
      textAlignment: 'left',
    },
    content: [],
    children: [],
  },
];
