"use client";

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { Threads } from "./Threads";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";

type EditorItemProps = {
  field: string;
};

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const ret = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).data.url.replace(
    "tmpfiles.org/",
    "tmpfiles.org/dl/",
  );
}
const { video, audio, file, ...remainingBlockSpecs } = defaultBlockSpecs;
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...remainingBlockSpecs,
  },
});

export function Editor({ field }: EditorItemProps) {
  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile, schema },
    { field, offlineSupport_experimental: true },
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "30vh",
        overflowY: "visible",

        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <BlockNoteView
        editor={editor}
        className="editor"
        editable={true}
        onChange={(editor, { getChanges }) => {
          const changes = getChanges();
          // console.log("current content:", JSON.stringify(editor.document));
        }}
      />
    </div>
  );
}
