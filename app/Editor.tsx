"use client";

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { Threads } from "./Threads";

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

export function Editor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    { uploadFile },
    {
      offlineSupport_experimental: true,
    },
  );

  return (
    <div>
      <BlockNoteView
        editor={editor}
        className="editor"
        editable={true}
        onChange={(editor, { getChanges }) => {
          const changes = getChanges();
          console.log("changes:", changes);
        }}
      />
      <Threads editor={editor} />
    </div>
  );
}
