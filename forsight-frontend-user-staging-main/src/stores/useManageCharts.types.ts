export type useManageChartsType = {
  addedCharts: Array<string>;
  addChart: (ChartComponent: string) => void;
  removeChart: (ChartComponent: string) => void;
  clearChartsState: () => void;
};
