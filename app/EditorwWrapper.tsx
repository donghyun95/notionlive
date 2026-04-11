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

function CursorLayer() {
  const others = useOthers();

  // 다른 사용자가 없으면 아무것도 렌더링하지 않음
  if (others.length === 0) return null;

  return (
    <>
      {others
        .filter((other) => other.presence.cursor != null)
        .map(({ connectionId, presence }) => (
          <FloatingCursor
            key={connectionId}
            // 기존 계산 로직 그대로 유지
            x={presence.cursor!.x}
            y={presence.cursor!.y}
          />
        ))}
    </>
  );
}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const role = selfAndChildren.self?.role;
  const updateMyPresence = useUpdateMyPresence();
  const throttledUpdate = useMemo(
    () =>
      throttle((x: number, y: number) => {
        updateMyPresence({
          cursor: { x, y },
        });
      }, 10),
    [updateMyPresence],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();

      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      throttledUpdate(x, y);
    },
    [throttledUpdate],
  );
  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCursorOn) setisCursorOn(true);
    }, 3000);
    const el = contentRef.current;
    return () => clearTimeout(timer);
  }, [setisCursorOn]);

  const updateRectStyles = useCallback(() => {
    const el = contentRef.current;
    const wrapper = containerRef.current;
    if (!el || !wrapper) return;

    const r = el.getBoundingClientRect();
    wrapper.style.setProperty('--rect-width', `${r.width}px`);
    wrapper.style.setProperty('--rect-height', `${r.height}px`);
    wrapper.style.setProperty('--rect-left', `${r.left}px`);
    wrapper.style.setProperty('--rect-top', `${r.top}px`);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      updateRectStyles();
    });

    observer.observe(el);

    window.addEventListener('scroll', updateRectStyles);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRectStyles);
    };
  }, [updateRectStyles]);

  return (
    <>
      <div ref={containerRef} className="relative page">
        <PopOverEmoticon />

        <div
          ref={contentRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="mx-auto w-[800px] relative"
        >
          {children}
        </div>
        {isCursorOn && <CursorLayer />}
      </div>
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
