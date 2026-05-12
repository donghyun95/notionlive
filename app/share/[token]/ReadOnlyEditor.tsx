'use client';
import {
  useCreateBlockNoteWithLiveblocks,
  useIsEditorReady,
} from '@liveblocks/react-blocknote';
import { codeBlockOptions } from '@blocknote/code-block';
import { EditorSkeleton } from '../../EditorSkeleton';
import { BlockNoteView } from '@blocknote/mantine';
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  createCodeBlockSpec,
} from '@blocknote/core';
const { video, audio, file, ...remainingBlockSpecs } = defaultBlockSpecs;
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...remainingBlockSpecs,
    codeBlock: createCodeBlockSpec({
      ...codeBlockOptions,
      defaultLanguage: 'typescript',
    }),
  },
});
export function ReadOnlyEditor({ pagenodeID }: { pagenodeID: number }) {
  const editor = useCreateBlockNoteWithLiveblocks(
    { schema },
    { mentions: false },
  );
  const ready = useIsEditorReady();
  if (!ready) {
    return <EditorSkeleton />;
  }
  return (
    <BlockNoteView
      editor={editor}
      className="min-h-[63vh] mx-auto max-w-[100%] md:max-w-[768px] md:min-w-[768px] commonPadding min-h-full"
      editable={false}
      onChange={(editor, { getChanges }) => {
        const changes = getChanges();
      }}
    />
  );
}
