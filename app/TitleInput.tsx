'use client';
import { getSelfandChildrenFetch } from '@/lib/api/getSelfandChildrenFetch';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { useSelectedData } from './Providers/ClientDataProvider';

export function TitleInput({ editor }: any) {
  const pageNodeID = useSelectedData((state) => state.pageNodeID);
  const { data: selfAndChildren = { self: {}, children: [] } } = useQuery({
    queryKey: ['page', String(pageNodeID)],
    queryFn: () => getSelfandChildrenFetch(pageNodeID),
    staleTime: 0,
    enabled: true,
  });

  const [title, setTitle] = useState('');
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('엔터 눌림');
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
  const handleChange = (e) => {
    const value = e.currentTarget.value;
    setTitle(value);
    console.log(value);
  };

  return (
    <div className="titleWrapper">
      <input
        className="title"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        maxLength={30}
        placeholder="Please enter the title"
        value={selfAndChildren.self.title ?? ''}
      ></input>
    </div>
  );
}
