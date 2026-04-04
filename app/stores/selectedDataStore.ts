// stores/selected-data-store.ts
import { createStore } from 'zustand/vanilla';

export type SelectedDataState = {
  pageNodeID: number;
  isCursorOn: boolean;
  ancestorPath: number[];
  openMap: Record<number, boolean>;
};

export type SelectedDataActions = {
  setPageNodeID: (v: number) => void;
  setisCursorOn: (v: boolean) => void;
  setNodeOpen: (id: number | string, isOpen: boolean) => void;
  setNodesOpenBatch: (ids: number[], isOpen: boolean) => void;
};

export type SelectedDataStore = SelectedDataState & SelectedDataActions;

export const createSelectedDataStore = (initState: SelectedDataState) => {
  return createStore<SelectedDataStore>()((set) => ({
    ...initState,
    setPageNodeID: (v) =>
      set((state) => {
        if (state.pageNodeID === v) return state;
        return { pageNodeID: v };
      }),
    setisCursorOn: (v) => set({ isCursorOn: v }),
    setNodeOpen: (id, isOpen) =>
      set((state) => {
        const prev = state.openMap[id] ?? false;

        if (prev === isOpen) return state;

        return {
          openMap: {
            ...state.openMap,
            [id]: isOpen,
          },
        };
      }),

    setNodesOpenBatch: (ids: number[], isOpen: boolean) =>
      set((state) => {
        const nextOpenMap = { ...state.openMap };

        for (const id of ids) {
          nextOpenMap[id] = isOpen;
        }

        return {
          openMap: nextOpenMap,
        };
      }),
  }));
};
