import { create } from "zustand";
import type { UseSelectedType } from "./useSelected.types";
import { ChartsList } from "../utils/constants";

export const useSelected = create<UseSelectedType>()((set) => ({
  selectedIds: [],
  addedCharts: ChartsList,
  setSelectedIds: (selectedIds) => {
    set({ selectedIds });
  },
  addSelectedId: (id) => {
    set((state) => ({ selectedIds: [...state.selectedIds, id] }));
  },
  selectAll: (ids) => {
    set(() => ({ selectedIds: ids }));
  },
  removeSelectedId: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
    }));
  },
  clearIds: () => {
    set({ selectedIds: [] });
  },
}));

// if (import.meta.env.DEV) {
//   mountStoreDevtool("auth", useUser);
// }
