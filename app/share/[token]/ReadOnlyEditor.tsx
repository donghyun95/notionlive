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
      className={`editor`}
      editable={false}
      onChange={(editor, { getChanges }) => {
        const changes = getChanges();
      }}
    />
  );
}
