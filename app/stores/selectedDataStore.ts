// stores/selected-data-store.ts
import { createStore } from 'zustand/vanilla';

export type SelectedDataState = {
  pageNodeID: string;
  isCursorOn: boolean;
};

export type SelectedDataActions = {
  setPageNodeID: (v: string) => void;
  setisCursorOn: (v: boolean) => void;
};

export type SelectedDataStore = SelectedDataState & SelectedDataActions;

export const createSelectedDataStore = (initState: SelectedDataState) => {
  return createStore<SelectedDataStore>()((set) => ({
    ...initState,
    setPageNodeID: (v) => set({ pageNodeID: v }),
    setisCursorOn: (v) => set({ isCursorOn: v }),
  }));
};
