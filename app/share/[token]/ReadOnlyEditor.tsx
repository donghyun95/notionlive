'use client';
import { BlockNoteView } from '@blocknote/mantine';
import {
  useCreateBlockNoteWithLiveblocks,
  useIsEditorReady,
} from '@liveblocks/react-blocknote';
import { EditorSkeleton } from '../../EditorSkeleton';

export function ReadOnlyEditor({ pagenodeID }: { pagenodeID: number }) {
  const editor = useCreateBlockNoteWithLiveblocks();
  const ready = useIsEditorReady();
  if (!ready) {
    return <EditorSkeleton />;
  }
  return (
    <BlockNoteView
      editor={editor}
      className={`editor`}
      editable={false}
      onChange={(editor, { getChanges }) => {
        const changes = getChanges();
      }}
    />
  );
}
