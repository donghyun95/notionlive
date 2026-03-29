'use client';

import { ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import {
  createSelectedDataStore,
  type SelectedDataStore,
} from '../stores/selectedDataStore';

type SelectedDataStoreApi = ReturnType<typeof createSelectedDataStore>;

const SelectedDataStoreContext = createContext<SelectedDataStoreApi | null>(
  null,
);

export function SelectedDataProvider({
  initialPage,
  children,
}: {
  initialPage: any;
  children: ReactNode;
}) {
  const storeRef = useRef<SelectedDataStoreApi | null>(null);

  if (!storeRef.current) {
    storeRef.current = createSelectedDataStore({
      pageNodeID: String(initialPage.personal.rootPages[0].id),
      isCursorOn: false,
    });
  }

  return (
    <SelectedDataStoreContext.Provider value={storeRef.current}>
      {children}
    </SelectedDataStoreContext.Provider>
  );
}

export function useSelectedData<T>(selector: (state: SelectedDataStore) => T) {
  const store = useContext(SelectedDataStoreContext);

  if (!store) {
    throw new Error('useSelectedData must be used within SelectedDataProvider');
  }

  return useStore(store, selector);
}
