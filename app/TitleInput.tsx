'use client';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { useSelectedData } from './Providers/ClientDataProvider';
import { updateTitleANDIcon } from '@/lib/api/updateTitleANDIcon';
type UpdateTitlePayload = {
  pageID: number;
  title: string | undefined;
  icon: string | undefined;
};

export function TitleInput({ editor }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: selfAndChildren = { self: {}, children: [] } } = useQuery({
    queryKey: ['page', Number(pageNodeID)],
    queryFn: () => getSelfandChildrenFetch(String(pageNodeID)),
    staleTime: 0,
    enabled: true,
    refetchInterval: 3000,
  });
  const mutation = useMutation({
    mutationFn: ({ pageID, title, icon }: UpdateTitlePayload) =>
      updateTitleANDIcon(pageID, title, icon),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['page', Number(pageNodeID)],
      });
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
      const newBlocks = editor.insertBlocks(
        [
          {
            type: 'paragraph',
            content: '',
          },
        ],
        editor.document[0],
        'before',
      );
      editor.setTextCursorPosition(newBlocks[0].id, 'start');
      editor.focus();
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setTitle(value);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      mutation.mutate({
        pageID: selfAndChildren.self.id,
        title: value,
        icon: undefined,
      });
    }, 1000);
  };

  useEffect(() => {
    setTitle(selfAndChildren.self.title ?? '');
  }, [pageNodeID, selfAndChildren.self.title]);
  return (
    <div className="editor mx-auto mb-10 flex">
      {selfAndChildren.role === 'VIEWER' ? (
        <h1 className="min-w-0 flex px-[54px] border-0 outline-none text-[40px] font-bold leading-[1.2] font-['Pretendard',sans-serif]">
          {title}
        </h1>
      ) : (
        <input
          className="min-w-0 flex px-[54px] border-0 outline-none text-[40px] font-bold leading-[1.2] font-['Pretendard',sans-serif]"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          maxLength={30}
          placeholder="Please enter the title"
          value={title ?? ''}
          spellCheck="false"
        ></input>
      )}
    </div>
  );
}
