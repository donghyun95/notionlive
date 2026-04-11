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
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { TitleInput } from './TitleInput';

import { ClientOnlyEditor } from './ClientOnlyEditor';
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
          x={presence.cursor!.x * propsRect.width + propsRect.left}
          y={presence.cursor!.y * propsRect.height + propsRect.top}
        />
      ));
  }, [others, propsRect]);
  if (others.length === 0) return null;
  return <>{cursorElements}</>;
});

export function EditorWrapper({ children }) {
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const { data: selfAndChildren = { self: {}, children: [] } } = useQuery({
    queryKey: ['page', Number(pageNodeID)],
    queryFn: () => getSelfandChildrenFetch(String(pageNodeID)),
    staleTime: 0,
    enabled: true,
  });
  // console.log('에디터', editor);
  // const ready = useIsEditorReady();
  const contentRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const role = selfAndChildren.self?.role;
  const updateMyPresence = useUpdateMyPresence();
  const updateRect = (el) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect((prev) => {
      if (
        prev.width === r.width &&
        prev.height === r.height &&
        prev.left === r.left &&
        prev.top === r.top
      ) {
        return prev;
      }

      return {
        width: r.width,
        height: r.height,
        left: r.left,
        top: r.top,
      };
    });
  };
  const debouncedUpdateRect = useMemo(
    () =>
      debounce(() => {
        if (!contentRef.current) return;
        updateRect(contentRef.current);
        console.log('디바운스실행');
      }, 1000),
    [],
  );

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

      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      throttledUpdate(x, y);
      console.log(y);
    },
    [throttledUpdate],
  );
  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    updateRect(el);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCursorOn) setisCursorOn(true);
    }, 3000);
    const el = contentRef.current;
    console.log(el);
    return () => clearTimeout(timer);
  }, [setisCursorOn]);
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    updateRect(el);
    window.addEventListener('scroll', debouncedUpdateRect);
    window.addEventListener('resize', debouncedUpdateRect);

    return () => {
      window.removeEventListener('scroll', debouncedUpdateRect);
      window.removeEventListener('resize', debouncedUpdateRect);
    };
  }, []);
  return (
    <>
      <div className="relative page">
        <PopOverEmoticon />

        <div
          ref={contentRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="mx-auto w-[800px] relative"
        >
          {children}
        </div>
      </div>
      {isCursorOn && <CursorLayer propsRect={rect} />}
    </>
  );
}
function debounce(fn, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}
