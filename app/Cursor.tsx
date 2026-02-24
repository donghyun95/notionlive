"use client";
import { useRef } from "react";

import { useMyPresence, useOthers } from "@liveblocks/react/suspense";

type Props = {
  x: number;
  y: number;
};

function CursorUI({ x, y }: Props) {
  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m13.67 6.03-11-4a.5.5 0 0 0-.64.64l4 11a.5.5 0 0 0 .935.015l1.92-4.8 4.8-1.92a.5.5 0 0 0 0-.935h-.015Z"
        fill="#000"
      />
    </svg>
  );
}

export function Cursor() {
  const boxRef = useRef(null);
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();
  function handlePointerLeave(e) {
    updateMyPresence({ cursor: null });
  }
  const handlePointerMove = (e) => {
    const rect = boxRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left; // 0 ~ rect.width
    const y = e.clientY - rect.top; // 0 ~ rect.height
    const cursor = { x: Math.floor(x), y: Math.floor(y) };
    updateMyPresence({ cursor });
    console.log("cursor:", cursor);
  };
  return (
    <div
      ref={boxRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ width: "100vw", height: "100vh" }}
    >
      <CursorUI x={150} y={150} />
      {others
        .filter((other) => other.presence.cursor !== null)
        .map(({ connectionId, presence }) => (
          <CursorUI
            key={connectionId}
            x={presence?.cursor?.x ?? 0}
            y={presence?.cursor?.y ?? 0}
          />
        ))}
    </div>
  );
}
