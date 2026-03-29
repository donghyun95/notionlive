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
import { useSelectedData } from './Providers/ClientDataProvider';

function throttle<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

const CursorLayer = memo(function CursorLayer({ propsRect }) {
  const others = useOthers();

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
  if (others.length === 0) return <></>;
  return <>{cursorElements}</>;
});

export function EditorWrapper({ children }: { children: ReactNode }) {
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);
  const contentRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({
    height: 0,
  });
  const updateMyPresence = useUpdateMyPresence();

  const throttledUpdate = useMemo(
    () =>
      throttle((x: number, y: number) => {
        updateMyPresence({
          cursor: { x, y },
        });
      }, 50),
    [updateMyPresence],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();

      const x = (e.pageX - r.left) / el.scrollWidth;
      const y = (e.clientY - r.top) / r.height;

      throttledUpdate(x, y);
    },
    [throttledUpdate],
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
    const timer = setTimeout(() => {
      if (!isCursorOn) setisCursorOn(true);
    }, 3000);
    return () => clearTimeout(timer);
  });
  const handleOnCursorLayer = (ev) => {
    console.log(isCursorOn);
    if (!isCursorOn) {
      setisCursorOn(true);
    }
  };
  return (
    <div
      ref={contentRef}
      className="relative page"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <button onClick={handleOnCursorLayer}>활성화</button>
      <PopOverEmoticon />
      {children}
      {isCursorOn && <CursorLayer propsRect={rect} />}
    </div>
  );
}
