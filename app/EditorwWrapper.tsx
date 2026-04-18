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
function CursorLayer() {
  const others = useOthersMapped(
    (other) => ({
      cursor: other.presence.cursor,
      info: other.info,
    }),
    shallow,
  );
  // 다른 사용자가 없으면 아무것도 렌더링하지 않음
  if (others.length === 0) return null;

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
            x={other.cursor.x}
            y={other.cursor.y}
          />
        );
      })}
    </>
  );
}
export function EditorWrapper({ children }) {
  const isCursorOn = useSelectedData((state) => state.isCursorOn);
  const [layoutReady, setLayoutReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
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
      if (!isCursorOn || !isDesktop) {
        updateMyPresence({ cursor: null });
        return null;
      }
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();

      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      throttledUpdate(x, y);
    },
    [throttledUpdate, isCursorOn, isDesktop],
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

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkSize();
    window.addEventListener('resize', checkSize);

    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    setLayoutReady(false);
    const timer = setTimeout(() => {
      setLayoutReady(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [PageId]);
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
          {isDesktop && layoutReady && isCursorOn && <CursorLayer />}
        </motion.div>
      </div>
    </>
  );
}
