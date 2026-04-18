'use client';
import { shallow } from '@liveblocks/react';
import {
  useUpdateMyPresence,
  useOthers,
  useOthersMapped,
} from '@liveblocks/react/suspense';
import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import FloatingCursor from './FloatingCursor';
import { PopOverEmoticon } from './PopOverEmoticon';
import { useSelectedData } from './Providers/ClientDataProvider';
import throttle from 'lodash/throttle';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
function CursorLayer({ contentRef }) {
  const others = useOthersMapped(
    (other) => ({
      cursor: other.presence.cursor,
      info: other.info,
    }),
    shallow,
  );
  // 다른 사용자가 없으면 아무것도 렌더링하지 않음
  if (others.length === 0) return null;
  if (!contentRef.current) return null;
  const contentRect = contentRef.current.getBoundingClientRect();

  return (
    <>
      {others.map(([id, other]) => {
        if (other.cursor == null) {
          return null;
        }

        return (
          <FloatingCursor
            key={id}
            // connectionId is an integer that is incremented at every new connections
            // Assigning a color with a modulo makes sure that a specific user has the same colors on every clients
            color={other.info.color}
            image={other.info.image}
            x={other.cursor.x * contentRect.width}
            y={other.cursor.y * contentRect.height}
          />
        );
      })}
    </>
  );
}
export function EditorWrapper({ children }) {
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const [layoutReady, setLayoutReady] = useState(false);
  const setisCursorOn = useSelectedData((state) => state.setisCursorOn);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const PageId = searchParams.get('PageId');
  console.log('페이지 아이디', PageId);
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
      if (!isCursorOn) {
        return null;
      }
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();

      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      throttledUpdate(x, y);
    },
    [throttledUpdate, isCursorOn],
  );
  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);
  useEffect(() => {
    if (!isCursorOn) {
      throttledUpdate.cancel();
      updateMyPresence({ cursor: null });
    }
  }, [isCursorOn, throttledUpdate, updateMyPresence]);

  // useEffect(() => {
  //   const el = contentRef.current;
  //   if (!el) return;

  //   const observer = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       // 너비가 0보다 커지면(레이아웃이 잡히면) 준비 완료로 간주
  //       if (entry.contentRect.width > 0) {
  //         setLayoutReady(true);
  //         observer.disconnect(); // 한 번 잡히면 감시 종료
  //       }
  //     }
  //   });

  //   observer.observe(el);
  //   return () => {
  //     observer.disconnect();
  //     setLayoutReady(false); // 언마운트 시 레이아웃 준비 상태 초기화
  //   };
  // }, []);

  useEffect(() => {
    setLayoutReady(false);
    const timer = setTimeout(() => {
      setLayoutReady(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [PageId]);

  // const updateRectStyles = useCallback(() => {
  //   const el = contentRef.current;
  //   const wrapper = containerRef.current;
  //   if (!el || !wrapper) return;

  //   const r = el.getBoundingClientRect();
  //   wrapper.style.setProperty('--rect-width', `${r.width}px`);
  //   wrapper.style.setProperty('--rect-height', `${r.height}px`);
  //   wrapper.style.setProperty('--rect-left', `${r.left}px`);
  //   wrapper.style.setProperty('--rect-top', `${r.top}px`);
  // }, []);

  // useEffect(() => {
  //   const el = contentRef.current;
  //   if (!el) return;
  //   updateRectStyles();
  //   const observer = new ResizeObserver(() => {
  //     updateRectStyles();
  //   });

  //   observer.observe(el);

  //   window.addEventListener('scroll', updateRectStyles);
  //   window.addEventListener('resize', updateRectStyles);
  //   return () => {
  //     observer.disconnect();
  //     window.removeEventListener('scroll', updateRectStyles);
  //     window.removeEventListener('resize', updateRectStyles);
  //   };
  // }, [updateRectStyles]);
  console.log(layoutReady, '레이아웃 준비 상태');
  return (
    <>
      <div
        ref={containerRef}
        className="page justify-center min-w-0 w-full overflow-x-auto"
      >
        <motion.div
          initial={{ x: 20, y: 20, opacity: 0 }} // 아래 + 투명
          animate={{ x: 0, y: 0, opacity: 1 }} // 원래 위치 + 보이기
          transition={{ duration: 0.5 }}
          ref={contentRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="min-h-[92vh] bg-white relative max-w-[100%] min-w-[360px] md:max-w-[768px] md:min-w-[768px] overflow-hidden"
        >
          <PopOverEmoticon />
          {children}
          {layoutReady && isCursorOn && <CursorLayer contentRef={contentRef} />}
        </motion.div>
      </div>
    </>
  );
}
