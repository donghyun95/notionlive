"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

import { Editor } from "./Editor";

type RoomData = {
  id: number;
  createdAt: Date;
  partNo: number;
  roomId: string;
};

type RoomProps = {
  children: ReactNode;
  data: RoomData[];
};

export function Room({ data, children }: any) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      {data.map((obj: any) => (
        <div
          key={obj.id}
          style={{
            position: "relative",
            border: "1px solid #ddd",
            marginBottom: 16,
            padding: 12,
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: 8, fontSize: 14 }}>{obj.roomId}</div>

          <RoomProvider id={obj.roomId}>
            <ClientSideSuspense fallback={<div>Loading…</div>}>
              <Editor field={obj.roomId} />
            </ClientSideSuspense>
          </RoomProvider>
        </div>
      ))}
    </LiveblocksProvider>
  );
}

// export function Room({ data }: any) {
//   return (
//     <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
//       <div className="relative flex">
//         {data.map((obj: any) => (
//           <RoomProvider id={obj.roomId}>
//             <ClientSideSuspense fallback={<div>Loading…</div>}>
//               <Editor field={obj.roomId} />
//             </ClientSideSuspense>
//           </RoomProvider>
//         ))}
//       </div>
//     </LiveblocksProvider>
//   );
// }
