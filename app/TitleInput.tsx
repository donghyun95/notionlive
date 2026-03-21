'use client';
import { useEffect, useState, useRef } from 'react';

export function TitleInput({ editor }: any) {
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
        value={title}
      ></input>
    </div>
  );
}
