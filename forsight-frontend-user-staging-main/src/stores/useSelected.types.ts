export type UseSelectedType = {
  selectedIds: Array<string>;
  setSelectedIds: (selectedIds: Array<string>) => void;
  addSelectedId: (id: string) => void;
  selectAll: (ids: Array<string>) => void;
  removeSelectedId: (id: string) => void;
  clearIds: () => void;
};
