'use client';

import { useUpdateMyPresence, useOthers } from '@liveblocks/react/suspense';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import FloatingCursor from './FloatingCursor';
import { PopOverEmoticon } from './PopOverEmoticon';
import { useSelectedData } from './Providers/ClientDataProvider';
import throttle from 'lodash/throttle';
import { motion } from 'framer-motion';
function CursorLayer() {
  const others = useOthers();
  // 다른 사용자가 없으면 아무것도 렌더링하지 않음
  if (others.length === 0) return null;

  return (
    <>
      {others
        .filter((other) => other.presence.cursor != null)
        .map(({ connectionId, presence, info }) => (
          <FloatingCursor
            key={connectionId}
            // 기존 계산 로직 그대로 유지
            x={presence.cursor!.x}
            y={presence.cursor!.y}
            color={info.color}
            image={info.image}
          />
        ))}
    </>
  );
}
export function EditorWrapper({ children }) {
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateMyPresence = useUpdateMyPresence();
  const throttledUpdate = useMemo(
    () =>
      throttle((x: number, y: number) => {
        updateMyPresence({
          cursor: { x, y },
        });
      }, 25),
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

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (!isCursorOn) setisCursorOn(true);
  //   }, 3000);
  //   const el = contentRef.current;
  //   return () => clearTimeout(timer);
  // }, [setisCursorOn]);

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
    updateRectStyles();
    const observer = new ResizeObserver(() => {
      updateRectStyles();
    });

    observer.observe(el);

    window.addEventListener('scroll', updateRectStyles);
    window.addEventListener('resize', updateRectStyles);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRectStyles);
      window.removeEventListener('resize', updateRectStyles);
    };
  }, [updateRectStyles]);

  return (
    <>
      <div ref={containerRef} className="page min-w-0 w-full overflow-x-auto">
        <motion.div
          initial={{ x: 20, y: 20, opacity: 0 }} // 아래 + 투명
          animate={{ x: 0, y: 0, opacity: 1 }} // 원래 위치 + 보이기
          transition={{ duration: 0.5 }}
          ref={contentRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="mx-auto w-[900px] min-h-[92vh] bg-white"
        >
          <PopOverEmoticon />
          {children}
        </motion.div>
        {isCursorOn && <CursorLayer />}
      </div>
    </>
  );
}
