'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { useQuery } from '@tanstack/react-query';
import EmojiPicker from 'emoji-picker-react';
import { useState } from 'react';
import { useSelectedData } from './Providers/ClientDataProvider';
function SmileIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="#FACC15"
        stroke="#18181B"
        strokeWidth="3"
      />

      <circle cx="22" cy="26" r="3" fill="#18181B" />
      <circle cx="42" cy="26" r="3" fill="#18181B" />

      <path
        d="M22 38C24.5 42 29 44 32 44C35 44 39.5 42 42 38"
        stroke="#18181B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PopOverEmoticon() {
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const { data: selfAndChildren = { self: {}, children: [] } } = useQuery({
    queryKey: ['page', String(pageNodeID)],
    queryFn: () => getSelfandChildrenFetch(pageNodeID),
    staleTime: 0,
    enabled: true,
  });
  const onEmojiClick = (emojiData, event) => {
    //mutation으로 데이터수정날리기
  };
  console.log(selfAndChildren.self.icon, '이모티콘');
  return (
    <div className="emotiocnBox">
      <div className="emoticonWrapper title">
        <Popover>
          <PopoverTrigger asChild>
            {selfAndChildren.self.icon ? (
              <Button variant="ghost" className="group h-14 w-14 p-0">
                <span className="text-5xl">{selfAndChildren.self.icon}</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="group px-2 h-9 opacity-30 transition-opacity hover:opacity-100 group-hover:opacity-100 border-0 outline-none 
              focus-visible:ring-0 shadow-none text-muted-foreground hover:text-muted-foreground"
              >
                <SmileIcon />
                Add Icon
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-auto p-0">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
