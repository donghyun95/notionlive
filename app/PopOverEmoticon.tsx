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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EmojiPicker from 'emoji-picker-react';
import { useState, useEffect } from 'react';
import { useSelectedData } from './Providers/ClientDataProvider';
import { updateTitleANDIcon } from '@/lib/api/updateTitleANDIcon';

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
type UpdateTitleAndIconParams = {
  pageID: number;
  title?: string | undefined;
  icon?: string | undefined;
};
export function PopOverEmoticon() {
  const queryClient = useQueryClient();
  const pageNodeID = useSelectedData((state) => state.pageNodeID);

  const { data: selfAndChildren = { self: {}, children: [] } } = useQuery({
    queryKey: ['page', Number(pageNodeID)],
    queryFn: () => getSelfandChildrenFetch(String(pageNodeID)),
    staleTime: 0,
    enabled: true,
  });
  const [Emoticon, setEmoticon] = useState(undefined);
  const updateIconMutation = useMutation<
    unknown,
    Error,
    UpdateTitleAndIconParams
  >({
    mutationFn: ({ pageID, title, icon }) =>
      updateTitleANDIcon(pageID, title, icon),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['page', Number(pageNodeID)],
      });
    },
    onError: (error) => {
      console.error('아이콘 업데이트 에러:', error);
    },
  });
  const onEmojiClick = (emojiData, event) => {
    //mutation으로 데이터수정날리기
    updateIconMutation.mutate({
      pageID: Number(pageNodeID),
      title: undefined,
      icon: emojiData.emoji,
    });
    setEmoticon(emojiData.emoji);
  };
  useEffect(() => {
    setEmoticon(selfAndChildren.self.icon);
  }, [selfAndChildren]);

  return (
    <div className="emotiocnBox">
      <div className="emoticonWrapper title">
        {selfAndChildren.role === 'VIEWER' ? (
          <span className="text-5xl">{Emoticon}</span>
        ) : (
          <EmojiPopover icon={Emoticon} onEmojiClick={onEmojiClick} />
        )}
      </div>
    </div>
  );
}

function EmojiPopover({
  icon,
  onEmojiClick,
}: {
  icon: string | undefined;
  onEmojiClick: (emojiData, event) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {icon ? (
          <Button variant="ghost" className="group h-14 w-14 p-0">
            <span className="text-5xl">{icon}</span>
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
  );
}
