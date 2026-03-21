'use client';

import { useUpdateMyPresence, useOthers } from '@liveblocks/react/suspense';
import {
  ReactNode,
  useRef,
  memo,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
} from 'react';
import FloatingCursor from './FloatingCursor';
import { PopOverEmoticon } from './PopOverEmoticon';

const CursorLayer = memo(function CursorLayer({ propsRect }) {
  const others = useOthers();
  console.log(others);
  if (others.length === 0) return <></>;
  const cursorElements = useMemo(() => {
    return others
      .filter((other) => other.presence.cursor != null)
      .map(({ connectionId, presence }) => (
        <FloatingCursor
          key={connectionId}
          x={presence.cursor!.x}
          y={presence.cursor!.y * propsRect.height}
        />
      ));
  }, [others, propsRect]);

  return <>{cursorElements}</>;
});

export function EditorWrapper({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({
    height: 0,
  });
  const [showCursorLayer, setShowCursorLayer] = useState(false);
  const updateMyPresence = useUpdateMyPresence();

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = e.currentTarget; // 현재 이벤트가 걸린 엘리먼트
      const r = el.getBoundingClientRect();
      console.log(rect.height);
      updateMyPresence({
        cursor: {
          x: (e.pageX - r.left) / el.scrollWidth,
          y: (e.clientY - r.top) / r.height,
        },
      });
    },
    [updateMyPresence, rect],
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useLayoutEffect(() => {
    // if (!contentRef.current) return;
    const el = contentRef.current;
    const updateRect = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();

      setRect({
        height: r.height,
      });
    };

    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShowCursorLayer(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      ref={contentRef}
      className="relative page"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {showCursorLayer && <PopOverEmoticon />}
      {children}
      {showCursorLayer && <CursorLayer propsRect={rect} />}
    </div>
  );
}
