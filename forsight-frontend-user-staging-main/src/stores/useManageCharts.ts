import { create } from "zustand";
import type { useManageChartsType } from "./useManageCharts.types";
import { ChartsList } from "../utils/constants";

export const useManageCharts = create<useManageChartsType>()((set) => ({
  addedCharts: ChartsList,
  addChart: (ChartComponent: string) => {
    set((state) => {
      if (!state.addedCharts.includes(ChartComponent)) {
        return {
          addedCharts: [...state.addedCharts, ChartComponent],
        };
      }
      return state;
    });
  },
  removeChart: (ChartComponent: string) => {
    set((state) => ({
      addedCharts: state.addedCharts.filter(
        (chart) => chart !== ChartComponent
      ),
    }));
  },
  clearChartsState: () => {
    set({ addedCharts: ChartsList });
  },
}));
