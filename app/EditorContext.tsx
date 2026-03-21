import { createContext, useContext } from 'react';

export const EditorContext = createContext(null);

export function useEditor() {
  const editor = useContext(EditorContext);

  if (!editor) {
    throw new Error('useEditor must be used within EditorProvider');
  }

  return editor;
}
