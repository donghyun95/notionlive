'use client';
import {
  useCreateBlockNoteWithLiveblocks,
  useIsEditorReady,
} from '@liveblocks/react-blocknote';
import { EditorSkeleton } from '../../EditorSkeleton';
import { BlockNoteView } from '@blocknote/mantine';

export function ReadOnlyEditor({ pagenodeID }: { pagenodeID: number }) {
  const editor = useCreateBlockNoteWithLiveblocks();
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
