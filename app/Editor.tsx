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
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

async function uploadFile(file: File) {
  try {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      console.log('이미지파일만');
      throw new Error('이미지 파일만 업로드할 수 있습니다.');
    }
    const response = await fetch('/api/s3/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });
    if (!response.ok) {
      throw new Error('presigned URL 생성 실패');
    }
    const { uploadUrl, key } = await response.json();
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      console.error(uploadResponse.status, text);
      throw new Error('S3 업로드 실패');
    }
    const imageUrl = `https://d3pe5mwm7m77g1.cloudfront.net/${key}`;

    console.log('업로드 완료:', imageUrl);
    return imageUrl;
  } catch (e) {
    console.log(e);
    throw new Error('업로드실패');
  }
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
